import React from 'react';
import Auth from './auth';

const client_id = '3275311328.17418201121';

export default (Component) => {
  return class extends React.Component {
    static async getInitialProps(ctx) {
      const {query, req} = ctx;
      const superProps = typeof Component.getInitialProps == 'function' ? await Component.getInitialProps(ctx) : {}
      const auth = await this.getAuthProps(ctx);
      return {
        ...superProps,
        auth
      };
    }

    static async getAuthProps({req, res, query}) {
      const self = `http://${req ? req.headers.host : window.location.host }/auth`;
      if (typeof window != 'undefined' && window.auth) {
        return window.auth
      } else {
        return {
          authurl: `https://slack.com/oauth/authorize?client_id=${client_id}&scope=files:read%20files:write:user&redirect_uri=${self}&state=${req.url}`
        }
      }
    }

    render() {
      if (this.props.auth.token) {
        return <Component {...this.props}/>
      } else {
        return <Auth authurl={this.props.auth.authurl}/>
      }
    }
  }
}
