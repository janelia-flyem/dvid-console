import React from 'react';
import AltContainer from 'alt-container';
import FileStore from '../stores/FileStore';
import FileActions from '../actions/FileActions';
import config from '../utils/config'

class FileList extends React.Component {

  constructor(props){
    super(props);
    if(props.hasFiles){
      FileActions.fetchFileNames(props.uuid)
    }
  }

  componentWillUpdate(nextProps, nextState){
    if(nextProps.hasFiles && this.props.uuid !== nextProps.uuid){
      FileActions.fetchFileNames(nextProps.uuid)
    }
  }

  render(){
    if(!this.props.hasFiles || this.props.filenames === []){
      return (
        <p><em>No files found. Upload files to a dvid .files keyvalue</em></p>
      );
    }
    if(!this.props.filenames){
      return <p><em>..loading</em></p>
    }

    return (
      <ul className="list-group">
        {this.props.filenames.map( (name, i) => {
          var download_link = `${config.baseUrl()}/api/node/${this.props.uuid}/.files/key/${name}`;
          return (
            <li className="list-group-item" key={i}>
            <span className="fa fa-file-text-o"></span> <a href={download_link} download="true">{name}</a>
          </li>
          );
        })}
      </ul>);
  }
}

class ConnectedFileList extends React.Component {

  render() {
    return (
      <AltContainer store={FileStore}>
        <FileList hasFiles={this.props.hasFiles} uuid={this.props.uuid} />
      </AltContainer>
    );
  }
}

module.exports = ConnectedFileList;