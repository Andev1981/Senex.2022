<?php
require __DIR__ . '/vendor/autoload.php';
use sasco\LibreDTE\Sii\Folios;

try {
    echo "Attempting to create Folios with junk string...\n";
    $f = new Folios('junk');
    echo "Success with junk string.\n";
} catch (\Throwable $e) {
    echo "Failed with junk string: " . $e->getMessage() . "\n";
}

try {
    echo "Attempting to create Folios with null...\n";
    // @phpstan-ignore-next-line
    $f = new Folios(null);
    echo "Success with null.\n";
} catch (\Throwable $e) {
    echo "Failed with null: " . $e->getMessage() . "\n";
}

try {
    // Minimal valid-ish XML?
    $xml = '<?xml version="1.0"?><AUTORIZACION><CAF version="1.0"><DA><RE>1-9</RE><RS>TEST</RS><TD>39</TD><RNG><D>1</D><H>100</H></RNG><FA>2020-01-01</FA><RSAPK><M>0</M><E>0</E></RSAPK><IDK>0</IDK></DA><FRMA algoritmo="SHA1withRSA">xxx</FRMA></CAF></AUTORIZACION>';
    echo "Attempting to create Folios with fake XML...\n";
    $f = new Folios($xml);
    echo "Success with fake XML.\n";
} catch (\Throwable $e) {
    echo "Failed with fake XML: " . $e->getMessage() . "\n";
}
