Slack Helper App
================

A user interface for [the Slack Helper API](https://github.com/lgbtq-technology/lgbtq-helper-api), providing file hosting and posting to slacks as well as utility functions for managing Slack communities.

The main instance is available at https://metapolis.space/

Contributing
------------

This application is a [next.js](https://www.npmjs.com/package/next) application. The entry points are the pages in the `pages/` directory. As in all next.js apps, they are React components with a `getInitialProps` static method to do any data fetching to do initial rendering. There should be no secret keys used in this application as the state is fully shared with the end user.

There is a configuration file to tell the application its own URL (for constructing self-referntial URLs for OAuth2 use) and the URL of the API endpoint that serves it.
