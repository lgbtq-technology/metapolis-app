import React from 'react';
import Layout from '../components/layout';

export default class extends React.Component {
	static getInitialProps({req}) {
		if (req) {
			const self = `http://${req.headers.host}/auth`;
			const client_id = process.env.SLACK_APP_CLIENT_ID;
			const client_secret = process.env.SLACK_APP_CLIENT_SECRET;
			const KEY = process.env.JWT_KEY;

			if (!client_id || !client_secret || !KEY) {
				throw "SLACK_APP_CLIENT_ID and SLACK_APP_CLIENT_SECRET and JWT_KEY must be set to operate";
			}

			return {
				authurl: `https://slack.com/oauth/authorize?client_id=${client_id}&scope=files:read%20files:write:user&redirect_uri=${self}`
			}
		}
	}
	render () {
		return <Layout>
		To access this application, you must <a href={this.props.authurl}>log in as a slack user</a>
		</Layout>;
	}
}
