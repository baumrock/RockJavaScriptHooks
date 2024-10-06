<?php

namespace ProcessWire;

/**
 * @author Bernhard Baumrock, 27.08.2024
 * @license Licensed under MIT
 * @link https://www.baumrock.com
 */
class RockJavaScriptHooks extends WireData implements Module
{

  public static function getModuleInfo()
  {
    return [
      'title' => 'RockJavaScriptHooks',
      'version' => '0.0.1',
      'summary' => 'Adds hooks for ProcessWire JavaScript',
      // changing this will break it
      'autoload' => 'template=admin',
      'singular' => true,
      'icon' => 'anchor',
    ];
  }

  public function init()
  {
    $config = wire()->config;
    if ($config->ajax) return;
    if ($config->external) return;
    wire()->config->scripts->add($config->urls($this) . 'Hooks.js');
    wire()->config->scripts->add($config->urls->templates . 'admin.js');
  }
}
