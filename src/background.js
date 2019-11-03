// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.
import path from "path";
import url from "url";
import {app, Menu, ipcMain, shell, BrowserWindow} from "electron";
import { editMenuTemplate } from "./menu/edit_menu_template";
import { fileMenuTemplate } from "./menu/file_menu_template";
import { helpMenuTemplate } from "./menu/help_menu_template";
import createWindow from "./helpers/window";
// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";
const electronLocalshortcut = require('electron-localshortcut');

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
  let onReady =  (currentWindow) => {
    currentWindow.reloadContent = {
      isFile: true,
      url: "./markdown/default.md"
    };
    currentWindow.send('open-file',["./markdown/default.md"]);
  };
  let window = createNewWindow("initial", onReady);
  window.setMenu(createMenu());
});


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
app.on("window-all-closed", () => {
  app.quit();
});

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
export function createNewWindow(name, onReady) {
  const window = createWindow(name, {
    width: 1000,
    height: 600,
    webPreferences: {
      nativeWindowOpen: true,
      nodeIntegration: true
    }
  });

  const defaultUrl = url.format({
    pathname: path.join(__dirname, "app.html"),
    protocol: "file:",
    slashes: true
  })


  window.loadURL(
    defaultUrl
  );

  // Store Relaod Content, either a file or a external URL
  window.reloadContent = {
    isFile: false,
    defaultUrl
  }

  window.webContents.on('devtools-reload-page', () => {
    window.webContents.once('dom-ready', () => {
      window.send("reload-window", window.reloadContent);
    });
  });

  electronLocalshortcut.register(window, 'CmdOrCtrl+Shift+J', () => {
    window.toggleDevTools();
  });


  window.webContents.on('new-window', function(e, url, disposition) {
    // about:blank is opened when creating stand-alone helper windows
    // such as for the About page and the Guide
    console.log('new-window');
    if (disposition === "_satyrn") {
      e.preventDefault();
      let onReady = (currentWindow) => {
        currentWindow.reloadContent = {
          isFile: false,
          url: url
        };
        currentWindow.send("load-url", url);

      }
      let newWindow = createNewWindow(url, onReady);
      newWindow.setMenu(createMenu());
      return false
    }
    if (disposition === "satyrn") {
      console.log("New FILE", url)
      e.preventDefault();
      window.reloadContent = {
        isFile: false,
        url: url
      };
      window.send("load-url", url);
      return false
    }
    if(url && url !== 'about:blank') {
      e.preventDefault();
      shell.openExternal(url);
      return false;
    }
  });

  window.webContents.once('dom-ready', () => {
    onReady(window);
  })

  return window;
}


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
ipcMain.on('set-reload-content', (event, reloadContent) => {
  // console.log("Set reload content", )
  let focusedWindow = event.sender.getOwnerBrowserWindow()
  focusedWindow.reloadContent = reloadContent
});


