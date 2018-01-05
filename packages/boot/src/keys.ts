// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BOOTER_PHASES} from './types';

/**
 * Namespace for core binding keys
 */
export namespace BootBindings {
  /**
   * Binding key for Boot configuration
   */
  export const BOOT_CONFIG = 'boot.config';

  export const BOOTER_TAG = 'booter';
  export const BOOTER_PREFIX = 'booters';

  export const PHASES = BOOTER_PHASES;
}
