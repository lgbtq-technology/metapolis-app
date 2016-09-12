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
const ecstatic = require('ecstatic');

const client_id = process.env.SLACK_APP_CLIENT_ID;
const client_secret = process.env.SLACK_APP_CLIENT_SECRET;
const KEY = process.env.JWT_KEY;

if (!client_id || !client_secret || !KEY) {
    console.warn("SLACK_APP_CLIENT_ID and SLACK_APP_CLIENT_SECRET and JWT_KEY must be set to operate");
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
    menu(null, req, res);
});

function menu(message, req, res) {
    const d = getToken(req);
    if (d) {
        render('menu.html', tr => {
          if (message) {
              tr.select('.Messages').createWriteStream().end(message);
          }
          
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
}

router.post('/purge', function (req, res, next) {
    const d = getToken(req);
    if (d) {
        prune(d.tok.access_token, d.tok.user_id).then(message => {
          menu(message, req, res);
        }).catch(next);
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

router.use(ecstatic({ root: path.resolve(__dirname, 'public') }));

const server = http.createServer(function (req, res) {
    router(req, res, function (e) {
        if (e) console.warn(e.stack || e)
        res.statusCode = 404;
        res.end('404');
    });
}).listen(process.env.PORT || 40617, function (err) {
    if (err) {
        console.warn(err);
        process.exit(1);
    } else {
        console.log(`Listening on port ${server.address().port}`);
    }
});

function prune(token, user_id, nfiles) {
    return slackFetch('https://slack.com/api/files.list', {
        token,
        user: user_id,
        ts_to: Math.floor((Date.now() - 86400000 * 7) / 1000),
        types: 'images',
        count: 1000
    }).then(body => {
        if (body.files.length) {
            return deleteAll(token, body.files)
              .then(() => prune(token, user_id, nfiles || 0 + body.files.length));
        } else if (nfiles) {
            return `Removed ${nfiles} files`;
        } else {
            return "No files to delete";
        }
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
