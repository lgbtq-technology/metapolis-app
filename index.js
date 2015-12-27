"use strict";
const http = require('http');
const router = require('router')();
const fetch = require('node-fetch');
const url = require('url');
const qs = require('querystring');

const client_id = process.env.SLACK_APP_CLIENT_ID;
const client_secret = process.env.SLACK_APP_CLIENT_SECRET;

router.get('/auth', function (req, res) {
    slackFetch('https://slack.com/api/oauth.access', {
        client_id,
        client_secret,
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
            res.setHeader('Content-Type', 'text/plain');
            prune(token, body.user_id, res);
        })
    }).catch(function (err) {
        console.warn(err.stack || err);
        res.end('error');
    });
});

router.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end("<a href='https://slack.com/oauth/authorize?client_id=" + client_id + "&scope=files:read%20files:write:user'>Go</a>");
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
        ts_to: Math.floor((Date.now() - 86400000 * 30) / 1000),
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
