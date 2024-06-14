const http = require("http");
const ini = require("ini");
const fs = require("fs");
const axios = require("axios");

// config file
let configFile = "./config.ini";

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
