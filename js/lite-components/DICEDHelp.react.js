import React from 'react';

class DICEDHelp extends React.Component{

  componentDidMount(){

    /* handle custom popover behavior */
    var popoverOptions = {
      html: true,
      content: function(){
        return  $(this).siblings('.popover-content').html();
      }
    };
    $(this.refs.helpBtn).popover(popoverOptions)

    const closeOnBodyClick = function(e){
      //close on a click anywhere but the popover
      e.preventDefault()
      if($(e.target).parents('.DICEDHelp-container').length === 0 &&
         $(e.target).parents('.popover').length === 0){
         $(this.refs.helpBtn).popover('hide');
      }
    }.bind(this)

    $(this.refs.helpBtn).on('shown.bs.popover', function(e){
      //make the body watch for a click event so we can hide the popover
      //if user clicks outside of popover
      $('body').on('click', closeOnBodyClick)

    })

    $(this.refs.helpBtn).on('hidden.bs.popover', function(e){
      //deregister the body click event
      e.preventDefault()
      $('body').off('click', closeOnBodyClick)
    });

  }

  togglePopover(){
    $(this.refs.helpBtn).popover('toggle');
  }

  render(){

    return (
    <div className="DICEDHelp-container">
      <a ref="helpBtn" className='btn btn-success btn-xs' tabIndex="0" role="button" data-toggle="popover"
        data-placement="bottom" title="Execute in Python:" data-container="body" data-trigger="manual"
        onClick={this.togglePopover.bind(this)}>
        Access from Python <span className="caret"></span>
      </a>
      <div className='popover-content hide'>
        <a className='copy-btn btn btn-default btn-xs'>
            <span className="fa fa-clipboard"></span>
        </a>
        <pre className="python-diced"> 
        {this.props.lines.join('\n')}
        </pre>
      </div>
    </div>
    );
  }

}

module.exports = DICEDHelp;