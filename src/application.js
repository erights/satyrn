// application.js
// ---------------------------------------------------------------------------
// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.


import path from "path";
import url from "url";
import { app, Menu, ipcMain, shell, BrowserWindow, remote, dialog } from "electron";
import { editMenuTemplate } from "./menu/edit_menu_template";
import { fileMenuTemplate } from "./menu/file_menu_template";
import { helpMenuTemplate } from "./menu/help_menu_template";
import createElectronWindow from "./helpers/window";
import BrowserState from './state/window/browserState';
// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";
import WindowState from "./state/application/windowState";
const electronLocalshortcut = require('electron-localshortcut');

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== "production") {
  let reload = require('electron-reload')
  reload(__dirname);
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}

// the only state managemed by application.js is the array of windows
// (each window keeps track of its own menus and context
let windowStates = [];
// TODO: we need to add the ability to reopen closed windows

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
app.on("ready", () => {
  let defaultSatyrnDocumentUrl = process.cwd() + "/markdown/default.md";

  newSatyrnWindow(defaultSatyrnDocumentUrl)
});


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
export let newSatyrnWindow = (satyrnDocumentUrl) => {
  // first define the callback function for window creation
  let onDomReady = (electronWindow) => {
    // first, store the URL for reloading later (if called to do so)
    electronWindow.documentSrcUrl = satyrnDocumentUrl
    setWindowTitle(electronWindow, satyrnDocumentUrl);
    // now send the URL to the window so it loads the Satyrn file
    electronWindow.send('load-document', satyrnDocumentUrl);
  };

  const electronWindow = createElectronWindow(satyrnDocumentUrl, {
    width: 1000,
    height: 600,
    webPreferences: {
      nativeWindowOpen: true,
      nodeIntegration: true
    },
  });

  const satyrnWindowTemplateUrl = url.format({
    pathname: path.join(__dirname, "satyrn-window.html"),
    protocol: "file:",
    slashes: true
  })

  electronWindow.loadURL(
    satyrnWindowTemplateUrl
  );

  registerListenersOnElectronWindow(electronWindow, onDomReady)

  // create a menu object
  let menu = createMenu();
  electronWindow.setMenu(menu)

  let windowState = new WindowState(electronWindow, menu);
  windowStates.push(windowState);
  electronWindow.state = windowState;

  return electronWindow
}


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
export const createMenu = () => {
  const menus = [fileMenuTemplate, editMenuTemplate, helpMenuTemplate];
  return Menu.buildFromTemplate(menus);
};


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
app.on("window-all-closed", () => {
  app.quit();
});

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
function registerListenersOnElectronWindow(window, onDomReady) {

  window.webContents.on('devtools-reload-page', () => {
    window.webContents.once('dom-ready', () => {
      window.send("load-document", window.documentSrcUrl);
    });
  });

  electronLocalshortcut.register(window, 'CmdOrCtrl+Shift+J', () => {
    window.toggleDevTools();
  });

  // new-window is the event fired after loading the original html template
  window.webContents.on('new-window', function (e, newSatyrnDocumentUrl, disposition) {
    console.log('new-window', newSatyrnDocumentUrl);
    // Opens satyrn document in a new electron windown
    if (disposition === "_satyrn") {
      e.preventDefault();
      newSatyrnWindow(newSatyrnDocumentUrl);
      return false
    }
    // Opens satyrn document in current electron window
    else if (disposition === "satyrn") {
      e.preventDefault();
      window.documentSrcUrl = newSatyrnDocumentUrl

      setWindowTitle(window, newSatyrnDocumentUrl);
      console.log("Set Menu")
      window.state.newMenu()

      window.send("load-document", newSatyrnDocumentUrl);
      return false
    }
  });

  window.webContents.once('dom-ready', () => {
    onDomReady(window);


  })
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
export function setWindowTitle(window, filePath) {
  if (!window) {
    window = BrowserWindow.get;
  }
  let filename = path.parse(filePath).base;

  window.setTitle(filename + " -- Satyrn")
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
export function saveFileAs(focusedWindow) {
  const options = {
    title: 'Save Markdown As',
    buttonLabel: 'Save',
    filters: [
      { name: 'markdown', extensions: ['md'] }
    ]
  };
  dialog.showSaveDialog(focusedWindow, options, (fileNames) => {

    // fileNames is an array that contains all the selected
    if (fileNames === undefined) {
      console.log("No file selected");
      return;
    }
    setWindowTitle(focusedWindow, fileNames);
    focusedWindow.send('save-file', fileNames);
  })
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
ipcMain.on('set-document-src-url', (event, documentSrcUrl) => {
  let focusedWindow = event.sender.getOwnerBrowserWindow()
  focusedWindow.documentSrcUrl = documentSrcUrl
});

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
ipcMain.on('save-file-as', (event) => {
  let focusedWindow = event.sender.getOwnerBrowserWindow()
  saveFileAs(focusedWindow);
})

ipcMain.on('navigate-backwards', (event) => {
  let focusedWindow = event.sender.getOwnerBrowserWindow()
  focusedWindow.state.navigateBackwards();
})

ipcMain.on('navigate-forwards', (event) => {
  let focusedWindow = event.sender.getOwnerBrowserWindow()
  focusedWindow.state.navigateForwards();
})
