import React from 'react';
import AuthRequired from '../components/auth-required';
import Layout from '../components/layout';
import purgeFiles from '../lib/purge-files';

export default AuthRequired(class extends React.Component {
  async purgeFiles(ev) {
    ev.preventDefault()
    const nfiles = await purgeFiles(this.props.auth.token)
  }
  
  render() {
    return <Layout auth={this.props.auth}>
      <form action='/purge' method='post' onSubmit={this.purgeFiles.bind(this)}>
        <button className='Button Button-dark' type='submit'>Purge private files</button>
      </form>
  
    </Layout>
  }
});
