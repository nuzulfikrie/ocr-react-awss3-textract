// src/App.js
import React from 'react';
import Upload from './components/Upload';
import styled from 'styled-components';

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const Header = styled.h1`
  color: #333;
  text-align: center;
`;

function App() {
  return (
    <AppContainer>
      <Header>OCR Application</Header>
      <Upload />
    </AppContainer>
  );
}

export default App;