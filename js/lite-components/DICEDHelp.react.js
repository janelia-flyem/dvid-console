import React from 'react';
import {highlight} from 'prismjs';
import 'prismjs/components/prism-python';

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
      //make the page watch for a click event so we can hide the popover
      //if user clicks outside of popover
      $('html').on('click', closeOnBodyClick)

    })

    $(this.refs.helpBtn).on('hidden.bs.popover', function(e){
      //deregister the page click event
      e.preventDefault()
      $('html').off('click', closeOnBodyClick)
    });

  }

  togglePopover(){
    $(this.refs.helpBtn).popover('toggle');
  }

  render(){
    let btnText = "Access from Python";
    if(this.props.btnText){
      btnText = this.props.btnText;
    }

    return (
      <div className={`DICEDHelp-container ${this.props.className}`}>
        <a ref="helpBtn" className='btn btn-success btn-xs' tabIndex="0" role="button" data-toggle="popover"
          data-placement="bottom" title="Execute in Python:" data-container="body" data-trigger="manual"
          onClick={this.togglePopover.bind(this)}>
          {btnText} <span className="caret"></span>
        </a>
        <div className='popover-content hide'>
          <CodeOutput lines={this.props.lines}/>
        </div>
      </div>
    );
  }

}

class CodeOutput extends React.Component{
  render(){
    const highlightedCode = highlight(this.props.lines.join('\n'), Prism.languages.python);
    const html = `<pre><code class="language-python">${highlightedCode}</code></pre>`;
    return(
      <div>
        <a className='copy-btn btn btn-default btn-xs'>
            <span className="fa fa-clipboard"></span>
        </a>
        <div className="python-diced" 
          dangerouslySetInnerHTML={{__html: html}}>

        </div>
      </div>
    );
  }

}

export {DICEDHelp, CodeOutput};
