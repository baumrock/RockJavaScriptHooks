# RockJavaScriptHooks (EXPERIMENTAL)

# !!! PLEASE USE THIS MODULE ONLY FOR TESTING AT THE MOMENT - API CHANGES ARE ALREADY ON THE DEV BRANCH AND MORE WILL COME !!!

## I guess I'll have something usable in 11/2024 😎

## Overview

RockJavaScriptHooks is a module that allows you to add hooks to your JavaScript code. Hooks are functions that can be executed before or after certain events, allowing you to modify the behavior of your code without changing the original implementation.

## Quickstart

ProcessWire hooks are usable in the ProcessWire admin interface. You can attach hooks from any loaded JS file.

Let's assume a module developer has added the following hookable function in his module:

```javascript
ProcessWire.hookable("HelloWorld::greeting", {
  message: 'Hello World',
});
```

You could then add a file `/site/templates/admin.js` and load it in `admin.php`:

```php
$config->scripts->add('/site/templates/admin.js');
```

In admin.js you could add a hook like this:

```javascript
// make sure this file is loaded
console.log("admin.js loaded");

// add a hook
ProcessWire.addHookAfter("HelloWorld::greeting", (event) => {
  let data = event.return;
  data.message = "Hello Universe";
  event.return = data;
});
```

You can also use a short version:

```javascript
ProcessWire.addHookAfter("HelloWorld::greeting", (event) => {
  event.return = { message: "Hello Universe" };
});
```

If you are unsure what the event object will look like, you can always log it to the console:

```javascript
ProcessWire.addHookAfter("RockDaterangePicker::locale", (event) => {
  console.log(event);
});
```

In this example we see the HookEvent of the RockDaterangePicker and we see that the return value is the settings object. We could easily add our own settings and modify the return value here.

<img src=https://i.imgur.com/1SFQhic.png class=blur>

## Example Use Case

An example use case is the RockCalendar module. It has a hookable function to get the locale settings for the daterange picker. This makes it easy to override the default settings:

```js
ProcessWire.addHookAfter("RockDaterangePicker::locale", (event) => {
  event.return = {
    ...event.return,
    applyLabel: "Anwenden",
    cancelLabel: "Abbrechen",
    fromLabel: "Von",
    toLabel: "Bis",
    customRangeLabel: "Benutzerdefiniert",
    weekLabel: "W",
    daysOfWeek: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    monthNames: [
      "Jänner",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ],
  };
});
```

Note that by using the spread operator `...` we don't overwrite the original settings but only add or modify the ones we want to change.

## Developer Information

To make certain functions hookable, just wrap them in the `ProcessWire.hookable` function and give them a unique name:

```javascript
ProcessWire.hookable("HelloWorld::greeting", {
  message: 'Hello World',
});
```

## Hook Priority

Hooks are executed in the order they were added, but you can change this by using the `priority` parameter. The higher the priority, the later the hook will be executed (default priority is 100).

```javascript
$(document).ready(() => {
  ProcessWire.addHookAfter(
    "test",
    (event) => {
      event.return.foo = "baz";
    },
    30
  );
  ProcessWire.addHookAfter(
    "test",
    (event) => {
      event.return.foo = "foo";
    },
    10
  );
  ProcessWire.addHookAfter(
    "test",
    (event) => {
      event.return.foo = "bar";
    },
    20
  );

  let demo = ProcessWire.hookable("test", { foo: "xxx" });

  console.log(demo);
});
```

In this example the hook with priority 30 will be added first but will be executed last, so the output will be `{ foo: 'baz' }`.
