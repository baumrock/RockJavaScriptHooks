# RockJavaScriptHooks

This module brings the power of Hooks to JavaScript! The syntax for adding hooks is the same as in PHP, which will make it feel very familiar to everybody who has worked with ProcessWire before:

```js
class HelloWorld {
  ___greet() {
    return "hello world";
  }
}

// create new instance
const hello = ProcessWire.wire(new HelloWorld());

// attach a hook
ProcessWire.addHookAfter("HelloWorld::greet", (event) => {
  event.return = "hello universe";
});

// outputs "hello universe"
console.log(hello.greet());
```

## Loading the JS file

### Backend

In the ProcessWire backend, hooks will automatically be added to the `ProcessWire` JavaScript object. The necessary JavaScript file will automatically be loaded.

### Frontend

Should you need the hook functionality on the frontend of your site (because hooks are great, right? ;)), you have to manually load the following file:

```
/site/modules/RockJavaScriptHooks/Hooks.js
```

## Usage

Consider the following example:

```js
// define class
class HelloWorld {
  greet() {
    return "hello world";
  }
}

// create new instance
const hello = new HelloWorld();

// outputs "hello world"
console.log(hello.greet());
```

Once the Hooks.js file is loaded, you can turn any JavaScript class into a hookable class like this:

```js
// create new instance
const notHookable = new HelloWorld();

// wire it, so we can use hooks
const hookable = ProcessWire.wire(notHookable);

// attach a hook
ProcessWire.addHookAfter('HelloWorld::greet')

// outputs "hello universe"
console.log(hookable.greet());
```
