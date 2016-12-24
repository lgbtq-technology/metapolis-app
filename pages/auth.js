import React from 'react';
import Layout from '../components/layout';
import AuthRequired from '../components/auth-required';
import fetch from 'isomorphic-fetch';
import cookie from 'cookie';
import url from 'url';
import config from '../config';

export default class extends React.Component {
    static async getInitialProps(ctx) {
      const {query, req} = ctx;
      const auth = await this.getAuthProps(ctx);
      return {
        auth
      };
    }

    static async getAuthProps({req, res, query}) {
      const self = url.resolve(config.self, '/auth');
      if (query.code) {
        const body = await fetch(url.resolve(config.api, '/-/login'), {
          method: 'POST',
          body: JSON.stringify({
            ...query,
            redirect_uri: self
          }),
          headers: {
            "Content-Type": "application/json"
          }
        }).then(req => req.json());

        if (!body.token) {
          throw new Error("No access token granted");
        }

	if (body.sid) {
	    if (res) {
		res.setHeader('Set-Cookie', cookie.serialize('session', body.sid));
	    } else {
		document.cookie = cookie.serialize('session', body.sid);
	    }
	}

        return {
	  ...body,
          nextUrl: query.state
        };
      } else if (typeof window != 'undefined' && window.auth) {
        return window.auth
      } else {
	const client_id = process.env.SLACK_APP_CLIENT_ID;
        return {
          authurl: `https://slack.com/oauth/authorize?client_id=${client_id}&scope=files:read%20files:write:user&redirect_uri=${self}&state=${req.url}`
        }
      }
    }

    componentWillMount() {
      if (this.props.auth.nextUrl) {
        this.props.url.replace(this.props.auth.nextUrl);
      }
    }

    constructor(props) {
      super(props);
      if (typeof window != 'undefined')
        window.auth = props.auth;
    }

	render () {
		return <Layout><div>Logging You In...</div></Layout>;
	}
}
