// create global ProcessWire object if it doesn't exist
if (typeof ProcessWire == "undefined") ProcessWire = {};

(() => {
  // Initialize hooks object to store before and after hooks
  ProcessWire.hooks = {
    after: {},
    before: {},
  };

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

  // HookHandler is a Proxy that intercepts every method call
  // and delegates it to the corresponding hookable method, if it
  // exists. For example calling .foo() will delegate to ___foo()
  const HookHandler = {
    get: function (target, prop) {
      if (typeof prop !== "string") return target[prop];

      // build hook selector
      const selector = `${target.constructor.name}::${prop}`;
      // console.log(selector);

      // if prop starts with ___ we return the original value
      if (prop.startsWith("___")) return target[prop];

      // if ___prop is not defined we return the original value
      if (typeof target[`___${prop}`] === "undefined") return target[prop];

      // if prop does not start with ___ we return a function that executes
      // hooks and the original method
      return function (...args) {
        let replace = false;
        let result = null;
        let hookArgs = args;

        // execute before hooks
        const beforeHooks = ProcessWire.hooks.before[selector] || [];
        beforeHooks.forEach((hook) => {
          if (replace) return;
          const evt = new HookEvent(hookArgs, result);
          hook.fn(evt);
          hookArgs = evt.args;
          if (evt.replace) replace = true;
        });

        result = target[`___${prop}`].apply(this, hookArgs);
        if (replace) return result;

        // execute after hooks
        const afterHooks = ProcessWire.hooks.after[selector] || [];
        afterHooks.forEach((hook) => {
          const evt = new HookEvent(hookArgs, result);
          hook.fn(evt);
          hookArgs = evt.args;
          result = evt.return;
        });

        return result;
      };
    },
  };

  // wire() method to apply HookHandler to an object
  // this is all we need to make any object hookable :)
  ProcessWire.wire = function (object) {
    return new Proxy(object, HookHandler);
  };
})();
