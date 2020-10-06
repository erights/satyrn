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


// --------------------- --------------------- ---------------------
// application state
import BrowserState from './state/window/browserState'

let browserState = new BrowserState();
browserState.buildMenu()
window.browserState = browserState;




//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//  toggle-edit-mode -> enable document editing (teacher mode)
export function toggleEditMode() {
  browserState.contentState.setEditMode(!browserState.contentState.isEditMode)

}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//  toggle-realtime-render -> flip real time render mode
export function toggleRealtimeRendering() {
  browserState.contentState.toggleRealTimeRender();
};

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
ipcRenderer.on('reload-window-content', (event) => {
  reloadWindow()

});

export function reloadWindow() {
  console.log("Reload window content", browserState);
  browserState.contentState.reloadContent();
}

ipcRenderer.on('browser-state', (event, newBrowserState) => {
  console.log("New Browser State", newBrowserState);
})

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
        browserState.openFile(url, request.responseText)
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
export function saveFile(url) {
  let protectedFolderPath = process.cwd() + '/markdown/';
  let fileContent = document.getElementById("teacher").value;
  let fileName = url ? url : browserState.contentState.currentFile;
  console.log(fileName, protectedFolderPath);
  if (fileName.includes(protectedFolderPath)) {

    remote.dialog.showMessageBox(remote.getCurrentWindow(), {
      type: "question",
      title: "Modify Satryn file?",
      message: "You asked to save to a Satyrn program file. This may make Satyrn unusable. Continue with save?",
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
    console.log(filename)
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
    browserState.contentState.saveFile(filename, fileContent);

    console.log("The file was saved and the name was changed!");
    remote.getCurrentWindow().documentSrcUrl = documentSrcUrl
  });
}


