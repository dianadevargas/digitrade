import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import Amplify, { Predictions } from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';
import { createForm, createTables } from 'aws-textract-helper';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

function TextIdentification() {
  const [response, setResponse] = useState("You can add a photo by uploading directly from the app ")
  const [responseTable, setTable] = useState('')
  const [responseForm, setForm] = useState('')

  function identifyFromFile(event) {
    setResponse('identifying text...');
    const { target: { files } } = event;
    const [file,] = files || [];

    if (!file) {
      return;
    }
    Predictions.identify({
      text: {
        source: {
          file,
        },
        format: "ALL", // Available options "PLAIN", "FORM", "TABLE", "ALL"
      }
    }).then((response) => {
      const { text } = response;
      const form = JSON.stringify(text.form || '');
      const table = JSON.stringify(text.tables || '');
      const fullText = text.fullText;
      console.log(response);
      setResponse(fullText);
      setForm(form);
      setTable(table);
    })
      .catch(err => setResponse(JSON.stringify(err, null, 2)))
  }

  return (
    <div className="Text">
      <div>
        <h3>Text identification</h3>
        <input type="file" onChange={identifyFromFile}></input>
        <p>{response}</p>
        <div>{responseTable}</div>
        <div>{responseForm}</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        Identify Text
        <TextIdentification />
      </header>
    </div>
  );
}

export default App;