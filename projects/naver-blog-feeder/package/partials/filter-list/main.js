(function() {
	
$(function()
{	
	$(document).keydown(function(event)
 	{
		if (event.which == 8)
			location.replace("app://preco/package/partials/filter-config/index.html");
	});
	
	$("#history-back").click(function()
	{
		location.replace("app://preco/package/partials/filter-config/index.html");
	});
	
	var id = getParameterByName("id");
	
	document.title = id + "의 카테고리 리스트";
	$("#subscribe-target").text(id);
	
	var dataObject = PRECO.getDataObject();
	var listTarget = $("#content-container");
	
	if (!dataObject.rssData[id])
	{
		listTarget.append("<h3>해당 블로그가 존재하지 않습니다!</h3>");
		return;
	}
	
	var targetData = dataObject.rssData[id];
	var targetItems = targetData.items;
	var targetFilterList = targetData.filters;
	var filterList = [];

	for (var i = 0; i < targetItems.length; i++)
	{
		var item = targetItems[i];

		if (filterList.indexOf(item.category) == -1)
			filterList.push(item.category);
	}
	
	for (var i = 0; i < targetFilterList.length; i++)
	{
		var targetIndex = filterList.indexOf(targetFilterList[i]);
		
		if (targetIndex == -1)
			targetFilterList.splice(targetIndex, 1);
	}
	
	PRECO.setDataObject(dataObject);
	
	if (!filterList.length)
	{
		listTarget.append("<h3>카테고리가 1개도 존재하지 않습니다!</h3>");
	}

	reflowList(filterList, targetFilterList, listTarget);
	
	listTarget.scroll(function(event)
	{
		this.scrollLeft = 0;
	});
	
	listTarget.click(function(event)
	{
		var target = $(event.target);
		var targetCategory = target.attr("data-filter");
		var categoryIndex = targetData.filters.indexOf(targetCategory);
		
		if (categoryIndex != -1)
		{
			targetData.filters.splice(categoryIndex, 1);
			target.removeClass("active");
		}
		else
		{
			targetData.filters.push(targetCategory);
			target.addClass("active");
		}
		
		PRECO.setDataObject(dataObject);
	});
	
	$("#reset-filter").click(function()
	{
		targetFilterList.length = 0;
		PRECO.setDataObject(dataObject);
		listTarget.empty();
		reflowList(filterList, targetFilterList, listTarget);
	});
});
	
function reflowList(filterList, targetFilterList, listTarget)
{
	for (var i = 0; i < filterList.length; i++)
	{
		var filter = filterList[i];

		var filterDom = $("<a></a>", {
			"class": "list-group-item bg-gray"
		});

		filterDom.text(filter);
		
		if (targetFilterList.indexOf(filter) != -1)
			filterDom.addClass("active");
		
		filterDom.attr("data-filter", filter);
		listTarget.append(filterDom);
	}
}
	
function getParameterByName(name)
{
    name = name.replace(/[\[]/g, "\\[").replace(/[\]]/g, "\\]");
	
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
	var results = regex.exec(location.search);
	
    return results ? decodeURIComponent(results[1].replace(/\+/g, " ")) : "";
}
	
})();