var React       = require('react'),
  Router        = require('react-router'),
  Route         = Router.Route,
  NotFoundRoute = Router.NotFoundRoute,
  DefaultRoute  = Router.DefaultRoute,
  RouteHandler  = Router.RouteHandler,
  Link          = Router.Link,
  NotFound      = require('../components/NotFound.react'),
  Nav           = require('../components/Navigation.react'),
  About         = require('../components/About.react'),
  Error         = require('../components/Error.react');

import '../vendor/modernizr-output.js';
import NewRepo from '../components/NewRepo.react';
import ErrorActions from '../actions/ErrorActions';
import ServerStore from '../stores/ServerStore';
import NoRepo from './NoRepo.react.js';
import LiteRepo from './LiteRepo.react.js';
import LiteHome from './LiteHome.react.js';
import RepoSelect from './RepoSelect.react.js';
import ReactDOM from 'react-dom';
import Clipboard from 'clipboard';

class LiteApp extends React.Component {

  componentWillMount(){
    //instantiate clipboard, which uses event delegation to handle all
    //copy btns
    new Clipboard('.copy-btn',{
      target: function(trigger) {
          return trigger.nextElementSibling;
      }
    });

    //litmus test for 'old browsers' similar to https://github.com/burocratik/outdated-browser
      if (!Modernizr.csstransitions || !Modernizr.fetch) {
        // not-supported
        ErrorActions.update(<p>You appear to be using an older browser.
          You may want to consider <a href="http://outdatedbrowser.com/" target="blank">updating</a> 
          for a better and more reliable experience</p>)
      }
  }

  componentWillReceiveProps() {
    ErrorActions.clear();
  }

  render() {
    return (
      <div>
        <Nav lite="1">
          <div className="navbar-left">
            <form className="navbar-form">
              <RepoSelect/>
            </form>
          </div>
        </Nav>
        <div>
          <div className="container">
            <Error/>
          </div>
          {/* this is the important part for route handling */}
          <RouteHandler dvid={ServerStore.state.api}/>
        </div>
      </div>
    );
  }
}

var routes = (
  <Route name="consoleapp" path="/" handler={LiteApp}>
    <DefaultRoute handler={LiteHome}/>
    <Route name="about" path="about" handler={About}/>
    <Route name="newrepo"  path="repo"  handler={NewRepo}/>
    <Route name="repo"  path="repo/:alias"  handler={LiteRepo}/>
    <NotFoundRoute handler={NotFound}/>
  </Route>
);

Router.run(routes, function (Handler) {
  ReactDOM.render(<Handler/>, document.getElementById('dvid-console-app'));
});

module.exports = LiteApp;