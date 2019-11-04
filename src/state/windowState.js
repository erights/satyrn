import { Kernel } from './kernel'
import showdownConverter from '../helpers/showdown-converter';

const EDITOR_ID = "editor-"
const EDITOR_OUTPUT_SELECTOR = "#output-editor-"
// This handles the windowState of a single notebook document.
const state = {
  editors: {},
  editorsResetValues: {},

  isEditMode: false,
  shouldRealTimeRender: true,
  currentFile: "",
  currentFileSaved: true,
  kernel: undefined,

  initialiseEditors: () => {
    for (let key in state.editors) {
      state.addEditor(key);
    }
  },
  getEditor: (key) => {
    return state.editors[key]
  },
  addEditor: (key) => {
    let editor = ace.edit(EDITOR_ID + key);
    editor.setTheme("ace/theme/twilight");
    editor.session.setMode("ace/mode/javascript");
    state.editors[key]=editor;
    state.editorsResetValues[key]=editor.getValue()
  },
  resetEditor: (key) => {
    let editor = state.getEditor(key);
    document.querySelector("#output-editor-"+key).innerHTML = "";

    editor.setValue(state.editorsResetValues[key])
  },

  toggleRealTimeRender: () => {
    state.shouldRealTimeRender = !state.shouldRealTimeRender;
    state.handleTextChange();
  },
  resetKernel: () => {
    if(state.kernel) {
      // TODO kill is not a function? Seems to work without killing - probably not good!
      // windowState.kernel.kill()
    }
    state.kernel = new Kernel(state)
  },

  openFile: (fname,data) => {
    state.resetKernel();
    state.editors = {};
    state.currentFile = fname;
    state.currentFileSaved = true;
    const text = data.toString();
    state.renderDocument(text);
    state.handleTextChange();
  },

  runEditor: (key) => {
    document.querySelector(EDITOR_OUTPUT_SELECTOR+key).innerHTML = "....";
    let editor = state.getEditor(key);
    const code = editor.getValue()
    state.kernel.run(key,code)
    document.querySelector(EDITOR_OUTPUT_SELECTOR+key).innerHTML = ""
  },

  receiveTextOutput: (data,key) => {
    console.log("RECIEVE ", data)
    const current = document.querySelector(EDITOR_OUTPUT_SELECTOR+key).innerHTML
    const replacement = current + data
    document.querySelector(EDITOR_OUTPUT_SELECTOR+key).innerHTML = replacement
  },

  receiveUnsolicitedTextOutput: (data) => {
    console.log(data)
  },

  receiveTextError: (data,key) => {
    const current = document.querySelector(EDITOR_OUTPUT_SELECTOR+key).innerHTML
    const replacement = current + data
    document.querySelector(EDITOR_OUTPUT_SELECTOR+key).innerHTML = replacement
  },

  receiveUnsolicitedTextError: (data) => {
    console.log(data)
  },

  reportKernelDeath: () => {
    console.log("Kernel died")
    state.kernel = undefined
  },

  getEditorHtml: (content, key) => {
    return "<div class=\"showdown-js-editor\">\n" +
      "    <div>\n" +
      "    <i class=\"fas fa-play\" onclick=\"state.runEditor('"+key+"')\" value=\"Run\" ></i>\n" +
      "    <i class=\"fas fa-redo\" onclick=\"state.resetEditor('"+key+"')\" value=\"Refresh\" ></i>\n" +
      "    </div>\n" +
      "\n" +
      "    <pre id=\"editor-"+key+"\" class=\"editor\">" + content +
      "    </pre>\n" +
      "    <pre class='editor-output' id=\"output-editor-"+key+"\">\n" +
      "    </pre>\n" +
      "  </div>";
  },

  handleTextChange: () => {
    if (state.shouldRealTimeRender) {
      const text = document.getElementById("teacher").value;
      state.renderDocument(text)
    }

  },

  renderDocument: (text) => {

    const html  = showdownConverter.makeHtml(text);
    document.querySelector("#markdown").innerHTML = html;
    document.querySelector("#teacher").innerHTML = text;
    state.initialiseEditors();
  }

};


export default state;
