// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application, Booter} from '@loopback/core';
import {Binding, Context} from '@loopback/context';
import {BootComponent, BootBindings} from '../../index';

describe('boot.component unit tests', () => {
  let bootComponent: BootComponent;

  beforeEach(getBootComponent);

  it("binds a booter to it's context", async () => {
    const binding: Binding = bootComponent.booter(MyBooter);
    const booterInst = await bootComponent.get(binding.key);
    expect(Array.from(binding.tags)).to.containEql(BootBindings.BOOTER_TAG);
    expect(binding.key).to.equal(`${BootBindings.BOOTER_PREFIX}.MyBooter`);
    expect(findKeysByTag(bootComponent, BootBindings.BOOTER_TAG)).to.containEql(
      binding.key,
    );
    expect(booterInst).to.be.an.instanceOf(MyBooter);
  });

  it('binds a booter with a custom name', async () => {
    const binding: Binding = bootComponent.booter(MyBooter, 'my-booter');
    const booterInst = await bootComponent.get(binding.key);
    expect(Array.from(binding.tags)).to.containEql(BootBindings.BOOTER_TAG);
    expect(binding.key).to.equal(`${BootBindings.BOOTER_PREFIX}.my-booter`);
    expect(findKeysByTag(bootComponent, BootBindings.BOOTER_TAG)).to.containEql(
      binding.key,
    );
    expect(booterInst).to.be.an.instanceOf(MyBooter);
  });

  it('binds an array of booters', async () => {
    const bindings = bootComponent.booter([MyBooter, MyBooter2]);
    bindings.forEach(binding => {
      expect(Array.from(binding.tags)).to.containEql(BootBindings.BOOTER_TAG);
      expect(
        findKeysByTag(bootComponent, BootBindings.BOOTER_TAG),
      ).to.containEql(binding.key);
    });
    expect(bindings[0].key).to.equal(`${BootBindings.BOOTER_PREFIX}.MyBooter`);
    expect(bindings[1].key).to.equal(`${BootBindings.BOOTER_PREFIX}.MyBooter2`);

    const booterInst = await bootComponent.get(bindings[0].key);
    expect(booterInst).to.be.an.instanceOf(MyBooter);

    const booterInst2 = await bootComponent.get(bindings[1].key);
    expect(booterInst2).to.be.an.instanceOf(MyBooter2);
  });

  it('runs the booter phases and ignores missing / other functions', async () => {
    const binding = bootComponent.booter(MyBooter2);
    await bootComponent.boot({projectRoot: __dirname}); // projectRoot isn't used
    const booterInst = await bootComponent.get(binding.key);
    expect(booterInst.discoverCalled).to.be.True();
    expect(booterInst.randomCalled).to.be.False();
  });

  function getBootComponent() {
    bootComponent = new BootComponent(new Application());
  }

  function findKeysByTag(ctx: Context, tag: string | RegExp) {
    return ctx.findByTag(tag).map(binding => binding.key);
  }

  class MyBooter implements Booter {
    configureCalled = false;
    async configure() {
      this.configureCalled = true;
    }
  }

  class MyBooter2 implements Booter {
    discoverCalled = false;
    randomCalled = false;
    async discover() {
      this.discoverCalled = true;
    }
    async random() {
      this.randomCalled = true;
    }
  }
});
