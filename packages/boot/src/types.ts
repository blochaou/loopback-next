// import {BootOptions} from '@loopback/core';

/**
 * A Booter class interface
 */
export interface Booter {
  configure?(): void;
  discover?(): void;
  load?(): void;
}

// Array of Phases
export const BOOTER_PHASES = ['configure', 'discover', 'load'];

// Boot Options Type. Must provide a projectRoot!
export type BootOptions = {
  projectRoot: string;
  // tslint:disable-next-line:no-any
  [prop: string]: any;
};
