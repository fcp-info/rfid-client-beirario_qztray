// Electron
const { app, Menu } = require("electron");

// server
require("./src/server");

// ini file
const ini = require("ini");
const fs = require("fs");

// config file
let configFile = "./config.ini";
const config = ini.parse(fs.readFileSync(configFile, "utf-8"));

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

app.whenReady().then(() => {
  // Main window
  const window = require("./src/window");
  mainWindow = window.createBrowserWindow(app);

  // open system URL
  mainWindow.loadURL(config.urlAPP);
  mainWindow.maximize();
  mainWindow.show();

  // Menu
  const menu = require("./src/menu");
  const template = menu.createTemplate(app.name);
  const builtMenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(builtMenu);
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
