import React from 'react'
export default class extends React.Component {
  render() {
    return <html>
      <head>
        <title> Slack Helper </title>
        <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet"/>
        <link rel='stylesheet' href='/static/site.css'/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </head>
      <body>
        <header className='Masthead Masthead-dark'>
          <h1> Slack Helper </h1>
        </header>
        <main>
          {this.props.children}
        </main>
      </body>
    </html>
  }
}
