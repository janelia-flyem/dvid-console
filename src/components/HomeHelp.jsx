import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import SyntaxHighlighter from "react-syntax-highlighter";

const DataSourceComponent = () => {
  const codeString = 'gs://flyem-public-connectome';
  return <SyntaxHighlighter language="python">{codeString}</SyntaxHighlighter>;
};

const ImportComponent = () => {
  const codeString = [
    'from diced import DicedStore',
    'store = DicedStore("<data source>")'].join('\n');
  return <SyntaxHighlighter language="python">{codeString}</SyntaxHighlighter>;
};

const FetchComponent = () => {
  const codeString = [
    '# open repo',
    'repo = store.open_repo("<reponame>")',
    '# get array',
    'my_array = repo.get_array("<array_name>")'].join('\n');
  return <SyntaxHighlighter language="python">{codeString}</SyntaxHighlighter>;
};

class HomeHelp extends React.Component {
  render() {
    return (
      <Card>
        <CardContent>
          <p>Data Source</p>
          <DataSourceComponent />
          <p>Get Data from DICED</p>
          <ol>
            <li><a href="https://github.com/janelia-flyem/diced/blob/master/README.md#installation">install DICED</a></li>
            <li><p>Connect to a DICED Store from python</p></li>
            <ImportComponent />
            <li><p>Get the data</p></li>
            <FetchComponent />
          </ol>
        </CardContent>
      </Card>
    );
  }
}

export default HomeHelp;
