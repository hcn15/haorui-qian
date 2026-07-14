$files = @(
    'chanpin1-cp1.html',
    'chanpin1-cp1-en.html'
)

foreach ($file in $files) {
    $content = Get-Content $file -Encoding Default
    $content | Set-Content $file -Encoding UTF8
    Write-Host "Fixed encoding for: $file"
}