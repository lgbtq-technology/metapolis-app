import React from 'react';
import Layout from '../components/layout';
import Menu from '../components/menu';
import AuthRequired from '../components/auth-required';

export default AuthRequired(class extends React.Component {
	render () {
		return <Layout auth={this.props.auth}>
			<Menu/>
		</Layout>;
	}
})