import slackFetch from './slack-fetch';
export default prune;

function prune(token, nfiles) {
    console.log('pruning, already did ', nfiles)
    return slackFetch('https://slack.com/api/files.list', {
        token: token.access_token,
        user: token.user_id,
        //ts_to: Math.floor((Date.now() - 86400000 * 2) / 1000),
        types: 'images',
        count: 1000
    }).then(body => {
        return deleteAll(token.access_token, body.files).then(n => {
            if (body.paging.pages > body.paging.page) {
                return prune(token, nfiles + n)
            } else {
                return n
            }
        })
    })
}

function deleteAll(token, files, n) {
    const file = files.shift();
    n = n || 0;

    if (!file) return Promise.resolve(n);

    return slackFetch('https://slack.com/api/files.delete', {
        token: token,
        file: file.id
    }).then(function () {
        return deleteAll(token, files, n + 1);
    });
}
