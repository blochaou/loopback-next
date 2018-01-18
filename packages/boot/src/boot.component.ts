// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Context,
  inject,
  Constructor,
  Binding,
  BindingScope,
} from '@loopback/context';
import {
  Component,
  Booter,
  BootOptions,
  BOOTER_PHASES,
  CoreBindings,
  Application,
} from '@loopback/core';
import {resolve} from 'path';
import {BootBindings} from './keys';

import * as debugModule from 'debug';
const debug = debugModule('loopback:boot:bootstrapper');

export class BootComponent extends Context implements Component {
  bootOptions: BootOptions;

  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    super(app);
  }

  /**
   * Function is responsible for calling all registered Booter classes that
   * are bound to the Application instance. Each phase of an instance must
   * complete before the next phase is started.
   * @param {BootOptions} bootOptions Options for boot. Bound for Booters to
   * receive via Dependency Injection.
   */
  async boot(bootOptions: BootOptions) {
    this.bootOptions = bootOptions;

    if (!this.bootOptions.projectRoot) {
      throw new Error(
        `No projectRoot provided for boot. Call boot({projectRoot: 'path'}) with projectRoot set.`,
      );
    }

    // Resolve path to projectRoot
    this.bootOptions.projectRoot = resolve(this.bootOptions.projectRoot);

    // Bind Boot Config for Booters
    this.bind(BootBindings.BOOT_CONFIG).to(this.bootOptions);

    // Find Bindings and get instance
    const bindings = this.findByTag(BootBindings.BOOTER_TAG);
    // tslint:disable-next-line:no-any
    let booterInsts: any[] = bindings.map(binding => this.getSync(binding.key));

    // Run phases of booters
    for (const phase of BOOTER_PHASES) {
      for (const inst of booterInsts) {
        if (inst[phase]) {
          await inst[phase]();
          debug(`${inst.constructor.name} phase: ${phase} complete.`);
        } else {
          debug(`${inst.constructor.name} phase: ${phase} missing.`);
        }
      }
    }
  }

  private _bindBooter<T extends Booter>(
    booterCls: Constructor<T>,
    name?: string,
  ): Binding {
    name = name || booterCls.name;
    return this.bind(`${BootBindings.BOOTER_PREFIX}.${name}`)
      .toClass(booterCls)
      .tag(BootBindings.BOOTER_TAG)
      .inScope(BindingScope.SINGLETON);
  }

  booter(booterCls: Constructor<Booter>, name?: string): Binding;
  booter(booterCls: Constructor<Booter>[]): Binding[];

  // tslint:disable-next-line:no-any
  booter(booterCls: any, name?: string): any {
    if (Array.isArray(booterCls)) {
      return booterCls.map(cls => this._bindBooter(cls));
    } else {
      return this._bindBooter(booterCls, name);
    }
  }
}
