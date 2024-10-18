<?php

namespace ProcessWire;

/**
 * @author Bernhard Baumrock, 27.08.2024
 * @license Licensed under MIT
 * @link https://www.baumrock.com
 */
class RockJavaScriptHooks extends WireData implements Module
{
  public function init()
  {
    $config = wire()->config;
    if ($config->ajax) return;
    if ($config->external) return;
    wire()->config->scripts->add($config->urls($this) . 'Hooks.js');
    if (is_file($config->paths->templates . 'admin.js')) {
      wire()->config->scripts->add($config->urls->templates . 'admin.js');
    }
  }
}
