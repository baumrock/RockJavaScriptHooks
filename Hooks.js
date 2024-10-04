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

  const HookHandler = {
    get: function (target, prop) {
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
        const beforeHooks =
          ProcessWire.hooks.before[`${target.constructor.name}::${prop}`] || [];
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
        const afterHooks =
          ProcessWire.hooks.after[`${target.constructor.name}::${prop}`] || [];
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

  ProcessWire.wire = function (object) {
    return new Proxy(object, HookHandler);
  };
})();

// class HelloWorld {
//   ___greet(salut = "hello", what = "world") {
//     return `${salut} ${what}`;
//   }
// }

// const helloWorld = ProcessWire.wire(new HelloWorld());

// // shows hello world
// console.log(helloWorld.greet());

// // shows hi there
// console.log(helloWorld.greet("hi", "there"));

// // add BEFORE hook
// ProcessWire.addHookBefore("HelloWorld::greet", (event) => {
//   event.arguments(0, "hallo");
//   event.arguments(1, "welt");
// });

// // shows hallo welt
// console.log(helloWorld.greet());

// // shows hallo welt
// console.log(helloWorld.greet("servas", "oida"));

// // add AFTER hook
// ProcessWire.addHookAfter("HelloWorld::greet", (event) => {
//   // shows ['hallo', 'welt']
//   console.log(event.arguments());
//   event.return = "hi universe";
// });

// // shows hi universe
// console.log(helloWorld.greet());

// console.log("----------- hook priority -----------");

// class PrioDemo {
//   ___greet() {
//     return "hello world";
//   }
// }

// const prio = ProcessWire.wire(new PrioDemo());

// ProcessWire.addHookAfter(
//   "PrioDemo::greet",
//   () => {
//     console.log("second");
//   },
//   20
// );
// ProcessWire.addHookAfter(
//   "PrioDemo::greet",
//   () => {
//     console.log("first");
//   },
//   10
// );
// ProcessWire.addHookAfter(
//   "PrioDemo::greet",
//   () => {
//     console.log("third");
//   },
//   30
// );

// // shows
// // first
// // second
// // third
// // hello world
// console.log(prio.greet());
