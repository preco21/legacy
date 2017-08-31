var PRECO = PRECO || {};

(function() {
	
var url = require("url");
var request = require("request");
var cheerio = require("cheerio");
	
function ImageParser(url)
{
	this.url = url;
}
	
var p = ImageParser.prototype;
p.constructor = ImageParser;
	
p.url = "";
	
p.parseImage = function(callback)
{
	var that = this;
	
	request(this.url, function(error, response, html)
	{
		if (error)
		{
			callback.call(that, error);
			return;
		}
		
		that._imageRequestHandler(html, that, callback);
	});
};
			
p._imageRequestHandler = function(html, that, callback)
{
	var $ = cheerio.load(html);
	var images = $("img");
	var imageList = [];

	for (var i = 0; i < images.length; i++)
	{
		var src = images[i].attribs.src || images[i].attribs["data-src"];

		if (src)
			imageList.push(url.resolve(that.url, src));
	}

	if (!imageList.length)
	{
		var tempFrame = $("frame")[0];
		
		if (!tempFrame)
			return;

		request(url.resolve(that.url, tempFrame.attribs.src), function(error, response, html)
		{
			if (error)
			{
				callback.call(that, error);
				return;
			}

			that._imageRequestHandler(html, that, callback);
		});
	}

	callback.call(that, null, imageList);
};
	
PRECO.ImageParser = ImageParser;
	
})();