/*
 * @Author: 吴占超
 * @Date: 2019-06-16 18:51:56
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-06-18 20:32:58
 */
import { Application, Router } from 'midway';
import { WrapperOptions } from './interface';
import * as _ from 'lodash';
import swaggerHTML from './swagger-html';
import swaggerJSON from './swagger-json';
import { apiObjects } from './swagger-joi-controller';
import { schemas } from './joi-router';

/**
 * swagger路由注册绑定
 * @param router
 * @param options
 */
const handleSwagger = (router: Router, options: WrapperOptions) => {
  const {
    // 声明json路由
    swaggerJsonEndpoint = '/swagger-json',
    // 声明html路由
    swaggerHtmlEndpoint = '/swagger-html',
    prefix = ''
  } = options;

  // setup swagger router
  router.get(swaggerJsonEndpoint, async ctx => {
    ctx.body = swaggerJSON(options, apiObjects);
  });
  router.get(swaggerHtmlEndpoint, async ctx => {
    ctx.body = swaggerHTML(
      `${prefix}${swaggerJsonEndpoint}`.replace('//', '/')
    );
  });
};

/**
 * swagger注册
 * @param app
 * @param options
 */
const wrapper = (app: Application, options?: WrapperOptions) => {
  // 参数配置
  const opts: WrapperOptions = {
    title: 'API DOC',
    description: 'API DOC',
    version: 'v1.0.0',
    prefix: '',
    swaggerJsonEndpoint: '/swagger-json',
    swaggerHtmlEndpoint: '/swagger-html',
    makeSwaggerRouter: false
  };
  Object.assign(opts, options || {});
  const { router } = app;
  handleSwagger(router, opts);
  // joi 绑定
  app.joiSchemas = schemas;
};

export { wrapper };
