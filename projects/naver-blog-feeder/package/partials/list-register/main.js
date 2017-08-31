(function() {
	
PRECO.DISABLE_PREVENT_HISTORY_BACK = true;
	
$(function()
{	
	$("#history-back").click(function()
	{
		location.replace("app://preco/package/partials/list-config/index.html");
	});
	
	$("#submit").click(submitHandler);
	$("#blog-id").keydown(function(event)
	{
		if (event.which == 13)
			submitHandler();
	}).focus();
	
	$("#blog-id").on("input propertychange paste click", function(event)
	{ 
		var regex = /[^A-Za-z0-9_]/g;
		var value = $('#blog-id').val().trim();
		
		$('#blog-id').val(value.replace(regex, ""));
	});
});
	
function submitHandler()
{
	var dataObject = PRECO.getDataObject();
	var pullingList = dataObject.pullingList;
	var blogId = $("#blog-id").val();

	blogId = blogId.replace(/\s+/g, "");

	if (!blogId)
		return;
	
	if (pullingList.length >= 50)
	{
		bootbox.dialog({
			message: "구독 추가는 최대 50명까지만 가능합니다. 삭제 후 다시 등록하세요!",
			title: "구독 - " + blogId,
			buttons: {
				main: {
					label: "확인",
					className: "btn-default"
				}
			}
		});
		
		return;
	}

	$("#blog-id").val("");

	if (pullingList.indexOf(blogId) != -1)
	{
		bootbox.dialog({
			message: "이미 추가되어 있습니다. 초기화를 원하시면 리스트에서 삭제 후 다시 등록하세요!",
			title: "구독 - " + blogId,
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
		pullingList.push(blogId);
		
		PRECO.setDataObject(dataObject);
		global.forcedPulling();

		bootbox.dialog({
			message: "구독 대상을 추가했습니다!",
			title: "구독 - " + blogId,
			buttons: {
				main: {
					label: "확인",
					className: "btn-default"
				}
			}
		});
	}
}
	
})();