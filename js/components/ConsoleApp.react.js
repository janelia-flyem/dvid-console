var React       = require('react'),
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
  Error         = require('./Error.react'),
  dvid          = require('dvid');

var ConsoleApp = React.createClass({
  getInitialState: function () {
    return {
      //dvid: dvid.connect({"host": "emdata1.int.janelia.org", "port": 8500})
      dvid: dvid.connect({host: 'emdata1', port: 65534})
    }
  },
  render: function () {
    return (
      <div>
        <Nav />
        <div className="container-fluid">
          <Error/>
          {/* this is the important part for route handling */}
          <RouteHandler dvid={this.state.dvid}/>
        </div>
      </div>
    );
  }
});

var routes = (
  <Route name="consoleapp" path="/" handler={ConsoleApp}>
    <DefaultRoute handler={Home}/>
    <Route name="admin" path="admin" handler={Admin}/>
    <Route name="about" path="about" handler={About}/>
    <NotFoundRoute handler={NotFound}/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});

module.exports = ConsoleApp;
