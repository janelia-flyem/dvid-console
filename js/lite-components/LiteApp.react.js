var React       = require('react'),
  Router        = require('react-router'),
  Route         = Router.Route,
  NotFoundRoute = Router.NotFoundRoute,
  DefaultRoute  = Router.DefaultRoute,
  RouteHandler  = Router.RouteHandler,
  NotFound      = require('../components/NotFound.react'),
  Nav           = require('../components/Navigation.react'),
  About         = require('../components/About.react'),
  Error         = require('../components/Error.react');

import NewRepo from '../components/NewRepo.react';
import ErrorActions from '../actions/ErrorActions';
import ServerStore from '../stores/ServerStore';
import NoRepo from './NoRepo.react.js';
import LiteRepo from './LiteRepo.react.js';
import RepoSelect from './RepoSelect.react.js';

class LiteApp extends React.Component {

  componentWillReceiveProps() {
    ErrorActions.clear();
  }

  render() {
    return (
      <div>
        <Nav lite="1">
        <form className="navbar-form navbar-left">
          <RepoSelect/>
        </form>
        </Nav>
        <div className="container-fluid">
          <Error/>
          {/* this is the important part for route handling */}
          <RouteHandler dvid={ServerStore.state.api}/>
        </div>
      </div>
    );
  }
}

var routes = (
  <Route name="consoleapp" path="/" handler={LiteApp}>
    <DefaultRoute handler={NoRepo}/>
    <Route name="about" path="about" handler={About}/>
    <Route name="newrepo"  path="repo"  handler={NewRepo}/>
    <Route name="repo"  path="repo/:uuid"  handler={LiteRepo}/>
    <NotFoundRoute handler={NotFound}/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});

module.exports = LiteApp;