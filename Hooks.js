// create global ProcessWire object if it doesn't exist
if (typeof ProcessWire == "undefined") ProcessWire = {};

(() => {
  // Initialize hooks object to store before and after hooks
  ProcessWire.hooks = {
    after: {},
    before: {},
  };

  class ProcessWireHooks {}

  // HookEvent class to use in hooks
  // eg event.arguments() or event.return
  class HookEvent {
    constructor(args, data, object) {
      this.object = object;
      this.args = args;
      this.replace = false;
      this.return = data;
    }

    arguments(index, value) {
      if (value === undefined) {
        if (index === undefined) return this.args;
        return this.args[index];
      }
      this.args[index] = value;
    }
  }

  // Hook class to create hook objects with name, function, and priority
  class Hook {
    constructor(name, fn, priority = 100) {
      this.name = name;
      this.fn = fn;
      this.priority = priority;
    }
  }

  // Function to add an after hook for a given event name
  ProcessWire.addHookAfter = function (name, fn, priority = 100) {
    let hooks = ProcessWire.hooks.after[name] || [];
    hooks.push(new Hook(name, fn, priority));
    hooks.sort((a, b) => a.priority - b.priority);
    ProcessWire.hooks.after[name] = hooks;
  };

  // Function to add a before hook for a given event name
  ProcessWire.addHookBefore = function (name, fn, priority = 100) {
    let hooks = ProcessWire.hooks.before[name] || [];
    hooks.push(new Hook(name, fn, priority, "before"));
    hooks.sort((a, b) => a.priority - b.priority);
    ProcessWire.hooks.before[name] = hooks;
  };

  // Add this helper function to execute hooks
  ProcessWire.executeHooks = function (type, hookName, hookEvent) {
    const hooks = ProcessWire.hooks[type][hookName] || [];
    for (let hook of hooks) {
      try {
        hook.fn(hookEvent);
        if (hookEvent.replace && type === "before") break;
      } catch (error) {
        console.error(`Error in ${type} hook for ${hookName}:`, error);
        console.log("Hook:", hook);
        console.log("HookEvent:", hookEvent);
      }
    }
  };

  // wire() method to apply HookHandler to an object
  // this is all we need to make any object hookable :)
  ProcessWire.wire = function (object, name = null) {
    // if no name is provided check if we can get it from the object
    if (!name) name = object.constructor.name;

    // if the object is not a class it will have name "Object"
    // in that case we throw an error so that the developer provides a name
    // that we can use for the hook identifier like "Foo::hello" or otherwise
    // all generic objects would have the same hook name "Object::hello"
    if (name === "Object") {
      throw new Error(
        "Please provide a name in ProcessWire.wire(object, name)"
      );
    }

    let props = Object.getOwnPropertyDescriptors(object);
    for (let key in props) {
      if (!key.startsWith("___")) continue;

      const originalMethod = props[key].value;
      if (typeof originalMethod !== "function") continue;

      let newKey = key.slice(3);
      const hookName = `${name}::${newKey}`;

      props[newKey] = {
        value: function (...args) {
          // Create hookEvent object using HookEvent class
          const hookEvent = new HookEvent(args, undefined, this);

          // Execute before hooks
          ProcessWire.executeHooks("before", hookName, hookEvent);

          // if event.replace is true we do not call the original method
          if (hookEvent.replace) return hookEvent.return;

          // Call the original method
          hookEvent.return = originalMethod.apply(this, hookEvent.arguments());

          // Execute after hooks
          ProcessWire.executeHooks("after", hookName, hookEvent);

          return hookEvent.return;
        },
      };
    }

    return Object.create(Object.getPrototypeOf(object), props);
  };
})();
