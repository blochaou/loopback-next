// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {CoreBindings, BootOptions} from '@loopback/core';
import {ControllerBooterApp} from '../fixtures/booterApp/application';
import {
  ControllerBooter,
  ControllerDefaults,
  BootBindings,
  BootComponent,
} from '../../index';
import {resolve} from 'path';
// @ts-ignore
import {getCompilationTarget} from '@loopback/build/bin/utils';

describe('controller booter intengration tests', () => {
  let app: ControllerBooterApp;
  let projectRoot: string;
  let bootOptions: BootOptions;

  beforeEach(getProjectRoot);
  beforeEach(getBootOptions);
  beforeEach(getApp);

  it('all functions run and work via app.boot() once bound', async () => {
    const resolvedProjectRoot = resolve(projectRoot);
    const expectedDiscoveredFiles = [
      `${resolve(
        resolvedProjectRoot,
        'controllers/nested/nested.controller.js',
      )}`,
      `${resolve(resolvedProjectRoot, 'controllers/another.ext.ctrl.js')}`,
      `${resolve(resolvedProjectRoot, 'controllers/empty.controller.js')}`,
      `${resolve(resolvedProjectRoot, 'controllers/hello.controller.js')}`,
      `${resolve(resolvedProjectRoot, 'controllers/two.controller.js')}`,
      `${resolve(resolvedProjectRoot, 'ctrl/multiple.folder.controller.js')}`,
    ];
    const expectedBindings = [
      `${CoreBindings.CONTROLLERS}.NestedController`,
      `${CoreBindings.CONTROLLERS}.AnotherController`,
      `${CoreBindings.CONTROLLERS}.HelloController`,
      `${CoreBindings.CONTROLLERS}.ControllerOne`,
      `${CoreBindings.CONTROLLERS}.ControllerTwo`,
      `${CoreBindings.CONTROLLERS}.MultipleFolderController`,
    ];

    await app.booter(ControllerBooter);
    await app.boot(bootOptions);
    const bootComponent: BootComponent = await app.get(
      CoreBindings.BOOTCOMPONENT,
    );
    const booter: ControllerBooter = await bootComponent.get(
      `${BootBindings.BOOTER_PREFIX}.ControllerBooter`,
    );

    // Check Config Phase Ran as expected
    expect(booter.dirs.sort()).to.eql(bootOptions.controllers.dirs.sort());
    expect(booter.extensions.sort()).to.eql(
      bootOptions.controllers.extensions.sort(),
    );
    expect(booter.options.nested).to.equal(ControllerDefaults.nested);

    // Check Discovered Phase Ran as expected
    expect(booter.discovered.sort()).to.eql(expectedDiscoveredFiles.sort());

    // Check Boot Phase Ran as expected
    const ctrlBindings = app
      .findByTag(CoreBindings.CONTROLLERS_TAG)
      .map(b => b.key);
    expect(ctrlBindings.sort()).to.eql(expectedBindings.sort());
  });

  function getApp() {
    app = new ControllerBooterApp({components: [BootComponent]});
  }

  function getProjectRoot() {
    let dist = 'dist';
    if (getCompilationTarget() === 'es2015') dist = 'dist6';
    projectRoot =
      process.cwd().indexOf('packages') > -1
        ? `${dist}/test/fixtures/booterApp`
        : `packages/boot/${dist}/test/fixtures/booterApp`;
  }

  function getBootOptions() {
    bootOptions = {
      projectRoot: projectRoot,
      controllers: {
        dirs: ['controllers', 'ctrl'],
        extensions: ['.ctrl.js', '.controller.js'],
      },
    };
  }
});
