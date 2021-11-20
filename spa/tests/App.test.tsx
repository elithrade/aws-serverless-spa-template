import React from 'react';
import ReactDOM from 'react-dom';
import App from '../src/components/App';

test('renders without crash', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
