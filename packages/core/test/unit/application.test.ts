// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application, Server, Component, CoreBindings} from '../../index';
import {Context, Constructor, Binding, BindingScope} from '@loopback/context';
import {Booter, BootOptions} from '@loopback/boot';

describe('Application', () => {
  describe('controller binding', () => {
    let app: Application;
    class MyController {}

    beforeEach(givenApp);

    it('binds a controller', () => {
      const binding = app.controller(MyController);
      expect(Array.from(binding.tags)).to.containEql('controller');
      expect(binding.key).to.equal('controllers.MyController');
      expect(findKeysByTag(app, 'controller')).to.containEql(binding.key);
    });

    it('binds a controller with custom name', () => {
      const binding = app.controller(MyController, 'my-controller');
      expect(Array.from(binding.tags)).to.containEql('controller');
      expect(binding.key).to.equal('controllers.my-controller');
      expect(findKeysByTag(app, 'controller')).to.containEql(binding.key);
    });

    function givenApp() {
      app = new Application();
    }
  });

  describe('booter binding', () => {
    let app: Application;
    const bootOptions: BootOptions = {projectRoot: __dirname};

    beforeEach(givenApp);

    it('throws an error if .boot() is called without a BootStrapper bound', async () => {
      await expect(app.boot(bootOptions)).to.be.rejectedWith(
        `The key ${CoreBindings.BOOTCOMPONENT} was not bound to any value.`,
      );
    });

    it('throws an error if .booter() is called without a BootStrapper bound', async () => {
      await expect(app.booter(TestBooter)).to.be.rejectedWith(
        `The key ${CoreBindings.BOOTCOMPONENT} was not bound to any value.`,
      );
    });

    it('calls .boot() if a BootComponent is bound', async () => {
      app.component(FakeBootComponent, 'BootComponent');
      await app.boot(bootOptions);
      const bootComponent = await app.get(CoreBindings.BOOTCOMPONENT);
      expect(bootComponent.bootCalled).to.be.True();
    });

    it('calls .booter(cls) if a BootComponent is bound', async () => {
      app.component(FakeBootComponent, 'BootComponent');
      const binding = await app.booter(TestBooter);
      const bootComponent = await app.get(CoreBindings.BOOTCOMPONENT);

      expect(Array.from(binding.tags)).to.containEql('booter');
      expect(binding.key).to.equal('booters.TestBooter');
      expect(findKeysByTag(bootComponent, 'booter')).to.containEql(binding.key);
    });

    function givenApp() {
      app = new Application();
    }
  });

  describe('component binding', () => {
    let app: Application;
    class MyController {}
    class MyComponent implements Component {
      controllers = [MyController];
    }

    beforeEach(givenApp);

    it('binds a component', () => {
      app.component(MyComponent);
      expect(findKeysByTag(app, 'component')).to.containEql(
        'components.MyComponent',
      );
    });

    it('binds a component', () => {
      app.component(MyComponent, 'my-component');
      expect(findKeysByTag(app, 'component')).to.containEql(
        'components.my-component',
      );
    });

    function givenApp() {
      app = new Application();
    }
  });

  describe('server binding', () => {
    it('defaults to constructor name', async () => {
      const app = new Application();
      const binding = app.server(FakeServer);
      expect(Array.from(binding.tags)).to.containEql('server');
      const result = await app.getServer(FakeServer.name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });

    it('allows custom name', async () => {
      const app = new Application();
      const name = 'customName';
      app.server(FakeServer, name);
      const result = await app.getServer(name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });
  });

  describe('configuration', () => {
    it('allows servers to be provided via config', async () => {
      const name = 'abc123';
      const app = new Application({
        servers: {
          abc123: FakeServer,
        },
      });
      const result = await app.getServer(name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });

    describe('start', () => {
      it('starts all injected servers', async () => {
        const app = new Application({
          components: [FakeComponent],
        });

        await app.start();
        const server = await app.getServer(FakeServer);
        expect(server).to.not.be.null();
        expect(server.running).to.equal(true);
        await app.stop();
      });

      it('does not attempt to start poorly named bindings', async () => {
        const app = new Application({
          components: [FakeComponent],
        });

        // The app.start should not attempt to start this binding.
        app.bind('controllers.servers').to({});
        await app.start();
        await app.stop();
      });
    });
  });

  function findKeysByTag(ctx: Context, tag: string | RegExp) {
    return ctx.findByTag(tag).map(binding => binding.key);
  }
});

class FakeComponent implements Component {
  servers: {
    [name: string]: Constructor<Server>;
  };
  constructor() {
    this.servers = {
      FakeServer,
      FakeServer2: FakeServer,
    };
  }
}

class FakeBootComponent extends Context implements Component {
  bootCalled = false;

  constructor() {
    super();
  }

  async boot(options: BootOptions) {
    this.bootCalled = true;
  }

  booter(cls: Constructor<Booter>): Binding {
    return this.bind(`booters.${cls.name}`)
      .toClass(cls)
      .inScope(BindingScope.SINGLETON)
      .tag('booter');
  }
}

class FakeServer extends Context implements Server {
  running: boolean = false;
  constructor() {
    super();
  }
  async start(): Promise<void> {
    this.running = true;
  }

  async stop(): Promise<void> {
    this.running = false;
  }
}

class TestBooter implements Booter {
  configRun = false;
  discoverRun = false;
  bootRun = false;

  async configure() {
    this.configRun = true;
  }

  async discover() {
    this.discoverRun = true;
  }

  async load() {
    this.bootRun = true;
  }
}

class TestBooter2 implements Booter {
  configRun = false;
  randomRun = false;

  async configure() {
    this.configRun = true;
  }

  async random() {
    this.randomRun = true;
  }
}
