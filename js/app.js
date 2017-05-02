require('bootstrap');
var React = require('react');
var ConsoleApp = require('./components/ConsoleApp.react');

// turn off global 'lite' switch (har har) to handle conditional 'lite' code
// makes it possible to 'switch' before the store is instantiated
window.DVID_LITE = false;

