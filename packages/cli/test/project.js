// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const yeoman = require('yeoman-environment');
const testUtils = require('./test-utils');
const sinon = require('sinon');
const path = require('path');

module.exports = function(projGenerator, props, projectType) {
  return function() {
    describe('help', () => {
      it('prints lb4', () => {
        const env = yeoman.createEnv();
        const name = projGenerator.substring(
          projGenerator.lastIndexOf(path.sep) + 1
        );
        env.register(projGenerator, 'loopback4:' + name);
        const generator = env.create('loopback4:' + name);
        const helpText = generator.help();
        assert(helpText.match(/lb4 /));
        assert(!helpText.match(/loopback4:/));
      });
    });
    describe('_setupGenerator', () => {
      describe('args validation', () => {
        it('errors out if validation fails', () => {
          assert.throws(() => {
            testUtils.testSetUpGen(projGenerator, {args: 'fooBar'});
          }, Error);
        });

        it('succeeds if no arg is provided', () => {
          assert.doesNotThrow(() => {
            testUtils.testSetUpGen(projGenerator);
          }, Error);
        });

        it('succeeds if arg is valid', () => {
          assert.doesNotThrow(() => {
            testUtils.testSetUpGen(projGenerator, {args: ['foobar']});
          }, Error);
        });
      });
      describe('argument and options setup', () => {
        it('has name argument set up', () => {
          let gen = testUtils.testSetUpGen(projGenerator);
          let helpText = gen.help();
          assert(helpText.match(/\[<name>\]/));
          assert(helpText.match(/# Project name for the /));
          assert(helpText.match(/Type: String/));
          assert(helpText.match(/Required: false/));
        });

        it('has description option set up', () => {
          let gen = testUtils.testSetUpGen(projGenerator);
          let helpText = gen.help();
          assert(helpText.match(/--description/));
          assert(helpText.match(/# Description for the /));
        });

        it('has outdir option set up', () => {
          let gen = testUtils.testSetUpGen(projGenerator);
          let helpText = gen.help();
          assert(helpText.match(/--outdir/));
          assert(helpText.match(/# Project root directory /));
        });

        it('has tslint option set up', () => {
          let gen = testUtils.testSetUpGen(projGenerator);
          let helpText = gen.help();
          assert(helpText.match(/--tslint/));
          assert(helpText.match(/# Enable tslint/));
        });

        it('has prettier option set up', () => {
          let gen = testUtils.testSetUpGen(projGenerator);
          let helpText = gen.help();
          assert(helpText.match(/--prettier/));
          assert(helpText.match(/# Enable prettier/));
        });

        it('has mocha option set up', () => {
          let gen = testUtils.testSetUpGen(projGenerator);
          let helpText = gen.help();
          assert(helpText.match(/--mocha/));
          assert(helpText.match(/# Enable mocha/));
        });

        it('has loopbackBuild option set up', () => {
          let gen = testUtils.testSetUpGen(projGenerator);
          let helpText = gen.help();
          assert(helpText.match(/--loopbackBuild/));
          assert(helpText.match(/# Use @loopback\/build/));
        });
      });
    });

    describe('setOptions', () => {
      it('has projectInfo set up', () => {
        let gen = testUtils.testSetUpGen(projGenerator);
        gen.options = {
          name: 'foobar',
          description: null,
          outdir: null,
          tslint: null,
          prettier: true,
          mocha: null,
          loopbackBuild: null,
        };
        gen.setOptions();
        assert(gen.projectInfo.name === 'foobar');
        assert(gen.projectInfo.description !== null);
        assert(gen.projectInfo.prettier === true);
      });
    });

    describe('promptProjectName', () => {
      it('incorporates user input into projectInfo', () => {
        let gen = testUtils.testSetUpGen(projGenerator);
        return testPrompt(
          gen,
          {
            name: 'foobar',
            description: 'foobar description',
          },
          'promptProjectName'
        ).then(() => {
          gen.prompt.restore();
          assert(gen.projectInfo.name);
          assert(gen.projectInfo.description);
          assert(gen.projectInfo.name === 'foobar');
          assert(gen.projectInfo.description === 'foobar description');
        });
      });
    });

    describe('promptProjectDir', () => {
      it('incorporates user input into projectInfo', () => {
        let gen = testUtils.testSetUpGen(projGenerator);
        return testPrompt(
          gen,
          {
            outdir: 'foobar',
          },
          'promptProjectDir'
        ).then(() => {
          gen.prompt.restore();
          assert(gen.projectInfo.outdir);
          assert(gen.projectInfo.outdir === 'foobar');
        });
      });
    });

    describe('promptOptions', () => {
      it('incorporates user input into projectInfo', () => {
        let gen = testUtils.testSetUpGen(projGenerator);
        return testPrompt(
          gen,
          {
            settings: [
              'Enable tslint',
              'Enable prettier',
              'Enable mocha',
              'Enable loopbackBuild',
            ],
          },
          'promptOptions'
        ).then(() => {
          gen.prompt.restore();
          assert(gen.projectInfo.tslint === true);
          assert(gen.projectInfo.prettier === true);
          assert(gen.projectInfo.mocha === true);
          assert(gen.projectInfo.loopbackBuild === true);
        });
      });
    });

    describe('without settings', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(props);
      });

      it('creates files', () => {
        assert.file([
          'package.json',
          '.yo-rc.json',
          '.prettierrc',
          '.gitignore',
          '.npmrc',
          'tslint.json',
          'src/index.ts',
        ]);
        assert.jsonFileContent('package.json', props);
        assert.fileContent([
          ['package.json', '@loopback/build'],
          ['tslint.json', '@loopback/build'],
          ['tsconfig.json', '@loopback/build'],
        ]);
        assert.noFileContent([
          ['package.json', '"typescript"'],
          ['tslint.json', '"rules"'],
          ['tsconfig.json', '"compilerOptions"'],
        ]);

        if (projectType === 'application') {
          assert.fileContent('package.json', '"@loopback/core"');
          assert.fileContent('package.json', '"@loopback/context"');
          assert.fileContent('package.json', '"@loopback/rest"');
          assert.fileContent('package.json', '"@loopback/openapi-v2"');
          assert.jsonFileContent('package.json', {
            scripts: {
              start: 'npm run build && node .',
            },
          });
        }
        if (projectType === 'extension') {
          assert.fileContent('package.json', '"@loopback/core"');
          assert.fileContent('package.json', '"@loopback/context"');
          assert.noFileContent('package.json', '"@loopback/rest"');
          assert.noFileContent('package.json', '"@loopback/openapi-v2"');
          assert.noJsonFileContent('package.json', {
            start: 'npm run build && node .',
          });
        }
      });
    });

    describe('with loopbackBuild disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                // Force Enable loopbackBuild to be unchecked
                'Disable loopbackBuild',
                'Enable tslint',
                'Enable prettier',
                'Enable mocha',
              ],
            },
            props
          )
        );
      });

      it('creates files', () => {
        assert.jsonFileContent('package.json', props);
        assert.noFileContent([
          ['package.json', '@loopback/build'],
          ['tslint.json', '@loopback/build'],
          ['tsconfig.json', '@loopback/build'],
        ]);
        assert.fileContent([
          ['package.json', '"typescript"'],
          ['package.json', '"tslint"'],
          ['package.json', '"prettier"'],
          ['tslint.json', '"rules"'],
          ['tsconfig.json', '"compilerOptions"'],
        ]);
      });
    });

    describe('with prettier disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                'Enable loopbackBuild',
                'Enable tslint',
                'Disable prettier', // Force Enable prettier to be unchecked
                'Enable mocha',
              ],
            },
            props
          )
        );
      });

      it('creates files', () => {
        assert.noFile(['.prettierrc', '.prettierrcignore']);
        assert.jsonFileContent('package.json', props);
      });
    });

    describe('with tslint disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                'Enable loopbackBuild',
                'Disable tslint', // Force Enable tslint to be unchecked
                'Enable prettier',
                'Enable mocha',
              ],
            },
            props
          )
        );
      });

      it('creates files', () => {
        assert.noFile(['tslint.json', 'tslint.build.json']);
        assert.jsonFileContent('package.json', props);
      });
    });

    describe('with loopbackBuild & tslint disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                // Force Enable loopbackBuild to be unchecked
                'Disable loopbackBuild',
                // Force Enable tslint to be unchecked
                'Disable tslint',
                'Enable prettier',
                'Enable mocha',
              ],
            },
            props
          )
        );
      });

      it('creates files', () => {
        assert.jsonFileContent('package.json', props);
        assert.noFile(['tslint.json', 'tslint.build.json']);
        assert.noFileContent([
          ['package.json', '@loopback/build'],
          ['tsconfig.json', '@loopback/build'],
        ]);
        assert.fileContent([
          ['package.json', '"typescript"'],
          ['package.json', '"prettier"'],
          ['tsconfig.json', '"compilerOptions"'],
        ]);
        assert.noFileContent([['package.json', '"tslint"']]);
      });
    });

    function testPrompt(gen, props, fnName) {
      gen.setOptions();
      gen.prompt = sinon.stub(gen, 'prompt');
      gen.prompt.resolves(props);
      return gen[fnName]();
    }
  };
};
