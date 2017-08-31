(function() {
	
var fs = require("fs");
var path = require('path');
var fileDialog;

PRECO.DISABLE_PREVENT_HISTORY_BACK = true;

$(function()
{
	fileDialog = $("#file-dialog");
	
	$("#history-back").click(function()
	{
		location.replace("app://preco/package/partials/dash-board/index.html");
	});
	
	// 넘버릭 input
	$("input[type='number']").on("keydown paste", function(event)
	{
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110, 190]) != -1 ||
		   (event.ctrlKey && event.keyCode == 65) ||
		   (event.keyCode >= 35 && event.keyCode <= 39))
			return;
		
        if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105))
            event.preventDefault();
	});
	
	$("#reset-setting").click(function()
	{
		resetSettings();
		reflowContent();
	});
	
	$("#alert-sound-select").click(function()
	{
		fileDialog.trigger("click");
	});
	
	fileDialog.change(function(event)
	{
		var file = fileDialog[0].files[0];
		var fileExtension = file.name.split(".").pop();
		
		if (!file)
			return;
		
		if (!fileExtension || fileExtension != "mp3")
		{
			bootbox.dialog({
				message: "mp3파일만 등록 가능합니다!",
				title: "Error!",
				buttons: {
					main: {
						label: "확인",
						className: "btn-default"
					}
				}
			});
		}
		else if (file.size > 20971520)
		{
			bootbox.dialog({
				message: "파일이 너무 큽니다! (최대 20mb)",
				title: "Error!",
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
			var execPath = path.dirname(process.execPath);
			var dataObject =  PRECO.getDataObject();
			var settings = dataObject.settings;

			fs.createReadStream(file.path).pipe(fs.createWriteStream(execPath + "\\alert.mp3"));
			settings.alertName = file.name.substr(0, 10);

			PRECO.setDataObject(dataObject);
			global.updateAlertAudio();
			
			bootbox.dialog({
				message: "알림음이 등록되었습니다!",
				title: "Success!",
				buttons: {
					main: {
						label: "확인",
						className: "btn-default"
					}
				}
			});

			reflowContent();
		}
	});
	
	checkFormUpdate();
	reflowContent();
});
	
function checkFormUpdate()
{
	$(".form-control").on("input propertychange paste click", function()
	{
		checkNumberMinMax();
		saveSettings();
	});
	
	$("#alert-toggle").on('switchChange.bootstrapSwitch', function(event, state)
	{
		saveSettings();
	});
}
	
function checkNumberMinMax()
{	
	checkMinMaxComponent($("#update-rate"), true, 1, 1200);
	checkMinMaxComponent($("#alert-duration"), true, 1, 60);
}
	
function checkMinMaxComponent(jquery, isFloat, min, max)
{
	var value = parseInt(jquery.val().trim());
	jquery.val(Math.max(Math.min(value, max), min));
}
	
function saveSettings()
{
	var dataObject =  PRECO.getDataObject();
	var settings = dataObject.settings;
	var updateRate = $("#update-rate").val();
	var alertDuration = $("#alert-duration").val();
	var alertToggleFlag = $("#alert-toggle").bootstrapSwitch("state");
	var alertName = $("#alert-sound-name").text();
	
	if (isNaN(updateRate) || isNaN(alertDuration) || !alertName)
		return;
	
	settings.updateRate = updateRate;
	settings.alertDuration = alertDuration;
	settings.alertName = alertName;
	settings.alertToggleFlag = alertToggleFlag;
	
	PRECO.setDataObject(dataObject);
}
	
function resetSettings()
{
	var dataObject = PRECO.getDataObject();
	var settingObject = {
		updateRate: 20,
		alertDuration: 6,
		alertName: "Default",
		alertToggleFlag: true
	};
	
	var execPath = path.dirname(process.execPath);
	fs.createReadStream("sounds/alert.mp3").pipe(fs.createWriteStream(execPath + "\\alert.mp3"));
	
	dataObject.settings = settingObject;
	PRECO.setDataObject(dataObject);
}
	
function reflowContent()
{
	var settings = PRECO.getDataObject().settings;
	
	$("#update-rate").val(settings.updateRate);
	$("#alert-duration").val(settings.alertDuration);
	$("#alert-sound-name").text(settings.alertName);
	$("#alert-toggle").bootstrapSwitch("state", settings.alertToggleFlag);
}
	
})();