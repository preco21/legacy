(function() {
	
$(function()
{
	$("[data-toggle='tooltip']").tooltip();
	
	$("#converted-id").click(function()
	{
		$(this).select();
	})
	.on("keydown paste", function(event)
	{
		if (event.ctrlKey && event.keyCode == 67)
			return;
		
		event.preventDefault();
	});
	
	startHandleFormUpdate();
	formUpdateHandler();
});
	
function startHandleFormUpdate()
{
	$(".form-control").on("input propertychange paste click", function()
	{
		formUpdateHandler();
	});
}
	
function formUpdateHandler()
{
	var inputValue = $("#target-id").val().trim();
	$("#converted-id").val(convertId(inputValue));
}
	
function convertId(originalID)
{
	if (!validateId(originalID))
		return "-";
		
	var a = +originalID.substr(8, 1);
	var b = Math.floor(+originalID.substr(10));
	
	return "U:1:" + (b * 2 + a);
}
	
function validateId(id)
{
	var regex = /^STEAM_[0-5]:[01]:\d+$/g;
	return regex.test(id);
}

})();