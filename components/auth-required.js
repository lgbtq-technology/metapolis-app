import React from 'react';
import Auth from './auth';
import fetch from 'isomorphic-fetch'
import slackFetch from '../lib/slack-fetch';
import jwt from 'jwt-simple';
import url from 'url';
import cookie from 'cookie';
import getToken from '../lib/get-token';

export default (Component) => {
	return class extends React.Component {
		static async getInitialProps(ctx) { 
			const { query, req } = ctx;
			const superProps = typeof Component.getInitialProps == 'function' ? await Component.getInitialProps(ctx) : {}
			const auth = await this.getAuthProps(ctx);
			return { ...superProps, auth };
		}
		
		static async getAuthProps({req, res, query}) {
			if (req) {
				const self = `http://${req.headers.host}/auth`;
				const client_id = process.env.SLACK_APP_CLIENT_ID;
				const client_secret = process.env.SLACK_APP_CLIENT_SECRET;
				const KEY = process.env.JWT_KEY;
	
				if (!client_id || !client_secret || !KEY) {
					throw "SLACK_APP_CLIENT_ID and SLACK_APP_CLIENT_SECRET and JWT_KEY must be set to operate";
				}
				
				const token = getToken(req);
				
				if (query.code) {
          const body = await slackFetch('https://slack.com/api/oauth.access', {
            client_id,
            client_secret,
            redirect_uri: `http://${req.headers.host}/auth`,
            code: url.parse(req.url, true).query.code
          });
          if (!body.access_token) {
            throw new Error("No access token granted");
          }
          
          const tok = jwt.encode(Object.assign(body, { time: Date.now() }), KEY);
          res.setHeader('Set-Cookie', cookie.serialize('auth', tok));
          return {
            loggedIn: true,
            token: tok
          };
				} else if (token) {
  				return {
  				  loggedIn: true,
  				  token
				  };
				}
	
				return {
					authurl: `https://slack.com/oauth/authorize?client_id=${client_id}&scope=files:read%20files:write:user&redirect_uri=${self}`
				}
			} else {
			 if (window.auth) {
  			 return window.auth
			 }
			}
		}
		
		constructor(props) {
  		super(props);
  		if (typeof window != 'undefined') window.auth = props.auth;
		}
		
		render() {
			if (this.props.auth.loggedIn) {
				return <Component {...this.props}/>
			} else {
				return <Auth authurl={this.props.auth.authurl}/>
			}
		}
	}
}
