(function() {

var gui = require("nw.gui");
var win = gui.Window.get();
	
win.on("loaded", function()
{
	var closeBtn = document.getElementById("close");
	var title = document.getElementById("title");
	var content = document.getElementById("content");
	var contentArea = document.getElementsByClassName("content-area");
	
	title.innerHTML = window.alertTitle;
	title.title = removeIcon(window.alertTitle);
	content.textContent = window.alertContent;
	content.title = window.alertContent;
	
	for (var i = 0; i < contentArea.length; i++)
	{
		contentArea[i].addEventListener("click", function()
		{
			if (!window.alertLink)
				return;
			
			gui.Shell.openExternal(checkURL(window.alertLink));
			opener.alertBox.closeAlert(window.index);
		});
	}
	
	closeBtn.addEventListener("click", function()
	{
		opener.alertBox.closeAlert(window.index);
	});
	
	setTimeout(function()
	{
		opener.alertBox.closeAlert(window.index);
	}, window.aliveTime);
});
	
function removeIcon(str)
{
	return str.substr(str.indexOf("</i>") + 4);
}
	
function checkURL(source)
{
	if (source.indexOf("http://") == -1)
		return "http://" + source;
	else
		return source;
}
	
})();