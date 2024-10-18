# RockJavaScriptHooks

This module brings the power of Hooks to JavaScript! The syntax for adding hooks is the same as in PHP, which will make it feel very familiar to everybody who has worked with ProcessWire before.

## Quickstart Example

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

In the ProcessWire backend, hook features will automatically be added to the `ProcessWire` JavaScript object. The necessary JavaScript file will automatically be loaded.

Additionally the module will load the file `/site/templates/admin.js` that you can use to add hooks to the ProcessWire backend.

Try it out and copy the example above into your `admin.js` file!

### Frontend

Should you need the hook functionality on the frontend of your site (because hooks are great, right? ;)), you have to manually load the following file:

```
/site/modules/RockJavaScriptHooks/Hooks.js
```

## Usage

### Plain Objects

At the very least you can provide a plain object to the `ProcessWire.wire()` method to make it hookable. The only thing to mention is that as plain objects have no classname, you need to specify a unique name for your hookable methods:

```js
const hello = ProcessWire.wire({
  ___greet() {
    return "hello world";
  }
}, "HelloWorld");
```

In this example, we could hook before or after the `HelloWorld::greet` method:

```js
ProcessWire.addHookAfter("HelloWorld::greet", (event) => {
  // replace hello world with hello universe
  event.return = "hello universe";
});

// outputs "hello universe"
console.log(hello.greet());
```

### Classes

When using classes, you don't even need to specify a name as it will be detected automatically:

```js
class HelloWorld {
  ___greet() {
    return "hello world";
  }
}
const hello = ProcessWire.wire(new HelloWorld());
// rest is the same as with plain objects
```
