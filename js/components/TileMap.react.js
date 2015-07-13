import React from 'react';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import AltContainer from 'alt/AltContainer';
import RepoMeta from './RepoMeta.react';


class TileMap extends React.Component {
  componentDidMount() {
    ServerActions.fetch();
  }

  render() {
    return (
      <AltContainer store={ServerStore} >
        <TileMapDetails uuid={this.props.params.uuid}/>
      </AltContainer>
    );
  }
}

class TileMapDetails extends React.Component {
  render() {
    if (this.props.repos && this.props.repos.hasOwnProperty(this.props.uuid)) {
      var repo = this.props.repos[this.props.uuid];
      return (
        <div>
          <RepoMeta repo={repo}/>
          <p>Tile viewer is in here.</p>
        </div>
      );
    }
    return ( <div></div> );
  }
}


module.exports = TileMap;
