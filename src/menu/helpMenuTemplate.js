import { fileMenuTemplate } from "./helpPopupMenuTemplate";
import { ipcRenderer } from "electron";


export const helpMenuTemplate = {
  label: "Help",
  submenu: [
    {
      label: "Tutorial",
      click: () => showHelpMenuWindow("/markdown/tutorial.md")
    },
    {
      label: "About",
      click: () => showHelpMenuWindow("/markdown/about.md")
    },
    {
      label: "Copyright",
      click: () => showHelpMenuWindow("/license.md")
    }
  ]
};

function showHelpMenuWindow(path) {
  let url = process.cwd() + path;
  ipcRenderer.send('new-satyrn-window', url)
}



