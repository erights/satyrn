import fs from 'fs';
import path from 'path';

import "./stylesheets/main.css";

// Small helpers you might want to keep
import "./helpers/contextMenu.js";
import "./helpers/externalLinks.js";

import {ipcRenderer, dialog, remote} from "electron";
let Menu = remote.Menu
import showdown  from 'showdown';
window.showdown = showdown;


import {buildSatyrnMenu}from './satyrnMenu'
// --------------------- --------------------- ---------------------
// application state
// import BrowserState from './state/window/browserState'
import SatyrnDocument from './satyrnDocument'
import SatyrnBrowser from './satyrnBrowser'

// let browserState = new BrowserState();
// browserState.buildMenu()
// window.browserState = browserState;


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// SatyrnBrower renders SatyrnDocuments
let satyrnBrowser = new SatyrnBrowser()
window.satyrnBrowser = satyrnBrowser

// No SatyrnDocument until a file has been loaded
let currentSatyrnDocument = null;

// Tracks documents that the window has rendered
let forwardDocumentStack = [];
let backwardDocumentStack = [];

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// TODO not sure this is used
// this.updateBackwardStack = () => {
//   backwardDocumentStack.push(currentSatyrnDocument);
// };

window.navigateBackwards = () => {
  let previousDocument= null;
  if (backwardDocumentStack.length >= 1) {
    forwardDocumentStack.push(currentSatyrnDocument);
    previousDocument = backwardDocumentStack.pop();
    currentSatyrnDocument = previousDocument;

    satyrnBrowser.setDocument(currentSatyrnDocument)
    buildSatyrnMenu(currentSatyrnDocument)
  } else {
    console.log("Nothing on the backwards stack")
  }
};

window.navigateForwards = () => {
  if (forwardDocumentStack.length > 0) {
    let forwardDocument = forwardDocumentStack.pop();
    backwardDocumentStack.push(currentSatyrnDocument);
    currentSatyrnDocument = forwardDocument;

    satyrnBrowser.setDocument(currentSatyrnDocument)

    buildSatyrnMenu(currentSatyrnDocument)

  } else {
    console.log("Nothing on the forwards stack")
  }
};

// TODO Not sure this is used
function resetNavigationStacks() {
  backwardDocumentStack = [];
  forwardDocumentStack = [];
}


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/// USED BY MENU TEMPLATES
// toggle-edit-mode -> enable document editing (teacher mode)
export function toggleEditMode() {
  currentSatyrnDocument.setEditMode(!currentSatyrnDocument.isEditMode)
  // TODO this should be handled by SatyrnBrowser but not sure how
  currentSatyrnDocument.isEditMode ? document.querySelector("#teacher-input").style.display = "block"  :  document.querySelector("#teacher-input").style.display = "none";

}

// toggle-realtime-render -> flip real time render mode
export function toggleRealtimeRendering() {
    currentSatyrnDocument.setShouldRealTimeRender(!currentSatyrnDocument.shouldRealTimeRender)
};

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
ipcRenderer.on('reload-window-content', (event) => {
  reloadWindow()

});

export function reloadWindow() {
  satyrnBrowser.reloadDocument()
}


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
ipcRenderer.on('reload-window-content', (event) => {

  satyrnBrowser.reloadDocument(satyrnDocument)

});


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// load-document-> loads a satyrn document from either a file or external url
ipcRenderer.on('load-document', (event,url) => {
  loadSatyrnDocument(url);
})

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// loadSatyrnDocument is called when a link has been clicked on
export function loadSatyrnDocument(url) {
  console.log('loading satyrn document from url : ', url);

  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.send(null);
  request.onreadystatechange = () => {
    if (request.readyState === 4 && request.status === 200) {

      if (currentSatyrnDocument) {
        // ADD Current SD to Document Stack
        console.log("Add to the backwards stack")
        backwardDocumentStack.push(currentSatyrnDocument)
      }
      // Create new Satyrn Document
      let content = request.responseText.toString();
      currentSatyrnDocument = new SatyrnDocument(url, content);



      console.log("Open file", url, content)
      // Reset Kernel and Clear Editors Who handles. Currently Browser. Refactor.
      satyrnBrowser.resetKernel();
      satyrnBrowser.editors = {};


      // Open the document and render in browser
      satyrnBrowser.setDocument(currentSatyrnDocument)

      // Build Menu for New Document
      buildSatyrnMenu(currentSatyrnDocument)
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
export function saveFile(url) {
  let protectedFolderPath = process.cwd() + '/markdown/';
  let fileContent = document.getElementById("teacher").value;
  let fileName = url ? url : currentSatyrnDocument.fileName;
  console.log(fileName, protectedFolderPath);
  // This probably needs updating. How better to handle protected files?
  if (fileName.includes(protectedFolderPath)) {

    remote.dialog.showMessageBox(remote.getCurrentWindow(), {
      type: "question",
      title: "Modify Satryn file?",
      message: `You asked to save to a Satyrn program file: ${currentSatyrnDocument.fileName}. This may make Satyrn unusable. Continue with save?`,
      buttons: ["Cancel", "Save as", "Save"]
    }, response => {
      if (response === 0) {
        console.log("Cancelled Save")
      } else if (response === 1) {
        saveFileAs()
      } else if (response === 2) {
        writeFile(fileName, fileContent)
      }
    })
  }
  else {
    writeFile(fileName, fileContent);
  }
}

export function saveFileAs() {
  const focusedWindow = remote.getCurrentWindow()
  const options = {
    title: 'Save Markdown As',
    buttonLabel: 'Save',
    filters: [
      {name: 'markdown', extensions: ['md']}
    ]
  };
  remote.dialog.showSaveDialog(focusedWindow, options, (filename) => {

    // fileNames is an array that contains all the selected
    if(filename === undefined)
    {
      console.log("No file selected");
      return;
    }
    // Add current document to stack (unsaved)
    backwardDocumentStack.push(currentSatyrnDocument)
    // Create new SD for save as under new file name
    currentSatyrnDocument = new SatyrnDocument(filename, null)

    focusedWindow.setTitle(filename)
    saveFile(filename)
  })
}

function writeFile(filename, fileContent) {
  console.log("Write file", filename);
  fs.writeFile(filename, fileContent, function(err) {
    if(err) {
      return alert(err);
    }
    // browserState.contentState.saveFile(filename, fileContent);

    // TODO turn into satyrnDocument.save
    currentSatyrnDocument.save(filename, fileContent)

    satyrnBrowser.renderDocument()

    // TODO Do we need this?
    // console.log("The file was saved and the name was changed!");
    // remote.getCurrentWindow().documentSrcUrl = documentSrcUrl
  });
}


