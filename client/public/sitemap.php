<?php
header('Content-Type: application/xml; charset=utf-8');
$sitemap_url = 'https://mediumaquamarine-goshawk-463282.hostingersite.com/sitemap.xml';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $sitemap_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Prevent SSL issues on internal shared hosting requests
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

$xml = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200 && $xml) {
    echo $xml;
} else {
    http_response_code(500);
    echo '<?xml version="1.0" encoding="UTF-8"?><error>Failed to fetch sitemap. HTTP Code: ' . $httpCode . '</error>';
}
?>
