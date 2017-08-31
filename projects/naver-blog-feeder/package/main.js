(function() {

var gui = require("nw.gui");
var win = gui.Window.get();
	
$(function()
{
	startWorker();
});
	
function startWorker()
{
	if (global.backgroundWorker)
		return;
	
	global.backgroundWorker = gui.Window.open("app://preco/package/partials/main-process/index.html", {
		show: false,
		toolbar: false
	});
	
	global.backgroundWorker.on("loaded", function()
	{
		this.window.primaryWindow = win;
	});
}

})();