import React from 'react';
import Layout from '../components/layout';
import AuthRequired from '../components/auth-required';

export default class extends React.Component {
    static async getInitialProps(ctx) {
      const {query, req} = ctx;
      const auth = await this.getAuthProps(ctx);
      return {
        auth
      };
    }

    static async getAuthProps({req, res, query}) {
      const self = `http://${req ? req.headers.host : window.location.host }/auth`;
      if (query.code) {
        const body = await fetch('http://localhost:3001/-/login', {
          method: 'POST',
          body: JSON.stringify({
            ...query,
            redirect_uri: self
          }),
          headers: {
            "Content-Type": "application/json"
          }
        }).then(req => req.json());

        if (!body.access_token) {
          throw new Error("No access token granted");
        }

        return {
          token: body,
          nextUrl: query.state
        };
      } else if (typeof window != 'undefined' && window.auth) {
        return window.auth
      } else {
        return {
          authurl: `https://slack.com/oauth/authorize?client_id=${client_id}&scope=files:read%20files:write:user&redirect_uri=${self}&state=${req.url}`
        }
      }
    }

    componentWillMount() {
      if (this.props.auth.nextUrl) {
        this.props.url.replaceTo(this.props.auth.nextUrl);
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
