// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TestSandbox, expect} from '..';
import {existsSync, readFile as readFile_} from 'fs';
import {resolve} from 'path';
import {createHash} from 'crypto';
import * as util from 'util';
const promisify = util.promisify || require('util.promisify/implementation');
const rimraf = require('rimraf');
const readFile = promisify(readFile_);

describe('TestSandbox unit tests', () => {
  let sandbox: TestSandbox;
  let path: string;

  beforeEach(createSandbox);
  beforeEach(givenPath);
  afterEach(deleteSandbox);

  it('returns path of sandbox and it exists', () => {
    expect(path).to.be.a.String();
    expect(existsSync(path)).to.be.True();
  });

  it('creates a directory in the sandbox', async () => {
    const dir = 'controllers';
    await sandbox.mkdir(dir);
    expect(existsSync(resolve(path, dir))).to.be.True();
  });

  it('copies a file to the sandbox', async () => {
    const file = 'copy-me.js';
    await sandbox.copy(resolve(__dirname, `fixtures/${file}`));
    expect(existsSync(resolve(path, file))).to.be.True();
    await compareFiles(
      resolve(__dirname, `fixtures/${file}`),
      resolve(path, file),
    );
  });

  it('copies and renames the file to the sandbox', async () => {
    const file = 'copy-me.js';
    const rename = 'copy.me.js';
    await sandbox.copy(resolve(__dirname, `fixtures/${file}`), rename);
    expect(existsSync(resolve(path, file))).to.be.False();
    expect(existsSync(resolve(path, rename))).to.be.True();
    await compareFiles(
      resolve(__dirname, `fixtures/${file}`),
      resolve(path, rename),
    );
  });

  it('copies file to a directory', async () => {
    const dir = 'test';
    await sandbox.mkdir(dir);
    const file = 'copy-me.js';
    const rename = `${dir}/${file}`;
    await sandbox.copy(resolve(__dirname, `fixtures/${file}`), rename);
    expect(existsSync(resolve(path, rename))).to.be.True();
    await compareFiles(
      resolve(__dirname, `fixtures/${file}`),
      resolve(path, rename),
    );
  });

  it('deletes the test sandbox', async () => {
    await sandbox.delete();
    expect(existsSync(path)).to.be.False();
  });

  it('throws an error trying to call a function after deleting the sandbox', async () => {
    const file = 'copy-me.js';
    const err = 'TestSandbox instance was deleted. Create a new instance.';
    await sandbox.delete();
    expect(existsSync(path)).to.be.False();
    expect(() => sandbox.getPath()).to.throw(err);
    await expect(sandbox.mkdir('test')).to.be.rejectedWith(err);
    await expect(
      sandbox.copy(resolve(__dirname, `fixtures/${file}`)),
    ).to.be.rejectedWith(err);
    await expect(sandbox.delete()).to.be.rejectedWith(err);
  });

  async function compareFiles(path1: string, path2: string) {
    const file1 = await readFile(path1);
    const file2 = await readFile(path2);
    const hash1 = createHash('sha256')
      .update(file1)
      .digest();
    const hash2 = createHash('sha256')
      .update(file2)
      .digest();
    expect(hash1).to.eql(hash2);
  }

  function createSandbox() {
    sandbox = new TestSandbox();
  }

  function givenPath() {
    path = sandbox.getPath();
  }

  function deleteSandbox() {
    if (!existsSync(path)) return;
    try {
      rimraf.sync(sandbox.getPath());
    } catch (err) {
      console.log(`Failed to delete sandbox because: ${err}`);
    }
  }
});
