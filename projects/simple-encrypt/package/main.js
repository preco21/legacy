(function() {
	
var crypto = require('crypto');
var fs = require('fs');
var zlib = require('zlib');
var path = require('path');

var algorithm = 'aes-256-ctr';
	
var fileDialog;
var mode = '';
var password = '';
	
var afv, bfv;
	
document.addEventListener('DOMContentLoaded', function()
{
	fileDialog = document.getElementById('file-dialog');
	afv = document.getElementById('after-view');
	bfv = document.getElementById('before-view');
	
	document.getElementById('encrypt-button').addEventListener('click', function()
	{
		mode = 'enc';
		fileDialog.click();
	});
	
	document.getElementById('decrypt-button').addEventListener('click', function()
	{
		mode = 'dec';
		fileDialog.click();
	});
	
	fileDialog.addEventListener('change', fileChangeHandler);
});
	
function fileChangeHandler()
{
	var file = fileDialog.files[0];
	var filePath = file.path;
		
	if (!file || !mode)
		return;

	if (file.size > 3221225472 || file.size <= 0)
	{
		alert('파일크기가 너무 크거나 작습니다! (최대 3GB)');
		clearFileDialog();
		return;
	}

	password = prompt('비밀키를 입력해주세요. (최대 32자리)');

	if (!password || password.length > 32)
	{
		alert('비밀키가 입력되지 않았거나, 최대 자릿수를 초과했습니다!');
		clearFileDialog();
		return;
	}

	bfv.classList.add('hidden');
	afv.classList.remove('hidden');

	var read = fs.createReadStream(filePath);
	var result = read.pipe(fs.createWriteStream(filePath + '.temp'));

	result.on('close', function()
	{
		var temp = fs.createReadStream(filePath + '.temp');
		var write = fs.createWriteStream(filePath);
		var result2;

		if (mode == 'enc')
		{
			var zip = zlib.createGzip();
			var encrypt = crypto.createCipher(algorithm, password);

			result2 = temp.pipe(zip).pipe(encrypt).pipe(write);
		}
		else if (mode == 'dec')
		{
			var unzip = zlib.createGunzip();
			var decrypt = crypto.createDecipher(algorithm, password);

			result2 = temp.pipe(decrypt).pipe(unzip).pipe(write);
		}

		result2.on('close', function()
		{
			fs.unlinkSync(filePath + '.temp');

			bfv.classList.remove('hidden');
			afv.classList.add('hidden');
			
			clearFileDialog();
		});
	});
}
	
function clearFileDialog()
{
	var files = new FileList();

	fileDialog.removeEventListener('change', fileChangeHandler);
	fileDialog.files = files;
	fileDialog.addEventListener('change', fileChangeHandler);
}
	
})();