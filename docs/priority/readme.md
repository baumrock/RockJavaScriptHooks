# Hook Priority

Just like in PHP, you can specify a priority when adding a hook. The priority is an integer, where a lower value means the hook is executed earlier.

```js
class Greeter {
  ___greet() {
    // return an object to show that you
    // can not only return strings ;)
    return { message: "Hello" };
  }
}

// Create a new instance
const greeter = ProcessWire.wire(new Greeter());

// Add hooks with different priorities
ProcessWire.addHookAfter("Greeter::greet", (event) => {
  event.return.message += " universe";
}, 30);

ProcessWire.addHookAfter("Greeter::greet", (event) => {
  event.return.message += " beautiful";
}, 10);

ProcessWire.addHookAfter("Greeter::greet", (event) => {
  event.return.message += " world";
}, 20);

// Output the result
console.log(greeter.greet().message);
// Outputs: "Hello beautiful world universe"
```

In this example, the hooks are executed not in the order of definition but by their priority (lower numbers first).

Order of definition: "universe (30), beautiful (10), world (20)"

Result when logged: "beautiful (10), world (20), universe (30)", resulting in the final greeting "Hello beautiful world universe".
