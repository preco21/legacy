<?php
session_start();

if (!isset($_SESSION["fullRequest"]) || !isset($_SESSION["doNum"]))
	exit("Error:Bad Request");

if ($_SESSION["fullRequest"] < 30)
	$_SESSION["fullRequest"] += 1;
else
	exit("Error:Exceed Request");

if ($_SESSION["doNum"] != true)
{
	$_SESSION["doNum"] = true;
}
else
	exit("Error:Recursive Request");

require_once("curl.php");

$baseDir = "/volume1/web/"; // service dir
$serviceDir = "service/dist/youtube-downloader/"; // this
$videoTempDirectory = "temp/"; // 임시폴더
$downloadDirectory = "temp-mp3/"; // 다운로드 폴더

$videoId = $_POST["video"];
$resultId = "";

if (strpos($videoId, "watch?v=") != false)
{
	$videoTemp = explode("watch?v=", $videoId);
	$resultId = trim(end($videoTemp));
}
else if (strpos($videoId, "youtu.be/") != false)
{
	$videoTemp = explode("/", $videoId);
	$resultId = trim(end($videoTemp));
}
else if (strlen($videoId) == 11)
{
	$resultId = $videoId;
}
else
	exit("전달된 URL이 잘못되었습니다");

$videoInfo = "http://www.youtube.com/get_video_info?video_id=". $resultId;
$videoInfo = curlGet($videoInfo);

parse_str($videoInfo);

$fetchArray = "";

if (isset($url_encoded_fmt_stream_map))
	$fetchArray = explode(",", $url_encoded_fmt_stream_map);
else
{
	exit("파싱결과를 가져올 수 없습니다. 지원하지 않는 동영상입니다");
}

if (count($fetchArray) == 0)
{
	exit("파싱결과를 가져올 수 없습니다. 지원하지 않는 동영상입니다");
}

$resultUrl = "";

foreach ($fetchArray as $format)
{
	parse_str($format);
	parse_str(urldecode($url));
	$type = explode(';', $type);
	
	if ($type[0] == "video/mp4")
	{
		if (get_size($url) > 268435456)
		{
			exit("Error:Too Big File");
		}
		
		$resultUrl = urldecode($url);
		break;
	}
}

if (empty($resultUrl))
	exit("mp3로 변환 할 수 없습니다");

$resultFile = downloadFile($resultUrl, $baseDir . $serviceDir . $videoTempDirectory);
$pureFile = basename($resultFile, ".temp");
$inFile = $resultFile;
$outFile = $baseDir . $serviceDir . $downloadDirectory . $pureFile . ".mp3";
$cmd = "ffmpeg -i \"" . $inFile . "\" -f mp3 -ab 320000 -vn \"" . $outFile . "\"";

exec($cmd);

unlink($inFile);

$current_dir_url = $_SERVER['SERVER_NAME'] . dirname($_SERVER['PHP_SELF']);
$downloadDirUrl = $_SERVER['SERVER_NAME'] . "/" . $serviceDir;
$outUrl = $downloadDirectory . $pureFile . ".mp3";
$mime = "audio/mp3";

echo("http://" . $current_dir_url . "/download.php?mime=" . $mime . "&title=" . urlencode($title) . "&url=" . base64_encode("http://" . $downloadDirUrl . $outUrl));

function downloadFile($source, $directory)
{
	$fileName = "";
	
	while (true)
	{
		$fileName = uniqid("temp", true) . ".temp";
		if (!file_exists($directory . $fileName))
			break;
	}
	
	$fullDirectory = $directory . $fileName;
	
	exec("wget -O \"" . $fullDirectory . "\" \"" . $source . "\"");
	
	return $fullDirectory;
}
?>