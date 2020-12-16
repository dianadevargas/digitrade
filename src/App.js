import logo from './logo.png';
import './App.css';
import React, { useState } from 'react';
import identifyText from './identify';
import downloadForms from './downloadForms';
import transformRawFiles from './transformRawFiles';
import Amplify from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

const logger = (x, y) => localStorage.setItem(x, y);

function TextIdentification() {
  const [responseForm, setResponse] = useState("You can add a photo by uploading directly from the app ")
  const [imageUrl, setImageUrl] = useState('')

  async function identifyFromFile(event) {
    setResponse('identifying text...');
    const formData = await identifyText(event, logger);
    if (formData) {
      setImageUrl(formData.imageUrl);
      setResponse(JSON.stringify(formData));
    } else {
      setResponse(`Error processing`);
    }
  }

  return (
    <div className="Text">
      <div>
        <h3>Text identification</h3>
        <div><input type="file" onChange={identifyFromFile}></input></div>
        <div><img src={imageUrl} className="App-img" alt="form" /></div>
        <div>{responseForm}</div>
      </div>
    </div>
  );
}

function FilesLoading(params) {
  const [response, setFileLoadingResponse] = useState(" Json form will be show here ")

  async function downloadJsonFromFiles() {
    setFileLoadingResponse('Reading files...');
    const jsonData = await downloadForms(logger);
    setFileLoadingResponse(jsonData ? 'Done' : 'Error');
  }

  return (
    <div className="Text">
      <div>
        <h3>List of Json Files</h3>
        <button onClick={downloadJsonFromFiles}>Download Forms</button>
        <div>{response}</div>
      </div>
    </div>
  );  
}

function FilesTransform(params) {
  const [response, setFileTransResponse] = useState(" Form Json form will be show here ")

  async function downloadJsonRawFiles() {
    setFileTransResponse('Reading files...');
    const resp = await transformRawFiles(logger);
    setFileTransResponse(resp ? 'Done' : 'Error');
  }

  return (
    <div className="Text">
      <div>
        <h3>Transform All Files In S3</h3>
        <button onClick={downloadJsonRawFiles}>Transform Raw To Forms</button>
        <div>{response}</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <TextIdentification />
        <FilesLoading />
        <FilesTransform />
      </header>
    </div>
  );
}

export default App;
