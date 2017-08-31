(function() {

var reqMp3 = false; // MP3요청 flag

$(function()
{	
	$("#url-input").keypress(function(event)
	{
		if (event.which == 13)
		{
			doAjax();
		}
	})
	.focus();
	
	$("#complete-button").click(doAjax);
});

function doMusicDownload()
{
	var inputData = $("#url-input");
	var status = $("#status");
	
	if (!inputData.val().trim())
	{
		status.text("URL칸이 비었습니다");
		return;
	}
	
	if (reqMp3 != true)
	{
		reqMp3 = true;
	}
	else
	{
		status.text("이미 MP3 다운로드를 요청한 상태입니다. 다운로드 링크가 나타나지 않는다면 새로고침 후 다시시도하세요");
		return false;
	}
	
	status.text("MP3로 변환하는 중입니다.. 다운로드창이 뜰 때까지 기다려주세요");
	
	$.ajax({
		type: "POST",
		url: "serverside/music.php",
		data: {
			video: inputData.val()
		},
		success: function(data)
		{
			switch (data)
			{
				case "Error:Recursive Request":
					status.text("요청이 중복되었습니다");
					break;

				case "Error:Exceed Request":
					status.text("1인당 최대 다운로드 횟수를 초과했습니다");
					break;

				case "Error:Bad Request":
					status.text("잘못된 요청입니다");
					break;

				case "Error:Too Big File":
					status.text("원본크기가 너무 크므로 다운로드 할 수 없습니다 (원본 MP4 최대크기 256MB)");
					break;

				default:
					break;
			}

			if (data.indexOf("Error") != -1)
				return false;

			location.replace(data);
			status.text("변환이 끝났습니다. MP3파일을 다운로드 해주세요");
		},
		error: function(error)
		{
			status.text("MP3를 다운로드 받는도중에 오류가 발생했습니다");
		}
	});
}

function doAjax()
{
	var inputData = $("#url-input");
	var status = $("#status");
	
	if (!inputData.val().trim())
	{
		status.text("URL칸이 비었습니다");
		return;
	}
	
	status.text("동영상 리스트를 가져오는중...");
	
	$.ajax({
		type: "POST",
		url: "serverside/youtube.php",
		data: {
			video: inputData.val()
		},
		success: function(data)
		{
			try
			{
				var json = JSON.parse(data);
				$("#thumbnail").attr("src", json.thumbnail);
				$("#title").text(json.title);
				
				var downloadLinkElem = "";
				var errorFlag = false;
				var onCompFlag = false;
				reqMp3 = false;
				
				for (var i = 0; i < json.videoData.length; i++)
				{
					if (json.videoData[i].size == "0B")
						errorFlag = true;
					else
						onCompFlag = true;
					
					downloadLinkElem += '<a class="list-group-item" href="serverside/download.php?mime=' + json.videoData[i].type + "&title=" + encodeURIComponent(json.title) + "&url=" + Base64.encode(json.videoData[i].url) + '">';
					downloadLinkElem +=	'<h4 class="list-group-item-heading">타입: ' + mimeToExtension(json.videoData[i].type) + " / 퀄리티: " + json.videoData[i].quality + "</h4>"; 
					downloadLinkElem +=	'<p class="list-group-item-text">용량: ' + json.videoData[i].size + " / Itag: " + json.videoData[i].itag + "</p>";
					downloadLinkElem +=	"</a>";
				}
				
				var statusText = "";
				
				if (errorFlag)
				{
					if (onCompFlag)
						statusText = "일부결과를 받지 못했습니다. 잠시후에 다시시도하세요 (일부 동영상의 용량이 0B입니다)";
					else
						statusText = "결과를 받는도중 문제가 발생했습니다. 잠시후에 다시시도하세요 (전체 동영상의 용량이 0B입니다)";
				}
				else if (onCompFlag && !errorFlag)
				{
					statusText = "성공적으로 동영상 리스트를 로드했습니다";
				}
				
				status.text(statusText);
				
				downloadLinkElem += '<a class="list-group-item pointer" href="#" onclick="doMusicDownload();">';
				downloadLinkElem +=	'<h4 class="list-group-item-heading">MP3 파일로 다운로드 : 비디오를 변환하는 과정이 있으므로 조금 기다려야합니다 [원본동영상(mp4) 최대 크기 256mb]</h4>';
				downloadLinkElem +=	"</a>";
				
				$("#download-link").html(downloadLinkElem);
				
			}
			catch (error)
			{
				status.text(data);
			}
		},
		error: function(error)
		{
			status.text("정보를 가져오는중에 오류가 발생했습니다");
		}
	});
}

function mimeToExtension(string)
{
	switch(string)
	{
		case "video/webm":
			return "webm 웹 비디오";
			
		case "video/mp4":
			return "mp4 고품질 비디오";
			
		case "video/x-flv":
			return "flv 플래시 비디오";
			
		case "video/3gpp":
			return "3gp 비디오 컨테이너";
			
		default:
			return string;
	}
}

window.doMusicDownload = doMusicDownload;
	
})();