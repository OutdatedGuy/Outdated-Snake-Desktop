import { app, BrowserWindow, dialog, net, shell } from "electron";
import path from "node:path";

const __dirname = import.meta.dirname;

if (!app.isPackaged) {
  let reloader;
  try {
    reloader = await import("electron-reloader");
  } catch { }

  reloader?.default(import.meta, {
    debug: false,
    watchRenderer: true,
  });
}

function isNewerVersion(latestTag, currentVersion) {
  const parse = (v) => v.replace(/^v/i, "").split("-")[0].split(".").map(Number);
  const latest = parse(latestTag);
  const current = parse(currentVersion);

  for (let i = 0; i < Math.max(latest.length, current.length); i++) {
    const a = latest[i] || 0;
    const b = current[i] || 0;
    if (a > b) return true;
    if (a < b) return false;
  }
  return false;
}

function getDownloadUrl(release) {
  const assets = release.assets || [];
  const os = process.platform === "darwin" ? "macos" : process.platform === "win32" ? "windows" : null;
  const ext = process.platform === "darwin" ? ".pkg" : process.platform === "win32" ? ".exe" : null;

  if (os && ext) {
    const exactName = `outdated-snake-${os}-${process.arch}${ext}`;
    const match = assets.find((a) => a.name === exactName);
    if (match) return match.browser_download_url;
  }

  return release.html_url;
}

async function checkForUpdates(parentWindow) {
  try {
    const response = await net.fetch(
      `https://api.github.com/repos/OutdatedGuy/Outdated-Snake-Desktop/releases/latest`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "Outdated-Snake-Desktop",
        },
      }
    );

    if (!response.ok) return;

    const release = await response.json();
    const latestTag = release.tag_name;
    const currentVersion = app.getVersion(); // Reads "version" from package.json

    if (!latestTag || !isNewerVersion(latestTag, currentVersion)) return;

    const { response: buttonIndex } = await dialog.showMessageBox(parentWindow, {
      type: "info",
      title: "Update Available",
      message: `Outdated Snake ${latestTag} is available`,
      detail: `You are currently running v${currentVersion}. Would you like to download the latest version?`,
      buttons: ["Download", "Later"],
      defaultId: 0,
      cancelId: 1,
    });

    if (buttonIndex === 0) {
      await shell.openExternal(getDownloadUrl(release));
    }
  } catch (_) {
    // Fail silently when offline or if GitHub is unreachable
  }
}

function createWindow() {
  const myWindow = new BrowserWindow({
    show: false,
    icon: path.join(__dirname, "build", "favicon.ico"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  myWindow.once("ready-to-show", () => {
    myWindow.maximize();
    myWindow.show();

    if (app.isPackaged) {
      checkForUpdates(myWindow);
    }
  });

  myWindow.loadFile(path.join(__dirname, "public", "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
