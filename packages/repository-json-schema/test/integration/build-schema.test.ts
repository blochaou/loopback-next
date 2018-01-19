// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  model,
  property,
  ModelMetadataHelper,
  ModelDefinition,
  PropertyMap,
} from '@loopback/repository';
import {modelToJsonDef, toJsonProperty} from '../../src/build-schema';
import {expect} from '@loopback/testlab';
import {MetadataInspector} from '@loopback/context';
import {JSON_SCHEMA_KEY, getJsonDef} from '../../index';

describe('build-schema', () => {
  describe('modelToJSON', () => {
    it('does not convert null or undefined property', () => {
      @model()
      class TestModel {
        @property() nul: null;
        @property() undef: undefined;
      }

      const jsonDef = modelToJsonDef(TestModel);
      expect(jsonDef.properties).to.not.have.keys(['nul', 'undef']);
    });

    it('does not convert properties that have not been decorated', () => {
      @model()
      class NoPropertyMeta {
        prop: string;
      }
      @model()
      class OnePropertyDecorated {
        @property() foo: string;
        bar: boolean;
        baz: number;
      }

      expect(modelToJsonDef(NoPropertyMeta)).to.eql({});
      expect(modelToJsonDef(OnePropertyDecorated)).to.deepEqual({
        properties: {
          foo: {
            type: 'string',
          },
        },
      });
    });

    it('does not convert models that have not been decorated with @model()', () => {
      class Empty {}
      class NoModelMeta {
        @property() foo: string;
        bar: number;
      }

      expect(modelToJsonDef(Empty)).to.eql({});
      expect(modelToJsonDef(NoModelMeta)).to.eql({});
    });

    it('properly converts string, number, and boolean properties', () => {
      @model()
      class TestModel {
        @property() str: string;
        @property() num: number;
        @property() bool: boolean;
      }

      const jsonDef = modelToJsonDef(TestModel);
      expect(jsonDef.properties).to.deepEqual({
        str: {
          type: 'string',
        },
        num: {
          type: 'number',
        },
        bool: {
          type: 'boolean',
        },
      });
    });

    it('properly converts object properties', () => {
      @model()
      class TestModel {
        @property() obj: object;
      }

      const jsonDef = modelToJsonDef(TestModel);
      expect(jsonDef.properties).to.deepEqual({
        obj: {
          type: 'object',
        },
      });
    });

    it('properly converts custom type properties', () => {
      class CustomType {
        prop: string;
      }

      @model()
      class TestModel {
        @property() cusType: CustomType;
      }

      const jsonDef = modelToJsonDef(TestModel);
      expect(jsonDef.properties).to.deepEqual({
        cusType: {
          $ref: '#definitions/CustomType',
        },
      });
    });

    it('properly converts primitive arrays properties', () => {
      @model()
      class TestModel {
        @property.array(Number) numArr: number[];
      }

      const jsonDef = modelToJsonDef(TestModel);
      expect(jsonDef.properties).to.deepEqual({
        numArr: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
      });
    });

    it('properly converts custom type arrays properties', () => {
      class CustomType {
        prop: string;
      }

      @model()
      class TestModel {
        @property.array(CustomType) cusArr: CustomType[];
      }

      const jsonDef = modelToJsonDef(TestModel);
      expect(jsonDef.properties).to.deepEqual({
        cusArr: {
          type: 'array',
          items: {
            $ref: '#definitions/CustomType',
          },
        },
      });
    });

    it('errors out when "@property.array" is not used on an array', () => {
      @model()
      class BadArray {
        @property() badArr: string[];
      }

      expect(() => {
        modelToJsonDef(BadArray);
      }).to.throw(/type is defined as an array/);
    });

    describe('toJSONProperty', () => {
      class Bar {
        barA: number;
      }
      @model()
      class Foo {
        @property() str: string;
        @property() num: number;
        @property() bool: boolean;
        @property() obj: object;
        @property() nul: null;
        @property() undef: undefined;
        @property.array(String) arrStr: string[];
        @property() bar: Bar;
        @property.array(Bar) arrBar: Bar[];
      }
      let meta: ModelDefinition;
      let propMeta: PropertyMap;

      before(() => {
        meta = ModelMetadataHelper.getModelMetadata(Foo);
        propMeta = meta.properties;
      });

      it('converts primitively typed property correctly', () => {
        expect(toJsonProperty(propMeta.str)).to.deepEqual({
          type: 'string',
        });
        expect(toJsonProperty(propMeta.num)).to.deepEqual({
          type: 'number',
        });
        expect(toJsonProperty(propMeta.bool)).to.deepEqual({
          type: 'boolean',
        });
      });

      it('converts object property correctly', () => {
        expect(toJsonProperty(propMeta.obj)).to.deepEqual({
          type: 'object',
        });
      });

      it('converts customly typed property correctly', () => {
        expect(toJsonProperty(propMeta.bar)).to.deepEqual({
          $ref: '#definitions/Bar',
        });
      });

      it('converts arrays of primitives correctly', () => {
        expect(toJsonProperty(propMeta.arrStr)).to.deepEqual({
          type: 'array',
          items: {
            type: 'string',
          },
        });
      });

      it('converts arrays of custom types correctly', () => {
        expect(toJsonProperty(propMeta.arrBar)).to.deepEqual({
          type: 'array',
          items: {
            $ref: '#definitions/Bar',
          },
        });
      });
    });
  });

  describe('getJsonDef', () => {
    it('gets cached JSON definition if one exists', () => {
      @model()
      class TestModel {
        @property() foo: number;
      }
      const cachedDef = {
        properties: {
          cachedProperty: {
            type: 'string',
          },
        },
      };
      MetadataInspector.defineMetadata(JSON_SCHEMA_KEY, cachedDef, TestModel);

      const jsonDef = getJsonDef(TestModel);
      expect(jsonDef).to.eql(cachedDef);
    });

    it('creates JSON definition if one does not already exist', () => {
      @model()
      class NewModel {
        @property() newProperty: string;
      }

      const jsonDef = getJsonDef(NewModel);
      expect(jsonDef.properties).to.containDeep({
        newProperty: {
          type: 'string',
        },
      });
    });
  });
});
