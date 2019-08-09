/*
 * @Author: 吴占超
 * @Date: 2019-06-16 10:25:21
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-07-29 14:37:09
 */

import { controller, get, post, put, del } from 'midway';
import * as _ from 'lodash';
import { IApiObject, IMethodIn, IClassIn } from './interface';
import * as j2s from 'joi-to-swagger';
import validate from './mid-validate';

// import { IApiObject } from './interface';
/**
 * used for building swagger docs object
 * 属性[controller]：[apiobject]
 */
const apiObjects = {};

/**
 * 生成 test用
 */
const controllerList: IClassIn[] = [];
const actionList: IMethodIn[] = [];

/**
 * eg. /api/{id} -> /api/:id
 * @param {String} path
 */
const convertPath = (path: string) => {
  const re = new RegExp('{(.*?)}', 'g');
  return path.replace(re, ':$1');
};

/**
 * 对象参数
 * @param parameters
 * @param type
 */
const _paramsBody = (parameters: any) => {
  if (!parameters) {
    return undefined;
  }
  const { swagger } = j2s(parameters);
  return [
    {
      name: 'data',
      description: 'request body',
      schema: swagger,
      in: 'body'
    }
  ];
};

const _paramsList = (parameters: any, type: string) => {
  if (!parameters) {
    return undefined;
  }
  const {
    swagger: { required }
  } = j2s(parameters);
  const swaggerParams = _.keys(parameters).map(p => {
    const { swagger } = j2s(parameters[p]);
    return { ...swagger, name: p, in: type, required: _.includes(required, p) };
  });
  return swaggerParams;
};

const _responsesBody = (body: any) => {
  if (!body) {
    return undefined;
  }
  const { swagger } = j2s(body);
  return {
    name: 'data',
    description: 'response body',
    schema: swagger,
    in: 'body'
  };
};

/**
 * 权限处理
 * @param auth
 */
const _auth = (auth: string | string[]) => {
  if (!auth) {
    // 获取默认
    return [];
  }
  if (_.isArray(auth) && auth.length > 0) {
    const result = {};
    [...auth].forEach(p => {
      result[p] = [];
    });
    return result;
  }
  return [
    {
      [auth as string]: []
    }
  ];
};

/**
 *
 * @param target
 * @param name
 * @param apiObj
 * @param content
 */
const _addToApiObject = (key: any, apiObj: any, content: IApiObject) => {
  if (!apiObj[key]) {
    apiObj[key] = {};
  }
  Object.assign(apiObj[key], content);
};

const SwaggerJoiController = (paramIn: IClassIn): ClassDecorator => {
  _.keys(apiObjects)
    .filter(p => _.startsWith(p, `${paramIn.api}-`))
    .forEach(p => {
      apiObjects[p].path = `${paramIn.path}${apiObjects[p].path}`.replace(
        '//',
        '/'
      );
      paramIn.description && (apiObjects[p].tags = [paramIn.description]);
    });
  /**
   * 组织controller
   */
  paramIn.actions = _.chain(actionList)
    .filter(p => p.api === paramIn.api)
    .value();
  controllerList.push(paramIn);
  return controller(convertPath(paramIn.path), paramIn.routerOptions);
};

const allSet = (paramIn: IMethodIn, method: string) => {
  const key = `${paramIn.api}-${method}-${paramIn.path.replace('/', '_')}`;

  _addToApiObject(key, apiObjects, {
    api: paramIn.api,
    tags: [paramIn.api],
    method,
    path: paramIn.path,
    // summary: paramIn.summary,
    // description: paramIn.description,
    // #region 显示位置切换
    summary: paramIn.description,
    description: paramIn.summary,
    // #endregion
    pathParams: _paramsList(paramIn.pathParams, 'path'),
    query: _paramsList(paramIn.query, 'query'),
    body: _paramsBody(paramIn.body),
    formData: _paramsList(paramIn.formData, 'formData'),
    security: _auth(paramIn.auth),
    responses: _responsesBody(paramIn.responses)
  });
  const realPath = convertPath(paramIn.path);
  return realPath;
};

const createSchemaMiddleware = (paramIn: IMethodIn) => {
  const schemaName = [
    { sname: 'body', key: 'request.body' },
    { sname: 'pathParams', key: 'params' },
    { sname: 'query' },
    { sname: 'formData' }
  ];
  const schemaList = _(schemaName)
    .filter(p => paramIn[p.sname])
    .map(p => {
      return {
        ctxkey: _.get(p, 'key', p.sname),
        schemas: paramIn[p.sname]
      };
    })
    .value();

  return validate(schemaList);
};

const paramInUpdMiddeware = (paramIn: IMethodIn) => {
  const tempMidd = _.get(paramIn, 'routerOptions.middleware');
  const validateMid = createSchemaMiddleware(paramIn);
  if (_.isArray(tempMidd)) {
    _.set(paramIn, 'routerOptions.middleware', [validateMid, ...tempMidd]);
  } else if (_.isString(tempMidd)) {
    _.set(paramIn, 'routerOptions.middleware', [validateMid, tempMidd]);
  } else {
    _.set(paramIn, 'routerOptions.middleware', [validateMid]);
  }
};

const SwaggerJoiGet = (paramIn: IMethodIn) => {
  paramIn.method = 'get';
  actionList.push(paramIn);
  const realPath = allSet(paramIn, 'get');
  paramInUpdMiddeware(paramIn);
  return get(realPath, paramIn.routerOptions);
};

const SwaggerJoiPost = (paramIn: IMethodIn) => {
  paramIn.method = 'post';
  actionList.push(paramIn);
  const realPath = allSet(paramIn, 'post');
  paramInUpdMiddeware(paramIn);
  return post(realPath, paramIn.routerOptions);
};

const SwaggerJoiPut = (paramIn: IMethodIn) => {
  paramIn.method = 'put';
  actionList.push(paramIn);
  const realPath = allSet(paramIn, 'put');
  paramInUpdMiddeware(paramIn);
  return put(realPath, paramIn.routerOptions);
};

const SwaggerJoiDel = (paramIn: IMethodIn) => {
  paramIn.method = 'del';
  actionList.push(paramIn);
  const realPath = allSet(paramIn, 'del');
  paramInUpdMiddeware(paramIn);
  return del(realPath, paramIn.routerOptions);
};

export {
  SwaggerJoiController,
  SwaggerJoiGet,
  SwaggerJoiPost,
  SwaggerJoiPut,
  SwaggerJoiDel,
  apiObjects,
  controllerList
};
