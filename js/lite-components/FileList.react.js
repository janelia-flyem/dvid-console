import React from 'react';
import AltContainer from 'alt/AltContainer';
import FileStore from '../stores/FileStore';
import FileActions from '../actions/FileActions';

class FileList extends React.Component {

  constructor(props){
    super(props);
    if(props.hasFiles){
      FileActions.fetchFileNames(props.uuid)
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
          return (
            <li className="list-group-item" key={i}>
            <span className="fa fa-file-text-o"></span> {name}
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