var PRECO = PRECO || {};

(function() {
	
var exec = require("child_process").exec;
	
var EXEC_DIR = "\"./external-bin/image-magick/convert\"";
	
function convertImage(src, dist, resizeSetting, background, backgroundColor, callback)
{
	var settings = {};
	
	if (resizeSetting)
	{
		if (resizeSetting.type == "wh")
			settings.resize = resizeSetting.width + "x" + resizeSetting.height + "!";
		else if (resizeSetting.type == "scale")
			settings.resize = resizeSetting.percent + "%";
	}
	
	if (background)
	{
		settings.background = backgroundColor;
		settings.flatten = "";
	}
	
	var makeScript = makeCommand(EXEC_DIR, src, dist, settings);
	
	exec(makeScript, callback.call(this));
}
	
function makeCommand(base, srcFile, distFile, settings)
{
	var command = "";
	
	for (var i in settings)
		command += " -" + i + " " + settings[i];
	
	return base + " " + srcFile + command + " " + distFile;
}
	
PRECO.convertImage = convertImage;
	
})();