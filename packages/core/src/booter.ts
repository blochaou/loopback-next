// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Defines the requirements to implement a Booter for LoopBack applications:
 * configure() : Promise<void>
 * discover() : Promise<void>
 * load(): Promise<void>
 *
 * A Booter will run through the above methods in order.
 *
 * @export
 * @interface Booter
 */
export interface Booter {
  configure?(): Promise<void>;
  discover?(): Promise<void>;
  load?(): Promise<void>;
}

/**
 * Export of an array of all the Booter phases supported by the interface
 * above, in the order they should be run.
 */
export const BOOTER_PHASES = ['configure', 'discover', 'load'];

/**
 * Type Object for Options passed into .boot().
 *
 * projectRoot => Root of project. All other artifacts are resolved relative to this
 * phases => An array of phases that should be executed.
 * [prop: string]: any => Any options as defined by a Booter.
 */
export type BootOptions = {
  projectRoot: string;
  phases?: string[];
  // tslint:disable-next-line:no-any
  [prop: string]: any;
};
