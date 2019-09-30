import {app, BrowserWindow, dialog, Menu, remote} from "electron";
import {createMenu, createNewWindow} from "../background";

var path = require('path');
import env from "env";
import {helpMenuTemplate} from "./help_menu_template";

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
      click: reloadPage
    },
    {
      label: "Save",
      accelerator: "CmdOrCtrl+S",
      click: saveFile
    },
    {
      label: "Save As",
      click: saveFileAs
    },
    { type: "separator" },
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
      click: toggleRealTimeRender,
      checked: true
    },
    { type: "separator" },
    {
      label: "Close",
      // accelerator: "CmdOrCtrl+Q",
      click: () => {
        BrowserWindow.getFocusedWindow().close()
      }
    },
    {
      label: "Quit",
      accelerator: "CmdOrCtrl+Q",
      click: () => {
        app.quit();
      }
    },
  ]
};

function newFile() {
  let url = "./markdown/untitled.mdt";
  let onReady =  (currentWindow) => {
    currentWindow.reloadContent = {
      isFile: true,
      url
    };
    currentWindow.send('open-file',[url]);
  };
  let window = createNewWindow("untitled", onReady);
  const menus = [fileMenuTemplate, helpMenuTemplate];
  window.setMenu(Menu.buildFromTemplate(menus));
}

function reloadPage() {
  let focusedWindow = BrowserWindow.getFocusedWindow();
  BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
  focusedWindow.setMenu(createMenu());

  focusedWindow.webContents.once('dom-ready', () => {
    focusedWindow.send('reload-window', focusedWindow.reloadContent);
  })
}


function toggleEditMode() {

  BrowserWindow.getFocusedWindow().send('toggle-edit-mode');

}

function toggleRealTimeRender() {

  BrowserWindow.getFocusedWindow().send('toggle-realtime-render');

}

function saveFile() {

  BrowserWindow.getFocusedWindow().send('save-file', null);
}

function saveFileAs() {
  var fileNames;
  const options = {
    title: 'Save Markdown As',
    buttonLabel: 'Save',
    filters: [
      { name: 'markdown', extensions: ['md'] }
    ]
  };
  const focusedWindow = BrowserWindow.getFocusedWindow()
  dialog.showSaveDialog(focusedWindow, options, (fileNames) => {

    // fileNames is an array that contains all the selected
    if(fileNames === undefined){
      console.log("No file selected");
      return;
    }

    focusedWindow.send('save-file',fileNames);
    focusedWindow.send("reload-window", window.reloadContent);
  })
}

function fileOpenDialog() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
    var fileNames;
    const options = {
        title: 'Open a markdown file',
        buttonLabel: 'Open',
        filters: [
          { name: 'markdown', extensions: ['md'] }
        ]
    };

    dialog.showOpenDialog(focusedWindow, options, (fileNames) => {

        // fileNames is an array that contains all the selected
        if(fileNames === undefined){
            console.log("No file selected");
            return;
        }

      focusedWindow.send('open-file',fileNames);
      focusedWindow.reloadContent = {
        isFile: true,
        url: fileNames[0]
      }
    })
}
