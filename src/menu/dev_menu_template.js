import { app, BrowserWindow } from "electron";

export const devMenuTemplate = {
  label: "Development",
  visible: false,
  submenu: [
    {
      label: "Toggle DevTools",
      accelerator: "CmdOrCtrl+Shift+J",
      click: () => {
        BrowserWindow.getFocusedWindow().toggleDevTools();
      }
    },
  ]
};
