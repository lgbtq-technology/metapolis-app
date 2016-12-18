import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default class extends React.Component {
  render() {
    return <div>
      <Head>
        <title> {this.props.auth ? this.props.auth.token.team_name : '' } Slack Helper </title>
        <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet"/>
        <link rel='stylesheet' href='/static/site.css'/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>
      <header className='Masthead Masthead-dark'>
        <h1> {this.props.auth ? this.props.auth.token.team_name : '' } Slack Helper </h1>
        <Link href='/'>Home</Link>
      </header>
      <main>
        {this.props.children}
      </main>
    </div>
  }
}
