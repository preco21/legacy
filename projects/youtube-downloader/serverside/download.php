<?php
include_once("curl.php");

if (empty($_GET["mime"]) || empty($_GET["url"]) || empty($_GET["title"]))
{
	exit("잘못된 URL 접근입니다");
}

$url  = base64_decode(filter_var($_GET["url"]));
$mime = filter_var($_GET["mime"]);
$ext  = str_replace(array("/", "x-"), "", strstr($mime, "/"));
$name = urldecode($_GET["title"]). "." .$ext;

if ($url)
{
	$size = get_size($url);
	
	if (is_ie())
	{
		header('Pragma: public');
		header('Expires: 0');
		header('Content-Type: "' . $mime . '"');
		header('Content-Disposition: attachment; filename="' . convertCharset($name) . '"');
		header('Content-Length: ' . $size);
		header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
		header("Content-Transfer-Encoding: binary");
	}
	else
	{
		header('Pragma: no-cache');
		header('Content-Type: "' . $mime . '"');
		header('Content-Disposition: attachment; filename="' . $name . '"');
		header("Content-Transfer-Encoding: binary");
		header('Expires: 0');
		header('Content-Length: '.$size);
	}

	ob_clean();
	flush();
	readfile($url);
	
	exit();
}
else
	exit("파일을 찾지 못하였습니다");

function is_ie()
{
	return isset($_SERVER['HTTP_USER_AGENT']) && (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') || strpos($_SERVER['HTTP_USER_AGENT'], "rv:11"));
}

function convertCharset($string)
{
	return iconv("UTF-8","CP949//TRANSLIT", $string);
}
?>