(function() {

var gui = require("nw.gui");
	
$(function()
{	
	$(document).keydown(function(event)
 	{
		if (event.which == 8)
			location.replace("app://preco/package/partials/dash-board/index.html");
	});
	
	$("#history-back").click(function()
	{
		location.replace("app://preco/package/partials/dash-board/index.html");
	});
	
	$("#link-set").click(function()
	{
		gui.Shell.openExternal("http://blog.prevl.org/");
	});
});
	
})();