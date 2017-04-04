import React from 'react';
import AltContainer from 'alt-container';
import Markdown from 'react-markdown';
import FileStore from '../stores/FileStore';
import ServerStore from '../stores/ServerStore';
import FileActions from '../actions/FileActions';

class ReadMe extends React.Component {

  constructor(props){
    super(props);
    if(props.ServerStore.uuid){
      FileActions.fetchREADME(props.ServerStore.uuid);
    }
  }

  shouldComponentUpdate(nextProps, nextState){

    if(nextProps.ServerStore.uuid !== this.props.ServerStore.uuid){
      if(nextProps.ServerStore.uuid){
        FileActions.fetchREADME(nextProps.ServerStore.uuid);
      }
      return true;
    }
    else if(nextProps.FileStore.readme !== this.props.FileStore.readme){
      return true;
    }
    return false;
  }

  render(){
    var content = <em>...loading</em>;
    if(this.props.FileStore.readme && this.props.FileStore.readme !== 'none'){
       // content = this.props.FileStore.readme
       content =  <Markdown source={this.props.FileStore.readme} />
    }
    if(this.props.FileStore.readme === 'none'){
      content = <em> You don't have a readme yet. Create one and upload to the .files keyvalue.</em>
    }
    return (

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title"><span className="fa fa-file-text-o"></span> README.md</h3>
        </div>
        <div id="readmeContent" className="panel-body">
          {content}
        </div>
      </div>
    );
  }

}

class ConnectedReadme extends React.Component {

  render() {
    return (
      <AltContainer stores={{FileStore:FileStore, ServerStore:ServerStore}}>
        <ReadMe />
      </AltContainer>
    );
  }
}

module.exports = ConnectedReadme