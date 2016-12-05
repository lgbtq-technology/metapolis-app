import React from 'react';
import AuthRequired from '../components/auth-required';
import Layout from '../components/layout';
import purgeFiles from '../lib/purge-files';

export default AuthRequired(class extends React.Component {
  static async getInitialProps({req}) {
    if (req && req.method == 'post') {
      
    }
  }
  
  render() {
    return <Layout auth={this.props.auth}>
      <form action='/purge' method='post'>
        <button className='Button Button-dark' type='submit'>Purge private files</button>
      </form>
  
    </Layout>
  }
});