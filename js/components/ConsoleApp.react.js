var React       = require('react'),
  ReactDOM      = require('react-dom'),
  Router        = require('react-router'),
  Route         = Router.Route,
  NotFoundRoute = Router.NotFoundRoute,
  DefaultRoute  = Router.DefaultRoute,
  Link          = Router.Link,
  RouteHandler  = Router.RouteHandler,
  Home          = require('./Home.react'),
  NotFound      = require('./NotFound.react'),
  Nav           = require('./Navigation.react'),
  Admin         = require('./Admin.react'),
  About         = require('./About.react'),
  Error         = require('./Error.react');

import Repo from './Repo.react';
import NewRepo from './NewRepo.react';
import ErrorActions from '../actions/ErrorActions';
import ServerStore from '../stores/ServerStore';

class ConsoleApp extends React.Component {

  componentWillReceiveProps() {
    ErrorActions.clear();
  }

  render() {
    return (
      <div>
        <Nav />
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
  <Route name="consoleapp" path="/" handler={ConsoleApp}>
    <DefaultRoute handler={Home}/>
    <Route name="admin" path="admin" handler={Admin}/>
    <Route name="about" path="about" handler={About}/>
    <Route name="newrepo"  path="repo"  handler={NewRepo}/>
    <Route name="repo"  path="repo/:uuid"  handler={Repo}/>
    <NotFoundRoute handler={NotFound}/>
  </Route>
);

Router.run(routes, function (Handler) {
  ReactDOM.render(<Handler/>, document.getElementById('dvid-console-app'));
});

module.exports = ConsoleApp;
