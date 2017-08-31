<?php
require_once("curl.php");

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

//$videoInfo = "http://www.youtube.com/get_video_info?html5=1&video_id=". $resultId . "&el=embedded&hl=ko_KR&sts=16225&iframe=1&c=web&cver=html5";
//$videoInfo = "http://www.youtube.com/get_video_info?html5=1&video_id=". $resultId . "&cpn=w4XY3PDM5oTKLoX8&el=embedded&hl=ko_KR&iframe=0&c=web&cver=html5";
$videoInfo = "http://www.youtube.com/get_video_info?video_id=". $resultId;
$videoInfo = curlGet($videoInfo);
parse_str($videoInfo);

$youtubeJsonData = array("thumbnail" => $thumbnail_url, "title" => $title);

$fetchArray = "";

if (isset($url_encoded_fmt_stream_map))
	$fetchArray = explode(",", $url_encoded_fmt_stream_map);
else
{
	exit("결과를 가져올 수 없습니다. 지원하지 않는 동영상입니다");
}

if (count($fetchArray) == 0)
{
	exit("결과를 가져올 수 없습니다. 지원하지 않는 동영상입니다");
}

session_start();

if (!isset($_SESSION["fullRequest"]))
{
	$_SESSION["fullRequest"] = 0;
}

$_SESSION["doNum"] = false;

$resultFormats[] = "";
$i = 0;
$itag = $quality = "";

foreach ($fetchArray as $format)
{
	parse_str($format);
	parse_str(urldecode($url));
	$type = explode(';', $type);
	$resultFormats[$i] = array("itag" => $itag, "quality" => $quality, "size" => formatBytes(get_size($url)), "type" => $type[0], "url" => urldecode($url));
	
	$i++;
}

$youtubeJsonData["videoData"] = $resultFormats;

echo json_encode($youtubeJsonData);

function formatBytes($bytes, $precision = 2)
{
    $units = array('B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'); 
    $bytes = max($bytes, 0); 
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024)); 
    $pow = min($pow, count($units) - 1); 
    $bytes /= pow(1024, $pow);
	
    return round($bytes, $precision) . '' . $units[$pow];
} 
?>