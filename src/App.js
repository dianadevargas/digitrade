import logo from './logo.png';
import receipt from './receipt.jpg';
import './App.css';
import React, { useState } from 'react';
import identifyText from './identify';
import downloadForms from './downloadForms.js';
import transformRawFiles from './transformRawFiles';
import Amplify from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';
import awsconfig from './aws-exports';
import fileDownload  from 'js-file-download';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

const logger = (x, y) => localStorage.setItem(x, y);

function TextIdentification({ openNav }) {
  const [response, setResponse] = useState(false);
  const [responseForm, setForm] = useState({});
  const [responseStatus, setResponseStatus] = useState('');

  async function identifyFromFile(event) {
    setResponse(false);
    setResponseStatus('identifying text...');
    setForm({});
    const formData = await identifyText(event, logger);
    if (formData) {
      setResponseStatus('');
      setForm(formData);
      setResponse(true);
    } else {
      setResponseStatus(`Error processing`);
    }
  }

  return (
    <div className="Text">
      <header id="portfolio">
      <img src={logo} className="w3-circle w3-right w3-margin w3-hide-large w3-hover-opacity"></img>
        <span className="w3-button w3-hide-large w3-xxlarge w3-hover-text-grey">
          <i className="fa fa-bars" onClick={openNav}></i>
        </span>
      <div className="w3-container">
      <h1><b>Text Identification</b></h1>
      <div className="w3-section w3-bottombar w3-padding-16">
            <i className="fa fa-photo w3-margin-right  w3-hide-small"></i><input name="Upload Photo" type="file" onChange={identifyFromFile} className="w3-button w3-white"></input>
      </div>
      </div>
      </header>
      <div className="w3-container flex-container">
        {response && <DocumentItem docName={responseForm.name || ''} imageUrl={responseForm.imageUrl || receipt} itemList={responseForm.items || []} />}
        <div>{responseStatus}</div>
      </div>
    </div>
  );
}

function FilesDownload({ openNav }) {
  const [responseStatus, setResponseStatus] = useState('');

  async function downloadJsonFromFiles() {
    setResponseStatus('Reading files...');
    const jsonData = await downloadForms(logger);
    if (jsonData) {
      fileDownload(JSON.stringify(jsonData), 'digitrade.json');
    }
    setResponseStatus(jsonData ? 'Done' : 'Error');
  }

  return (
    <div className = "Text" >
      <header id="portfolio">
      <img src={logo} className="w3-circle w3-right w3-margin w3-hide-large w3-hover-opacity"></img>
      <span className="w3-button w3-hide-large w3-xxlarge w3-hover-text-grey">
        <i className="fa fa-bars" onClick={openNav}></i>
      </span>
      <div className="w3-container">
      <h1><b>Download Json With All Files</b></h1>
      <div className="w3-section w3-bottombar w3-padding-16">
            <button onClick={downloadJsonFromFiles} class="w3-button w3-white"><i class="fa fa-file w3-margin-right"></i>Download Forms</button>
      </div>
      </div>
      </header>
      <div className="w3-container w3-white in-box">
        <p><b>{responseStatus}</b></p>
      </div>
    </div>
  );  
}

function DocumentItem({ docName, imageUrl, itemList }) {
  return (
    <div className="w3-container w3-margin-bottom">
      <div className="w3-container w3-white in-box">
        <img src={imageUrl} alt="document" className="w3-hover-opacity" id="upload-image"></img>
      </div>
      <div className="w3-container w3-white in-box">
        <p><b>{docName}</b></p>
        <table className="w3-table-all">
          <tr>
            <th>Name</th>
            <th>Quantity</th>
            <th>Unit Price</th>
          </tr>
          {itemList.map(({ name, qty, unitPrice }) => {
            return (
              <tr>
                <th>${name}</th>
                <th>${qty}</th>
                <th>${unitPrice}</th>
              </tr>
            )
          })}
        </table>
      </div>
    </div>
  );
} 

function ListFiles({ openNav }) {
  const [response, setFileLoadingResponse] = useState(false);
  const [documents, setDocuments] = useState([]);

  async function downloadJsonFromFiles() {
    setDocuments([]);
    setFileLoadingResponse(false);
    const jsonData = await downloadForms(logger);
    if (jsonData) {
      setDocuments(jsonData);
      setFileLoadingResponse(true);
    }
  }

  return (
    <div className="Text">
      <header id="portfolio">
      <img src={logo} className="w3-circle w3-right w3-margin w3-hide-large w3-hover-opacity"></img>
      <span className="w3-button w3-hide-large w3-xxlarge w3-hover-text-grey">
        <i className="fa fa-bars" onClick={openNav}></i>
      </span>
      <div className="w3-container">
      <h1><b>Documents Gallery</b></h1>
      <div className="w3-section w3-bottombar w3-padding-16">
            <button onClick={downloadJsonFromFiles} class="w3-button w3-white"><i class="fa fa-th-large w3-margin-right"></i>Display documents</button>
      </div>
      </div>
      </header>
      <div className="w3-container flex-container">
        {response && documents.map((doc) => {
          return <DocumentItem docName={doc.name} imageUrl={doc.imageUrl} itemList={doc.items} />
        })}
      </div>
    </div>
  );
}

function FilesTransform(params) {
  const [response, setFileTransResponse] = useState('')

  async function downloadJsonRawFiles() {
    setFileTransResponse('Reading files...');
    const resp = await transformRawFiles(logger);
    setFileTransResponse(resp ? 'Done' : 'Error');
  }

  return (
    <div className="Text">
      <div>
        <h3>Transform All Raw Files In S3</h3>
        <button onClick={downloadJsonRawFiles}>Transform Raw To Form</button>
        <div>{response}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [navStatus, setNavStatus] = useState('w3-collapse');

  function openNavegation() {
    setNavStatus('open-nav');
  }
  function closeNavegation() {
    setNavStatus('close-nav');
  }
  
  return (
    <Router>
      <div className="w3-light-grey w3-content" >
        {/* </div><!-- Sidebar/menu -->*/}
        <nav className={`w3-sidebar w3-white w3-animate-left ${navStatus}`} id="mySidebar" >
          <div className="w3-container">
            <a href="#" onClick={closeNavegation} class="w3-hide-large w3-right w3-padding w3-hover-grey" title="close menu">
              <i class="fa fa-remove"></i>
            </a>
            <img src={logo} className="w3-round"></img><br></br><br></br>
            <h4><b>DIGITRADE</b></h4>
          </div>

          <div className="w3-bar-block">
            <Link to="/" className="w3-bar-item w3-button w3-padding w3-text-teal"><i className="fa fa-picture-o fa-fw w3-margin-right"></i>Text Identification</Link>
            <Link to="/gallery" className="w3-bar-item w3-button w3-padding"><i className="fa fa-th-large fa-fw w3-margin-right"></i>Documents Gallery </Link>
            <Link to="/download" className="w3-bar-item w3-button w3-padding"><i className="fa fa-file fa-fw w3-margin-right"></i>Download Forms</Link>
          </div>
        </nav>

        {/*<!-- !PAGE CONTENT! -->*/}
        <div className="w3-main"  id="page-content">
        {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
        */}
        <Switch>
          <Route exact path="/">
            <TextIdentification openNav={() => openNavegation()} />
          </Route>
          <Route path="/download">
              <FilesDownload openNav={() => openNavegation()} />
          </Route>
          <Route path="/gallery">
              <ListFiles openNav={() => openNavegation()} />
          </Route>
          </Switch>
          </div>
      </div>
    </Router>
  );
}
