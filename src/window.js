import fs from 'fs';
import path from 'path';

import "./stylesheets/main.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

import {ipcRenderer, dialog, remote} from "electron";

import showdown  from 'showdown';
window.showdown = showdown;


// --------------------- --------------------- ---------------------
// application state
import BrowserState from './state/window/browserState'

let browserState = new BrowserState();
window.browserState = browserState;


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//  save-file -> write the current document to a file.
ipcRenderer.on('save-file', function(event, arg) {
  saveFile(event, arg)

});

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//  toggle-edit-mode -> enable document editing (teacher mode)
ipcRenderer.on('toggle-edit-mode', function(event, args) {
  browserState.contentState.setEditMode(!browserState.contentState.isEditMode)

});

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//  toggle-realtime-render -> flip real time render mode
ipcRenderer.on('toggle-realtime-render', (event, args) => {
  browserState.contentState.toggleRealTimeRender();
});

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// load-url-> loads either a file or external url
ipcRenderer.on('load-url', (event,url) => {
  loadUrl(url);
})

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
ipcRenderer.on('reload-window-content', (event) => {
  console.log("Reload window content", browserState);
  window.browserState.contentState.reloadContent();

});

ipcRenderer.on('browser-state', (event, newBrowserState) => {
  console.log("New Browser State", newBrowserState);
})

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// loadUrl is called when a link has been clicked on
function loadUrl(url) {
  console.log('loading url', url);

  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.send(null);
  request.onreadystatechange = () => {
    if (request.readyState === 4 && request.status === 200) {
//      let type = request.getResponseHeader('Content-Type');
//      if (type.indexOf("text") !== 1) {
        window.browserState.openFile(url, request.responseText)
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
function  saveFile(event, url) {
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
        event.sender.send("save-file-as")
      } else if (response === 2) {
        writeFile(event.sender, fileName, fileContent)
      }
    })
  }
  else {
    writeFile(event.sender, fileName, fileContent);
  }
}

function writeFile(sender, fileName, fileContent) {
  console.log("Write file", fileName);
  fs.writeFile(fileName, fileContent, function(err) {
    if(err) {
      return alert(err);
    }
    browserState.contentState.saveFile(fileName, fileContent);

    console.log("The file was saved and the name was changed!");
    sender.send("set-reload-url", {
      url: fileName
    })
  });
}

window.navigateBackwards = function() {
  let contentState = browserState.navigateBackwards();
  console.log("Navigation Backwards content state", contentState)
};
