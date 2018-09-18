import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';

import Admin from './Admin';
import Home from '../containers/Home';
import About from './About';
import CommitHistory from '../containers/CommitHistory';
import RepoHome from '../containers/RepoHome';
import Navigation from '../containers/Navigation';

const theme = createMuiTheme({
  palette: {
    primary: blue,
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: {
        "background-color": '#333',
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
            <Route exact path="/" component={Home} />
            <Route path="/admin" component={Admin} />
            <Route path="/about" component={About} />
            <Route exact path="/repo/:name" component={RepoHome} />
            <Route path="/repo/:name/commits" component={CommitHistory} />
          </Switch>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
