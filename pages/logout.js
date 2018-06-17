import React from 'react';
import AuthRequired from '../components/auth-required';
import Button from '../components/button';
import Layout from '../components/layout';
import slackFetch from '../lib/slack-fetch';

export default AuthRequired(class extends React.Component {

  logout() {
    document.cookie = "session=";
    window.location = '/';
  }

  async revoke() {
    await slackFetch('https://slack.com/api/auth.revoke', {
      token: this.props.auth.token.access_token
    })

    document.cookie = "session=";
    window.location = '/'
  }

  render() {
    return <Layout auth={this.props.auth}>
      <Button onClick={() => this.logout()} dark>Log Out</Button>
      <Button onClick={() => this.revoke()} dark>Log Out on all browsers</Button>
    </Layout>
  }
})
