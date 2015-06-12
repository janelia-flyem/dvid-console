var React = require('react'),
  Router = require('react-router'),
  Link   = Router.Link;

var Navigation = React.createClass({
  mixins: [Router.State],
  render: function () {
    return (
<nav className="navbar navbar-default">
  <div className="container-fluid">
    <div className="navbar-header">
      <Link to="consoleapp" className="navbar-brand">DVID</Link>
      <Link to="admin" className="navbar-brand"><span className="glyphicon glyphicon-cog" aria-hidden="true"></span></Link>
      <Link to="about" className="navbar-brand"><span className="glyphicon glyphicon-question-sign" aria-hidden="true"></span></Link>
    </div>
  </div>
</nav>
    );
  }
});

module.exports = Navigation;
