import { Kernel } from './state/kernel'
import showdownConverter from './helpers/showdownConverter';
import {remote} from "electron";

import path from 'path';

const EDITOR_ID = "editor-"
const EDITOR_OUTPUT_SELECTOR = "#output-editor-"

function SatyrnBrowser(){

  this.editors = {};
  this.editorsResetValues = {};
  this.kernel = null;
  this.satyrnDocument = null;
  this.baseDir = null;

  this.setDocument = (satyrnDocument) => {
    this.satyrnDocument = satyrnDocument
    this.setAbsolutePath(this.satyrnDocument.fileName);
    // Possibly this is not the browsers responsibility
    remote.getCurrentWindow().setTitle(this.satyrnDocument.fileName)
    this.renderDocument()
  }

  this.reloadDocument = () => {
    this.renderMarkdown(this.satyrnDocument.savedMarkdown)
  }

  this.renderDocument = () => {
     this.renderMarkdown(this.satyrnDocument.markdownContent)
  }


  this.renderMarkdown = (markdown) => {

    const html  = showdownConverter.makeHtml(markdown);

    let teacher = document.getElementById("teacher")
    teacher.value = markdown;
    document.getElementById("markdown").innerHTML = html;

    // TODO editor code should be extracted into SatyrnDriver
    this.initialiseEditors();
  }

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

  this.resetKernel = () => {
    if(this.kernel) {
      // TODO kill is not a function? Seems to work without killing - probably not good!
      // windowState.kernel.kill()
    }
    this.kernel = new Kernel(this)
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
      "    <i class=\"fas fa-play\" onclick=\"window.satyrnBrowser.runEditor('"+key+"')\" value=\"Run\" ></i>\n" +
      "    <i class=\"fas fa-redo\" onclick=\"window.satyrnBrowser.resetEditor('"+key+"')\" value=\"Refresh\" ></i>\n" +
      "    </div>\n" +
      "\n" +
      "    <pre id=\"editor-"+key+"\" class=\"editor\">" + content +
      "    </pre>\n" +
      "    <pre class='editor-output' id=\"output-editor-"+key+"\">\n" +
      "    </pre>\n" +
      "  </div>";
  };


  // TODO Need to be able to call this from the HTML. But have no access to document for realTimeRender
  this.handleTextChange =() => {
    if (this.satyrnDocument.shouldRealTimeRender) {
      const text = document.getElementById("teacher").value;
      this.renderMarkdown(text)
    }

  };

  // What is this for again
  this.setAbsolutePath = (filename) => {
    console.log('setting path for ' + filename);
    const baseDir = path.dirname(filename) + "/"
    let baseTag = document.getElementById("base-dir")
    console.log("base tag", baseTag)
    if (!baseTag) {

      baseTag = document.createElement("base");
      baseTag.id = "base-dir";

      document.head.appendChild(baseTag)
    }

    baseTag.href = baseDir
    this.baseDir = baseDir;
  };
}

export default SatyrnBrowser
