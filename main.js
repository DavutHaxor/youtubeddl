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
    },
    resizable: false,
    icon: __dirname + 'youtube.png'
  });

  win.loadFile('index.html')

  ipc.on("minimize", function (event) { // Listens the renderer for minimize signal
    win.minimize();
  });

  ipc.on("close", function (event) { // Listens the renderer for close signal
    win.close();
  });

}

app.whenReady().then(() => {
  createWindow()
})

const { exec } = require('child_process');

ipc.on("path:get", function (event) { // Listener for path:get.
  dialog
    .showOpenDialog({
      properties: ["openFile", "openDirectory"],
    })

    .then((result) => {

      if (result) {
        let chosenPath = result.filePaths;
        const cleanPath = chosenPath[0].replace(/[\[\]']/g, ''); // Removes '[]' from path and makes it clean.
        const writePath = `echo "${cleanPath}" > path.txt`; // Saves the clean path.
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
        });
      }
    })
    
    .catch((err) => {
      console.log(err);
    });
});
