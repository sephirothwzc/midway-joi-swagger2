/*
 * @Author: 吴占超
 * @Date: 2019-07-29 10:33:56
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-07-29 11:51:29
 * 自定义中间件，进行校验处理
 */
import * as _ from 'lodash';
import * as joi from 'joi';
import { KoaMiddleware } from 'midway';

const joiValidate = (param: any, schema: any) => {
  return new Promise((resolve, reject) => {
    joi.validate(param, schema, (err: any, value: any) => {
      if (err) {
        reject(err);
      }
      resolve(value);
    });
  });
};

const validate = (
  schemaList: Array<{ ctxkey: string; schemas: any }>
): KoaMiddleware => {
  return async (ctx: any, next: () => Promise<any>) => {
    const promiseAll = _(schemaList)
      .map(p => joiValidate(_.get(ctx, p.ctxkey), p.schemas))
      .value();
    const result = await Promise.all(promiseAll)
      .then(resultAll => {
        return resultAll;
      })
      .catch(error => {
        return ctx.throw(422, JSON.stringify(error));
      });
    result && (await next());
  };
};
export default validate;
