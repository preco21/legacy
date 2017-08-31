(function() {
	
var sizeSelect;
var backgroundColor;
var transparentBackground;
var typeSelect;
var typeInput;
var saveSelect;
var size1, size2_1, size2_2;
var saveDirDialog;
	
document.addEventListener('DOMContentLoaded', function()
{
	sizeSelect = document.getElementById('size-select');
	backgroundColor = document.getElementById('background-color');
	transparentBackground = document.getElementById('transparent-background');
	typeSelect = document.getElementById('type-select');
	typeInput = document.getElementById('type-input');
	saveSelect = document.getElementById('save-select');
	size1 = document.getElementById('size-1');
	size2_1 = document.getElementById('size-2-1');
	size2_2 = document.getElementById('size-2-2');
	saveDirDialog = document.querySelector('#save-dir-dialog');
	
	var numberInputs = document.querySelectorAll('input[type="number"]');

	for (var i = 0; i < numberInputs.length; i++)
	{
		numberInputs[i].addEventListener('keydown', function(event)
		{
			if ([40, 46, 8, 9, 27, 13, 110, 190].indexOf(event.keyCode) != -1 ||
			   (event.ctrlKey && event.keyCode == 65) ||
			   (event.keyCode >= 35 && event.keyCode <= 39))
				return;

			if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105))
				event.preventDefault();
		});
	}
	
	sizeSelect.addEventListener('change', function()
	{
		if (this.value == 'Percent')
		{
			toggleSizeSetElement(true);
		}
		else if (this.value == 'W / H')
		{
			toggleSizeSetElement(false);
		}
	});
	
	transparentBackground.addEventListener('change', function()
	{
		backgroundColor.disabled = this.checked;
	});
	
	typeSelect.addEventListener('change', function()
	{
		updateTypeSelect(this.value);
	});
	
	document.querySelector('#reset-settings').addEventListener('click', function()
	{
		PRECO.resetSettingObject();
		updateAllInput();
	});
	
	var formControls = document.querySelectorAll('.form-control, input[type="checkbox"]');
	
	for (var i = 0; i < formControls.length; i++)
	{
		formControls[i].addEventListener('change', function(event)
		{
			updateAllInputHandler(event);
		});
	}
	
	saveDirDialog.addEventListener('change', saveDirDialogSelectHandler);
	
	updateAllInput();
});
	
function updateTypeSelect(type)
{
	var isDirect = type == '직접입력';
	typeSelect.value = type;
	typeInput.value = !isDirect ? type : '';
	typeInput.disabled = !isDirect;
}
	
function toggleSizeSetElement(flag)
{
	var el1 = document.getElementById('sizeset-1');
	var el2 = document.getElementById('sizeset-2');
	
	if (flag)
	{
		el1.classList.remove('hidden');
		el2.classList.add('hidden');
	}
	else
	{
		el1.classList.add('hidden');
		el2.classList.remove('hidden');
	}
}
	
function updateAllInputHandler(event)
{
	var settingObject = PRECO.getSettingObject();
	
	settingObject.type = typeSelect.value;
	settingObject.inputedType = typeInput.value;
	
	if (saveSelect.value == '저장 위치 직접 선택' && event.target.tagName.toLowerCase() == 'select')
	{
		clearFileDialog(saveDirDialog, saveDirDialogSelectHandler);	
		saveDirDialog.click();
		saveSelect.value = settingObject.saveMode;
	}
	else
		settingObject.saveMode = saveSelect.value;
	
	settingObject.resizeMode = sizeSelect.value;
	settingObject.resizeSet = sizeSelect.value == 'Percent' ? size1.value : size2_1.value + 'x' + size2_2.value;
	settingObject.backgroundColor = backgroundColor.value;
	settingObject.transparent = transparentBackground.checked;
	
	PRECO.setSettingObject(settingObject);
	updateAllInput();
}
	
function clearFileDialog(fileDialog, fileChangeHandler)
{
	var files = new FileList();

	fileDialog.removeEventListener('change', fileChangeHandler);
	fileDialog.files = files;
	fileDialog.addEventListener('change', fileChangeHandler);
}
	
function saveDirDialogSelectHandler(event)
{
	var directory = event.target.files[0].path;
	var settingObject = PRECO.getSettingObject();
	
	settingObject.saveMode = '저장 위치 직접 선택';
	settingObject.saveData = directory;
	
	saveSelect.value = '저장 위치 직접 선택';
	
	PRECO.setSettingObject(settingObject);
	updateAllInput();
}
	
function updateAllInput()
{
	var settingObject = PRECO.getSettingObject();
	
	updateTypeSelect(settingObject.type);
	typeInput.value = settingObject.inputedType;
	saveSelect.value = settingObject.saveMode;
	sizeSelect.value = settingObject.resizeMode;
	
	var sizeSelectFlag = sizeSelect.value == 'Percent';
	
	toggleSizeSetElement(sizeSelectFlag);
	
	if (sizeSelectFlag)
		size1.value = settingObject.resizeSet || 100;
	else
	{
		var sizes = [0, 0];
		
		if (settingObject.resizeSet.indexOf('x') != -1)
			sizes = settingObject.resizeSet.split('x');
		
		size2_1.value = sizes[0] || 0;
		size2_2.value = sizes[1] || 0;
	}
	
	backgroundColor.value = settingObject.backgroundColor;
	backgroundColor.disabled = settingObject.transparent;
	transparentBackground.checked = settingObject.transparent;
}
	
})();