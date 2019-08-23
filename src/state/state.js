import { Kernel } from './kernel'
import showdown_converter from '../helpers/showdown_converter';

const EDITOR_ID = "editor-"
const EDITOR_OUTPUT_SELECTOR = "#output-editor-"
// This handles the state of a single notebook document.
const state = {
  editors: {},
  //TODO why is this called state?
  state: {},

  isEditMode: false,
  shouldRealTimeRender: true,
  currentFile: "",
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
    state.state[key]=editor.getValue()
  },
  reset: (key) => {
    let editor = state.getEditor(key);
    document.querySelector("#output-editor-"+key).innerHTML = "";

    editor.setValue(state.state[key])
  },

  toggleRealTimeRender: () => {
    state.shouldRealTimeRender = !state.shouldRealTimeRender;
    state.handleTextChange();
  },
  resetKernel: () => {
    if(state.kernel) {
      // TODO kill is not a function? Seems to work without killing - probably not good!
      // state.kernel.kill()
    }
    state.kernel = new Kernel(state)
  },

  openFile: (fname,data) => {
    state.resetKernel();
    state.editors = {};
    state.currentFile = fname
    console.log("CURRENT FILE", state.currentFile)
    const text = data.toString();
    state.renderDocument(text);
    state.handleTextChange();
  },

  run: (key) => {
    document.querySelector(EDITOR_OUTPUT_SELECTOR+key).innerHTML = "....";
    let editor = state.getEditor(key);
    const code = editor.getValue()
    state.kernel.run(key,code)
    let markdown = document.querySelector("#teacher").innerHTML;

    console.log("INDEX,", markdown.indexOf('```javascript'));

    console.log("teacher, key", markdown, key)
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
      "    <i class=\"fas fa-play\" onclick=\"state.run('"+key+"')\" value=\"Run\" ></i>\n" +
      "    <i class=\"fas fa-redo\" onclick=\"state.reset('"+key+"')\" value=\"Refresh\" ></i>\n" +
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

    const html  = showdown_converter.makeHtml(text);
    document.querySelector("#markdown").innerHTML = html;
    document.querySelector("#teacher").innerHTML = text;
    state.initialiseEditors();
  }

};


export default state;
