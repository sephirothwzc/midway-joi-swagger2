/*
 * @Author: 吴占超
 * @Date: 2019-06-16 19:11:39
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-06-18 14:08:35
 */
import { KoaMiddleware } from 'midway';

export interface swaggerConfig {
  title: string;
  description: string;
  version: string;
  prefix: string;
  swaggerOptions: any;
}

export interface WrapperOptions {
  title?: string;
  description?: string;
  version?: string;
  prefix?: string;
  swaggerOptions?: any;
  swaggerJsonEndpoint?: string;
  swaggerHtmlEndpoint?: string;
  makeSwaggerRouter?: boolean;
  [param: string]: any;
}

export interface IApiObject {
  /**
   * controllerName
   */
  api: string;
  security?: any;
  tags: string[];
  method?: string;
  path?: string;
  pathParams?: any;
  query?: any;
  body?: any;
  formData?: any;
  summary?: string;
  description?: string;
  responses?: IResponse;
}

export interface IResponse {
  [name: number]: any;
}

export interface IMethodIn {
  path: string;
  routerOptions?: {
    routerName?: string;
    middleware?: Array<string | KoaMiddleware>;
  };
  pathParams?: any;
  query?: any;
  body?: any;
  formData?: any;
  api: string;
  summary: string;
  description?: string;
  responses?: IResponse;
  auth?: string | string[];
}

export interface IClassIn {
  path: string;
  routerOptions?: { middleware: Array<string | KoaMiddleware> };
  /**
   * controllerName
   */
  api: string;
  summary?: string;
  description?: string;
}
