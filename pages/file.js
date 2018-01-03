import React from 'react';
import Head from 'next/head';
import Layout from '../components/layout';
import fetch from 'isomorphic-fetch';
import url from 'url';
import config from '../config';

export default class extends React.Component {
  static async getInitialProps({query}) {
    const file = query.f;
    const res = await fetch(url.resolve(config.api, `/-/metadata/${file}`))
    const metadata = await res.json();
    return metadata;
  }

  render() {
    const ext = this.props.type.split('/')[1];
    const image = url.resolve(config.api, `/-/files/${this.props.team}/${this.props.user}/${this.props.file}.${ext}`);
    //const thumb = this.props.sizes['256x256'] || image;
    const large = url.resolve(config.api, this.props.sizes['1000x1000'] || image);
    const title = this.props.title || this.props.name || "";
    const unfurl = this.props.unfurl || this.props.unfurl == null;
    return <Layout>
      <Head>
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:title" content={title}/>
        { unfurl && <meta name="twitter:image" content={large}/> }
        <meta property="og:title" content={title}/>
        { unfurl && <meta property="og:image" content={large}/> }
        { unfurl && image != large && <meta property="og:image:width" content="1000"/> }
        /*{ unfurl && image != large && <meta property="og:image:height" content="1000"/> }*/
        <meta property="og:image:type" content={this.props.type}/>
      </Head>
      {
        this.props.title
        ? <h1>{this.props.title}</h1>
        : <h1>{this.props.name}</h1>
      }
      <img src={image} />
      <style jsx>{`
        h1 {
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
