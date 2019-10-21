# Contributing to Satyrn

We welcome any contributions to the code base.

The code started from this [electron boilerplate code](https://github.com/szwacz/electron-boilerplate)

## Development

The src file contains all JS code for the application. This build process compiles the src folder and adds it to the app folder. Webpack configuration is under the /build folder.

The entry-points are src/background.js and src/window.js. Webpack will follow all import statements starting from those files and compile code of the whole dependency tree into one .js file for each entry point.

### window.js

This file has access to the html document and provides functions callable from the index.html. It can be thought of as the view or frontend layer of the application.

The window.js can listen to ipcRenderer events sent from the background.js file

App.js has access to the application state under src/state/state.js. This contains the core logic of the application including:
 * Tracking JavaScript editors
 * Rendering the markdown
 * Opening files
 * calling to the kernel.js to run editor code
 

### background.js

The key functionality of this file is to create new Windows and register the appropriate listeners for these windows.

All application windows are created using the createNewWindow() function. This generates a new BrowserWindow and loads the app.html which contains scripts for window.js and state.js enabling all satyrn functionality to work in all the windows.

A BrowserWindow has a number of listeners attached to them:
* *Reload* - Each BrowserWindow stores the state of it's last loaded page in window.reloadContent. On a reload event, this reload content is used to repopulate the page.
* *New Window* - A window.webcontents.on('new-window) event is fired every time a user creates a new window. New windows can be categorised as:
  * Same window. This occurs when target="_satyrn" is used in a href link. The application then overwrites the reloadContent of the current window and opens that page. This is expected to be a markdown file.
  * New Window. Defined with target="satyrn" Again opens a satyrn application, a markdown, but in a new window.
  * Menu Pages. These are under the help menu. Here each menu item needs to open a new window once, if the specific page is already open in a window then the page should just be focussed.


## Testing

We have some basic e2e tests under the e2e folder which run on a release build.

## Showdown Extensions

Showdown extensions can convert markdown or html into different text content. See the showdown [documentation](https://github.com/showdownjs/showdown/wiki/extensions).

When writing an extension, create a new JS file for the extension under the extensions folder. Then when complete import this file into the helpers/converter.js file and add the converter name to showdown.Converter({extensions: [...]).

See mailto-email.js for an example. This parses the markdown file for any emails, replaces them with the temporary string EMAIL< INDEX > using the lang type extension. Then it uses the output type extension to replace these holding variables with mailto anchor tags for each email.


