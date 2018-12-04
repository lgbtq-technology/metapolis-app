import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default (props) => (<div className="root">
  <Head>
    <title> {props.auth ? props.auth.token.team_name : '' } Slack Helper </title>
    <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
  </Head>
  <header className='Masthead'>
    <h1> {props.auth ? props.auth.token.team_name : '' } Slack Helper </h1>
    <nav className="TopNav">
      <Link href='/'><a style={ { color: 'white' , textDecoration: 'none' } }>Home</a></Link>
      <Link href='/about'><a style={ { color: 'white' , textDecoration: 'none' } }>About</a></Link>
    </nav>
  </header>
  <main>
    {props.children}

  </main>
  <footer>
    <p>This site is maintained by <a href='http://dinhe.net/~aredridel'>Aria Stewart</a> and is an <a href='https://github.com/lgbtq-technology/lgbtq-helper-app'>an open project</a>. Contributions welcome!</p>
  </footer>

  <style jsx>{`
    .root {
      min-height: 100%;
      display: flex;
      flex-direction: column;
      flex: 1 0 auto;
    }

    main {
      flex-direction: column;
      flex: 1 0 auto;
      max-width: 50rem;
      margin: 3em auto;
    }

    footer {
      text-align: center;
      margin: 1em;
    }

    .Masthead {
      padding: 1em;
      background-color: #4D394B;
      color: #AB9BA9;
    }

    h1 {
      font-size: 2rem;
    }

    .TopNav {
      display: flex;
    }

    .TopNav a {
      padding-right: 1rem;
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
      min-height: 100%;
    }

    *, *:before, *:after {
      font-size: inherit;
      line-height: inherit;
    }

    html, body, body>div:first-child, body>div>div  {
      display: flex;
      flex-direction: column;
      flex: 1 0 auto;
      margin: 0;
    }

    body>div:last-child {
      display: none;
    }
  `}</style>
</div>)
