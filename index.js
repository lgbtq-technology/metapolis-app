"use strict";
const http = require('http');
const router = require('router')();
const fetch = require('node-fetch');
const url = require('url');
const qs = require('querystring');
const fs = require('fs');
const trumpet = require('trumpet');
const path = require('path');
const jwt = require('jwt-simple');
const P = require('bluebird');
const pump = P.promisify(require('pump'));

const client_id = process.env.SLACK_APP_CLIENT_ID;
const client_secret = process.env.SLACK_APP_CLIENT_SECRET;
const KEY = 'once there was a little boy with a curl in the middle of his forehead';

if (!client_id || !client_secret) {
    console.warn("SLACK_APP_CLIENT_ID and SLACK_APP_CLIENT_SECRET must be set to operate");
    process.exit(1)
}

router.get('/auth', function (req, res) {
    slackFetch('https://slack.com/api/oauth.access', {
        client_id,
        client_secret,
        redirect_uri: 'http://' + req.headers.host + '/auth',
        code: url.parse(req.url, true).query.code
    }).then(function (body) { 
        if (body.access_token) {
            return body.access_token;
        } else {
            throw new Error("No access token granted");
        }
    }).then(function (token) {
        return slackFetch('https://slack.com/api/auth.test', {
            token: token
        }).then(function (body) {
            const tok = jwt.encode({access_token: token, user_id: body.user_id, time: Date.now()}, KEY);
            res.setHeader('Location', `/menu?auth=${tok}`);
            res.statusCode = 302;
            res.end();
        })
    }).catch(function (err) {
        console.warn(err.stack || err);
        res.end('error');
    });
});

router.get('/menu', function (req, res) {
    const d = getToken(req);
    if (d) {
        render('menu.html', tr => {
          tr.selectAll('form', el => {
              el.getAttribute('action', val => {
                  el.setAttribute('action', `${val}?auth=${d.auth}`);
              });
          });
          return res;
        });
    } else {
        res.end('token expired');
    }
});

router.post('/purge', function (req, res) {
    const d = getToken(req);
    if (d) {
        prune(d.tok.access_token, d.tok.user_id, res);
    } else {
        res.end('token expired');
    }
});

router.get('/', function (req, res) {
    const self = `http://${req.headers.host}/auth`;
    const authurl = `https://slack.com/oauth/authorize?client_id=${client_id}&scope=files:read%20files:write:user&redirect_uri=${self}`;
    render('auth.html', tr => {
      tr.select("#authurl").setAttribute('href', authurl);
      return res;
    });
});

http.createServer(function (req, res) {
    router(req, res, function (e) {
        if (e) console.warn(e.stack || e)
        res.statusCode = 404;
        res.end('404');
    });
}).listen(process.env.PORT || 40617);

function prune(token, user_id, res) {
    slackFetch('https://slack.com/api/files.list', {
        token,
        user: user_id,
        ts_to: Math.floor((Date.now() - 86400000 * 7) / 1000),
        types: 'images',
        count: 1000
    }).then(function (body) {
        if (body.files.length) {
            return deleteAll(token, body.files, res).then(function () {
                return prune(token, user_id, res);
            });
        } else {
            res.end('done');
        }
    }).catch(function (err) {
        console.warn(err.stack || err);
        res.statusCode = 500;
        res.end('error');
    })
}

function deleteAll(token, files, res) {
    const file = files.shift();

    if (!file) return;

    return slackFetch('https://slack.com/api/files.delete', {
        token: token,
        file: file.id
    }).then(function () {
        return deleteAll(token, files, res);
    });
}

function slackFetch(url, args) {
    console.warn('fetching', url, args);
    return fetch(url + "?" + qs.stringify(args)).then(function (res) {
        return res.json()
    }).then(function (body) {
        console.warn('got', body);
        if (body.ok) return body;
        throw new Error(body.error);
    });
}

function render(template, fn) {
    const tr = trumpet();
    const layout = trumpet();
    return P.resolve(tr).then(fn).then(res => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      const a = pump(fs.createReadStream(path.resolve(__dirname, 'layout.html')), layout, res);
      const main = layout.select('main').createWriteStream();
      const b = pump(fs.createReadStream(path.resolve(__dirname, template)), tr, main);
      return P.join(a, b).catch(err => {
        console.warn(err.stack || err);
        res.end('error');
      });
    });
}

function getToken(req) {
    const query = qs.parse(req._parsedUrl.query);
    const tok = jwt.decode(query.auth, KEY);
    if (tok.time + 3600000 < Date.now()) {
        return null;
    } else {
        return { tok, auth: query.auth };
    }
}
