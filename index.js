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
const multer = require('multer');

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
            return body;
        } else {
            throw new Error("No access token granted");
        }
    }).then(function (token) {
        const tok = jwt.encode(Object.assign(token, { time: Date.now() }), KEY);
        res.setHeader('Location', `/menu?auth=${tok}`);
        res.statusCode = 302;
        res.end();
    }).catch(function (err) {
        console.warn(err.stack || err);
        res.end('error');
    });
});

router.get('/menu', context(function (ctx) {
    menu(null, ctx);
}));

function menu(message, ctx) {
    if (!ctx.token) throw new Error("No token found");
    return ctx.render('menu.html', tr => {
        if (message) {
            tr.select('.Messages').createWriteStream().end(message);
        }
    });
}

router.post('/purge', context(function (ctx) {
    if (ctx.token) {
        prune(ctx.token).then(message => {
          menu(message, ctx);
        }).catch(ctx.next);
    } else {
        res.end('token expired');
    }
}));

router.get('/upload', context(ctx => {
    return ctx.render('upload.html');
}));

const uploads = multer({ dest: path.resolve(__dirname, 'storage/temp') });
router.post('/upload', uploads.any(), function (req, res) {
    console.warn(req.files);
    res.end('being built');
});

router.get('/', context(function (ctx) {
    const self = `http://${req.headers.host}/auth`;
    const authurl = `https://slack.com/oauth/authorize?client_id=${client_id}&scope=files:read%20files:write:user&redirect_uri=${self}`;
    return ctx.render('auth.html', tr => {
      tr.select("#authurl").setAttribute('href', authurl);
    });
}));

router.use(ecstatic({ root: path.resolve(__dirname, 'public') }));

router.use(function (err, req, res, next) {
    if (err.statusCode) {
        res.statusCode = err.statusCode;
    } else {
        res.statusCode = 500;
    }
    console.warn(err.stack || err);
    res.end('error');
});

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

function prune(token, nfiles) {
    return slackFetch('https://slack.com/api/files.list', {
        token: token.access_token,
        user: token.user_id,
        ts_to: Math.floor((Date.now() - 86400000 * 7) / 1000),
        types: 'images',
        count: 1000
    }).then(body => {
        if (body.files.length) {
            return deleteAll(token, body.files)
              .then(() => prune(token, nfiles || 0 + body.files.length));
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

function context(handler) {
    return function (req, res, next) {
        return P.try(() => {
            const tokenData = getToken(req);
            console.warn(tokenData);
            const token = tokenData && tokenData.tok;
            return {
                req,
                res,
                token,
                render: (template, fn) => {
                    const tr = trumpet();
                    const layout = trumpet();
                    if (tokenData) {
                        layout.selectAll('.Masthead h1, title', el => {
                            el.createWriteStream().end(`${token.team_name} Helper`);
                        });
                        
                        tr.selectAll('form', el => {
                            el.getAttribute('action', val => {
                                el.setAttribute('action', `${val}?auth=${tokenData.auth}`);
                            });
                        });
                        
                        tr.selectAll('a', el => {
                            el.getAttribute('href', val => {
                                el.setAttribute('href', `${val}?auth=${tokenData.auth}`);
                            });
                        });
                    }
                
                    return P.resolve(tr).then(fn).then(() => {
                        res.setHeader('Content-Type', 'text/html; charset=utf-8');
                        const a = pump(fs.createReadStream(path.resolve(__dirname, 'layout.html')), layout, res);
                        const main = layout.select('main').createWriteStream();
                        const b = pump(fs.createReadStream(path.resolve(__dirname, template)), tr, main);
                        return P.join(a, b);
                    });
                }
            };
        }).then(handler).catch(next);
    };
}

function getToken(req) {
    const query = qs.parse(req._parsedUrl.query);
    if (!query.auth) return null;
    const tok = jwt.decode(query.auth, KEY);
    if (tok.time + 3600000 < Date.now()) {
        return null;
    } else {
        return { tok, auth: query.auth };
    }
}
