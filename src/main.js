const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const prompt = require("electron-prompt");
const writeIni = require("write-ini-file");
const ini = require("ini");
const fs = require("fs");
const axios = require("axios");
const http = require("http");
const path = require("path");

let configFile = "./config.ini";

// Verifica se o Arquivo existe
fs.access(configFile, (error) => {
  if (error) {
    app.exit();
  }
});

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

const config = ini.parse(fs.readFileSync(configFile, "utf-8"));

var WebSocketServer = require("websocket").server;

var server = http.createServer(function (request, response) {
  console.log(new Date() + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(8889, function () {
  console.log(new Date() + " Websocket Inciado...");
});

wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on("request", function (request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log(new Date() + " Connection from origin " + request.origin + " rejected.");
    return;
  }

  var connection = request.accept("echo-protocol", request.origin);
  console.log(new Date() + " Connection accepted.");
  connection.on("message", function (message) {
    if (message.type === "utf8") {
      // Tratar mensagem recebida aqui
      //console.log('Received Message: ' + message.utf8Data);
      connection.sendUTF(message.utf8Data);
      console.log(message.utf8Data);

      /**
       * Rotina para impressão
       */
      let printer = ini.parse(fs.readFileSync(configFile, "utf-8"));
      axios.post(`http://${printer.printerIP}/pstprnt`, {
        data: message.utf8Data,
      });
    } else if (message.type === "binary") {
      console.log("Received Binary Message of " + message.binaryData.length + " bytes");
    }
  });

  connection.on("close", function (reasonCode, description) {
    console.log(new Date() + " Peer " + connection.remoteAddress + " disconnected.");
  });
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    icon: __dirname + "/fcp.ico",
    allowRunningInsecureContent: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webviewTag: true,
      nodeIntegration: true,
      devTools: true,
    },
  });

  var menu = Menu.buildFromTemplate([
    {
      label: "Menu",
      submenu: [
        {
          label: "Configurar Endereço Impressora",
          click() {
            prompt({
              title: "Configuração da Impressora",
              label: "IP Impressora Zebra:",
              value: ini.parse(fs.readFileSync(configFile, "utf-8")).printerIP,
              inputAttrs: {
                type: "text",
              },
              type: "input",
            })
              .then((r) => {
                if (r === null) {
                  console.log("user cancelled");
                } else {
                  console.log("result", r);
                  config.printerIP = r;
                  fs.writeFileSync(configFile, ini.stringify(config));
                }
              })
              .catch(console.error);
          },
        },
        {
          label: "DevTools",
          click() {
            mainWindow.openDevTools();
          },
        },
        {
          label: "Recarregar",
          click() {
            mainWindow.reload();
          },
        },
        {
          label: "Exit",
          click() {
            app.quit();
          },
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);

  mainWindow.loadURL(config.urlAPP);
  mainWindow.maximize();
  mainWindow.show();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

ipcMain.on("printPDF", (event, content) => {
  console.log(content);
  //workerWindow.webContents.send("printPDF", content);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
