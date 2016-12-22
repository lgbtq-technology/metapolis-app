import React from 'react';
import Auth from './auth';
import cookie from 'cookie';

const DEFAULT_PERMS = [
  'files:read',
  'files:write:user'
];

const client_id = '3275311328.17418201121';

export default (perms, Component) => {
  if (typeof perms == 'function') {
    Component = perms;
    perms = DEFAULT_PERMS;
  }

  return class extends React.Component {
    static async getInitialProps(ctx) {
      const {query, req} = ctx;
      const superProps = typeof Component.getInitialProps == 'function' ? await Component.getInitialProps(ctx) : {}
      const auth = await this.getAuthProps(ctx);
      const self = `http://${req ? req.headers.host : window.location.host }/auth`;
      return {
        ...superProps,
        authurl: `https://slack.com/oauth/authorize?client_id=${client_id}&scope=${encodeURIComponent(perms.join(' '))}&redirect_uri=${self}&state=${ctx.pathname}`,
        auth
      };
    }

    static async getAuthProps({req, res, query}) {
      const session = req && req.headers.cookie && cookie.parse(req.headers.cookie).session
      if (req && session) {
        try {
          const token = await fetch(`http://localhost:3001/-/session/${session}`).then(res => res.json())
          if (token && scopesMatch(token.scope, perms)) {
            return { token };
          }
        } catch (e) {
          console.warn(e)
        }
      }

      if (typeof window != 'undefined' && window.auth) {
        return window.auth
      }
    }

    constructor(props) {
      super(props)
      if (props.auth && props.auth.token) {
        global.auth = props.auth
      }
    }

    render() {
      if (this.props.auth && this.props.auth.token && scopesMatch(this.props.auth.token.scope, perms)) {
        return <Component {...this.props}/>
      } else {
        return <Auth authurl={this.props.authurl}/>
      }
    }
  }
}

function scopesMatch(user, required) {
  if (typeof required == 'string') {
    required = required.split(',');
  }
  if (typeof user == 'string') {
    user = user.split(',');
  }

  const userSet = new Set(user);

  for (let requirement of required) {
    if (!userSet.has(requirement)) {
      return false;
    }
  }

  return true;
}
