import React from 'react';
import PropTypes from 'prop-types';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

function getAncestorsForNode(node, nodeLookup, ancestors = []) {
  // take node and push it onto ancestors list
  ancestors.push((
    <tr key={node.UUID}>
      <td>{distanceInWordsToNow(node.Created, { addSuffix: true })}</td>
      <td>{distanceInWordsToNow(node.Updated, { addSuffix: true })}</td>
      <td>{node.UUID.slice(0, 9)}</td>
      <td>{node.Note}</td>
      <td>
        {!node.Locked
          && <span className="far fa-lock-open" />
        }
      </td>
    </tr>
  ));
  // grab the parents array
  // foreach item run getAncestorsForNode
  node.Parents.forEach((parentId) => {
    getAncestorsForNode(nodeLookup[parentId], nodeLookup, ancestors);
  });
  return ancestors;
}

class CommitList extends React.Component {
  commits() {
    const { nodes, branch } = this.props;
    const nodesByVersionID = {};
    let mostRecentNodeOnBranch = {};

    // loop over all nodes sorted by version id
    Object.values(nodes).sort((a, b) => {
      if (a.VersionID < b.VersionID) {
        return -1;
      }
      if (a.VersionID > b.VersionID) {
        return 1;
      }
      return 0;
    }).forEach((node) => {
      nodesByVersionID[node.VersionID] = node;
      // keep replacing the most recent node if it is on the current branch.
      // we are relying on the fact that the nodes are sorted by version number
      // to make sure we get the most recent last.
      if (node.Branch === branch.value) {
        mostRecentNodeOnBranch = node;
      }
    });

    // use that to get all parent nodes back to root. That is our list of nodes.
    if ('Branch' in mostRecentNodeOnBranch) {
      const branchNodeList = getAncestorsForNode(mostRecentNodeOnBranch, nodesByVersionID);
      return branchNodeList;
    }
    return (
      <tr><td>Loading...</td></tr>
    );
  }

  render() {
    const commits = this.commits();
    return (
      <table>
        <tbody>
          {commits}
        </tbody>
      </table>
    );
  }
}

CommitList.propTypes = {
  nodes: PropTypes.object.isRequired,
  branch: PropTypes.object.isRequired,
};

export default CommitList;
