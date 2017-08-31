var PRECO = PRECO || {};

(function() {
	
var path = require("path");
	
function initDataObject()
{
	var dataObject = getDataObject();
	
	if (!(dataObject.settings && dataObject.rssData && dataObject.pullingList))
	{
		var settingObject = {
			updateRate: 20,
			alertDuration: 6,
			alertName: "Default",
			alertToggleFlag: true
		};
		
		var tempDataObject = {
			settings: settingObject,
			pullingList: [],
			rssData: {}
		};
		
		setDataObject(tempDataObject);
	}
}
	
function secToMilli(second)
{
	return second * 1000;
}
	
function startRssPulling()
{
	var dataObject = getDataObject();
	var settings = dataObject.settings;
	
	setInterval(rssPullingHandler, secToMilli(settings.updateRate));
}

function rssPullingHandler()
{
	var dataObject = getDataObject();
	var pullingList = dataObject.pullingList;
	
	for (var i = 0; i < pullingList.length; i++)
		proceedRssData(pullingList[i]);
}

function proceedRssData(id)
{
	var dataObject = getDataObject();
	var regx = /^[A-Za-z0-9]+$/g;
	
	if (!regx.test(id))
	{
		dataObject.pullingList.splice(dataObject.pullingList.indexOf(id), 1);
		setDataObject(dataObject);
		return;
	}
	
	$.getFeed({
		url: makeRssUrl(id),
		success: function(feed)
		{
			getRssDataHandler(id, feed);
			global.connctionFlag = true;
		},
		error: function()
		{
			if (global.connctionFlag)
			{
				showAlert(makeIcon("exclamation-sign") + "문제가 발생했습니다!", "인터넷에 연결되어있지 않거나 알 수 없는 문제가 발생했습니다.", "");
				global.connctionFlag = false;
			}
		}
	});
}
	
function updateAlertAudio()
{
	global.alertAudio.pause();
	
	var audioPath = path.dirname(process.execPath) + "\\alert.mp3";
	global.alertAudio.src = audioPath;
}
	
function showAlert(title, content, link, sound)
{
	var dataObject = getDataObject();
	var settings = dataObject.settings;
	
	if (global.alertAudio && settings.alertToggleFlag && sound)
	{
		global.alertAudio.pause();
		global.alertAudio.load();
		global.alertAudio.play();
	}
	
	alertBox.showAlert(title, content, link, secToMilli(settings.alertDuration));
}

function getRssDataHandler(id, feed)
{
	var dataObject = getDataObject();
	var rssData = dataObject.rssData;
	
	if (!feed.title)
	{
		dataObject.pullingList.splice(dataObject.pullingList.indexOf(id), 1);
		delete rssData[id];
		setDataObject(dataObject);
		
		showAlert(makeIcon("exclamation-sign") + "해당하는 블로그를 찾지 못함!", id + "님의 블로그를 찾지 못해 리스트에서 제거됩니다.", "", true);
		return;
	}
	
	if (!rssData[id])
	{
		rssData[id] = makeRssData(feed.title, feed.link, feed.image, feed.description, feed.items);
		setDataObject(dataObject);
		
		showAlert(makeIcon("ok-sign") + id + "의 새로운 알림 추가됨!", feed.title, feed.link, true);
	}
	else
	{
		if (!feed.items || Object.keys(feed.items).length == 0)
			return;
		
		for (var i = 0; i < rssData[id].filters.length; i++)
		{
			for (var j = 0; j < feed.items.length; j++)
			{
				if (rssData[id].filters[i] == feed.items[j].category)
					feed.items[j].filtered = true;
			}
		}
		
		var updatedData = [];
		
		for (var i = 0; i < feed.items.length; i++)
		{
			var diffFlag = true;
			
			for (var j = 0; j < rssData[id].items.length; j++)
			{
				if ((feed.items[i].title == rssData[id].items[j].title) && (feed.items[i].updated == rssData[id].items[j].updated))
				{
					diffFlag = false;
					break;
				}
			}
			
			if (diffFlag && (new Date(rssData[id].items[0].updated).getTime() < new Date(feed.items[i].updated).getTime()) && !feed.items[i].filtered)
				updatedData.push(feed.items[i]);
		}
		
		if (updatedData.length)
		{
			if (updatedData.length > 3)
				showAlert(makeIcon("info-sign") + feed.title, "업데이트된 포스트 " + updatedData.length + "개가 있습니다!", feed.link, true);
			else
			{
				for (var i =0, len = updatedData.length; i < len; i++)
					showAlert(makeIcon("info-sign") + feed.title, updatedData[i].title, updatedData[i].link, true);
			}
		}
		
		rssData[id].items = feed.items;
		setDataObject(dataObject);
	}
}
	
function makeIcon(iconName)
{
	return '<i class="glyphicon glyphicon-' + iconName + '"></i> ';
}
	
window.makeIcon = makeIcon;
	
function makeRssData(title, blogLink, imageObject, description, items)
{
	var tempRssData = {
		title: title,
		link: blogLink,
		imageObject: imageObject,
		description: description,
		items: items,
		filters: []
	};
	
	return tempRssData;
}
	
function makeRssUrl(id)
{
	return "http://blog.rss.naver.com/" + id + ".xml";
}
	
function getDataObject()
{
	var data = localStorage.getItem("preco_naverNotifyData");
	
	if (!data)
	{
		data = {};
		localStorage.setItem("preco_naverNotifyData", JSON.stringify(data));
	}
	else
		data = JSON.parse(data);
	
	return data;
}
	
function setDataObject(data)
{
	localStorage.setItem("preco_naverNotifyData", JSON.stringify(data));
}
	
PRECO.getDataObject = getDataObject;
PRECO.setDataObject = setDataObject;
PRECO.forcedPullingData = rssPullingHandler;
PRECO.startRssPulling = startRssPulling;
PRECO.initDataObject = initDataObject;
PRECO.showAlert = showAlert;
PRECO.makeIcon = makeIcon;
PRECO.updateAlertAudio = updateAlertAudio;
	
})();