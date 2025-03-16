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
    $this->dev();
  }

  public function ready(): void
  {
    $config = wire()->config;
    if ($config->ajax) return;
    if ($config->external) return;
    if (wire()->page->template != 'admin') return;
    wire()->config->scripts->add($config->urls($this) . 'dst/Hooks.min.js');
  }

  private function dev(): void
  {
    $config = wire()->config;
    if ($config->ajax) return;
    if ($config->external) return;
    if (!$config->debug) return;
    if (!$config->rockdevtools) return;
    if (!wire()->modules->isInstalled('RockDevTools')) return;
    $tools = rockdevtools();
    $tools
      ->assets()
      ->js()
      ->add(__DIR__ . '/src/*.js')
      ->save(__DIR__ . '/dst/Hooks.min.js');
  }
}
