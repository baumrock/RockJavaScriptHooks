<?php

$info = array(
  'title' => 'RockJavaScriptHooks',
  'version' => json_decode(file_get_contents(__DIR__ . '/package.json'))->version,
  'summary' => 'Adds hooks for ProcessWire JavaScript',
  // changing this will break it!
  'autoload' => 'template=admin',
  'singular' => true,
  'icon' => 'anchor',
);
