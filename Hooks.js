(() => {
  // Initialize hooks object to store before and after hooks
  ProcessWire.hooks = {
    after: {},
    before: {},
  };

  // Hook class to create hook objects with name, function, and priority
  class Hook {
    constructor(name, fn, priority = 100) {
      this.name = name;
      this.fn = fn;
      this.priority = priority;
    }
  }

  // HookEvent class to create event objects with name and data
  class HookEventOld {
    constructor(name, data, context) {
      this.name = name;
      this.replace = false;
      this.return = data;
      this.context = context;
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

  // Function to execute hooks for a given event name and data
  ProcessWire.hookable = function (name, data, context) {
    let hooksBefore = ProcessWire.hooks.before[name] || [];
    let hooksAfter = ProcessWire.hooks.after[name] || [];
    let event = new HookEventOld(name, data, context);

    // Execute before hooks
    hooksBefore.forEach((hook) => {
      // if previous hook has replace = true skip this one
      if (event.replace) return;
      hook.fn(event, context);
    });

    // If event has replace = true, return the new data
    if (event.replace) return event.return;

    // Execute after hooks
    hooksAfter.forEach((hook) => {
      hook.fn(event, context);
    });

    // Return the final event data
    return event.return;
  };

  /** ##### new version ##### */

  class HookEvent {
    constructor(args, data) {
      this.arguments = args;
      this.replace = false;
      this.return = data;
    }
  }

  const HookHandler = {
    get: function (target, prop) {
      // if prop starts with ___ we return the original value
      if (prop.startsWith("___")) return target[prop];

      // if prop does not start with ___ we return a function that executes
      // hooks and the original method
      return function (...args) {
        let replace = false;
        let result = null;

        // execute before hooks
        const beforeHooks =
          ProcessWire.hooks.before[`${target.constructor.name}::${prop}`] || [];
        beforeHooks.forEach((hook) => {
          if (replace) return;
          const evt = new HookEvent(args, result);
          hook.fn(evt);
          if (evt.replace) {
            replace = true;
            result = evt.return;
          }
        });

        if (replace) return result;

        result = target[`___${prop}`].apply(this, args);

        // execute after hooks
        const afterHooks =
          ProcessWire.hooks.after[`${target.constructor.name}::${prop}`] || [];
        afterHooks.forEach((hook) => {
          const evt = new HookEvent(args, result);
          hook.fn(evt);
          result = evt.return;
        });

        return result;
      };
    },
  };

  ProcessWire.proxy = function (object) {
    return new Proxy(object, HookHandler);
  };
})();

// var hooktest = new HookTest();

// var hooktestProxy = new Proxy(hooktest, HookHandler);

// console.log(hooktestProxy.foo());
// console.log(hooktestProxy.bar());

// ProcessWire.magic(
//   {
//     foo: "foo world!",
//     ___hello: () => {
//       return "hello world!";
//     },
//   },
//   "HelloWorld"
// );

// ProcessWire.addHookAfter("HelloWorld::hello", (e) => {
//   e.return = "hello universe";
// });

// ProcessWire.addHookAfter("HelloWorld::foo", (e) => {
//   e.return = "foo universe!";
// });
