(function() {

var fs = require('fs');
var path = require('path');
var request = require('request');
var navi = require('nw.gui');
var currentWindow = navi.Window.get();
	
var downloadList = null;

$(function()
{	
	$('#devi-link').click(function()
	{
		navi.Shell.openExternal($(this).text());
	});
	
	$('#clear-search-input').click(function()
	{
		$('#search-input').val('');
	});
	
	$('#open-save-directory-button').click(function()
	{
		var savedData = getLocalStorage();
		
		if (savedData.saveMethod == 1)
			navi.Shell.openExternal(path.dirname(process.execPath));
		else if (savedData.saveDirectory)
			navi.Shell.openExternal(savedData.saveDirectory);
	});
	
	$('#search-form').submit(function(event)
	{
		event.preventDefault();
		
		var url = $('#search-input').val();
		
		if (url && isURL(url))
			loadImageData(url);
		else
			Materialize.toast('프로토콜(http, https)을 포함한 URL을 입력해 주세요.', 3000);
		
		$('#search-input').blur();
	});
	
	$('#download-all-images-button').click(function()
	{
		if (!downloadList)
		{
			Materialize.toast('다운로드 리스트가 비었습니다.', 3000);
			return;
		}
		
		downloadList.forEach(function(image)
		{
			downloadFileFromLocalData(image);
		});
	});
	
	$('a[data-toggle="modal"]').leanModal();
	
	$('#save-method-select').change(saveMethodChangeHandler);
	$('#save-directory-file').change(saveDirectoryChangeHandler);
	
	$('.material-boxed').materialbox();
	
	window.addEventListener('resize', resizeHandler);
	
	initSavedData();
	saveMethodChangeHandler();
	saveDirectoryChangeHandler();
});
	
function isURL(url)
{
	var regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	return regex.test(url);
}
	
// 이미지 로드 및 DOM에 삽입
function loadImageData(url)
{
	var target = $('#image-set').empty();
	var parser = new PRECO.ImageParser(url);
	
	parser.parseImage(function(error, imageList)
	{
		if (error)
		{
			Materialize.toast(error, 3000);
			return;
		}

		for (var i = 0; i < imageList.length; i++)
			target.append(buildImageElement(imageList[i], i));
		
		downloadList = imageList;
	});
	
	resizeHandler();
}
	
// PS 이미지 element 빌드
function buildImageElement(url, id)
{
	var wrapper = $('<div>', {
		'class': 'col left image-wrapper'
	});
	
	var imagePS = $('<a>', {
		'data-href': url
	});
	
	var innerImage = $('<img>', {
		src: url,
		'class': 'image-ps'
	});
	
	var downloadButton = $('<a>', {
		'class': 'btn blue lighten-2 waves-effect waves-light download-button',
		'id': 'dl-button-' + id
	});
	
	var icon = $('<i>', {
		'class': 'mdi-file-file-download'
	});
	
	imagePS.append(innerImage);
	downloadButton.append(icon);
	wrapper.append(imagePS);
	wrapper.append(downloadButton);
	
	imagePS.click(function(event)
	{
		openPhotoSwipe(this);
	});
	
	downloadButton.click(function()
	{
		downloadFileFromLocalData(url);
	});
	
	return wrapper;
}
	
// URL을 다운로드하여 파일로 저장
function downloadFileFromLocalData(url)
{	
	var savedData = getLocalStorage();
	var saveDir = (savedData.saveMethod == 1) ? path.dirname(process.execPath) : savedData.saveDirectory || path.dirname(process.execPath);
	var fileName = url.replace(/(.*\/)|(\?.*)+/g, '');
	
	Materialize.toast('다운로드 시작: ' + replaceDot(fileName, 32), 1000);
	
	var req = request(url).pipe(fs.createWriteStream(path.join(saveDir, fileName)));
	
	req.on('close', function()
	{		
		Materialize.toast('다운로드 완료: ' + replaceDot(fileName, 32), 3000);
	});
}
	
function replaceDot(str, length)
{
	return str.length > length ? str.substr(0, length) + '..' : str;
}
	
function openPhotoSwipe(element)
{
	var tempImage = new Image();
	
	tempImage.addEventListener('load', function()
	{
		var items = [{
			src: element.dataset.href,
			w: this.width,
			h: this.height
		}];

		var options = {
			index: 0
		};

		var gallery = new PhotoSwipe(document.querySelector('.pswp'), PhotoSwipeUI_Default, items, options);
		gallery.init();
	});
	
	tempImage.src = element.dataset.href;
}
	
function initSavedData()
{
	var savedData = getLocalStorage();
	
	$('#save-method-select').val(savedData.saveMethod);
	$('#save-directory-text').val(savedData.saveDirectory);
}
	
function resizeHandler()
{
	var newHeight = window.innerHeight;
	
	$('.image-container').css('height', newHeight - $('#main-navbar').height() + 'px');
}
	
function saveDirectoryChangeHandler()
{
	var directory = $('#save-directory-file').val();
	var savedData = getLocalStorage();
	
	if (!directory)
		return;
	
	savedData.saveDirectory = directory;
	setLocalStorage(savedData);
	
	$('#save-directory-text').val(directory);
}
	
function saveMethodChangeHandler()
{
	var selected = $('#save-method-select').find('option:selected').val();
	var savedData = getLocalStorage();
	
	savedData.saveMethod = selected;
	setLocalStorage(savedData);
	
	$('#save-directory-file-warpper').prop('hidden', selected == 1);
}
	
function getLocalStorage()
{
	var data = localStorage.getItem('preco_ImageScraper');
	
	if (!data)
	{
		data = makeDataObject();
		setLocalStorage(data);
	}
	else
		data = JSON.parse(data);
	
	return data;
}
	
function setLocalStorage(data)
{
	localStorage.setItem('preco_ImageScraper', JSON.stringify(data));
}
	
function makeDataObject()
{
	return {
		saveMethod: 1,
		saveDirectory: ''
	};
}

})();