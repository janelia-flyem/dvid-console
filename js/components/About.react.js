import React from 'react';
import {Router, browserHistory } from 'react-router';
import {wording} from '../utils/config.js';

class About extends React.Component {

  back(){
    var hasHistory = this.context.router.goBack()
    if(!hasHistory){
      this.context.router.transitionTo('/')
    }

  }

  render() {
    return (
      <div className='container'><div className='row'>
        <div className='col-xs-12'>
          {!window.DVID_LITE && <a id="forkme_banner" href="https://github.com/janelia-flyem/dvid">View DVID on GitHub</a>}
          <ol className="breadcrumb">
            <li><a onClick={this.back.bind(this)}>Back</a></li>
          </ol>
          <h3>Welcome to {wording.app_name}</h3>

          <p>DVID documentation can be found on <a href="https://github.com/janelia-flyem/dvid">github</a> as
            well as the automatically updated <a href="https://godoc.org/github.com/janelia-flyem/dvid">Go Doc
            documentation</a>.</p>
          { window.DVID_LITE &&
            <p>DICED documentation can also be found on <a href="https://github.com/janelia-flyem/diced">github</a>.</p>
          }

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
      </div></div>
    );
  }
}

About.contextTypes = {
  router: React.PropTypes.func.isRequired
};

module.exports = About;
