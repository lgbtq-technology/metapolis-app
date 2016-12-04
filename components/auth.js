import React from 'react';
import Layout from '../components/layout';

export default class extends React.Component {
	render () {
		return <Layout>
  		To access this application, you must <a href={this.props.authurl}>log in as a slack user</a>
		</Layout>;
	}
}
