import React from 'react';
import Head from 'next/head';
import Layout from '../components/layout';

export default class extends React.Component {
  render() {
    return <Layout>
      <Head>
        <title>About metapolis.space</title>
      </Head>

      <h1>About metapolis.space</h1>

      <p>Metapolis.space is an addon helper for communities that use Slack. </p>
      
      <h2> Features</h2>
      <ul>
        <li>There is hosting for images separate from Slack, to work with free limits and a different durability profile for them.</li>
        <li>There are tools for purging oneself from a community somewhat</li>
        <li>There's some help to get a minimal token for using WeeSlack</li>
        <li>More tools in the future</li>
      </ul>

      <p>This is personal project, hosted on my one small server. If you're going to store a ton of pictures here, give me a heads up and maybe I can help you run your own instance.</p>

      <style jsx>{`
        h1 {
          font-size: 2em;
          font-weight: 600;
        }
        h2 { 
          font-size: 1em;
          font-weight: 600;
        }
        img {
          max-width: 100%;
        }
      `}</style>
    </Layout>;
  }
}

