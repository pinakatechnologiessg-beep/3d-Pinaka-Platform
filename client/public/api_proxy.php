<?php
// A robust PHP proxy for Hostinger to bypass SNI/CORS issues for API calls
$backend_base = 'https://mediumaquamarine-goshawk-463282.hostingersite.com/api';

$request_uri = $_SERVER['REQUEST_URI'];
// Remove /api from the beginning of the URI
$path_and_query = preg_replace('/^\/api/', '', $request_uri);
$target_url = $backend_base . $path_and_query;

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $target_url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// Forward headers
$curl_headers = [];
foreach ($headers as $key => $value) {
    // Skip headers that shouldn't be forwarded to avoid Hostinger proxy conflicts
    $lower_key = strtolower($key);
    if ($lower_key == 'host' || $lower_key == 'content-length' || $lower_key == 'accept-encoding') {
        continue;
    }
    $curl_headers[] = "$key: $value";
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $curl_headers);

// Forward body for POST/PUT
if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
    $input = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
}

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

curl_close($ch);

http_response_code($http_code);
if ($content_type) {
    header("Content-Type: $content_type");
}

echo $response;
?>
