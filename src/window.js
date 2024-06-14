const path = require("path");
const { BrowserWindow } = require("electron"); 

exports.createBrowserWindow = () => {
  return new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    // icon: __dirname + "/fcp.ico",
    icon: path.join(__dirname, "assets/icons/fcp.png"),
    allowRunningInsecureContent: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webviewTag: true,
      nodeIntegration: true,
      devTools: true,
      nativeWindowOpen: true,
      devTools: true, // false if you want to remove dev tools access for the user
      contextIsolation: true,
    },
  });
};
