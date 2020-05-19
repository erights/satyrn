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
import createWindow from "./helpers/window";
import BrowserState from './state/window/browserState';
// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";
//import AppState from "./state/background/appState";
const electronLocalshortcut = require('electron-localshortcut');

// the only state managemed by application.js is the array of windows
// (each window keeps track of its own menus and context
let windowStates = [];
// TODO: we need to add the ability to reopen closed windows

let newWindow = (url) => {
  let onReady = (currentWindow) => {
    currentWindow.reloadContent = {
      url: url
    };

    currentWindow.send('load-url', url);
  };
  let menu = createMenu();
  let window = createNewWindow(url, onReady);
  window.setMenu(menu)
  let windowState = new WindowState(window, menu);
  windowStates.push(windowState);
  window.state = windowState
}


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
export const createMenu = () => {
  const menus = [fileMenuTemplate, editMenuTemplate, helpMenuTemplate];
  return Menu.buildFromTemplate(menus);
};


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

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
app.on("ready", () => {
  var url = process.cwd() + "/markdown/default.md";

  newWindow(url)
});


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
app.on("window-all-closed", () => {
  app.quit();
});

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
export function createNewWindow(filePath, onReady) {
  const window = createWindow(filePath, {
    width: 1000,
    height: 600,
    webPreferences: {
      nativeWindowOpen: true,
      nodeIntegration: true
    },
  });



  const defaultUrl = url.format({
    pathname: path.join(__dirname, "app.html"),
    protocol: "file:",
    slashes: true
  })


  window.loadURL(
    defaultUrl
  );


  window.webContents.on('devtools-reload-page', () => {
    window.webContents.once('dom-ready', () => {
      window.send("load-url", window.reloadContent.url);
    });
  });

  electronLocalshortcut.register(window, 'CmdOrCtrl+Shift+J', () => {
    window.toggleDevTools();
  });


  window.webContents.on('new-window', function (e, url, disposition) {
    // about:blank is opened when creating stand-alone helper windows
    // such as for the About page and the Guide
    console.log('new-window', url);
    if (disposition === "_satyrn") {
      e.preventDefault();
      newWindow(url);
      // let onReady = (currentWindow) => {
      //   currentWindow.reloadContent = {
      //     url: url
      //   };
      //   currentWindow.send("load-url", url);
      // }
      // let newWindow = createNewWindow(url, onReady);
      // newWindow.setMenu(createMenu());
      return false
    }
    if (disposition === "satyrn") {
      e.preventDefault();
      window.reloadContent = {
        url: url
      };

      setWindowTitle(window, url);
      console.log("Set Menu")
      window.state.newMenu()

      window.send("load-url", url);
      return false
    }
    if (url && url !== 'about:blank') {
      e.preventDefault();
      shell.openExternal(url);
      return false;
    }
  });

  window.webContents.once('dom-ready', () => {
    onReady(window);
    setWindowTitle(window, filePath);

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
