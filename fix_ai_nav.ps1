$content = Get-Content 'chanpin1-ai.html' -Raw

$content = $content -replace '(?s)<div class="mobile-nav-overlay" id="mobileNavOverlay"></div>\s*<div class="mobile-nav-drawer" id="mobileNavDrawer">.*?</div>\s*<div class="mobile-nav-overlay" id="mobileNavOverlay"></div>\s*<div class="mobile-nav-drawer" id="mobileNavDrawer">', '<div class="mobile-nav-overlay" id="mobileNavOverlay"></div><div class="mobile-nav-drawer" id="mobileNavDrawer">'

Set-Content 'chanpin1-ai.html' $content