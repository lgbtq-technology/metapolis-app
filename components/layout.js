import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default (props) => (<div>
  <Head>
    <title> {props.auth ? props.auth.token.team_name : '' } Slack Helper </title>
    <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
  </Head>
  <header className='Masthead'>
    <h1> {props.auth ? props.auth.token.team_name : '' } Slack Helper </h1>
    <Link href='/'><a style={ { color: 'white' , textDecoration: 'none' } }>Home</a></Link>
  </header>
  <main>
    {props.children}
  </main>
  <style jsx>{`
    main {
      max-width: 50rem;
      margin: 3em auto;
    }
    .Masthead {
      padding: 1em;
      background-color: #4D394B;
      color: #AB9BA9;
    }

    h1 {
      font-size: 2rem;
    }
  `}</style>

  <style jsx global>{`
    html {
      box-sizing: border-box;
    }

    *, *:before, *:after {
      box-sizing: inherit;
    }

    html {
      font-size: 100%;
      line-height: 1.5rem;
      color: black;
      background-color: white;
      font-family: 'Lato', 'Helvetica', sans-serif;
    }

    *, *:before, *:after {
      font-size: inherit;
      line-height: inherit;
    }

    html, body {
      margin: 0;
    }
  `}</style>
</div>)
