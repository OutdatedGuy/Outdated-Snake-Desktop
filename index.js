const { app, BrowserWindow } = require("electron");
const path = require("path");

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

	myWindow.loadURL(path.join(__dirname, "public/index.html"));
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
