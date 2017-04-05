import React from 'react';
import {Link} from 'react-router';
import {wording} from '../utils/config.js';


var Navigation = React.createClass({
  render: function () {
    return (
<nav className="navbar navbar-default">
  <div className="container-fluid">
    <div className="navbar-header">
      <Link to="consoleapp" className="navbar-brand">{wording.app_name}</Link>
    </div>

      {this.props.children}

    <div>
      <ul className="nav navbar-nav navbar-right">
      {
        this.props.lite !=="1" && 
        <li><Link to="admin" className="navbar-brand"><span className="glyphicon glyphicon-cog" aria-hidden="true"></span></Link></li>
       
       }
        <li><Link to="about" className="navbar-brand"><span className="glyphicon glyphicon-question-sign" aria-hidden="true"></span></Link></li>
      </ul>
    </div>
  </div>
</nav>
    );
  }
});

module.exports = Navigation;
