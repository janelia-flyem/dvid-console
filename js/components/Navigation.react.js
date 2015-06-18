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
    </div>
    <div>
      <ul className="nav navbar-nav navbar-right">
        <li><Link to="admin" className="navbar-brand"><span className="glyphicon glyphicon-cog" aria-hidden="true"></span></Link></li>
        <li><Link to="about" className="navbar-brand"><span className="glyphicon glyphicon-question-sign" aria-hidden="true"></span></Link></li>
      </ul>
    </div>
  </div>
</nav>
    );
  }
});

module.exports = Navigation;
