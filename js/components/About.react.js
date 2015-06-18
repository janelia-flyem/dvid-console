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
		    <a id="forkme_banner" href="https://github.com/janelia-flyem/dvid">View DVID on GitHub</a>
        <h3>Welcome to DVID</h3>

        <p>DVID documentation can be found on the extensive <a href="https://github.com/janelia-flyem/dvid#dvid-">README</a> on
          github as well as the automatically updated <a href="https://godoc.org/github.com/janelia-flyem/dvid">Go Doc
          documentation</a>.</p>
        <p>The <a href="/console/index.html">DVID admin console</a> for this server may be available if you have permissions.</p>

        <h4>HTTP API</h4>

        <p>
          Each data type within DVID exposes commands and a HTTP API allowing clients like this browser to retrieve and put data.
          Command-line and HTTP API documentation is currently distributed over a variety of data types.  Visit
          the <a href="/api/help">/api/help HTTP endpoint</a> to review this server's current API.
        </p>

        <h3>Licensing</h3>
        <p>DVID is released under the <a href="http://janelia-flyem.github.com/janelia_farm_license.html">Janelia
        Farm license</a>, a <a href="http://en.wikipedia.org/wiki/BSD_license#3-clause_license_.28.22New_BSD_License.22_or_.22Modified_BSD_License.22.29"> 3-clause
        BSD license</a>.</p>
      </div>
    );
  }
});

module.exports = About;
