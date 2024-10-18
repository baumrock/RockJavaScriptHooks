# Hooks.js

The Hooks.js file adds the ability to hook into methods and functions just like in PHP.

The Hooks.js file can be loaded both in the backend and in the frontend of your site! To make loading the global ProcessWire object as efficient as possible, it is split up into several components, like this one.

## File structure

The file is structured as follows:

```js
// create global ProcessWire object if it doesn't exist
if (typeof ProcessWire == "undefined") ProcessWire = {};

// function for custom scope to not pollute global namespace
(() => {
  // ##### Public ProcessWire API #####
  ProcessWire.addHookAfter = addHookAfter;
  ProcessWire.addHookBefore = addHookBefore;
  ProcessWire.wire = wire;

  // ##### Internal code to support hooks #####

  // hooks storage
  const hooks = { ... };

  // HookEvent class to use in hooks
  // eg event.arguments() or event.return
  class HookEvent { ... }

  // addHookAfter
  function addHookAfter(name, fn, priority = 100) { ... }

  // addHookBefore
  function addHookBefore(name, fn, priority = 100) { ... }

  // executeHooks
  // this executes all attached before and after hooks
  function executeHooks(type, hookName, hookEvent) { ... }

  // wire() method to apply HookHandler to an object
  // this is all we need to make any object hookable :)
  function wire(object, name = null) { ... }
})();
```

## Explanation

If the Hooks.js file is loaded on the frontend, the `ProcessWire` object will not be available. In this case it will create an empty object on the fly, which will then be enriched with some hook-related methods.

Next, we add an auto-executed function. All code inside this function has its own scope, so it doesn't pollute the global namespace. Only some of the features are exposed globally via the `ProcessWire` object:

- `ProcessWire.addHookAfter()`
- `ProcessWire.addHookBefore()`
- `ProcessWire.wire()`

Next, we define the `hooks` object, which will store all hooks. This is the object that users can add hooks to via `ProcessWire.addHookAfter()` and `ProcessWire.addHookBefore()`.

Then we define the `HookEvent` class that will be available in every hook via the `event` parameter as you know it from ProcessWire's core. This class basically only adds the event.arguments(...) syntax to make JS hooks match PHP hooks as much as possible.

After that, we implement the `addHookAfter()` and `addHookBefore()` methods that users can use to add hooks and we implement the `executeHooks()` method, which will execute any attached hooks whenever a hookable method is called.

Finally, the `wire()` method is used to make any object hookable. It takes an object and a name (optional) and returns an object with the same methods as the original object, but with added hooking functionality.
