import React from 'react';
import AuthRequired from '../components/auth-required';
import Layout from '../components/layout';
import purgeFiles from '../lib/purge-files';

export default AuthRequired(class extends React.Component {

  logout() {
    document.cookie = "session=";
    global.location = '/';
  }

  render() {
    return <Layout auth={this.props.auth}>
      <button onClick={() => this.logout()}>Log Out</button>
    </Layout>
  }
})
