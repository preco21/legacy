(function() {
	
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
	
	makeList();
});
	
function makeList()
{
	var listTarget = $("#content-container");
	var dataObject = PRECO.getDataObject();
	var pullingList = dataObject.pullingList;
	
	if (pullingList.length <= 0)
	{
		listTarget.append('<h3 class="text-danger text-center margin-top-0">[구독중인 블로그가 1명도 존재하지 않습니다!]</h3>');
		return;
	}	
	
	for (var i = 0; i < pullingList.length; i++)
	{		
		var pullingTarget = pullingList[i];
		var pullingTargetData = dataObject.rssData[pullingTarget];
		
		var mainDom = $("<a></a>", {
			"class": "list-group-item bg-gray",
			href: "app://preco/package/partials/filter-list/index.html?id=" + pullingTarget
		});
		
		var header = $("<h4></h4>", {
			"class": "list-group-item-heading head-space"
		});
		
		var content = $("<p></p>", {
			"class": "list-group-item-text"
		});
		
		if (!pullingTargetData)
		{
			header.text("[" + pullingTarget + "]");
			content.text("블로그의 데이터를 로드할 수 없습니다");
			mainDom.attr("href", "");
		}
		else
		{
			header.text("[" + pullingTarget + "] " + pullingTargetData.title);
			content.text(pullingTargetData.link);
		}
		
		mainDom.append(header, content);
		listTarget.append(mainDom);
	}
}
	
})();