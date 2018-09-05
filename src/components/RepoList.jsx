import React from 'react';
import PropTypes from 'prop-types';
import RepoCard from './RepoCard';

class RepoList extends React.Component {
  render() {
    const { repos } = this.props;
    const formattedRepos = Object.values(repos).map(repo => <RepoCard key={repo.Root} repo={repo} />);

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
