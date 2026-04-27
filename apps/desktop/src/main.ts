import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createXk3190Bridge } from "./serial/xk3190Bridge.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webUrl = process.env.WEIGHPRO_WEB_URL ?? "http://localhost:3000";
const serialPort = process.env.XK3190_SERIAL_PORT ?? "COM3";
const baudRate = Number(process.env.XK3190_BAUD_RATE ?? 9600);

const bridge = createXk3190Bridge({
  path: serialPort,
  baudRate,
});

let mainWindow: BrowserWindow | undefined;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1100,
    minHeight: 720,
    title: "WeighPro Station",
    backgroundColor: "#f6f7f4",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(webUrl);
}

app.whenReady().then(async () => {
  createWindow();

  bridge.on("reading", (reading) => {
    mainWindow?.webContents.send("scale:reading", reading);
  });

  bridge.on("error", (error) => {
    mainWindow?.webContents.send("scale:error", error.message);
  });

  await bridge.open().catch(() => undefined);
});

app.on("window-all-closed", () => {
  bridge.close();

  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("scale:get-last-reading", () => bridge.lastReading);
ipcMain.handle("scale:reconnect", async () => {
  await bridge.reconnect();
  return bridge.lastReading;
});
