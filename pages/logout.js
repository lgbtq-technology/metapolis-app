import React from 'react';
import AuthRequired from '../components/auth-required';
import Button from '../components/button';
import Layout from '../components/layout';
import purgeFiles from '../lib/purge-files';

export default AuthRequired(class extends React.Component {

  logout() {
    document.cookie = "session=";
    window.location = '/';
  }

  render() {
    return <Layout auth={this.props.auth}>
      <Button onClick={() => this.logout()} dark>Log Out</Button>
    </Layout>
  }
})
