require('bootstrap');
var React = require('react');
var ConsoleApp = require('./components/ConsoleApp.react');


// function to stop the page scrolling when setting focus on an input
// element. Specifically the keyboard controls for the tile viewer.
// http://stackoverflow.com/questions/4963053/focus-to-input-without-scrolling
$.fn.focusWithoutScrolling = function(){
  var x = window.scrollX, y = window.scrollY;
  this.focus();
  window.scrollTo(x, y);
};
