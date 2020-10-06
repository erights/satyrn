import ContentState from './contentState';
import {ipcRenderer, remote} from "electron";
import { editMenuTemplate } from "../../menu/editMenuTemplate";
import { buildFileMenuTemplate } from "../../menu/fileMenuTemplate";
import { helpMenuTemplate } from "../../menu/helpMenuTemplate";
let Menu = remote.Menu
function BrowserState(file) {

  this.forwardStack = [];
  this.backwardStack = [];
  this.contentState = new ContentState()

  //////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////
  this.buildMenu = () => {
    let fileMenuTemplate = buildFileMenuTemplate(this.contentState.isEditMode, this.contentState.shouldRealTimeRender)
    const menus = [fileMenuTemplate, editMenuTemplate, helpMenuTemplate];
    let electronMenu = Menu.buildFromTemplate(menus)
    remote.getCurrentWindow().setMenu(electronMenu)
  };


  this.openFile = (filePath, content) => {
    this.updateBackwardStack()
    this.contentState = new ContentState();
    this.contentState.openFile(filePath, content)
    this.contentState.rebuildDocument();
    this.buildMenu()
  }

  this.updateBackwardStack = () => {
    console.log("Storing old content state - ", this.contentState)
    this.backwardStack.push(this.contentState);
  };

  this.navigateBackwards = () => {
    let previousContentState = null;
    if (this.backwardStack.length > 1) {
      this.forwardStack.push(this.contentState);
      previousContentState = this.backwardStack.pop();
      this.contentState = previousContentState;

      this.contentState.rebuildDocument()
      this.buildMenu()
    } else {
      console.log("Nothing on the backwards stack")
    }
    return previousContentState;
  };

  this.navigateForwards = () => {
    if (this.forwardStack.length > 0) {
      let nextContentState = this.forwardStack.pop();
      this.backwardStack.push(this.contentState);
      this.contentState = nextContentState;
      this.contentState.rebuildDocument()
      this.buildMenu()

    } else {
      console.log("Nothing on the forwards stack")
    }
  };

  this.resetNavigationStacks = () => {
    this.backwardStack = [];
    this.forwardStack = [];
  }

};

export default BrowserState;
