

function SatyrnDocument(name, content) {
  this.isEditMode = false;
  this.shouldRealTimeRender = true;
  this.fileName = name;
  this.isSaved = true;
  this.markdownContent = content;
  this.savedMarkdown = content;

  this.setEditMode = (mode) => {
    this.isEditMode = mode
  }

  this.setShouldRealTimeRender = (mode) => {
    this.shouldRealTimeRender = mode
  }

  this.save = (filename, fileContent) => {
    this.isSaved = true;
    this.savedMarkdown = fileContent;
    this.markdownContent  = fileContent;
  }
}

export default SatyrnDocument
