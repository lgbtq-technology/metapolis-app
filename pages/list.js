import React from 'react';
import Link from 'next/link';
import Layout from '../components/layout';
import AuthRequired from '../components/auth-required';
import fetch from 'isomorphic-fetch';
import url from 'url';
import config from '../config';

export default AuthRequired(class extends React.Component {
  static async getInitialProps({auth}) {
    const result = await fetch(url.resolve(config.api, `/-/files.list?user=${auth.token.user_id}`), {
      headers: {
        'Authorization': `Bearer ${auth.sid}`
      }
    });

    return await result.json();
  }

  // {"user":"U038225J3","team":"T0383959N","file":"9B9826D7","name":"test","type":"image/png","unfurl":true,"path":"/-/files/T0383959N/U038225J3/9B9826D7.png"}

  render() {
    console.warn(this.props);

    const files = this.props.files ? this.props.files.map(file => (
      <div key={file.file}>
        <Link>
          <a href={`/file?f=${file.team}/${file.user}/${file.file}`}>
            { file.title || file.name || 'untitled' }
          </a>
        </Link>
      </div>
    )) : 'No files';

    return(
      <Layout auth={this.props.auth}>
        <h2>Your files</h2>

        { files }
      </Layout>
    );
  }
})
