import React from 'react';
import PropTypes from 'prop-types';
import RepoCard from './RepoCard';
import { apiurl } from '../settings';

class RepoList extends React.Component {
  render() {
    const { repos } = this.props;

    const repoInfoUrl = `${apiurl()}/repos/info`;

    let formattedRepos = (
      <p>No repositories found. Please check the api response @ <a href={repoInfoUrl}>{repoInfoUrl}</a>.</p>
    );

    if (typeof repos === 'object' && Object.keys(repos).length > 0) {
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
