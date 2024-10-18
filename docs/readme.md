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

## WHY? (+ Real World Example)

You might ask yourself why you would want to use hooks in JavaScript when you can just use event listeners. Well, hooks have a few advantages:

1. They are usually easier to read and understand (especially when you are familiar with PHP hooks).
2. They are easier to add for the developer (just prefix any method with `___`).
3. They are more powerful and flexible.

Take this real life example from the RockCommerce module, where we show an alert when the user has selected too many product variation options:

```js
handleOptionClick(el) {
  if(this.maxOptionsReached) this.maxOptionsAlert();
  else this.selectOption(el);
}
maxOptionsAlert() {
  alert("Maximum number of selectable options reached");
}
```

Now what if you wanted to make that ugly alert() customisable for the developer developing the webshop? Using event listeners this would be quite hard to do. Hooks make this easy, just rename `maxOptionsAlert` to `___maxOptionsAlert` and now the developer can override what's happening in that method with a BEFORE hook:

```js
ProcessWire.addHookBefore("RcVariationOption::maxOptionsAlert", (event) => {
  // show UIkit modal alert instead of plain alert
  UIkit.modal.alert("Maximale Anzahl an auswählbaren Optionen erreicht");
  // stop execution of the original method (do not show the alert again)
  event.replace = true;
});
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
