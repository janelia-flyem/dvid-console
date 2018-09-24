import React from 'react';
import PropTypes from 'prop-types';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import { datatypeLabels, labelProperties } from '../settings.json';
class DataInstance extends React.Component {
  render() {
    const { instance } = this.props;

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
      <li>
        <Typography>
          {instance.Base.Name}
          {labels}
        </Typography>
      </li>
    );
  }
}

DataInstance.propTypes = {
  instance: PropTypes.object.isRequired,
};

export default DataInstance;
