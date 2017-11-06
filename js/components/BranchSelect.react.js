import React from 'react';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import Select from 'react-select';

var BranchSelect = createClass({

	showAllLabel: 'Show all',

	displayName: 'BranchDropdown',

	propTypes: {
		label: PropTypes.string,
		searchable: PropTypes.bool,
	},

	getDefaultProps () {
		return {
			value: 'showall',
			label: this.showAllLabel,
			searchable: true,
		};
	},

	getInitialState () {
		return {
			value: 'showall',
			label: this.showAllLabel,
			className: ''
		}
	},

	updateValue (newValue) {
		this.setState({
			selectValue: newValue,
		});
		this.props.callbackFromParent(newValue);
	},

	focusStateSelect () {
		this.refs.stateSelect.focus();
	},

	toggleCheckbox (e) {
		let newBranch = {};
		newBranch[e.target.name] = e.target.checked;
		this.setState(newBranch);
	},

	getCompleteData() {
      	var nodes = this.props.myNodes;
      	var addMaster = false;
		// get distinct branch names
        var keySet = Object.keys(nodes).reduce(
		function(set, key) {
			if (nodes[key].Branch == ""){
			  addMaster = true;
			}
			else {
			  set.add(nodes[key].Branch)
			}
			return set;
		},
		new Set());
        
        // create object for each branch
	 	var result = Array.from(keySet).map(function(key){
		return { value: key, label: key, className: ''};
		})

		// if master, prepend master
		if(addMaster){
			result.unshift({value: 'master', label: 'master', className: ''});
		}

	 	// always Prepend showall
        result.unshift({value: 'showall', label: this.showAllLabel, className: ''});
        return result;
  	},

	render () {
		var options = this.getCompleteData();
		return (
			<div className="section branch-select no-border">
				<Select
					id="branch-select"
					ref="branchSelect"
					autoFocus
					options={options}
					simpleValue
					clearable={this.state.clearable}
					name="selected-branch"
					disabled={this.state.disabled}
					value={this.state.selectValue}
					onChange={this.updateValue}
					rtl={this.state.rtl}
					searchable={this.state.searchable}
				/>
			</div>
		);
	}
});

module.exports = BranchSelect;