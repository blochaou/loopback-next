// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get} from '../..';

describe('backward-compatibility', () => {
  it('exports functions from @loopback/openapi-v2', async () => {
    /* tslint:disable-next-line:no-unused-variable */
    class Test {
      // Make sure the decorators are exported
      @get('/test')
      async test() {
        return '';
      }
    }
  });
});
