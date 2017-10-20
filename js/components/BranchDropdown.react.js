import React from 'react';

// Import the Autocomplete Component
import Autocomplete from 'react-autocomplete';

export default class BranchDropdown extends React.Component {

  constructor(props, context) {
    super(props, context);

    // Set initial State
    this.state = {
      // Current value of the select field
      currentBranch: this.getFirstBranch(),
      autocompleteData: this.getCompleteData()
    };

    // Bind `this` context to functions of the class
    this.onChange = this.onChange.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.getItemValue = this.getItemValue.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  /**
   * Callback triggered when the user types in the autocomplete field
   *
   * @param {Event} e JavaScript Event
   * @return {Event} Event of JavaScript can be used as usual.
   */
  onChange(e) {
    console.log('e.target.value ' + e.target.value);
    console.log('e.target.currentbranch ' + e.target.currentBranch);
    this.setState({
      currentBranch: e.target.value
    });
  }

  /**
   * Callback triggered when the autocomplete input changes.
   *
   * @param {Object} val Value returned by the getItemValue function.
   * @return {Nothing} No value is returned
   */
  onSelect(val){
    this.setState({
      currentBranch: val,
    });

    this.props.callbackFromParent(val);
  }


  getFirstBranch() {
    // var branches = this.getBranches();
    // if (branches.length > 0) {
    //   return branches[0];
    // }
    // return null;
    return "Show all";
  }

  /**
   * Get the label and the value to fill the dropdown box
   */
  // getCompleteData() {
  //   // var keys = Object.keys(this.props.repo.DAG.Nodes);
  //   var values = this.props.myNodes;
  //   var keys = Object.keys(values);
  //   var result = {};
  //   for (var i = 0; i < keys.length; i++) {
  //     var tBranch = values[keys[i]].Branch;
  //     if (tBranch in result) { // result does have the branch name already -> add another node to the list of branch nodes
  //       result[tBranch].push(values[keys[i]].UUID)
  //     }
  //     else { // add new branch
  //       result[tBranch] = []
  //     }
  //   }
  //   return result;
  // }

  getCompleteData() {
      var values = this.props.myNodes;
      var keys = Object.keys(values);
      var result = ['Show all'];
      for (var i = 0; i < keys.length; i++) {
        var tBranch = values[keys[i]].Branch;
        if (result.indexOf(tBranch) === -1) { // result does have the branch name already -> add another node to the list of branch nodes
          result.push(tBranch);
        }
      }
      return result;
  }

  /**
   * Define the markup of every rendered item of the autocomplete.
   *vim
   * @param {Object} item Single object from the data that can be shown inside the autocomplete
   * @param {Boolean} isHighlighted declares whether the item has been highlighted or not.
   * @return {Markup} Component
   */
  renderItem(item, isHighlighted){
    return (
        <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
          {item}
        </div>
    );
  }

  /**
   * Define which property of the autocomplete source will be show to the user.
   *
   * @param {Object} item Single object from the data that can be shown inside the autocomplete
   * @return {String} val
   */
  getItemValue(item){
    // You can obviously only return the Label or the component you need to show
    // In this case we are going to show the value and the label that shows in the input
    // something like "1 - Microsoft"
    return `${item}`;
  }

  render() {
    return (
        <div className="no-border">
          <Autocomplete
              getItemValue={this.getItemValue}
              items={this.state.autocompleteData}
              renderItem={this.renderItem}
              value={this.state.currentBranch}
              onChange={this.onChange}
              onSelect={this.onSelect}
          />
        </div>
    );
  }
}