import React from 'react';
import {Nav, NavItem} from 'react-bootstrap';
import ReadMe from '../lite-components/ReadMe.react.js';
import RepoData from '../lite-components/RepoData.react.js';


class RepoTabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "1"
    };
  }

  handleSelect(eventKey){
    this.setState({
      activeTab: eventKey
    });
  }

  render(){
      var tabcontent = <div/>;
      var panelHeader = ""
      if(this.state.activeTab === "1"){
        tabcontent = <RepoData/>
        panelHeader = (<div><span className="fa fa-database"></span> Data</div>);
      }
      return (
        <div>
          <div className='container-fluid'><div className='row'>
            <Nav className="RepoTabs" bsStyle="tabs" activeKey={this.state.activeTab} onSelect={this.handleSelect.bind(this)}>
              <NavItem eventKey="1" title="Data">Data</NavItem>
            </Nav>
          </div></div>
          
          <div className='container'><div className='row'>
            <div className='lite-padding'>
              <div className='col-xs-12'>
                <div className="panel panel-default">
                  <div className="panel-heading">
                    <h3 className="panel-title">{panelHeader}</h3>
                  </div>
                  <div className="panel-body">
                    {tabcontent}
                  </div>
                </div>
                </div>
              <div className='col-xs-12'>
                {this.state.activeTab === "1" && <ReadMe/>}
              </div>
            </div>
          </div></div>
        </div>
      );
  }

}

module.exports = RepoTabs;