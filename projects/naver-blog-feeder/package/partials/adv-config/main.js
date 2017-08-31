(function() {

var fs = require("fs");
	
var fileDialog, fileDialog2;
var forSavingData = "";
var restoreMode = "none";
	
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
	
	fileDialog = document.getElementById("file-dialog");
	fileDialog2 = document.getElementById("file-dialog-2");
	
	$("#setting-export").click(function()
	{
		exportSetting();
	});
	
	$("#setting-import").click(function()
	{
		importSetting();
	});
	
	$("#list-export").click(function()
	{
		exportList();
	});
	
	$("#list-import").click(function()
	{
		importList();
	});
	
	fileDialog.addEventListener("change", fileSaveHandler);
	
	fileDialog2.addEventListener("change", function(event)
	{
		var file = fileDialog2.files[0];
		var fileExtension = file.name.split(".").pop();
		
		if (!file || !fileExtension || fileExtension != "json")
			return;
		
		fs.readFile(file.path, "utf8", function(error, data)
		{
			if (error)
				return;
			
			var dataObject = PRECO.getDataObject();
			var tempObject = JSON.parse(data);
			
			if (restoreMode == "settings" && tempObject.updateRate && tempObject.alertDuration &&
				tempObject.alertName && typeof tempObject.alertToggleFlag === "boolean")
			{
				dataObject.settings = tempObject;
				
				bootbox.dialog({
					message: "Setting을 로드했습니다!",
					title: file.name + " 파일을 로드했습니다!",
					buttons: {
						main: {
							label: "확인",
							className: "btn-default"
						}
					}
				});
			}
			else if (restoreMode == "list" && tempObject instanceof Array)
			{
				dataObject.pullingList = tempObject;
				
				bootbox.dialog({
					message: "Pulling List를 로드했습니다!",
					title: file.name + " 파일을 로드했습니다!",
					buttons: {
						main: {
							label: "확인",
							className: "btn-default"
						}
					}
				});
			}
			else
			{
				bootbox.dialog({
					message: "파일을 로드하지 못했습니다!",
					title: file.name + " 파일을 로드하지 못했습니다!",
					buttons: {
						main: {
							label: "확인",
							className: "btn-default"
						}
					}
				});
				
				return;
			}
			
			PRECO.setDataObject(dataObject);
			global.forcedPulling();
			
			restoreMode = "none";
		});
	});
});

function fileSaveHandler(event)
{
	var file = fileDialog.files[0];
	
	if (!file)
		return;
	
	var fileExtension = file.name.split(".").pop();
	var fileSavePath = file.path;
	
	if (!fileExtension || fileExtension != "json")
		fileSavePath += ".json";
	
	fs.writeFile(fileSavePath, forSavingData);
	
	bootbox.dialog({
		message: "해당하는 설정파일을 저장했습니다!",
		title: file.name + " 파일을 저장했습니다!",
		buttons: {
			main: {
				label: "확인",
				className: "btn-default"
			}
		}
	}, false);
	
	var files = new FileList();
	
	fileDialog.removeEventListener("change", fileSaveHandler);
	fileDialog.files = files;
	fileDialog.addEventListener("change", fileSaveHandler);
}
	
function importSetting()
{
	restoreMode = "settings";
	applyLoadFile();
}
	
function exportSetting()
{
	var dataObject = PRECO.getDataObject();
	var settings = dataObject.settings;
	
	applySaveFile("setting.json", JSON.stringify(settings));
}
	
function importList()
{
	restoreMode = "list";
	applyLoadFile();
}
	
function exportList()
{
	var dataObject = PRECO.getDataObject();
	var pullingList = dataObject.pullingList;
	
	if (!pullingList.length)
	{
		bootbox.dialog({
			message: "구독 리스트가 비었으므로 Export를 할 수 없습니다!",
			title: "리스트가 비었습니다!",
			buttons: {
				main: {
					label: "확인",
					className: "btn-default"
				}
			}
		});
		
		return;
	}
	
	applySaveFile("pulling-list.json", JSON.stringify(pullingList));
}
	
function applyLoadFile()
{
	fileDialog2.click();
}
	
function applySaveFile(name, data)
{	
	fileDialog.nwsaveas = name;
	forSavingData = data;
	fileDialog.click();
}
	
})();