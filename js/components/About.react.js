var React = require('react'),
  Router = require('react-router'),
  Link   = Router.Link;


var About = React.createClass({
  getInitialState: function() {
    return {
    };
  },

  // this gets called after the fist time the component is loaded into the page.
  componentDidMount: function () {
    return;
  },

  render: function () {
    return (
      <div>
        <h1>About</h1>
      </div>
    );
  }
});

module.exports = About;
