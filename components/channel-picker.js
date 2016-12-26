import React from 'react';
import Select from './select';
import slackFetch from '../lib/slack-fetch';

export default class ChannelPicker extends React.Component {
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
    return this.state.channels
      ? <Select list={this.state.channels} onSelect={c => this.handleClick(c.id)} />
      : <div>{this.props.children}</div>
  }

  handleClick(id) {
    if (this.props.onSelect) this.props.onSelect(id);
  }
}

