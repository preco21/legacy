(function() {

require("nw.gui").Window.get().on("resize", function()
{
	this.resizeTo(650, 480);
});

})();