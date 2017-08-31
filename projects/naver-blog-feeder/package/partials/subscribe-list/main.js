(function() {
	
var gui = require("nw.gui");
	
$(function()
{	
	$(document).keydown(function(event)
 	{
		if (event.which == 8)
			location.replace("app://preco/package/partials/list-config/index.html");
	});
	
	$("#history-back").click(function()
	{
		location.replace("app://preco/package/partials/list-config/index.html");
	});
	
	var id = getParameterByName("id");
	
	document.title = id + "의 포스트 리스트";
	$("#subscribe-target").text(id);
	
	var dataObject = PRECO.getDataObject();
	var listTarget = $("#content-container");
	
	if (!dataObject.rssData[id])
	{
		listTarget.append('<h3 class="text-center">해당 블로그가 존재하지 않습니다!</h3>');
		return;
	}
	
	var targetData = dataObject.rssData[id];
	var targetItems = targetData.items;
	
	for (var i = 0; i < targetItems.length; i++)
	{
		var item = targetItems[i];

		var mainDom = $("<a></a>", {
			"class": "list-group-item bg-gray"
		});

		var header = $("<h4></h4>", {
			"class": "list-group-item-heading header-space"
		});

		var content = $("<p></p>", {
			"class": "list-group-item-text"
		});

		header.html(item.title + "<br>[" + (new Date(item.updated)).toLocaleString() + "]");
		content.text(adjustDescription(item.description));

		mainDom.append(header, content);
		mainDom.attr("id", i);
		listTarget.append(mainDom);
	}
	
	listTarget.scroll(function(event)
	{
		this.scrollLeft = 0;
	});
	
	listTarget.click(function(event)
	{
		var target = event.target;
		var tagName = target.tagName.toLowerCase();

		if (tagName == "h4" || tagName == "p")
			target = target.parentNode;

		var targetItem = targetData.items[target.id];

		if (!targetItem.link)
			return;

		gui.Shell.openExternal(checkURL(targetItem.link));
	});
	
	$("#remove-subscribe").click(function()
	{
		dataObject.pullingList.splice(dataObject.pullingList.indexOf(id), 1);
		delete dataObject.rssData[id];
		PRECO.setDataObject(dataObject);
		
		global.showAlert(PRECO.makeIcon("ok-sign") + " 구독 해제 완료!", id + "님을 구독리스트에서 제거했습니다", "");
		location.replace("app://preco/package/partials/dash-board/index.html");
	});
});
	
function adjustDescription(desc)
{
	return desc.length > 200 ? desc.substr(0, 200) + "..." : desc;
}
	
function checkURL(source)
{
	if (source.indexOf("http://") == -1)
		return "http://" + source;
	else
		return source;
}
	
function getParameterByName(name)
{
    name = name.replace(/[\[]/g, "\\[").replace(/[\]]/g, "\\]");
	
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
	var results = regex.exec(location.search);
	
    return results ? decodeURIComponent(results[1].replace(/\+/g, " ")) : "";
}
	
})();