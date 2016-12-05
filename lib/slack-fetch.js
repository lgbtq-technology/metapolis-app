import qs from 'qs';

export default function slackFetch(url, args) {
    console.warn('fetching', url, args);
    return fetch(url + "?" + qs.stringify(args)).then(function (res) {
        return res.json()
    }).then(function (body) {
        console.warn('got', body);
        if (body.ok) return body;
        throw new Error(body.error);
    });
}
