Slack Helper App
================

A user interface for [the Slack Helper API](https://github.com/lgbtq-technology/lgbtq-helper-api), providing file hosting and posting to slacks as well as utility functions for managing Slack communities.

The main instance is available at https://metapolis.space/

Features
--------

* File Management
	* upload for off-slack hosting
	* listing of files
	* view page for uploaded files, including openGraph tags so slack displays linked files nicely.
* Image purging from slack-based hosting

Contributing
------------

This application is a [next.js](https://www.npmjs.com/package/next) application. The entry points are the pages in the `pages/` directory. As in all next.js apps, they are React components with a `getInitialProps` static method to do any data fetching to do initial rendering. There should be no secret keys used in this application as the state is fully shared with the end user.

There is a configuration file to tell the application its own URL (for constructing self-referntial URLs for OAuth2 use) and the URL of the API endpoint that serves it.

Run this thing locally
----------------------

Clone the repository, `cd` into it, and `npm install`

rename `/config.example.js` to `/config.js`, and update the `api` and `self` values. if you're just looking to contribute to the main instance at https://metapolis.space, you can simply change the values to:

```js
{
  api: 'https://api.metapolis.space/',
  self: 'https://metapolis.space/auth'
}

```
