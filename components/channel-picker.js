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
    });

    const groupsP = slackFetch('https://slack.com/api/groups.list', {
      exclude_archived: 1,
      token: props.auth.token.access_token,
    });

    const usersP = slackFetch('https://slack.com/api/users.list', {
      exclude_archived: 1,
      token: props.auth.token.access_token,
    });

    const pmP = slackFetch('https://slack.com/api/im.list', {
      exclude_archived: 1,
      token: props.auth.token.access_token,
    });

    // Fetch all channels
    channelsP.then(channelRes => {
        // Then fetch private groups
        groupsP.then(groupRes => {
          // Then fetch all users
          usersP.then(usersRes => {
              // Then fetch pms
              pmP.then(pmRes => {
                this.setChannels(channelRes, usersRes, groupRes, pmRes);
              });
            });
        });
    });
  }

    /**
     * Set the state for the channel-picker based on the different responses (combination is needed)
     * @param channelRes
     * @param usersRes
     * @param groupRes
     * @param pmRes
     */
  setChannels (channelRes, usersRes, groupRes, pmRes){
        let usersMap = {};
        let channels = [...channelRes.channels.filter(c => c.is_member), ...groupRes.groups];
        let pmList = pmRes.ims;

        // Calculate the user map
        usersRes.members.forEach(user => {
            usersMap[user.id] = user;
        });

        // Add PMs
        pmList = pmList.map(pm => {
            pm.name = usersMap[pm.user].name;
            return pm;
        });

        this.setState({channels: [...channels, ...pmList]});
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

