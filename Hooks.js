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
  const hooks = {
    after: {},
    before: {},
  };

  // HookEvent class to use in hooks
  // eg event.arguments() or event.return
  class HookEvent {
    constructor(data) {
      this.object = data.object;
      this._arguments = data.arguments;
      this.replace = false;
      this.return = data.return;
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

  // addHookAfter
  function addHookAfter(name, fn, priority = 100) {
    const _hooks = hooks.after[name] || [];
    _hooks.push(new Hook(name, fn, priority));
    _hooks.sort((a, b) => a.priority - b.priority);
    hooks.after[name] = _hooks;
  }

  // addHookBefore
  function addHookBefore(name, fn, priority = 100) {
    const _hooks = hooks.before[name] || [];
    _hooks.push(new Hook(name, fn, priority));
    _hooks.sort((a, b) => a.priority - b.priority);
    hooks.before[name] = _hooks;
  }

  // executeHooks
  // this executes all attached before and after hooks
  function executeHooks(type, hookName, hookEvent) {
    const _hooks = hooks[type][hookName] || [];
    for (let i = 0; i < _hooks.length; i++) {
      try {
        // get the hook and execute its "fn" callback
        // send the hookEvent to this callback to support our familiar syntax:
        // addHookAfter('...', function(event) { ... });
        _hooks[i].fn(hookEvent);

        // if the callback has set replace to true we stop here
        // as far as I know only before hooks can replace following hooks
        // so we do this only for before hooks
        if (hookEvent.replace && type === "before") break;
      } catch (error) {
        console.error(`Error in ${type} hook for ${hookName}:`, error);
        console.log("Hook:", _hooks[i]);
        console.log("HookEvent:", hookEvent);
      }
    }
  }

  // wire() method to apply HookHandler to an object
  // this is all we need to make any object hookable :)
  function wire(object, name = null) {
    // if no name is provided check if we can get it from the object
    if (!name) name = object.constructor.name;

    // if the object is not a class it will have name "Object"
    // in that case we throw an error so that the developer provides a name
    // that we can use for the hook identifier like "Foo::hello" or otherwise
    // all generic objects would have the same hook name "Object::hello"
    if (name === "Object") {
      throw new Error("Please provide a name: ProcessWire.wire(object, name)");
    }

    // loop all properties of the object
    // and add corresponding methods instead of methods with ___ prefix
    let props = Object.getOwnPropertyDescriptors(object);
    for (let key in props) {
      // non prefixed props stay untouched
      if (!key.startsWith("___")) continue;

      // get the original method
      // we only support hookable methods at this point, no properties
      const originalMethod = props[key].value;
      if (typeof originalMethod !== "function") continue;

      // generate new method name, eg MyClass::myMethod
      let newMethod = key.slice(3);
      const hookName = `${name}::${newMethod}`;

      // add the new method to the object
      props[newMethod] = {
        value: function (...args) {
          // Create hookEvent object using HookEvent class
          const hookEvent = new HookEvent({
            arguments: args,
            object: this,
          });

          // Execute before hooks
          executeHooks("before", hookName, hookEvent);

          // if event.replace is true we do not call the original method
          if (hookEvent.replace) return hookEvent.return;

          // Call the original method
          hookEvent.return = originalMethod.apply(this, hookEvent.arguments());

          // Execute after hooks
          executeHooks("after", hookName, hookEvent);

          return hookEvent.return;
        },
      };
    }

    return Object.create(Object.getPrototypeOf(object), props);
  }
})();
