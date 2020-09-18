import {remote, ipcRenderer} from "electron";
import {saveFile, toggleEditMode, toggleRealtimeRendering, loadSatyrnDocument, reloadWindow, saveFileAs} from '../satyrnWindow'

var path = require('path');
import env from "env";
import url from "url";

export const fileMenuTemplate = {
  label: "File",
  submenu: [
    {
      label: "New",
      accelerator: "CmdOrCtrl+N",
      click: newFile
    },
    {
      label: "Open",
      accelerator: "CmdOrCtrl+O",
      click: fileOpenDialog
    },
    {
      label: "Reload",
      accelerator: "CmdOrCtrl+R",
      click: reloadWindow
    },
    {
      label: "Save",
      accelerator: "CmdOrCtrl+S",
      click: () => saveFile()
    },
    {
      label: "Save As",
      click: saveFileAs
    },
    {type: "separator"},
    {
      label: "Edit Mode",
      type: "checkbox",
      accelerator: "CmdOrCtrl+E",
      click: toggleEditMode,
      checked: false
    },
    {
      label: "Real-time Render",
      type: "checkbox",
      accelerator: "CmdOrCtrl+T",
      click: toggleRealtimeRendering,
      checked: true
    },
    { type: "separator" },
    {
      label: "Close",
      // accelerator: "CmdOrCtrl+Q",
      click: () => {
        remote.getCurrentWindow().close()
      }
    },
    {
      label: "Quit",
      accelerator: "CmdOrCtrl+Q",
      click: () => {
        ipcRenderer.send("quit-app")
      }
    },
  ]
};



function newFile() {
  let url = process.cwd() + "/markdown/untitled.mdt";
  ipcRenderer.send('new-satyrn-window', url)
}


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
function fileOpenDialog() {
  const focusedWindow = remote.getCurrentWindow();
  let options = {
    title: 'Open a markdown file',
    buttonLabel: 'Open',
    filters: [
      {name: 'markdown', extensions: ['md']}
    ]
  };

  remote.dialog.showOpenDialog(focusedWindow, options, (fileNames) => {

    // fileNames is an array that contains all the selected
    if(fileNames === undefined)
    {
      console.log("No file selected");
      return;
    }
    let filename = fileNames[0]
    focusedWindow.documentSrcUrl = filename
    focusedWindow.setTitle(filename + " -- Satyrn")
    // focusedWindow.state.newBrowser()
    loadSatyrnDocument(filename);

  })
}
