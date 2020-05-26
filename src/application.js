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
//import AppState from "./state/application/appState";
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
  let onReady = (currentElectronWindow) => {
    // first, store the URL for reloading later (if called to do so)
    currentElectronWindow.reloadContent = {
      url: satyrnDocumentUrl
    };

    // now send the URL to the window so it loads the Satyrn file
    currentElectronWindow.send('load-document', satyrnDocumentUrl);
  };

  // create a menu object
  let menu = createMenu();

  // create the window, passing the url and onReady callback
  let window = createSatyrnWindow(satyrnDocumentUrl, onReady);

  window.setMenu(menu)
  let windowState = new WindowState(window, menu);
  windowStates.push(windowState);
  window.state = windowState;

  return window
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
function createSatyrnWindow(documentUrl, onReady) {
  const window = createElectronWindow(documentUrl, {
    width: 1000,
    height: 600,
    webPreferences: {
      nativeWindowOpen: true,
      nodeIntegration: true
    },
  });



  const satyrnWindowTemplateUrl = url.format({
    pathname: path.join(__dirname, "app.html"),
    protocol: "file:",
    slashes: true
  })


  window.loadURL(
    satyrnWindowTemplateUrl
  );


  window.webContents.on('devtools-reload-page', () => {
    window.webContents.once('dom-ready', () => {
      window.send("load-document", window.reloadContent.url);
    });
  });

  electronLocalshortcut.register(window, 'CmdOrCtrl+Shift+J', () => {
    window.toggleDevTools();
  });


  window.webContents.on('new-window', function (e, newSatyrnDocumentUrl, disposition) {
    // about:blank is opened when creating stand-alone helper windows
    // such as for the About page and the Guide
    console.log('new-window', newSatyrnDocumentUrl);
    if (disposition === "_satyrn") {
      e.preventDefault();
      newSatyrnWindow(newSatyrnDocumentUrl);
      return false
    }
    if (disposition === "satyrn") {
      e.preventDefault();
      window.reloadContent = {
        url: newSatyrnDocumentUrl
      };

      setWindowTitle(window, newSatyrnDocumentUrl);
      console.log("Set Menu")
      window.state.newMenu()

      window.send("load-document", newSatyrnDocumentUrl);
      return false
    }
    if (newSatyrnDocumentUrl && newSatyrnDocumentUrl !== 'about:blank') {
      e.preventDefault();
      shell.openExternal(newSatyrnDocumentUrl);
      return false;
    }
  });

  window.webContents.once('dom-ready', () => {
    onReady(window);
    setWindowTitle(window, documentUrl);

  })

  return window;
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
    // focusedWindow.send("reload-window", focusedWindow.reloadContent);
  })
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
ipcMain.on('set-reload-url', (event, reloadContent) => {
  let focusedWindow = event.sender.getOwnerBrowserWindow()
  focusedWindow.reloadContent = reloadContent
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
