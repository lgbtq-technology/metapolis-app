import React from 'react';
import Auth from './auth';
import fetch from 'isomorphic-fetch'

export default (Component) => {
	return class extends React.Component {
		static async getInitialProps(ctx) { 
			const { query, req } = ctx;
			const superProps = typeof Component.getInitialProps == 'function' ? await Component.getInitialProps(ctx) : {}
			const authProps = await this.getAuthProps(ctx);
			return { ...superProps, ...authProps };
		}
		
		static async getAuthProps({req, query}) {
			if (req) {
				const self = `http://${req.headers.host}/auth`;
				const client_id = process.env.SLACK_APP_CLIENT_ID;
				const client_secret = process.env.SLACK_APP_CLIENT_SECRET;
				const KEY = process.env.JWT_KEY;
	
				if (!client_id || !client_secret || !KEY) {
					throw "SLACK_APP_CLIENT_ID and SLACK_APP_CLIENT_SECRET and JWT_KEY must be set to operate";
				}
				
				if (query.code) {
					// Update login code here
				} else if (/*has cookie*/true) {
					// unpack cookie here
				}
	
				return {
					authurl: `https://slack.com/oauth/authorize?client_id=${client_id}&scope=files:read%20files:write:user&redirect_uri=${self}`,
					loggedIn: true
				}
			}
		}
	
		render() {
			if (this.props.loggedIn) {
				return <Component {...this.props}/>
			} else {
				return <Auth authurl={this.props.authurl}/>
			}
		}
	}
}
