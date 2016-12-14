import qs from 'qs';
import fetch from 'isomorphic-fetch';

export default function slackFetch(url, args) {
    console.warn('fetching', url, args);
    return fetch(url + "?" + qs.stringify(args)).then(res => {
        return res.json()
    }).then(body => {
        console.warn('got', body);
        if (body.ok) return body;
        throw new Error(body.error);
    });
}
