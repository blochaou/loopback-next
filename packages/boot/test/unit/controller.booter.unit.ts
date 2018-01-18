// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application, CoreBindings, BootOptions} from '@loopback/core';
import {ControllerBooter, ControllerDefaults} from '../../index';
import {resolve, relative} from 'path';
// @ts-ignore
import {getCompilationTarget} from '@loopback/build/bin/utils';

describe('controller booter unit tests', () => {
  let app: Application;
  let projectRoot: string;

  beforeEach(getApp);
  beforeEach(getProjectRoot);

  describe('ControllerBooter.config()', () => {
    it('uses default values for controllerOptions when not present', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
      };

      const booter = new ControllerBooter(app, bootOptions);
      await booter.configure();
      validateConfig(
        booter,
        <string[]>ControllerDefaults.dirs,
        <string[]>ControllerDefaults.extensions,
        ControllerDefaults.nested,
      );
    });

    it('converts string options in controllerOptions to Array and overrides defaults', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
        controllers: {
          dirs: 'ctrl',
          extensions: '.ctrl.js',
          nested: false,
        },
      };

      const booter = new ControllerBooter(app, bootOptions);
      await booter.configure();
      validateConfig(
        booter,
        [bootOptions.controllers.dirs],
        [bootOptions.controllers.extensions],
        bootOptions.controllers.nested,
      );
    });

    it('overrides controllerOptions with those provided', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
        controllers: {
          dirs: ['ctrl1', 'ctrl2'],
          extensions: ['.ctrl.js', '.controller.js'],
        },
      };

      const booter = new ControllerBooter(app, bootOptions);
      await booter.configure();
      validateConfig(
        booter,
        bootOptions.controllers.dirs,
        bootOptions.controllers.extensions,
        ControllerDefaults.nested,
      );
    });

    function validateConfig(
      booter: ControllerBooter,
      dirs: string[],
      exts: string[],
      nested: boolean,
    ) {
      expect(booter.dirs.sort()).to.eql(dirs.sort());
      expect(booter.extensions.sort()).to.eql(exts.sort());
      if (nested) {
        expect(booter.options.nested).to.be.True();
      } else {
        expect(booter.options.nested).to.be.False();
      }
      expect(booter.projectRoot).to.equal(projectRoot);
    }
  });

  describe('ControllerBooter.discover()', () => {
    it('discovers files based on ControllerDefaults', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
        controllers: ControllerDefaults,
      };
      const expected = [
        `${resolve(projectRoot, 'controllers/empty.controller.js')}`,
        `${resolve(projectRoot, 'controllers/hello.controller.js')}`,
        `${resolve(projectRoot, 'controllers/two.controller.js')}`,
        `${resolve(projectRoot, 'controllers/nested/nested.controller.js')}`,
      ];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = <string[]>ControllerDefaults.dirs;
      booter.extensions = <string[]>ControllerDefaults.extensions;

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers files without going into nested folders', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
        controllers: {nested: false},
      };
      const expected = [
        `${resolve(projectRoot, 'controllers/empty.controller.js')}`,
        `${resolve(projectRoot, 'controllers/hello.controller.js')}`,
        `${resolve(projectRoot, 'controllers/two.controller.js')}`,
      ];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = <string[]>ControllerDefaults.dirs;
      booter.extensions = <string[]>ControllerDefaults.extensions;

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers files of specified extensions', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
        controllers: ControllerDefaults,
      };
      const expected = [
        `${resolve(projectRoot, 'controllers/another.ext.ctrl.js')}`,
      ];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = <string[]>ControllerDefaults.dirs;
      booter.extensions = ['.ctrl.js'];

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers files in specified directory', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
        controllers: ControllerDefaults,
      };
      const expected = [
        `${resolve(projectRoot, 'ctrl/multiple.folder.controller.js')}`,
      ];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = ['ctrl'];
      booter.extensions = <string[]>ControllerDefaults.extensions;

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers files of multiple extensions', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
        controllers: ControllerDefaults,
      };
      const expected = [
        `${resolve(projectRoot, 'controllers/empty.controller.js')}`,
        `${resolve(projectRoot, 'controllers/hello.controller.js')}`,
        `${resolve(projectRoot, 'controllers/two.controller.js')}`,
        `${resolve(projectRoot, 'controllers/another.ext.ctrl.js')}`,
        `${resolve(projectRoot, 'controllers/nested/nested.controller.js')}`,
      ];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = <string[]>ControllerDefaults.dirs;
      booter.extensions = ['.ctrl.js', '.controller.js'];

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers files in multiple directories', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
        controllers: ControllerDefaults,
      };
      const expected = [
        `${resolve(projectRoot, 'controllers/empty.controller.js')}`,
        `${resolve(projectRoot, 'controllers/hello.controller.js')}`,
        `${resolve(projectRoot, 'controllers/two.controller.js')}`,
        `${resolve(projectRoot, 'controllers/nested/nested.controller.js')}`,
        `${resolve(projectRoot, 'ctrl/multiple.folder.controller.js')}`,
      ];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = ['ctrl', 'controllers'];
      booter.extensions = <string[]>ControllerDefaults.extensions;

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers no files in an empty directory', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
        controllers: ControllerDefaults,
      };
      const expected: string[] = [];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = ['empty'];
      booter.extensions = <string[]>ControllerDefaults.extensions;

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers no files of an invalid extension', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
        controllers: ControllerDefaults,
      };
      const expected: string[] = [];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = <string[]>ControllerDefaults.dirs;
      booter.extensions = ['.fake'];

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });

    it('discovers no files in a non-existent directory', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
        controllers: ControllerDefaults,
      };
      const expected: string[] = [];

      const booter = new ControllerBooter(app, bootOptions);
      booter.dirs = ['fake'];
      booter.extensions = <string[]>ControllerDefaults.extensions;

      await booter.discover();
      expect(booter.discovered.sort()).to.eql(expected.sort());
    });
  });

  describe('ControllerBooter.load()', () => {
    it('binds a controller from discovered file', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
      };
      const expected = [`${CoreBindings.CONTROLLERS}.HelloController`];

      const booter = new ControllerBooter(app, bootOptions);
      booter.discovered = [
        `${resolve(projectRoot, 'controllers/hello.controller.js')}`,
      ];

      await booter.load();
      const boundControllers = app
        .findByTag(CoreBindings.CONTROLLERS_TAG)
        .map(b => b.key);
      expect(boundControllers.sort()).to.eql(expected.sort());
    });

    it('binds controllers from multiple files', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
      };
      const expected = [
        `${CoreBindings.CONTROLLERS}.HelloController`,
        `${CoreBindings.CONTROLLERS}.AnotherController`,
        `${CoreBindings.CONTROLLERS}.NestedController`,
      ];

      const booter = new ControllerBooter(app, bootOptions);
      booter.discovered = [
        `${resolve(projectRoot, 'controllers/hello.controller.js')}`,
        `${resolve(projectRoot, 'controllers/another.ext.ctrl.js')}`,
        `${resolve(projectRoot, 'controllers/nested/nested.controller.js')}`,
      ];

      await booter.load();
      const boundControllers = app
        .findByTag(CoreBindings.CONTROLLERS_TAG)
        .map(b => b.key);
      expect(boundControllers.sort()).to.eql(expected.sort());
    });

    it('binds multiple controllers from a file', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
      };
      const expected = [
        `${CoreBindings.CONTROLLERS}.ControllerOne`,
        `${CoreBindings.CONTROLLERS}.ControllerTwo`,
      ];

      const booter = new ControllerBooter(app, bootOptions);
      booter.discovered = [
        `${resolve(projectRoot, 'controllers/two.controller.js')}`,
      ];

      await booter.load();
      const boundControllers = app
        .findByTag(CoreBindings.CONTROLLERS_TAG)
        .map(b => b.key);
      expect(boundControllers.sort()).to.eql(expected.sort());
    });

    it('does not throw on an empty file', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
      };
      const expected: string[] = [];

      const booter = new ControllerBooter(app, bootOptions);
      booter.discovered = [
        `${resolve(projectRoot, 'controllers/empty.controller.js')}`,
      ];

      await booter.load();
      const boundControllers = app
        .findByTag(CoreBindings.CONTROLLERS_TAG)
        .map(b => b.key);
      expect(boundControllers.sort()).to.eql(expected.sort());
    });

    it('throws an error on a non-existent file', async () => {
      const bootOptions: BootOptions = {
        projectRoot: projectRoot,
      };

      const booter = new ControllerBooter(app, bootOptions);
      booter.discovered = [
        `${resolve(projectRoot, 'controllers/fake.controller.js')}`,
      ];

      await expect(booter.load()).to.be.rejectedWith(
        `ControllerBooter failed to load the following files: ["${relative(
          projectRoot,
          booter.discovered[0],
        )}"]`,
      );
    });
  });

  it('mounts other files even if one is non-existent', async () => {
    const bootOptions: BootOptions = {
      projectRoot: projectRoot,
    };
    const expected = [
      `${CoreBindings.CONTROLLERS}.ControllerOne`,
      `${CoreBindings.CONTROLLERS}.ControllerTwo`,
      `${CoreBindings.CONTROLLERS}.HelloController`,
    ];

    const booter = new ControllerBooter(app, bootOptions);
    booter.discovered = [
      `${resolve(projectRoot, 'controllers/hello.controller.js')}`,
      `${resolve(projectRoot, 'controllers/fake.controller.js')}`,
      `${resolve(projectRoot, 'controllers/two.controller.js')}`,
    ];

    await expect(booter.load()).to.be.rejectedWith(
      `ControllerBooter failed to load the following files: ["${relative(
        projectRoot,
        booter.discovered[1],
      )}"]`,
    );

    const boundControllers = app
      .findByTag(CoreBindings.CONTROLLERS_TAG)
      .map(b => b.key);
    expect(boundControllers.sort()).to.eql(expected.sort());
  });

  function getApp() {
    app = new Application();
  }

  function getProjectRoot() {
    let dist = 'dist';
    if (getCompilationTarget() === 'es2015') dist = 'dist6';
    projectRoot =
      process.cwd().indexOf('packages') > -1
        ? `${dist}/test/fixtures/booterApp`
        : `packages/boot/${dist}/test/fixtures/booterApp`;
    projectRoot = resolve(projectRoot);
  }
});
