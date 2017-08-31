(function() {

var targetPage = "http://google.com";
var musicDataDirectory = "musicdata/preco/data/musicData.json";
var musicDirectory = "musicdata/preco/musics/";
var isStartUpAutoPlay = true;
var isAutoPlay = true;
var isStartUpRandomMusic = true;
var shuffleFlag = false;
var startUpMusicIndex = 0;
var startupVolume = 0.8;
var musicData;
var nowPlaying;
var shuffleArray = [];
var nowPlayingIndex;

// 엔트리 포인트
$(function()
{
	$("#mainFrame").attr("src", targetPage);
	
	$(window).resize(setupFrame);
	setupFrame();
	musicPlayerLoadCompleteHandler();
});

// 뮤직 플레이어 시작
function musicPlayerLoadCompleteHandler()
{
	// audioElement Select
	nowPlaying = document.getElementById("audioElement");

	// 커스텀 stop 메서드 정의
	nowPlaying.stop = function()
	{
		this.pause();
		this.currentTime = 0;
		setPlayButtonGlyphIcon(2);
	};

	// 시작시 볼륨조절
	nowPlaying.volume = startupVolume;

	// 볼륨바 볼륨조절
	$("#musicVolumeBar").css("width", nowPlaying.volume * 100 + "%");

	// 음악이름 툴팁
	$("#musicName").tooltip({
		placement: "bottom"
	});
	
	// 셔플 초기화
	if (shuffleFlag)
		$("#musicShuffleToggleIcon").addClass("glyphicon-random");
	else
		$("#musicShuffleToggleIcon").addClass("glyphicon-refresh");

	var musicListElement = '<div class="musicListSet list-group">';

	// 뮤직 리스트 로드
	$.getJSON(musicDataDirectory, function(data)
	{
		musicData = data;
		
		for (var i = 0; i < data.length; i++)
		{
			musicListElement += '<a class="list-group-item point-cursor" onclick="musicStartByList(' + i + ');">' + data[i].musicName + "</a>";
		}
		
		musicListElement += "</div>";

		if (isStartUpRandomMusic)
		{
			var randomInt = Math.floor(Math.random() * data.length);

			startMusic(data[randomInt].file, data[randomInt].musicName);
			nowPlayingIndex = randomInt;
		}
		else
		{
			startMusic(data[startUpMusicIndex].file, data[startUpMusicIndex].musicName);
			nowPlayingIndex = startUpMusicIndex;
		}

		// 리스트 팝오버
		$("#musicListButton").popover({
			html: true,
			placement: "bottom",
			title: "Music List  -",
			content: musicListElement
		});
		
		// 리스트 팝오버 닫기
		$("body").click(function(event)
		{
			if ($(event.target).data("toggle") != "popover"
			&& $(event.target).parents("[data-toggle=\"popover\"]").length == 0
			&& $(event.target).parents(".popover.in").length == 0)
			{
				$("[data-toggle=\"popover\"]").popover("hide");
			}
		});

		// 다음버튼 핸들링
		$("#musicNextButton").click(function()
		{
			playNextMusic(data);
		});

		// 이전버튼 핸들링
		$("#musicPrevButton").click(function()
		{
			playPrevMusic(data);
		});

		// 컴플리트 이벤트 핸들링
		nowPlaying.addEventListener("ended", function()
		{
			nowPlaying.stop();
			
			if (shuffleFlag)
			{
				var randomInt = 0;
				
				if (shuffleArray.length >= data.length)
					shuffleArray.length = 0;
				
				do
					randomInt = Math.floor(Math.random() * data.length);
				while (randomInt == nowPlayingIndex || shuffleArray.indexOf(randomInt) != -1);
				
				shuffleArray.push(randomInt);
				
				startMusic(data[randomInt].file, data[randomInt].musicName);
				nowPlayingIndex = randomInt;
			}
			else
				playNextMusic(data);
		});
	});

	/* Event Handling */
	
	// 프리로딩 이벤트 핸들링
	nowPlaying.addEventListener("loadstart", musicPreloadStartHandler);

	// 타임 업데이트 이벤트 핸들링
	nowPlaying.addEventListener("timeupdate", musicTimeUpdateHandler);

	/* jquery Event Handling */

	// 재생/일시정지버튼 핸들링
	$("#musicPlayPauseButton").click(function()
	{
		playPauseMusic(nowPlaying.paused);
	});

	// 정지버튼 핸들링
	$("#musicStopButton").click(function()
	{
		nowPlaying.stop();
		setPlayButtonGlyphIcon(2);
	});

	var originMusicStatus = nowPlaying.paused;
	var isProgressPressed = false;

	// 슬라이드 바
	$("#musicProgressBarPost").on("sliderchange", function(e, result)
	{
		nowPlaying.currentTime = nowPlaying.duration * (result.value / 100);

		var formatedDura = formatTimeNumber(nowPlaying.currentTime) + " / " + formatTimeNumber(nowPlaying.duration);

		$("#musicDuration").text(formatedDura);
	})
	.mousedown(function()
	{
		originMusicStatus = nowPlaying.paused;
		isProgressPressed = true;
		nowPlaying.pause();
	});
	
	$(document).mouseup(function()
	{
		if (isProgressPressed && !originMusicStatus)
		{
			isProgressPressed = false;
			nowPlaying.play();
		}
	});

	// 볼륨 바
	$("#musicVolumePost").on("sliderchange", function(e, result)
	{
		nowPlaying.volume = result.value / 100;

		if (nowPlaying.volume == 0)
		{
			nowPlaying.muted = true;
			muteButtonToggle(true);
		}
		else
		{
			nowPlaying.muted = false;
			muteButtonToggle(false);
		}
	});

	// mute 버튼 처리
	$("#musicVolumeIcon").click(function()
	{
		nowPlaying.muted = !nowPlaying.muted;
		muteButtonToggle(nowPlaying.muted);

		if (nowPlaying.muted)
			$("#musicVolumeBar").css("width", "0%");
		else
			$("#musicVolumeBar").css("width", Math.floor(nowPlaying.volume * 100) + "%");
	});

	// 셔플 버튼 처리
	$("#musicShuffleToggleIcon").click(function()
	{
		var btn = $("#musicShuffleToggleIcon");

		shuffleFlag = !shuffleFlag;

		if (shuffleFlag)
		{
			btn.removeClass("glyphicon-refresh");
			btn.addClass("glyphicon-random");
		}
		else
		{
			btn.removeClass("glyphicon-random");
			btn.addClass("glyphicon-refresh");
		}
	});
}

// music selection
function musicStartByList(index)
{
	nowPlaying.stop();
	startMusicByIndex(musicData, index);
}

// 다음음악 재생
function playNextMusic(data)
{
	if(++nowPlayingIndex >= data.length)
		nowPlayingIndex = 0;

	startMusicByIndex(data, nowPlayingIndex);
}

// 이전음악 재생
function playPrevMusic(data)
{
	if (--nowPlayingIndex < 0)
		nowPlayingIndex = data.length - 1;

	startMusicByIndex(data, nowPlayingIndex);
}

// 인덱스기반 음악 재생
function startMusicByIndex(data, index)
{
	nowPlaying.stop();
	startMusic(data[index].file, data[index].musicName);

	if (isAutoPlay)
	{
		playPauseMusic(true);
	}
}

// 스타트업 재생
function startMusic(musicFileName, musicName)
{
	if (musicName.length >= 12)
	{
		var shortedMusicName = musicName.substring(0, 10);
		
		$("#musicName").text(shortedMusicName + "..");
	}
	else
	{
		$("#musicName").text(musicName);
	}

	$("#musicName").tooltip("destroy").tooltip({
		placement: "bottom",
		title: musicName
	});
	
	setMusic(musicFileName);

	if (isStartUpAutoPlay)
	{
		playPauseMusic(true);
		isStartUpAutoPlay = false;
	}
	else if (isAutoPlay)
	{
		playPauseMusic(true);
	}
}

// 음악소스 삽입
function setMusic(musicName)
{
	if (nowPlaying.canPlayType("audio/mpeg") != "")
		nowPlaying.src = musicDirectory + musicName + ".mp3";
	else if (nowPlaying.canPlayType("audio/ogg") != "")
		nowPlaying.src = musicDirectory + musicName + ".ogg";
}

// 음악재생 제어
function playPauseMusic(musicStatus)
{
	if (musicStatus)
	{
		nowPlaying.play();
		setPlayButtonGlyphIcon(1);
	}
	else
	{
		nowPlaying.pause();
		setPlayButtonGlyphIcon(2);
	}
}

// 버튼 글리프 설정
function setPlayButtonGlyphIcon(flag)
{
	var button = $("#musicPlayPauseButtonGlyph");

	if (flag == 1)
	{
		// 재생 상태 (>)
		button.removeClass("glyphicon-play");
		button.addClass("glyphicon-pause");
	}
	else if (flag == 2)
	{
		// 일시정지 상태 (=)
		button.removeClass("glyphicon-pause");
		button.addClass("glyphicon-play");
	}
}

// mute 토글
function muteButtonToggle(status)
{
	var volumeIcon = $("#musicVolumeIcon");

	if (status)
	{
		volumeIcon.removeClass("glyphicon-volume-up");
		volumeIcon.addClass("glyphicon-volume-off");
	}
	else
	{
		volumeIcon.removeClass("glyphicon-volume-off");
		volumeIcon.addClass("glyphicon-volume-up");
	}
}

// 타임 포맷팅
function formatTimeNumber(duraSec)
{
	var min = Math.floor(duraSec / 60);
	var sec = Math.floor(duraSec % 60);
	var minStr = "";
	var secStr = "";

	minStr = min < 10 ? "0" + min : min;
	secStr = sec < 10 ? "0" + sec : sec;
	
	return minStr + ":" + secStr;
}

/* Events */

// 프로그래스 처리
function musicTimeUpdateHandler()
{
	var percentage = (nowPlaying.currentTime / nowPlaying.duration) * 100;
	var formatedDura = formatTimeNumber(nowPlaying.currentTime) + " / " + formatTimeNumber(nowPlaying.duration);
	
	if (isNaN(nowPlaying.duration))
		formatedDura = "00:00 / 00:00";
	
	$("#musicProgressBar").css("width", percentage + "%");
	$("#musicDuration").text(formatedDura);
}

// 프리로드
function musicPreloadStartHandler()
{
	$("#musicDuration").text("00:00 / 00:00");
}

// 프레임 셋업
function setupFrame()
{
	var targetFrame = $("#blogFrame");
	var windowHeight = $(window).height();
	var naviHeight = $("#naviBar").height();

	targetFrame.css("top", naviHeight);
	targetFrame.height(windowHeight - naviHeight);
}
	
window.musicStartByList = musicStartByList;
	
})();