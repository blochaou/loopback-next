# @loopback/boot

A collection of Booters for LoopBack Applications

# Overview

A Booter is a Class that can be bound to an Application and is called
to perform a task before the Application is started. A Booter may have multiple
phases to complete its task.

An example task of a Booter may be to discover and bind all artifacts of a
given type.

BootComponent is responsible for handling Booter artifacts and running the
phases. It must be added to an `Application` to use `await app.booter()`
or `await app.boot()`.

## Installation

```shell
$ npm i @loopback/boot
```

## Basic Use

```ts
import {Application} from '@loopback/core';
import {ControllerBooter, BootComponent} from '@loopback/boot';
const app = new Application({components:[BootComponent]});
await app.booter(ControllerBooter); // register booter
await app.boot({
  projectRoot: __dirname,
  controllers: {
    dirs: ['controllers'],
    extensions: ['.controller.js'],
    nested: true
  }
}); // Booter gets run by the Application
```

## Available Booters

### ControllerBooter

#### Description
Discovers and binds Controller Classes using `app.controller()`.

#### Options
The Options for this can be passed via `BootOptions` when calling `app.boot(options:BootOptions)`.

The options for this are passed in a `controllers` object on `BootOptions`.

Available Options on the `controllers` object are as follows:

|Options|Type|Default|Description|
|-|-|-|-|
|`dirs`|`string | string[]`|`['controllers']`|Paths relative to projectRoot to look in for Controller artifacts|
|`extensions`|`string | string[]`|`['.controller.js']`|File extensions to match for Controller artifacts|
|`nested`|`boolean`|`true`|Look in nested directories in `dirs` for Controller artifacts|

#### Examples
**Via BootOptions**
```ts
new Application({components: [BootComponent]});
app.boot({
  boot: {
    projectRoot: '',
    controllers: {...}
  }
});
```

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing#guidelines)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
