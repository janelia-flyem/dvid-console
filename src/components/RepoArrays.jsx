import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { darcula } from 'react-syntax-highlighter/styles/prism';
import qs from 'qs';
import DataInstance from './DataInstance';

const allowedTypes = ['uint8blk', 'uint16blk', 'uint32blk', 'uint64blk', 'labelblk'];

const styles = theme => ({
  button: {
    marginRight: theme.spacing.unit,
  },
});

class RepoArrays extends React.Component {
  state = {
    selectedInstances: [],
    showAll: false,
    showGetArrays: false,
  };

  handleShowAll = () => {
    this.setState(state => ({ showAll: !state.showAll }));
  }

  handleShowGetArrays = () => {
    const { showGetArrays } = this.state;
    this.setState({ showGetArrays: !showGetArrays });
  }

  handleAddInstance = (dataInstance) => {
    const { selectedInstances } = this.state;
    const newInstances = [...selectedInstances];
    newInstances.push(dataInstance);
    this.setState({ selectedInstances: newInstances });
  }

  handleDeleteInstance = (dataInstance) => {
    const { selectedInstances } = this.state;
    const newInstances = [...selectedInstances];
    const index = newInstances.indexOf(dataInstance);
    if (index > -1) {
      newInstances.splice(index, 1);
    }
    this.setState({ selectedInstances: newInstances });
  }

  handleViewSelected = () => {
    const { selectedInstances } = this.state;
    const { history } = this.props;
    // need to pump these instances into neuroglancer component.
    // how do we pass these into a redirect?
    const queryParams = qs.stringify(selectedInstances);
    history.push(`/repo/repoName/neuroglancer/?${queryParams}`);
  }

  render() {
    const { dataInstances, classes, repoID } = this.props;
    const { selectedInstances, showAll, showGetArrays } = this.state;
    const content = Object.values(dataInstances).sort((a, b) => {
      const aType = a.Base.TypeName;
      const bType = b.Base.TypeName;
      // sort by the type...
      if (aType < bType) return -1;
      if (aType > bType) return 1;
      // then sort by name.
      if (a.Base.Name > b.Base.Name) return 1;
      if (a.Base.Name < b.Base.Name) return -1;
      return 0;
    }).map((instance) => {
      const { Base } = instance;
      // check if this instance is in the list of allowed instances.
      if (!allowedTypes.includes(Base.TypeName) && !showAll) {
        return false;
      }
      return <DataInstance instance={instance} key={Base.DataUUID} addInstance={this.handleAddInstance} deleteInstance={this.handleDeleteInstance} />;
    });

    const CodeExampleComponent = () => {
      const codeString = [
        'from diced import DicedStore',
        'store = DicedStore("gs://flyem-public-connectome")',
        '# open repo with version id or repo name',
        `repo = store.open_repo("${repoID}")`,
        'my_array = repo.get_array("<array_name>")',
      ].join('\n');
      return <SyntaxHighlighter language="python" style={darcula}>{codeString}</SyntaxHighlighter>;
    };


    const viewEnabled = selectedInstances.length < 1;

    return (
      <div>
        <Typography>
          <span className="fas fa-th-large" /> Data Types
          <Button className={classes.button} size="small" color="primary" onClick={this.handleShowAll}>
            {showAll ? 'Show Filtered' : 'Show All'}
          </Button>
        </Typography>
        <Card>
          <CardContent>
            <List>
              {content}
            </List>
            <Button
              className={classes.button}
              onClick={this.handleShowGetArrays}
              size="small"
              variant="outlined"
              color="primary"
            >
              Get arrays
            </Button>
            <Button
              className={classes.button}
              onClick={this.handleViewSelected}
              disabled={viewEnabled}
              size="small"
              variant="outlined"
              color="primary"
            >
              View selected
            </Button>
          </CardContent>
        </Card>
        <Dialog
          open={showGetArrays}
          onClose={this.handleShowGetArrays}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Execute in Python</DialogTitle>
          <DialogContent>
            <CodeExampleComponent />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleShowGetArrays} color="primary">
              Got It!
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

RepoArrays.propTypes = {
  dataInstances: PropTypes.object,
  classes: PropTypes.object.isRequired,
  repoID: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

RepoArrays.defaultProps = {
  dataInstances: {},
};

export default withRouter(withStyles(styles)(RepoArrays));
