const express = require('express')
const identifyText = require('./identify');
const downloadForms = require('./downloadForms.js');
const transformRawFiles = require('./transformRawFiles');
const Amplify = require( 'aws-amplify');
const { AmazonAIPredictionsProvider } = require( '@aws-amplify/predictions');
const awsconfig = require( './aws-exports');

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

const app = express()
const port = 3000
const logger = (x, y) => console.log(x, y);

async function identifyFromFile(event) {
  console.log('identifying text...');
  const formData = await identifyText(event, logger);
  if (formData) {
    setImageUrl(`<div><img src="${formData.imageUrl}" className="App-img" alt="form" /></div>`);
    console.log(JSON.stringify(formData));
  } else {
    console.log(`Error processing`);
  }
}

async function downloadJsonFromFiles() {
  console.log('Reading files...');
  const jsonData = await downloadForms(logger);
  console.log(jsonData ? 'Done' : 'Error');
  if (jsonData) {
    return JSON.stringify(jsonData);
  } else {
    return '';
  }
}

async function downloadJsonRawFiles() {
  console.log('Reading files...');
  const resp = await transformRawFiles(logger);
  console.log(resp ? 'Done' : 'Error');
}

app.get('/', (req, res) => {
  res.send(downloadJsonFromFiles());
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
