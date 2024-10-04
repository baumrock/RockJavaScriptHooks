class HelloWorld {
  ___greet(salut = "hello", what = "world") {
    return `${salut} ${what}`;
  }
}

const helloWorld = ProcessWire.wire(new HelloWorld());

// shows hello world
console.log(helloWorld.greet());

// shows hi there
console.log(helloWorld.greet("hi", "there"));

// add BEFORE hook
ProcessWire.addHookBefore("HelloWorld::greet", (event) => {
  event.arguments(0, "hallo");
  event.arguments(1, "welt");
});

// shows hallo welt
console.log(helloWorld.greet());

// shows hallo welt
console.log(helloWorld.greet("servas", "oida"));

// add AFTER hook
ProcessWire.addHookAfter("HelloWorld::greet", (event) => {
  // shows ['hallo', 'welt']
  console.log(event.arguments());
  event.return = "hi universe";
});

// shows hi universe
console.log(helloWorld.greet());

console.log("----------- hook priority -----------");

class PrioDemo {
  ___greet() {
    return "hello world";
  }
}

const prio = ProcessWire.wire(new PrioDemo());

ProcessWire.addHookAfter(
  "PrioDemo::greet",
  () => {
    console.log("second");
  },
  20
);
ProcessWire.addHookAfter(
  "PrioDemo::greet",
  () => {
    console.log("first");
  },
  10
);
ProcessWire.addHookAfter(
  "PrioDemo::greet",
  () => {
    console.log("third");
  },
  30
);

// shows
// first
// second
// third
// hello world
console.log(prio.greet());
