import React from 'react';
import ReactDOM from 'react-dom';
import InstanceStore from '../stores/InstanceStore';
import InstanceActions from '../actions/InstanceActions';
import {datatype_labels, label_properties} from '../utils/datalabels.js';

class DataInstance extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      ndims: null
    }
  }

  componentWillMount(){
    if(this.props.hasMeta){
      this.getNdims(this.props)
    }

  }

  componentDidMount(nextProps, nextState){
    const refName = `extents-${this.props.instance[0]}`
    if(this.refs[refName]){
      $(this.refs[refName]).tooltip();
    }
  }

  componentWillUnmount(){
    const refName = `extents-${this.props.instance[0]}`
    if(this.refs[refName]){
      let tip = $(this.refs[refName]);
      tip.tooltip('destroy');
    }

  }

  /**
   * Get the ndims for an instance
   * /api/node/a0325/.meta/key/instance:alt-segmetation:b66b5635ee334419b12d83476f61e1b4
   */
  getNdims(props){
    const api = InstanceStore.state.api;
    const dataUuid = props.instance[1].Base.DataUUID;
    const name = props.instance[0];

    api.node({
        uuid: props.uuid,
        endpoint: `.meta/key/instance:${name}:${dataUuid}`,
        callback: function(data) {
          if(data.numdims){
            this.setState({ndims: data.numdims});
          }
        }.bind(this),
        error: function(data){
          this.setState({ndims: null});
        }.bind(this)
    });
  }

  checkLabel(){
    const checked = $(ReactDOM.findDOMNode(this)).find(':checked').length === 1;
    InstanceActions.updateSelected({instance: this.props.instance[0],
                                    checked: checked})
  }

  getLabels(datatype, dataTypeInfo){
    let nDimsLabel = '';
    if(this.state.ndims){
       nDimsLabel = <span className='badge' style={{backgroundColor:'#202f9f'}}>{`${this.state.ndims}d`}</span>;
    }

    let extents = "";
    const details = this.props.instance[1].Extended;
    if(details && details.MaxPoint && details.MinPoint){
      
      const max = details.MaxPoint;
      const min = details.MinPoint;
      const extentsDetails = max.map(function(val, i){
          return `${min[i]}:${val}`;
      })
      extents = (
        <span className='badge extents' ref={`extents-${this.props.instance[0]}`} style={{backgroundColor:'#660066'}}
         data-container="body" data-toggle="tooltip" data-placement="bottom" title={`[${extentsDetails.join(', ')}]`}>
          extents <span className="fa fa-angle-down"></span>
        </span>
      );
    }

    var labels = datatype_labels[datatype];
    return (
      <div className='data-badge-container'>
        {
          labels.map( label => {
            var color = label_properties[label].color;
            return <span key={label} className='badge' style={{backgroundColor:color}}>{label}</span>;
          })
        }
        {nDimsLabel}
        {extents}
      </div>
    );
    
  }

  render(){
    let neuroGCheckBox = '';
    if(this.props.useNeuroG){
      neuroGCheckBox = <input onClick={this.checkLabel.bind(this)} className="pull-right" type="checkbox" id={this.props.instance[0]}/>;
    }
    return (
      <li className="list-group-item">
            {this.props.instance[0]}
            {this.getLabels(this.props.instance[1].Base.TypeName, this.props.instance[1])}
            {neuroGCheckBox}
      </li>
    );
  }
}


module.exports = DataInstance;
