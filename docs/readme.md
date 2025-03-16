# RockJavaScriptHooks

This module brings the power of Hooks to JavaScript! The syntax for adding hooks is the same as in PHP, which will make it feel very familiar to everybody who has worked with ProcessWire before.

## Quickstart Example

```js
const hello = ProcessWire.wire({
  ___greet() {
    return "hello world";
  }
}, "HelloWorld");

// attach a hook
ProcessWire.addHookAfter("HelloWorld::greet", (event) => {
  event.return = "hello universe";
});

// outputs "hello universe"
console.log(hello.greet());
```

## WHY + Example

You might ask yourself why you would want to use hooks in JavaScript when you can just use event listeners. Well, hooks have a few advantages:

1. They are usually easier to read and understand (especially when you are familiar with PHP hooks).
2. They are easier to add for the developer (just prefix any method with `___`).
3. They are more powerful and flexible.

Take this simple example:

```js
const Product = {
  addToCart(item) {
    alert('Item has been added to cart: ' + item);
  }
}
Product.addToCart('Foo Product');
```

The Product object can easily be used to add products to the cart, great. But what if you want to make that configurable? What if someone wants to use your Product object but wants to show a UIkit alert instead of the plain JavaScript alert?

How would you do that with event listeners? It would be possible, but not easy.

Using hooks, you can easily achieve this, because we can not only listen to the event, but also modify or replace it using addHookBefore:

```js
ProcessWire.addHookBefore("Product::addToCart", (event) => {
  // show UIkit modal alert instead of plain alert
  UIkit.modal.alert("Item has been added to cart: " + event.arguments(0));
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
