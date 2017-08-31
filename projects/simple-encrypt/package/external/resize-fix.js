(function() {

require("nw.gui").Window.get().on("resize", function()
{
	this.resizeTo(500, 400);
});

})();