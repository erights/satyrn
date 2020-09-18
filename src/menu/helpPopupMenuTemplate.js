import { app, BrowserWindow, dialog, remote } from "electron";
// import { createMenu } from "../application";

var path = require('path');
import env from "env";

export const fileMenuTemplate = {
  label: "File",
  submenu: [
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
