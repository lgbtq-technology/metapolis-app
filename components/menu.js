import Link from 'next/link';

export default () => (
  <nav>
    <p><Link href='/'><a>Home</a></Link></p>
    <p><Link href='/upload'><a>Upload File</a></Link></p>
    <p><Link href='/list'><a>List Your Files</a></Link></p>
    <p><Link href='/logout'><a>Log Out</a></Link></p>
    <p>Advanced options</p>
    <p><Link href='/purge'><a>Purge Private Files</a></Link> hosted on slack</p>
    <p><Link href="/weeslack"><a>Get a Wee-Slack token</a></Link></p>
  </nav>
);
