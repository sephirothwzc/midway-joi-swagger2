/*
 * @Author: 吴占超
 * @Date: 2019-06-16 18:51:56
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-07-25 11:52:13
 */
import { Application, Router } from 'midway';
import { WrapperOptions } from './interface';
import * as _ from 'lodash';
import swaggerHTML from './swagger-html';
import swaggerJSON from './swagger-json';
import { apiObjects, controllerList } from './swagger-joi-controller';
import { joiTest, joiInterface } from './joi-to-file';
import * as str from 'string-to-stream';

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
    // 声明test路由
    swaggerTestEndpoint = '/unittest/:api',
    // 声明interface路由
    swaggerInterfaceEndpoint = '/interface/:api',
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
  if (options.test) {
    router.get(swaggerTestEndpoint, async ctx => {
      const templateString = joiTest(controllerList, ctx.params.api, options);
      if (templateString === false) {
        ctx.status = 500;
        return ctx.body = `not find [${ctx.params.api}]`;
      }
      ctx.attachment(`${_.kebabCase(ctx.params.api)}.test.ts`);
      ctx.set('Content-Type', 'application/octet-stream');
      ctx.body = str(templateString);
    });
    router.get(swaggerInterfaceEndpoint, async ctx => {
      const templateString = await joiInterface(controllerList, ctx.params.api, options);
      if (templateString === false) {
        ctx.status = 500;
        return ctx.body = `not find [${ctx.params.api}]`;
      }
      ctx.attachment(`${_.kebabCase(ctx.params.api)}.ts`);
      ctx.set('Content-Type', 'application/octet-stream');
      ctx.body = str(templateString);
    });
  }
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
};

export { wrapper };
