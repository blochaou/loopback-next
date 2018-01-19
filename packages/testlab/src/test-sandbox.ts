// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {tmpdir} from 'os';
import {createHash} from 'crypto';
import {resolve, join, parse} from 'path';
import * as util from 'util';
import {mkdtempSync, mkdir as mkdir_, copyFile as copyFile_} from 'fs';
const promisify = util.promisify || require('util.promisify/implementation');

const rimraf = promisify(require('rimraf'));
const mkdir = promisify(mkdir_);
const copyFile = promisify(copyFile_);

export class TestSandbox {
  private path: string;

  constructor() {
    this.create();
  }

  private create(): void {
    this.path = mkdtempSync(join(tmpdir(), 'lb4-temp-'));
  }

  private validateInst() {
    if (!this.path) {
      throw new Error(
        `TestSandbox instance was deleted. Create a new instance.`,
      );
    }
  }

  getPath(): string {
    this.validateInst();
    return this.path;
  }

  async delete(): Promise<void> {
    this.validateInst();
    await rimraf(this.path);
    delete this.path;
  }

  async mkdir(dir: string): Promise<void> {
    this.validateInst();
    await mkdir(resolve(this.path, dir));
  }

  async copy(src: string, dest?: string): Promise<void> {
    this.validateInst();
    dest = dest
      ? resolve(this.path, dest)
      : resolve(this.path, parse(src).base);
    await copyFile(src, dest);
  }
}
