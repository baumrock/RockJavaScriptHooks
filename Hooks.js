// create global ProcessWire object if it doesn't exist
if (typeof ProcessWire == "undefined") ProcessWire = {};

(() => {
  // create class for processwire hooks
  class ProcessWireHooks {
    static hooks = {
      after: {},
      before: {},
    };

    static executeHooks(type, hookName, hookEvent) {
      const hooks = ProcessWireHooks.hooks[type][hookName] || [];
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
    }
  }

  // HookEvent class to use in hooks
  // eg event.arguments() or event.return
  class HookEvent {
    constructor(args, data, object) {
      this.object = object;
      this._arguments = args;
      this.replace = false;
      this.return = data;
    }

    // dynamic arguments getter
    // this is to access hook arguments either via event.arguments
    // or event.arguments(0) or event.arguments(1) etc
    get arguments() {
      const self = this;
      return new Proxy(
        function () {
          // requested as property, eg event.arguments
          // return the arguments array
          if (arguments.length === 0) return self._arguments;

          // requested as method, eg event.arguments(0)
          // return the requested array element
          if (arguments.length === 1) return self._arguments[arguments[0]];

          // requested as method to set a value, eg event.arguments(0, "foo")
          // set the requested array element
          if (arguments.length === 2)
            self._arguments[arguments[0]] = arguments[1];
        },
        {
          get(target, prop) {
            if (prop === "length") return self._arguments.length;
            const index = parseInt(prop, 10);
            return isNaN(index) ? undefined : self._arguments[index];
          },
          set(target, prop, value) {
            const index = parseInt(prop, 10);
            if (!isNaN(index)) {
              self._arguments[index] = value;
              return true;
            }
            return false;
          },
        }
      );
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
    let hooks = ProcessWireHooks.hooks.after[name] || [];
    hooks.push(new Hook(name, fn, priority));
    hooks.sort((a, b) => a.priority - b.priority);
    ProcessWireHooks.hooks.after[name] = hooks;
  };

  // Function to add a before hook for a given event name
  ProcessWire.addHookBefore = function (name, fn, priority = 100) {
    let hooks = ProcessWireHooks.hooks.before[name] || [];
    hooks.push(new Hook(name, fn, priority, "before"));
    hooks.sort((a, b) => a.priority - b.priority);
    ProcessWireHooks.hooks.before[name] = hooks;
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
          ProcessWireHooks.executeHooks("before", hookName, hookEvent);

          // if event.replace is true we do not call the original method
          if (hookEvent.replace) return hookEvent.return;

          // Call the original method
          hookEvent.return = originalMethod.apply(this, hookEvent.arguments());

          // Execute after hooks
          ProcessWireHooks.executeHooks("after", hookName, hookEvent);

          return hookEvent.return;
        },
      };
    }

    return Object.create(Object.getPrototypeOf(object), props);
  };
})();
