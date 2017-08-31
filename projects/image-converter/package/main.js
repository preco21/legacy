(function() {

var gui = require('nw.gui');
var path = require('path');
var win = gui.Window.get();
	
var settingWindow;
var dropzone;
var convertCounter = 0;
var isConverting = false;

document.addEventListener('DOMContentLoaded', function()
{
	document.querySelector('#close-button').addEventListener('click', function()
	{
		win.close();
	});
	
	document.querySelector('#open-setting').addEventListener('click', function()
	{
		if (settingWindow)
		{
			settingWindow.focus();
			return;
		}
		
		settingWindow = gui.Window.open('app://preco/package/partials/settings/index.html', {
			show: true,
			toolbar: false,
			resizable: false,
			width : 600,
			height : 430,
			min_width : 600,
			max_width : 600,
			min_height : 430,
			max_height : 430
		});
		
		settingWindow.on('closed', function()
		{
			settingWindow = null;
		});
	});
	
	dropzone = document.querySelector('#dropzone');
	
	document.querySelector('body').addEventListener('dragover', function()
	{
		dropzone.textContent = 'DROP IT!';
		dropzone.classList.remove('dropzone-out');
		dropzone.classList.add('dropzone-hover');
	});
	
	document.querySelector('body').addEventListener('dragleave', function()
	{
		dropzone.textContent = 'DROP IMAGE HERE!';
		dropzone.classList.add('dropzone-out');
		dropzone.classList.remove('dropzone-hover');
	});
	
	document.querySelector('body').addEventListener('drop', function(event)
	{
		dropzone.textContent = 'CONVERTING..';
		dropzone.classList.add('dropzone-converting');
		dropzone.classList.remove('dropzone-hover');
		
		isConverting = true;
		
		convertImages(event.dataTransfer.files);
	});
});
	
win.on('closed', function()
{
	if (settingWindow)
		settingWindow.close();
});	
	
function convertImages(files)
{
	if (!files.length)
	{
		isConverting = false;
		dropzone.textContent = 'DROP IMAGE HERE!';
		dropzone.classList.add('dropzone-out');
		dropzone.classList.remove('dropzone-converting');
	}
	
	var settingObject = PRECO.getSettingObject();
	var distDir = '';
	var resizeSetting;
	var extension = '';
	
	if (settingObject.type == '직접입력')
	{
		if (settingObject.inputedType)
			extension = settingObject.inputedType;
		else
			return;
	}
	else
		extension = settingObject.type;
	
	if (settingObject.resizeMode == 'Percent')
		resizeSetting = makeResizeSetting('scale', checkZero(settingObject.resizeSet));
	else if (settingObject.resizeMode == 'W / H')
		resizeSetting = makeResizeSetting('wh', checkZero(settingObject.resizeSet.split('x')[0]), checkZero(settingObject.resizeSet.split('x')[1]));
	
	convertCounter = files.length;
	
	for (var i = 0; i < files.length; i++)
	{
		var basepath = files[i].path;
		var filename = path.basename(files[i].path, path.extname(files[i].path));
		
		if (settingObject.saveMode == '같은 위치에 자동으로 저장')
			distDir = path.dirname(files[i].path) + '/' + filename + '.' + extension;
		else if (settingObject.saveMode == '저장 위치 직접 선택')
			distDir = settingObject.saveData + '/' + filename + '.' + extension;
		
		distDir = '"' + distDir + '"';
		basepath = '"' + basepath + '"';
		
		PRECO.convertImage(basepath, distDir, resizeSetting, !settingObject.transparent, settingObject.backgroundColor, convertCompleteHandler);
	}
}
	
function checkZero(value)
{
	if (!value)
		return 0;
	else 
		return value;
}
						   
function makeResizeSetting(comm)
{
	if (!arguments.length)
		return null;
	
	var resizeSetting = {
		type: comm
	};
	
	if (comm == 'wh')
	{
		resizeSetting.width = arguments[1];
		resizeSetting.height = arguments[2];
	}
	else if (comm == 'scale')
		resizeSetting.percent = arguments[1];
	
	return resizeSetting;
}
	
function convertCompleteHandler(error, stdout, stderror)
{
	if (error || stderror)
	{
		alert('변환중 오류가 발생했습니다!');
		alert(error);
	}
	
	if (--convertCounter <= 0)
	{
		dropzone.textContent = 'COMPLETE!';
		
		setTimeout(function()
		{
			isConverting = false;
			dropzone.textContent = 'DROP IMAGE HERE!';
			dropzone.classList.add('dropzone-out');
			dropzone.classList.remove('dropzone-converting');
		}, 1000);
	}
}

})();