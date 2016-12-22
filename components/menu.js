import Link from 'next/link';

export default () => <nav>
  <p><Link href='/'>Home</Link></p>
  <p><Link href='/purge'>Purge Private Files</Link></p>
  <p><Link href='/upload'>Upload File</Link></p>
  <p><Link href='/logout'>Log Out</Link></p>
</nav>;
