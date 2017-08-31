(function() {

var gui = require("nw.gui");
var win = gui.Window.get();
	
$(function()
{
	setNumberUpdate();
});
	
function setNumberUpdate()
{
	if (global.interval)
		clearInterval(global.interval);
	
	global.interval = setInterval(setSubscribeNumber, 5000);
	setSubscribeNumber();
}
	
function setSubscribeNumber()
{
	var dataObject = PRECO.getDataObject();
	
	if (!dataObject.pullingList)
		return;
	
	$("#subscribes").text(dataObject.pullingList.length);
}
	
})();