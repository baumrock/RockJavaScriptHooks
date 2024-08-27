# RockJavaScriptHooks

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
