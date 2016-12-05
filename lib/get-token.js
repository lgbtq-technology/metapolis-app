import cookie from 'cookie';
import jwt from 'jwt-simple';

export default (req) => {
  if (req && req.headers.cookie) {
    const cookies = cookie.parse(req.headers.cookie)
	  const tok = jwt.decode(cookies.auth, process.env.JWT_KEY);
	  return tok
  }
}