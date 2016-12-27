import React from 'react';
import Button from '../components/button';
import Layout from '../components/layout';
import AuthRequired from '../components/auth-required';
import ChannelPicker from '../components/channel-picker';
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
      view: 'pick',
      unfurl: true,
      metadata: null
    };
  }

  render() {
    return <Layout auth={this.props.auth}>
    {
      this.state.view == 'pick' ?
        <FilePicker onFiles={drop => this.handleDrop(drop)}>
        </FilePicker>
      : this.state.view == 'confirm' ?
        <form onSubmit={e => {e.preventDefault(); this.handleUpload()}}>
          {
            this.state.files.map((file, i) => <div key={i} className="image"><img src={URL.createObjectURL(file)}/></div>)
          }
          <div>
            <label>
              Title <input type="text" onChange={ev => this.setState({title: ev.target.value})} value={this.state.title} />
            </label>
          </div>
          <div>Share in? <ChannelPicker auth={this.props.auth} onSelect={channel => this.setState({channel})}>Loading channels...</ChannelPicker></div>
          <div>
            <label>
              Unfurl image?
              <input type="checkbox" name="unfurl" value="true" 
                checked={this.state.unfurl}
                onChange={e => this.setState({unfurl: e.target.checked })}
              />
            </label>
          </div>
          <Button disabled={!this.state.channel} dark>Share</Button>
        </form>
      : <div/>

    }
    <style jsx>{`
      .image {
        text-align: center;
      }
      img {
        max-width: 60%;
        max-height: 60%;
      }
    `}</style>
    </Layout>;
  }

  async handleUpload() {
    const data = new FormData();
    let n = 0;
    this.state.files.forEach(f => data.append(`file-${n++}`, f))
    data.append('sid', this.props.auth.sid)
    data.append('unfurl', String(this.state.unfurl));
    data.append('title', String(this.state.title));

    const result = await fetch(url.resolve(config.api, '/-/upload'), {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.props.auth.sid}`
      },
      body: data
    })

    const metadata = await result.json();

    for (let md of metadata) {
      const image = url.resolve(config.self, `/file?f=${md.team}/${md.user}/${md.file}`);
      await slackFetch('https://slack.com/api/chat.postMessage', {
        token: this.props.auth.token.access_token,
        channel: this.state.channel,
        parse: true,
        as_user: true,
        text: image
      });
    }
    this.props.url.push('/');
  }

  async handleDrop(files) {
    this.setState({ files, view: 'confirm' });
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

class FilePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false
    };
  }

  render() {
     return <Drop onDrop={drop => this.handleDrop(drop)} onLeave={() => this.handleLeave()} onOver={() => this.handleOver()}>
        {
          this.state.active
            ? <h2>Drop file to upload</h2>
            : <h2>Drag file here</h2>
        }
        { this.state.active || <FileInput onFiles={drop => this.handleDrop(drop)} multiple /> }
      </Drop>
  }

  handleOver() {
    this.setState({active: true});
  }

  handleLeave() {
    this.setState({active: false});
  }

  handleDrop(drop) {
    if (this.props.onFiles) this.props.onFiles(drop);
  }
}
