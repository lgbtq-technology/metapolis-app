import React from 'react';
import Link from 'next/link';
import Layout from '../components/layout';
import AuthRequired from '../components/auth-required';
import fetch from 'isomorphic-fetch';
import url from 'url';
import config from '../config';

export default AuthRequired(['client'], class extends React.Component {
  render() {

    console.warn(this.props.auth);

    return(
      <Layout auth={this.props.auth}>
        <h2>Your token</h2>

        <div style={ { backgroundColor: '#eee', padding: " 0 0.5em" } }><pre>{ this.props.auth.token.access_token }</pre></div>
      </Layout>
    );
  }
})
