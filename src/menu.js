const prompt = require("electron-prompt");
const ini = require("ini");
const fs = require("fs");

// config file
let configFile = "./config.ini";
const config = ini.parse(fs.readFileSync(configFile, "utf-8"));

exports.createTemplate = (name) => {
  let template = [
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
        { type: "separator" },
        { label: "Fechar", role: "close" },
      ],
    },
  ];
  return template;
};
