import WindowState from "./windowState";
import {createMenu, createNewWindow} from "../../background";


function BackgroundState() {

  this.windowStates = [];

  this.newWindow = (url) => {
    let onReady =  (currentWindow) => {
      currentWindow.reloadContent = {
        url: url
      };

      currentWindow.send('load-url',url);
    };
    let menu = createMenu();
    let window = createNewWindow(url, onReady);
    window.setMenu(menu)
    let windowState = new WindowState(window, menu);
    this.windowStates.push(windowState);
    window.state = windowState
  }
}


export default BackgroundState
