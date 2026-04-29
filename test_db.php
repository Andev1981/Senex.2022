<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=senex', 'root', '');
    echo "OK\n";
} catch (PDOException $e) {
    echo $e->getMessage() . "\n";
}
