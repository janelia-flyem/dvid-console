import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Button from '@material-ui/core/Button';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import ScheduleIcon from '@material-ui/icons/Schedule';
import parse from 'date-fns/parse';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { darcula } from 'react-syntax-highlighter/styles/prism';

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing.unit * 2,
  },
  card: {
    marginBottom: theme.spacing.unit * 2,
  },
});

class RepoCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  handleClick = () => {
    this.setState(state => ({ expanded: !state.expanded }));
  }

  render() {
    const { classes, repo, dataSource } = this.props;
    const { expanded } = this.state;
    const desc = repo.Description;
    const date = parse(repo.Updated);
    const url = `/repo/${repo.Alias}`;
    const link = <Link to={url}>{repo.Alias}</Link>;
    const subheading = <p><ScheduleIcon style={{ fontSize: '1em' }} /> Updated {distanceInWordsToNow(date, { addSuffix: true })}</p>;

    const Component = () => {
      const codeString = ['from diced import DicedStore',
        `store = DicedStore("${dataSource}")`,
        `repo = store.open_repo("${repo.Alias || '<data source>'}")`].join('\n');
      return <SyntaxHighlighter language="python" style={darcula}>{codeString}</SyntaxHighlighter>;
    };

    return (
      <Card className={classes.card}>
        <CardHeader
          title={link}
          subheader={subheading}
        />
        <CardContent>
          <p>{desc}</p>
        </CardContent>
        <CardActions className={classes.actions} disableActionSpacing>
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            onClick={this.handleClick}
          >
            Access from Python
          </Button>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <h4>Add this to your python code:</h4>
            <Component />
          </CardContent>
        </Collapse>
      </Card>
    );
  }
}

RepoCard.propTypes = {
  classes: PropTypes.object.isRequired,
  repo: PropTypes.object.isRequired,
  dataSource: PropTypes.string,
};

RepoCard.defaultProps = {
  dataSource: '<data source>',
};

export default withStyles(styles)(RepoCard);
