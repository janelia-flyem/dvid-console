import React from 'react';

class NoRepo extends React.Component {

  render(){
    return (
      <div className="container text-muted">
        <div className="col-md-4">
        </div>
        <div className="col-md-4">
          <div className="center-block">
            <h2> No Repo Selected </h2>
          </div>
        </div>
        <div className="col-md-4"></div>
      </div>
    );
  }

}

module.exports = NoRepo;
