import React from 'react';
import Layout from '../components/layout';

export default class extends React.Component {
	render () {
		return <Layout>
		{ this.props.upgrade ? <span>We need some more permissions from slack. <a href={this.props.authurl}>Authorize them here</a>.</span> : <span>To access this application, you must <a href={this.props.authurl}>log in as a slack user</a></span> }
		</Layout>;
	}
}
