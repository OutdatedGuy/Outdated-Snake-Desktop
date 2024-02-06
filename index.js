const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require('url');

app.on("ready", () => {
	const myWindow = new BrowserWindow({
		show: false,
		icon: "/Icon/favicon.ico",
		webPreferences: {
			nodeIntegration: true,
		},
	});
	myWindow.maximize();
	myWindow.show();

	myWindow.loadURL(url.format({
		pathname: path.join(__dirname, "public", "index.html"),
		protocol: 'file:',
		slashes: true
	}));
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
