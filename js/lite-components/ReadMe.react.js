import React from 'react';
import AltContainer from 'alt/AltContainer';

class ReadMe extends React.Component {

  render(){
    return (

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title"><span className="fa fa-file-text-o"></span> README.md</h3>
        </div>
        <div className="panel-body">
          You don't have a readme yet. Create one and upload to the .files keyvalue.
        </div>
      </div>
    );
  }

}

module.exports = ReadMe