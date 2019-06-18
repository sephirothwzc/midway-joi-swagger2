/*
 * @Author: 吴占超
 * @Date: 2019-06-18 11:02:26
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-06-18 16:26:45
 * joi-router 处理
 */
import * as _ from 'lodash';

const schemas = {};

/**
 * method 用
 * @param key [api]+path
 * @param paramIn
 */
const addSchema = async (key: string, paramIn: any) => {
  schemas[key] && (schemas[key] = {});
  schemas[key] = paramIn;
};

const controllerSchema = async (api: string, path: string) => {
  _.chain(schemas)
    .keys()
    .filter(p => _.startsWith(p, `[${api}]`))
    .forEach(p => {
      schemas[p.replace(`[${api}]`, path).replace('//', '/')] = schemas[p];
      delete schemas[p];
    })
    .value();
};

export { schemas, addSchema, controllerSchema };
