const { app, BrowserWindow, ipcMain, dialog, remote } = require('electron')
const path = require('path');
const os = require('os');
const ipc = require("electron").ipcMain;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,  
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: true
    },
    resizable: false,
    icon: __dirname + 'youtube.png'
  });

  win.loadFile('index.html')

  ipc.on("minimize", function (event) {
    win.minimize();
  });

  ipc.on("close", function (event) {
    win.close();
  });

}

let win;

app.whenReady().then(() => {
  createWindow()
})

const { exec } = require('child_process');



ipc.on("path:get", function (event) {
  if (os.platform() === "linux" || os.platform() === "win32") {
    dialog
        .showOpenDialog({
            properties: ["openFile", "openDirectory"],
        })
        .then((result) => {
            /*if (result) win.webContents.send("path:selected", result.filePaths);*/
            if (result) {
              let chosenPath = result.filePaths;
              const cleanPath = chosenPath[0].replace(/[\[\]']/g, '');
              const writePath = `echo "${cleanPath}" > path.txt`;
              console.log(cleanPath);

              exec(writePath, (error, stdout, stderr) => {
                if (error) {
                  console.error(`Error executing command: ${writePath}`);
                  console.error(error.message);
                  return;
              }
              if (stderr) {
                  console.error(stderr);
                  return;
              }
              })
            }
            
        })
        .catch((err) => {
            console.log(err);
        });
} else {
    dialog
        .showOpenDialog({
            properties: ["openFile", "openDirectory"],
        })
        .then((result) => {
            /*if (result) win.webContents.send("path:selected", result.filePaths);*/
        })
        .catch((err) => {
            console.log(err);
        });
  }
});


