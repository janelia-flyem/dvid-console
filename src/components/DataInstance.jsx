import React from 'react';
import PropTypes from 'prop-types';
import Chip from '@material-ui/core/Chip';
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
      labels = [<Chip key={instance.Base.TypeName} label={instance.Base.TypeName} />];
    }

    return (
      <li>
        {instance.Base.Name}
        {labels}
      </li>
    );
  }
}

DataInstance.propTypes = {
  instance: PropTypes.object.isRequired,
};

export default DataInstance;
