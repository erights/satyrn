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
import state from './state/windowState'
window.state = state;


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
  state.isEditMode ? document.querySelector("#teacher-input").style.display = "none"  :  document.querySelector("#teacher-input").style.display = "block";
  state.isEditMode = !state.isEditMode;
});

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//  toggle-realtime-render -> flip real time render mode
ipcRenderer.on('toggle-realtime-render', (event, args) => {
  state.shouldRealTimeRender = !state.shouldRealTimeRender;
});

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// load-url-> loads either a file or external url
ipcRenderer.on('load-url', (event,url) => {
  loadUrl(url);
})

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
ipcRenderer.on('reload-window', (event, reloadContents) => {
  loadUrl(reloadContents.url);
});

// --------------------- --------------------- ---------------------
// action implementations
// show -> display a styled file like about, guide
// loadGuide - display the guide file
// loadAbout -> display the about file
// loadUrl -> returns contents of http request to a url
// handleTextChanged -> re-render document on change if real-time rendering
// renderDocument -> used by open-file to display a document other
//                   than about and guide, also used during realTime
//                   rendering
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
function show(html, target) {
  let w = window.open("", target, "toolbar=no,scrollbars=yes,resizable=yes,width=800,height=500");
  // close the old window so we can open with focus
  if (w.document.body.innerHTML) {
  //    console.log(target + ' exists');
    setTimeout(function () {
      w.close();
      show(html, target);
    }, 100);
    return;
  }

  w.document.body.innerHTML = "";
  w.document.write(html)

  let link = document.createElement("link")
  link.type = "text/css";
  link.rel = "stylesheet";
  const cssPath = path.resolve(__dirname, './main.css');
  console.log(cssPath);
  link.href = cssPath;

  w.document.head.appendChild(link);
}


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
        state.openFile(url, request.responseText)
//
//      }
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
function  saveFile(event, url) {
  let protectedFolderPath = process.cwd() + '/markdown/';
  let fileContent = document.getElementById("teacher").value;
  let fileName = url ? url : state.currentFile;
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
    state.currentFile = fileName;
    state.currentFileSaved = true;
    state.renderDocument(fileContent);
    console.log("The file was saved and the name was changed!");
    sender.send("set-reload-url", {
      url: fileName
    })
  });
}
