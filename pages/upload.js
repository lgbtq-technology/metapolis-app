import React from 'react';
import Layout from '../components/layout';
import AuthRequired from '../components/auth-required';
import XHRUploader from 'react-xhr-uploader';

export default AuthRequired(class extends React.Component {
  render() {
    return <Layout auth={this.props.auth}>
      <XHRUploader url='http://localhost:3001/-/upload' auto />
    </Layout>;
  }
})
