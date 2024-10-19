# Hook Priority

Just like in PHP, you can specify a priority when adding a hook. The priority is an integer, where a lower value means the hook is executed earlier.

```js
// Create a new instance
const greeter = ProcessWire.wire({
  ___greet() {
    // return an object to show that you
    // can not only return strings ;)
    return { message: "Hello" };
  },
}, "Greeter");

// Add hooks with different priorities
ProcessWire.addHookAfter("Greeter::greet", (event) => {
  event.return.message += " one";
}, 30);

ProcessWire.addHookAfter("Greeter::greet", (event) => {
  event.return.message += " two";
}, 10);

ProcessWire.addHookAfter("Greeter::greet", (event) => {
  event.return.message += " three";
}, 20);

// Output the result
console.log(greeter.greet().message);
// Outputs: "Hello two three one"
```

In this example, the hooks are not executed in the order of definition but by their priority (lower numbers first).

