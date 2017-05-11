import Link from 'next/link';

export default () => (
  <nav>
    <p><Link><a href='/'>Home</a></Link></p>
    <p><Link><a href='/purge'>Purge Private Files</a></Link></p>
    <p><Link><a href='/upload'>Upload File</a></Link></p>
    <p><Link><a href='/list'>List Your Files</a></Link></p>
    <p><Link><a href='/logout'>Log Out</a></Link></p>
  </nav>
);
