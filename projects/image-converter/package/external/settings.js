var PRECO = PRECO || {};

(function() {
	
function makeSettingObject()
{
	return {
		type: "png",
		inputedType: "",
		saveMode: "같은 위치에 자동으로 저장",
		saveData: "",
		resizeMode: "Percent",
		resizeSet: "100",
		backgroundColor: 0,
		transparent: true
	};
}

function resetSettingObject()
{
	var settings = makeSettingObject();
	localStorage.setItem("preco_imageConverter", JSON.stringify(settings));	
}
	
function getSettingObject()
{
	var settings = localStorage.getItem("preco_imageConverter");
	
	if (!settings)
	{
		settings = makeSettingObject();
		localStorage.setItem("preco_imageConverter", JSON.stringify(settings));
	}
	else
		settings = JSON.parse(settings);
	
	return settings;
}
	
function setSettingObject(settings)
{
	localStorage.setItem("preco_imageConverter", JSON.stringify(settings));
}
	
PRECO.getSettingObject = getSettingObject;
PRECO.setSettingObject = setSettingObject;
PRECO.resetSettingObject = resetSettingObject;
	
})();