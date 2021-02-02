import {ipcRenderer, remote} from "electron";
import { editMenuTemplate } from ".//menu/editMenuTemplate";
import { buildFileMenuTemplate } from "./menu/fileMenuTemplate";
import { helpMenuTemplate } from "./menu/helpMenuTemplate";
let Menu = remote.Menu

export function buildSatyrnMenu (satyrnDocument) {

    console.log("BUILD MENU")
    let fileMenuTemplate = buildFileMenuTemplate(satyrnDocument.isEditMode, satyrnDocument.shouldRealTimeRender)
    const menus = [fileMenuTemplate, editMenuTemplate, helpMenuTemplate];
    let electronMenu = Menu.buildFromTemplate(menus)
    remote.getCurrentWindow().setMenu(electronMenu)


}
