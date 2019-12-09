import ContentState from './contentState';

function BrowserState(file) {

  this.forwardStack = [];
  this.backwardStack = [];
  this.contentState = new ContentState(file);

  this.openFile = (filePath, content, addToBackstack) => {
    if (addToBackstack) {
      this.updateBackwardStack()
    } else {
      this.resetNavigationStacks();
    }
    this.contentState = new ContentState();
    this.contentState.openFile(filePath, content)

  }

  this.updateBackwardStack = () => {
    console.log("Storing old content state - ", this.contentState)
    this.backwardStack.push(this.contentState);
  };

  this.navigateBackwards = () => {
    let previousContentState = null;
    if (this.backwardStack.length > 0) {
      this.forwardStack.push(this.contentState);
      previousContentState = this.backwardStack.pop();
      this.contentState = previousContentState;
      this.contentState.renderDocument(previousContentState.teacherMarkdown)
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
      this.contentState.renderDocument(nextContentState.teacherMarkdown)
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
