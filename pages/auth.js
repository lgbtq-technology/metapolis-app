import React from 'react';
import Layout from '../components/layout';
import AuthRequired from '../components/auth-required';

export default AuthRequired(class extends React.Component {
	render () {
		return <Layout><div>Logging You In...</div></Layout>;
	}
})
