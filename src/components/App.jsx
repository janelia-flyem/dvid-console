import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';

import Admin from './Admin';
import Home from '../containers/Home';
import About from './About';
import Repo from '../containers/Repo';
import Navigation from '../containers/Navigation';
import NotFound from './NotFound';
import VolumeViewer from './VolumeViewer';

import './App.css';

const theme = createTheme({
  palette: {
    primary: blue,
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: {
        'background-color': '#333',
      },
    },
  },
});

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <Navigation />
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/admin" component={Admin} />
            <Route path="/about" component={About} />
            <Route path="/:name/:branch/:commit/neuroglancer" component={VolumeViewer} />
            <Route path="/:name/:branch/:commit" component={Repo} />
            <Route path="/:name/:branch" component={Repo} />
            <Route path="/:name" component={Repo} />
            <Route path="*" exact component={NotFound} />
          </Switch>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
