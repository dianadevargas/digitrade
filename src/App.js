import logo from './logo.png';
import './App.css';
import React, { useState } from 'react';
import Amplify, { Predictions, Storage } from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';
import awsconfig from './aws-exports';
import transform from './transform';

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

function TextIdentification() {
  const [response, setResponse] = useState("You can add a photo by uploading directly from the app ")
  const [imageUrl, setImageUrl] = useState('')
  const [responseTable, setTable] = useState('')
  const [responseForm, setForm] = useState('')

  async function identifyFromFile(event) {
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
      localStorage.setItem('digi-raw', JSON.stringify(response));
      Storage.put(`digi-raw.${file.name}.json`, JSON.stringify(response), {
        contentType: 'text/json'
      })
        .then(result => console.log(`Upload response: ${result}`))
        .catch(err => console.log(err));

      setResponse(fullText);
      setForm(form);
      setTable(table);
      // form extract
    })
      .catch(err => setResponse(JSON.stringify(err, null, 2)))
  }

  return (
    <div className="Text">
      <div>
        <h3>Text identification</h3>
        <input type="file" onChange={identifyFromFile}></input>
        <img src={imageUrl} className="App-img" alt="form" />
        <div>{response}</div>
        <div>{responseTable}</div>
        <div>{responseForm}</div>
      </div>
    </div>
  );
}

function FilesLoading(params) {
  const [response, setFileLoadingResponse] = useState(" Json form will be show here ")

  async function downloadJsonFromFiles() {
    setFileLoadingResponse('Reading files...');

    const fileList = await Storage.list('digi-form.');
    const jsonData = await Promise.all(fileList.map(async (item) => {
      const data = await Storage.get(item.key, { download: true });
      const bodyText = await data.Body.text();
      const fileData = JSON.parse(bodyText);
      localStorage.setItem(item.key, bodyText);
      return fileData;
    }));
    setFileLoadingResponse('done');
    localStorage.setItem('final-json', JSON.stringify(jsonData));
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

    const fileList = await Storage.list('digi-raw.');
    fileList.map(async (item) => {
      const data = await Storage.get(item.key, { download: true });
      const imgFileName = item.key.replace(/digi-raw\./gi, '').replace(/\.json/i, '');
      const imgData = await Storage.get(imgFileName);
      localStorage.setItem(`${item.key}.img`, JSON.stringify(imgData));
      data.Body.text().then(async (string) => {
        const formData = transform(string, imgFileName);
        localStorage.setItem(item.key, JSON.stringify(formData));
        await Storage.put(`digi-form.${imgFileName}.json`, JSON.stringify(formData), {
          contentType: 'text/json'
        });
      })
    });
    setFileTransResponse('done');
  }

  return (
    <div className="Text">
      <div>
        <h3>Transform Files In S3</h3>
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
        <br></br>
        <TextIdentification />
        <FilesLoading />
        <FilesTransform />
      </header>
    </div>
  );
}

export default App;
