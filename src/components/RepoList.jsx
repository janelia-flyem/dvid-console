import React from 'react';
import PropTypes from 'prop-types';
import RepoCard from './RepoCard';
import { apiurl } from '../settings';

class RepoList extends React.Component {
  render() {
    const { repos } = this.props;

    let formattedRepos = (
      <p>No repositories found. Please check the api response @ {apiurl()}.</p>
    );

    if (typeof repos === 'object') {
      formattedRepos = Object.values(repos).map(repo => <RepoCard key={repo.Root} repo={repo} />);
    }

    return (
      <div>
        {formattedRepos}
      </div>
    );
  }
}

RepoList.propTypes = {
  repos: PropTypes.object.isRequired,
};

export default RepoList;
