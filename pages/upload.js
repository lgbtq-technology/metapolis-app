import React from 'react';
import Layout from '../components/layout';
import AuthRequired from '../components/auth-required';
import Drop from 'react-drop-to-upload';
import fetch from 'isomorphic-fetch';
import slackFetch from '../lib/slack-fetch';
import url from 'url';
import config from '../config';

const PERMS = [
  'channels:read',
  'chat:write:user',
]

export default AuthRequired(PERMS, class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false
    };
  }

  render() {
    return <Layout auth={this.props.auth}>
    {
      this.state.metadata
      ? <ChannelPicker auth={this.props.auth} onSelect={id => this.handleChannel(id)}>Loading channels...</ChannelPicker>
      : <Drop onDrop={drop => this.handleDrop(drop)} onLeave={() => this.handleLeave()} onOver={() => this.handleOver()}>
        {
          this.state.active ?
            <h2>Drop file to upload</h2>
          :
            <h2>Drag file here</h2>
        }
        { this.state.active || <FileInput onFiles={drop => this.handleDrop(drop)} multiple /> }
      </Drop>
    }
        <style jsx>{`
          h2 {
            font-size: 1.5rem;
          }
      `}</style>
    </Layout>;
  }

  async handleChannel(id) {
    const res = await slackFetch('https://slack.com/api/chat.postMessage', {
      token: this.props.auth.token.access_token,
      channel: id,
      parse: true,
      as_user: true,
      text: `${url.resolve(config.api, this.state.metadata[0].path)}`
    });
  }

  async handleDrop(drop) {
    const data = new FormData();
    let n = 0;
    drop.forEach(f => data.append(`file-${n++}`, f))
    data.append('sid', this.props.auth.sid)
    const result = await fetch(url.resolve(config.api, '/-/upload'), {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.props.auth.sid}`
      },
      body: data
    })

    const metadata = await result.json();

    this.setState({ metadata });
  }

  handleOver() {
    this.setState({active: true});
  }

  handleLeave() {
    this.setState({active: false});
  }
})

class FileInput extends React.Component {
  render() {
    const props = {...this.props};
    delete props.onFiles;
    return <input ref='file' type='file' onChange={() => this.handleChange()} accept='image/*' {...props} />
  }

  handleChange() {
    if (typeof this.props.onFiles == 'function') {
      this.props.onFiles(Array.from(this.refs.file.files))
    }
  }

}

class ChannelPicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    const channelsP = slackFetch('https://slack.com/api/channels.list', {
      exclude_archived: 1,
      token: props.auth.token.access_token,
    })

    channelsP.then(res => {
      this.setState({channels: res.channels.filter(c => c.is_member)})
    });
  }

  render() {
    return this.state.channels ? <div><h2>Channels</h2>{
      this.state.channels.map(c => <p key={c.id} onClick={() => this.handleClick(c.id)}>{c.id}: {c.name}</p>)
    }</div> : <div>{this.props.children}</div>
  }

  handleClick(id) {
    if (this.props.onSelect) this.props.onSelect(id);
  }
}
