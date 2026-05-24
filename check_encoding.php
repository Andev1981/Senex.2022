<?php
function checkEncoding($file) {
    $content = file_get_contents($file);
    $isUtf8 = mb_check_encoding($content, 'UTF-8');
    echo "File: $file\n";
    echo "Is UTF-8: " . ($isUtf8 ? "YES" : "NO") . "\n";
    
    // Check for BOM
    if (substr($content, 0, 3) == pack("CCC", 0xef, 0xbb, 0xbf)) {
        echo "BOM detected: YES\n";
    } else {
        echo "BOM detected: NO\n";
    }
    echo "-------------------\n";
}

checkEncoding('app/Http/Controllers/KineMobile/SessionMobileController.php');
checkEncoding('app/Services/Treatments/TreatmentSessionService.php');
checkEncoding('resources/js/pages/kine-mobile/session-form.jsx');
