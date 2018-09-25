import React from 'react';
import PropTypes from 'prop-types';
import Chip from '@material-ui/core/Chip';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import { datatypeLabels, labelProperties } from '../settings.json';

class DataInstance extends React.Component {
  state = {
    checked: false,
  };

  handleToggle = () => {
    const { checked } = this.state;
    this.setState({ checked: !checked });
  }

  render() {
    const { instance } = this.props;
    const { checked } = this.state;
    let labels = null;

    if (datatypeLabels[instance.Base.TypeName]) {
      labels = datatypeLabels[instance.Base.TypeName].map((label) => {
        const { color } = labelProperties[label];

        const style = {
          background: color,
          color: '#fff',
          height: '16px',
          margin: '0 0.3em',
        };

        return (<Chip key={label} label={label} style={style} />);
      });
    } else {
      const style = {
        background: '#ccc',
        color: '#333',
        height: '16px',
        margin: '0 0.3em',
      };
      labels = [<Chip key={instance.Base.TypeName} label={instance.Base.TypeName} style={style} />];
    }

    return (
      <ListItem
        key={instance.Base.Name}
        role={undefined}
        dense
        button
        onClick={this.handleToggle}
      >
        <ListItemText>
          {instance.Base.Name}
          {labels}
        </ListItemText>
        <Checkbox
          checked={checked}
          color="primary"
          tabIndex={-1}
          disableRipple
        />

      </ListItem>
    );
  }
}

DataInstance.propTypes = {
  instance: PropTypes.object.isRequired,
};

export default DataInstance;
