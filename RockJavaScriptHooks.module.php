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
      'autoload' => 'template=admin',
      'singular' => true,
      'icon' => 'anchor',
    ];
  }

  public function init()
  {
    $url = $this->wire->config->urls($this);
    $this->wire->config->scripts->add($url . 'Hooks.js');
  }
}
