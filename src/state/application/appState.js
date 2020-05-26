import WindowState from "./windowState";
import { createMenu, createSatyrnWindow } from "../../application";


function AppState() {

  this.windowStates = [];

  this.newWindow = (url) => {
    let onReady = (currentWindow) => {
      currentWindow.reloadContent = {
        url: url
      };

      currentWindow.send('load-url', url);
    };
    let menu = createMenu();
    let window = createSatyrnWindow(url, onReady);
    window.setMenu(menu)
    let windowState = new WindowState(window, menu);
    this.windowStates.push(windowState);
    window.state = windowState
  }
}


export default AppState
