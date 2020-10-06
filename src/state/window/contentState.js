import { Kernel } from '../kernel'
import showdownConverter from '../../helpers/showdownConverter';
import path from "path";

const EDITOR_ID = "editor-"
const EDITOR_OUTPUT_SELECTOR = "#output-editor-"
// This handles the windowState of a single notebook document.
function ContentState (){
  this.editors = {};
  this.editorsResetValues = {};
  this.isEditMode = false;
  this.shouldRealTimeRender = true;
  this.currentFile = null;
  this.currentFileSaved = true;
  this.kernel = null;
  this.teacherMarkdown = null;
  this.savedTeacherMarkdown = null;

  this.initialiseEditors = () => {
    console.log("Editors to initialise : ", this.editors);
    for (let key in this.editors) {
      this.addEditor(key);
    }
  };
  this.getEditor = (key) => {
    return this.editors[key]
  },
  this.addEditor = (key) => {
    let editor = ace.edit(EDITOR_ID + key);
    editor.setTheme("ace/theme/twilight");
    editor.session.setMode("ace/mode/javascript");
    this.editors[key]=editor;
    this.editorsResetValues[key]=editor.getValue()
  },
  this.resetEditor = (key) => {
    let editor = this.getEditor(key);
    document.querySelector("#output-editor-"+key).innerHTML = "";

    editor.setValue(this.editorsResetValues[key])
  };

  this.toggleRealTimeRender = () => {
    this.shouldRealTimeRender = !this.shouldRealTimeRender;
    this.handleTextChange();
  };

  this.setEditMode = (editMode) => {
    console.log("Set edit mode", editMode)
    editMode ? document.querySelector("#teacher-input").style.display = "block"  :  document.querySelector("#teacher-input").style.display = "none";
    this.isEditMode = editMode
  }

  this.resetKernel = () => {
    if(this.kernel) {
      // TODO kill is not a function? Seems to work without killing - probably not good!
      // windowState.kernel.kill()
    }
    this.kernel = new Kernel(this)
  };

  this.openFile = (fname,data) => {
    console.log("Open file", fname, data)
    this.resetKernel();
    this.editors = {};
    this.currentFile = fname;
    this.currentFileSaved = true;
    const text = data.toString();
    this.renderDocument(text);
    this.convertToAbsolutePath();
    this.savedTeacherMarkdown = text;
    // console.log("Saved Teacher Markdown", text);
    this.handleTextChange();
  };

  this.saveFile = (fileName, fileContent) => {
    state.currentFile = fileName;
    state.currentFileSaved = true;
    state.renderDocument(fileContent);
    this.savedTeacherMarkdown = fileContent;
  };

  this.runEditor = (key) => {
    document.querySelector(EDITOR_OUTPUT_SELECTOR+key).innerHTML = "....";
    let editor = this.getEditor(key);
    const code = editor.getValue()
    this.kernel.run(key,code)
    document.querySelector(EDITOR_OUTPUT_SELECTOR+key).innerHTML = ""
  };

  this.receiveTextOutput = (data,key) => {
    const current = document.querySelector(EDITOR_OUTPUT_SELECTOR+key).innerHTML
    const replacement = current + data
    document.querySelector(EDITOR_OUTPUT_SELECTOR+key).innerHTML = replacement
  };

  this.receiveUnsolicitedTextOutput = (data) => {
    console.log(data)
  };

  this.receiveTextError = (data,key) => {
    const current = document.querySelector(EDITOR_OUTPUT_SELECTOR+key).innerHTML
    const replacement = current + data
    document.querySelector(EDITOR_OUTPUT_SELECTOR+key).innerHTML = replacement
  };

  this.receiveUnsolicitedTextError = (data) => {
    console.log(data)
  };

  this.reportKernelDeath = () => {
    console.log("Kernel died")
    this.kernel = undefined
  };

  this.getEditorHtml = (content, key) => {
    return "<div class=\"showdown-js-editor\">\n" +
      "    <div>\n" +
      "    <i class=\"fas fa-play\" onclick=\"window.browserState.contentState.runEditor('"+key+"')\" value=\"Run\" ></i>\n" +
      "    <i class=\"fas fa-redo\" onclick=\"window.browserState.contentState.resetEditor('"+key+"')\" value=\"Refresh\" ></i>\n" +
      "    </div>\n" +
      "\n" +
      "    <pre id=\"editor-"+key+"\" class=\"editor\">" + content +
      "    </pre>\n" +
      "    <pre class='editor-output' id=\"output-editor-"+key+"\">\n" +
      "    </pre>\n" +
      "  </div>";
  };

  this.handleTextChange =() => {
    if (this.shouldRealTimeRender) {
      const text = document.getElementById("teacher").value;
      this.renderDocument(text)
    }

  };

  this.renderDocument = (text) => {
    // console.log("Render Document", text);
    this.teacherMarkdown  = text;
    const html  = showdownConverter.makeHtml(text);
    let teacher = document.getElementById("teacher")
    teacher.value = text;
    document.getElementById("markdown").innerHTML = html;
    this.initialiseEditors();
  };

  this.convertToAbsolutePath = () => {
    console.log('setting path for ' + this.currentFile);
    const baseDir = path.dirname(this.currentFile) + "/"
    let baseTag = document.getElementById("base-dir")
    console.log("base tag", baseTag)
    if (!baseTag) {

      baseTag = document.createElement("base");
      baseTag.id = "base-dir";

      document.head.appendChild(baseTag)
    }

    baseTag.href = baseDir
  };

  this.reloadContent = () => {
    this.renderDocument(this.savedTeacherMarkdown);
  }

  this.rebuildDocument= () => {
    this.setEditMode(this.isEditMode)
    this.renderDocument(this.teacherMarkdown)
  }

};


export default ContentState;
