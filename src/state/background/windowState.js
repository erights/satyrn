import {createMenu} from "../../background";
import BrowserState from "../window/browserState";


function WindowState(window, menu) {

  this.currentMenu = menu;

  this.menuBackstack = [];
  this.menuForwardstack = [];

  this.browserWindow = window

  this.navigateBackwards = () => {
    if (this.menuBackstack.length > 0) {
      this.menuForwardstack.push(this.currentMenu)
      this.currentMenu = this.menuBackstack.pop();
      this.browserWindow.setMenu(this.currentMenu)
    } else {
      console.log("Unable to navigate menu backwards")
    }
  }

  this.navigateForwards = () => {
    if (this.menuForwardstack.length > 0) {
      this.menuBackstack.push(this.currentMenu);
      this.currentMenu = this.menuForwardstack.pop()
      this.browserWindow.setMenu(this.currentMenu)
    } else {
      console.log("unable to navigate menu forwards")
    }
  }

  // Called when a new file is opened or a link clicked within the browserWindow
  // This creates new BrowserState tracked within the window.
  // It's menu needs to be tracked within the background.
  //////////////////////////////////////////////////////////////////////////////////
  this.newBrowser = () => {
    let newMenu = createMenu();
    this.menuBackstack.push(this.currentMenu)
    this.currentMenu = newMenu;
    this.browserWindow.setMenu(newMenu)
  }



}
export default WindowState
