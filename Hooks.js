// create global ProcessWire object if it doesn't exist
if (typeof ProcessWire == "undefined") ProcessWire = {};

(() => {
  // Initialize hooks object to store before and after hooks
  ProcessWire.hooks = {
    after: {},
    before: {},
  };

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
