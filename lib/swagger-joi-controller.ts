/*
 * @Author: 吴占超
 * @Date: 2019-06-16 10:25:21
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-07-03 16:22:11
 */

import { controller, get, post, put, del } from 'midway';
import * as _ from 'lodash';
import { IApiObject, IMethodIn, IClassIn } from './interface';
import * as j2s from 'joi-to-swagger';
import { addSchema, controllerSchema } from './joi-router';

// import { IApiObject } from './interface';
/**
 * used for building swagger docs object
 * 属性[controller]：[apiobject]
 */
const apiObjects = {};

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
  controllerSchema(paramIn.api, paramIn.path);
  return controller(convertPath(paramIn.path), paramIn.routerOptions);
};

const allSet = (paramIn: IMethodIn, method: string) => {
  const key = `${paramIn.api}-${method}-${paramIn.path.replace('/', '_')}`;

  _addToApiObject(key, apiObjects, {
    api: paramIn.api,
    tags: [paramIn.api],
    method,
    path: paramIn.path,
    summary: paramIn.summary,
    description: paramIn.description,
    pathParams: _paramsList(paramIn.pathParams, 'path'),
    query: _paramsList(paramIn.query, 'query'),
    body: _paramsBody(paramIn.body),
    formData: _paramsList(paramIn.formData, 'formData'),
    security: _auth(paramIn.auth),
    responses: _responsesBody(paramIn.responses)
  });
  const realPath = convertPath(paramIn.path);
  addSchema(`[${paramIn.api}]${realPath}-[${method}]`.replace('//', '/'), {
    pathParams: paramIn.pathParams,
    query: paramIn.pathParams,
    body: paramIn.body,
    formData: paramIn.formData
  });
  return realPath;
};

const SwaggerJoiGet = (paramIn: IMethodIn) => {
  const realPath = allSet(paramIn, 'get');
  return get(realPath, paramIn.routerOptions);
};

const SwaggerJoiPost = (paramIn: IMethodIn) => {
  const realPath = allSet(paramIn, 'post');
  return post(realPath, paramIn.routerOptions);
};

const SwaggerJoiPut = (paramIn: IMethodIn) => {
  const realPath = allSet(paramIn, 'put');
  return put(realPath, paramIn.routerOptions);
};

const SwaggerJoiDel = (paramIn: IMethodIn) => {
  const realPath = allSet(paramIn, 'del');
  return del(realPath, paramIn.routerOptions);
};

export {
  SwaggerJoiController,
  SwaggerJoiGet,
  SwaggerJoiPost,
  SwaggerJoiPut,
  SwaggerJoiDel,
  apiObjects
};
