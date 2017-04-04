require('bootstrap');
var React = require('react');
var ConsoleApp = require('./components/ConsoleApp.react');

// turn off global 'lite' switch (har har) to handle conditional 'lite' code
// makes it possible to 'switch' before the store is instantiated
window.DVID_LITE = false;

// function to stop the page scrolling when setting focus on an input
// element. Specifically the keyboard controls for the tile viewer.
// http://stackoverflow.com/questions/4963053/focus-to-input-without-scrolling
$.fn.focusWithoutScrolling = function(){
  var x = window.scrollX, y = window.scrollY;
  this.focus();
  window.scrollTo(x, y);
};
