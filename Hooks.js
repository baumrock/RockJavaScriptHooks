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
    get: function (data, prop) {
      const object = data.object;
      if (typeof prop !== "string") return object[prop];

      // build hook selector
      let hookObjectName = data.name;
      if (!hookObjectName) hookObjectName = object.constructor.name;
      const selector = `${hookObjectName}::${prop}`;
      // console.log(selector);

      // if prop starts with ___ we return the original value
      if (prop.startsWith("___")) return object[prop];

      // if ___prop is not defined we return the original value
      if (typeof object[`___${prop}`] === "undefined") return object[prop];

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

        result = object[`___${prop}`].apply(this, hookArgs);
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

  ProcessWire.wireNoProxy = function (comp, name) {
    // get all defined of provided alpine component
    let props = Object.getOwnPropertyDescriptors(comp);

    // loop over all props and check for hookable methods
    for (let key in props) {
      if (!key.startsWith("___")) continue;

      const val = props[key].value;
      if (!typeof val === "function") continue;

      // add new method without the ___ prefix
      let newKey = key.slice(3);

      // define the new method dynamically
      props[newKey] = {
        get() {
          return function (...args) {
            // build hook name
            const hookName = `${name}::${newKey}`;

            // build hookEvent
            const hookEvent = {
              object: this,
              replace: false,
              return: val,
              arguments: args,
            };

            // add hook to ProcessWire to make it hookable
            // this method call will return the initial value
            // of the non-hooked method, but before it does that
            // all beforeHooks are executed and after it does that
            // all afterHooks are executed.
            return ProcessWire.hook(hookName, hookEvent);
          };
        },
      };
    }

    // create the new object and return it
    // this is using the following alpinejs workaround for nextTick issue:
    // https://github.com/alpinejs/alpine/discussions/1940#discussioncomment-6586765
    return Object.create(Object.getPrototypeOf(comp), props);
  };

  ProcessWire.hook = function (name, hookEvent) {
    console.log("--- attach hook " + name + " ---");
    console.log("hookEvent", hookEvent);
    console.log("rctype", hookEvent.object.$rctype);
    console.log("--- end hook ---");
    return hookEvent.return;
  };

  // wire() method to apply HookHandler to an object
  // this is all we need to make any object hookable :)
  ProcessWire.wire = function (object, name = null, noProxy = false) {
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

    // If noProxy is set we use a different technique to add hooks to our
    // object. This is necessary for alpinejs, because the proxy would mess up
    // with alpine's internal proxy mechanism.
    if (noProxy) return this.wireNoProxy(object, name);

    // otherwise we create a proxy object that uses the HookHandler
    // to intercept method calls and execute hooks
    return new Proxy(
      {
        object: object,
        name: name,
      },
      HookHandler
    );
  };
})();
