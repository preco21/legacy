(function() {

require("nw.gui").Window.get().on("resize", function()
{
	this.resizeTo(600, 430);
});

})();