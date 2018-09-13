import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
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
  };

  render() {
    const { dataInstances, classes } = this.props;
    const { selectedInstances } = this.state;
    const content = Object.values(dataInstances).sort((a, b) => {
      const aType = a.Base.TypeName;
      const bType = b.Base.TypeName;
      // sort by name, then...
      if (a.Base.Name > b.Base.Name) return 1;
      if (a.Base.Name < b.Base.Name) return -1;
      // ... sort by the type.
      if (aType > bType) return -1;
      if (aType < bType) return 1;
      return 0;
    }).map((instance) => {
      const { Base } = instance;
      // check if this instance is in the list of allowed instances.
      if (!allowedTypes.includes(Base.TypeName)) {
        return false;
      }
      return <DataInstance instance={instance} key={Base.DataUUID} />;
    });

    const viewEnabled = selectedInstances.length < 1;

    return (
      <div>
        <Typography>Arrays</Typography>
        <Card>
          <CardContent>
            <ul>
              {content}
            </ul>
            <Button className={classes.button} size="small" variant="outlined" color="primary">Get arrays</Button>
            <Button className={classes.button} disabled={viewEnabled} size="small" variant="outlined" color="primary">View selected</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

RepoArrays.propTypes = {
  dataInstances: PropTypes.object,
  classes: PropTypes.object.isRequired,
};

RepoArrays.defaultProps = {
  dataInstances: {},
};

export default withStyles(styles)(RepoArrays);
