(function() {
	
var gui = require("nw.gui");
var path = require("path");
var fs = require("fs");
var win = gui.Window.get();

var tray;
var primaryWindow;

win.on("loaded", function()
{
	PRECO.initDataObject();
	checkFileExist();
	
	var execPath = path.dirname(process.execPath);
	var audioPath = execPath + "/alert.mp3";
	global.alertAudio = new Audio(audioPath);
	global.connctionFlag = true;
	
	PRECO.startRssPulling();
	
	primaryWindow = window.primaryWindow;
	
	mainCloseHandler();
});
	
function checkFileExist()
{
	var dataObject = PRECO.getDataObject();
	var execPath = path.dirname(process.execPath);
	var audioPath = execPath + "\\alert.mp3";
	
	if (!fs.existsSync("alert.mp3") || dataObject.settings.alertName == "Default")
	{
		fs.createReadStream("sounds/alert.mp3").pipe(fs.createWriteStream(audioPath));
		dataObject.settings.alertName = "Default";
		PRECO.setDataObject(dataObject);
	}
}
	
function updateAlertAudio()
{
	PRECO.updateAlertAudio();
}
	
function makeMenu()
{
	tray = new gui.Tray({
		title: "NaverBlogNoti",
		icon: "images/tray.png",
		tooltip: "네이버 블로그 포스트 알림"
	});
	
	var menu = new gui.Menu();
	var settingMenu = new gui.Menu();
	var sepMenuItem = new gui.MenuItem({
		type: "normal",
		label: "설정"
	});
	
	sepMenuItem.submenu = settingMenu;
	
	var settingMenuSet = [
		new gui.MenuItem({
			type: "normal",
			label: "알림 설정",
			click: function()
			{
				processClick("alert-config");
			}
		}),
		new gui.MenuItem({
			type: "normal",
			label: "포스트 필터링 설정",
			click: function()
			{
				processClick("filter-config");
			}
		}),
		new gui.MenuItem({
			type: "normal",
			label: "고급 설정",
			click: function()
			{
				processClick("adv-config");
			}
		})
	];
	
	for (var i = 0; i < settingMenuSet.length; i++)
		settingMenu.append(settingMenuSet[i]);
	
	var mainMenuSet = [
		new gui.MenuItem({
			type: "normal",
			label: "[네이버 블로그 포스트 알림]"
		}),
		new gui.MenuItem({
			type: "separator"
		}),
		new gui.MenuItem({
			type: "normal",
			label: "대시보드",
			click: function()
			{
				processClick("main");
			}
		}),
		new gui.MenuItem({
			type: "normal",
			label: "구독 리스트",
			click: function()
			{
				processClick("list-config");
			}
		}),
		sepMenuItem,
		new gui.MenuItem({
			type: "normal",
			label: "개발자 정보",
			click: function()
			{
				processClick("developer-info");
			}
		}),
		new gui.MenuItem({
			type: "normal",
			label: "끝내기",
			click: function()
			{
				processClick("exit");
			}
		})
	];
	
	for (var i = 0; i < mainMenuSet.length; i++)
		menu.append(mainMenuSet[i]);
	
	tray.menu = menu;
	tray.on("click", function()
	{
		processClick("main");
	});
}
	
function processClick(target)
{	
	if (target == "none")
		return;
	
	if (target == "exit")
		win.close(true);
	else if (target == "main")
		makeMain("app://preco/package/partials/dash-board/index.html");
	else
		makeMain("app://preco/package/partials/" + target + "/index.html");
		
	hideMenu();
}
	
function makeMain(source)
{	
	var secondaryWindow = gui.Window.open(source, {
		show: true,
		toolbar: false,
		resizable: false,
		width : 650,
		height : 480,
		focus: true
	});
	
	secondaryWindow.once("closed", mainCloseHandler);
}

function hideMenu()
{
	tray.remove();
	tray = null;
}

function mainCloseHandler()
{	
	makeMenu();
	showAlert(PRECO.makeIcon("info-sign") + "백그라운드로 전환됨!", "알림이 계속 업데이트 됩니다!", "");
}
	
function forcedPulling()
{
	PRECO.forcedPullingData();
}

function showAlert(title, content, link)
{
	PRECO.showAlert(title, content, link);
}
	
win.on("closed", function()
{
	alertBox.closeAllAlert();
	primaryWindow.close();
});
	
global.forcedPulling = forcedPulling;
global.showAlert = showAlert;
global.updateAlertAudio = updateAlertAudio;
	
})();