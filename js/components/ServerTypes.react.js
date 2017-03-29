import React from 'react';
import Router from 'react-router';
import ServerActions from '../actions/ServerActions';
import ServerStore from '../stores/ServerStore';
import AltContainer from 'alt-container';
import {Glyphicon} from 'react-bootstrap';


class TypesDisplay extends React.Component {
  render() {
    if (this.props.types) {

      var types = [];

      for (var key in this.props.types) {
        if (this.props.types.hasOwnProperty(key)) {
          var type = this.props.types[key];
          types.push(<li key={key}><b>{key}</b>: {type}</li>);
        }
      }

      return (
        <div className="servertypes row">
          <div className="col-sm-12">
            <div className="panel panel-default">
              <div className="panel-heading">Installed Data Types</div>
              <div className="panel-body">
                <ul>
                {types}
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="servertypes"></div>
    );
  }
}


class ServerTypes extends React.Component {

  componentDidMount() {
    ServerActions.fetchTypes();
  }

  render() {
    return (
      <AltContainer store={ServerStore}>
        <TypesDisplay/>
      </AltContainer>
    );
  }
};

module.exports = ServerTypes;
