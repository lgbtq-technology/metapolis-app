import React from 'react';
import AuthRequired from '../components/auth-required';
import Layout from '../components/layout';
import purgeFiles from '../lib/purge-files';
import Button from '../components/button';

export default AuthRequired(class extends React.Component {
  constructor (props) {
    super(props);
    this.state = { days: 7, working: false, npurged: null }

  }
  async purgeFiles(ev) {
    this.setState({ working: true });
    ev.preventDefault()
    const nfiles = await purgeFiles({
      token: this.props.auth.token,
      days: this.state.days
    });

    this.setState({ npurged: nfiles });
  }

  handleChange(ev) {
    this.setState({days: Number(ev.target.value)});
  }

  reset() {
    this.setState({working: false, npurged: null });
  }
  
  render() {
    return <Layout auth={this.props.auth}>
      {
        this.state.npurged != null
          ? <div>
              <p>{this.state.npurged} file(s) purged.</p>
              <Button onClick={() => this.reset()} dark>Ok</Button>
            </div>
          : this.state.working
            ?  <div>Purging...</div>
            : <form action='/purge' method='post' onSubmit={this.purgeFiles.bind(this)}>
                <p>Purge private files older than <input name="days" value={this.state.days} onChange={e => this.handleChange(e)} type="number" size="2" /> days old?</p>
                <Button type='submit' dark>Purge</Button>
              </form>
      }
  
    </Layout>
  }
});
