// application.js
// ---------------------------------------------------------------------------
// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from "path";
import url from "url";
import { app, Menu, ipcMain, shell, BrowserWindow, remote, dialog } from "electron";
import createElectronWindow from "./helpers/window";
// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";
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



  return electronWindow
}



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

      window.send("load-document", newSatyrnDocumentUrl);
      return false
    }
  });

  window.webContents.once('dom-ready', () => {
    onDomReady(window);
  })
}


ipcMain.on('new-satyrn-window', (event, url) => {
  newSatyrnWindow(url)
})

ipcMain.on('quit-app', () => {
  app.quit()
})
