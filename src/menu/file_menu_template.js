import { app, BrowserWindow, dialog, Menu, remote } from "electron";
import { createMenu, newSatyrnWindow, saveFileAs, setWindowTitle } from "../application";

var path = require('path');
import env from "env";
import { helpMenuTemplate } from "./help_menu_template";
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
  let url = process.cwd() + "/markdown/untitled.mdt";

  let window = newSatyrnWindow(url);
  const menus = [fileMenuTemplate, helpMenuTemplate];
  window.setMenu(Menu.buildFromTemplate(menus));
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
function reloadPage() {
  let focusedWindow = BrowserWindow.getFocusedWindow();
  // TODO check it is okay not to use this
  // focusedWindow.reload()
  // BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
  // focusedWindow.setMenu(createMenu());
  focusedWindow.send('reload-window-content');

}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
function toggleEditMode() {

  BrowserWindow.getFocusedWindow().send('toggle-edit-mode');

}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
function toggleRealTimeRender() {

  BrowserWindow.getFocusedWindow().send('toggle-realtime-render');

}

function saveFile() {

  BrowserWindow.getFocusedWindow().send('save-file', null);
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
function fileOpenDialog() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  const options = {
    title: 'Open a markdown file',
    buttonLabel: 'Open',
    filters: [
      { name: 'markdown', extensions: ['md'] }
    ]
  };

  dialog.showOpenDialog(focusedWindow, options, (fileNames) => {

    // fileNames is an array that contains all the selected
    if (fileNames === undefined) {
      console.log("No file selected");
      return;
    }

    focusedWindow.documentSrcUrl = fileNames[0]
    setWindowTitle(focusedWindow, fileNames[0]);
    focusedWindow.state.newBrowser()
    focusedWindow.send('load-document', fileNames[0]);

  })
}
