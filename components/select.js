import React from 'react';
import ReactDOM from 'react-dom';

export default class Select extends React.Component {
  constructor(props) {
    super(props);
    this.n = 1;
    this.state = {
      out: 0,
      clicked: 0,
      blurred: 0,
      focused: false,
      filter: '',
      selected: null
    };
  }

  render() {
    const state = this.state;
    return <div onMouseLeave={() => this.setState({out: this.n++})}>
      <input
        ref="input"
        type="text"
        value={state.filter}
        onChange={(ev) => this.setState({filter: ev.target.value.toLowerCase()})}
        onKeyDown={ev => this.handleKeyDown(ev)}
        onFocus={() => this.setState({focused: true})}
        onBlur={() => this.setState({focused: false, blurred: this.n++})}
      />
      {
        (state.focused || state.out < state.blurred) && <div className='container'>
          {
            this.filtered().map(c => c.id == (state.selected || {}).id
                                ? <div className="selected" key={c.id} ref="selected" onMouseUp={() => this.select(c)}>#{c.name}</div>
                                : <div key={c.id} onMouseUp={() => this.select(c)}>#{c.name}</div>)
          }
        </div>
      }
      <style jsx>{`
        input {
          width: 100%;
        }
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

  select(selected) {
    ReactDOM.findDOMNode(this.refs.input).blur();
    this.setState({filter: selected.name, out: 0, blurred: 0, clicked: 0, focused: false});
    if (this.props.onSelect) this.props.onSelect(selected);
  }

  componentDidUpdate() {
    const ref = this.refs.selected;
    if (ref) {
      const node = ReactDOM.findDOMNode(ref);
      if (node) node.scrollIntoView()
    }
  }

  handleKeyDown(ev) {
    if (ev.key == 'ArrowDown' || ev.key == 'ArrowUp') {
      const direction = ev.key == 'ArrowDown' ? 1 : -1;
      const selected = this.state.selected || {};
      const filtered = this.filtered();
      const next = filtered[(filtered.findIndex(c => c.id == selected.id) + direction) % filtered.length]
      this.setState({selected: next});
    } else if (ev.key == 'Enter') {
      const selected = this.state.selected || (this.filtered().find(c => c.name == this.state.filter) || {})
      this.select(selected);
    }
  }

  filtered() {
    return this.props.list.filter(e => e.name.indexOf(this.state.filter) != -1)
  }
};

