import React from 'react';
import ReactDom from 'react-dom';

export default class Select extends React.Component {
  constructor(props) {
    super(props);
    this.n = 0;
    this.state = {
      out: -1,
      in: false,
      focused: false,
      filter: '',
      selected: null
    };
  }

  render() {
    return <div onMouseOver={() => this.setState({in: true})} onMouseLeave={() => this.setState({in: false, out: this.n++})}>
      <input
        type="text"
        onChange={(ev) => this.setState({filter: ev.target.value})}
        onKeyDown={ev => this.handleKeyDown(ev)}
        onFocus={() => this.setState({focused: true})}
        onBlur={() => this.setState({focused: false, blurred: this.n++})}
      />
      {
        (this.state.focused || this.state.out < this.state.blurred) && <div className='container'>
          {
            this.filtered().map(c => c.id == this.state.selected
                                ? <div className="selected" key={c.id} ref="selected" onMouseUp={() => this.select(c.id)}>#{c.name}</div>
                                : <div key={c.id} onMouseUp={() => this.select(c.id)}>#{c.name}</div>)
          }
        </div>
      }
      <style jsx>{`
        .container {
          padding: 0.5em;
          border: solid 1px #ddf;
          max-height: 8em;
          overflow-y: auto;
          cursor: pointer;
        }
        .selected {
          background-color: #ddf;
        }
      `}</style>
    </div>;
  }

  select(id) {
    if (this.props.onSelect) this.props.onSelect(id);
  }

  componentDidUpdate() {
    const ref = this.refs.selected;
    if (ref) {
      const node = ReactDom.findDOMNode(ref);
      if (node) node.scrollIntoView()
    }
  }

  handleKeyDown(ev) {
    if (ev.key == 'ArrowDown' || ev.key == 'ArrowUp') {
      const direction = ev.key == 'ArrowDown' ? 1 : -1;
      const selected = this.state.selected;
      const filtered = this.filtered();
      const next = filtered[(filtered.findIndex(c => c.id == selected) + direction) % filtered.length].id
      this.setState({selected: next});
    } else if (ev.key == 'Enter') {
      const selected = this.state.selected || (this.filtered().find(c => c.name == this.state.filter) || {}).id
      this.select(selected);
    }
  }

  filtered() {
    return this.props.list.filter(e => e.name.indexOf(this.state.filter) != -1)
  }
};

