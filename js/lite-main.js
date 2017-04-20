// set global 'lite' switch to handle conditional 'lite' code
window.DVID_LITE = true;

//polyfills for icky browsers
require("babel-polyfill");
require('whatwg-fetch');

//the good stuff
require('bootstrap');
var React = require('react');
var LiteApp = require('./lite-components/LiteApp.react');

