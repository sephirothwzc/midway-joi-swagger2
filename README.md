### 关于 swagger joi

项目地址：
https://github.com/sephirothwzc/midway-joi-swagger2

遗留问题：
egg midway 不能获取到动态路由的原始路由 比如 /test2/3333 无法获取到 /test2/:id 如果有知道的大大，请指点小弟。谢谢！🙏

- auth 需要对应到全局设置
- 参数：pathParams、body、query、formData（不推荐）
- https://github.com/hapijs/joi
- https://github.com/Twipped/joi-to-swagger#readme

感谢：
https://github.com/Cody2333/egg-swagger-decorator

使用说明：

1. app.ts 绑定 swagger 初始化配置（auth）
2. 访问地址 [根目录]/swagger-html

```app.ts
import { wrapper } from 'midway-joi-swagger2';
module.exports = (app: any) => {
  // 配置文件建议从config读取
  wrapper(app, {
    title: 'foo',
    version: 'v1.0.0',
    description: 'bar'
  });

  ......
```

配置示例：
config.local.ts

```
export const joiSwagger = {
  title: 'Api平台',
  version: 'v1.0.0',
  description: '开发环境文档',
  swaggerOptions: {
    securityDefinitions: {
      apikey: {
        type: 'apiKey',
        name: 'servertoken',
        in: 'header'
      }
    }
  }
};
```

示例：

```
import { provide, Context, config, plugin } from 'midway';
import {
  SwaggerJoiController as sjc,
  SwaggerJoiGet as sjg,
  SwaggerJoiPost as sjp
} from 'midway-joi-swagger2';
import * as joi from 'joi';
import { test2 } from '../../lib/schemas/home';

@provide()
@sjc({ path: '/', api: 'home' })
export class HomeController {
  @sjg({
    path: '/',
    api: 'home',
    summary: 'index',
    description: 'Welcome to word'
  })
  async index(ctx: Context) {
    ctx.body = `Welcome to word!`;
  }

  @sjg({
    path: '/test/{id}',
    api: 'home',
    summary: 'test',
    pathParams: {
      id: joi
        .string()
        .required()
        .max(10)
        .description('测试id')
    },
    auth: 'servertoken',
    routerOptions: {
      routerName: '/test/id'
    }
  })
  async test(ctx: Context) {
    ctx.body = ctx.params.id;
  }

  @sjp({
    path: '/test2',
    api: 'home',
    summary: 'test2',
    body: test2,
    auth: 'token'
  })
  async test2(ctx: Context) {
    ctx.body = ctx.request.body;
  }
}

// ../../lib/schemas/home
import * as joi from 'joi';
export const test2 = joi.object().keys({
  username: joi
    .string()
    .required()
    .description('用户名'),
  age: joi
    .number()
    .min(10)
    .max(90)
    .description('年龄')
});
```

中间件

```
import * as joi from 'joi';
import * as _ from 'lodash';
const joiValidate = (param: any, schema: any) => {
  return new Promise((resolve, reject) => {
    !schema && resolve({ body: 'not schema' });
    joi.validate(param, schema, (err, value) => {
      if (err) {
        reject(err);
      }
      resolve(value);
    });
  });
};

module.exports = () => {
  return async function swaggerJoi(ctx, next) {
    const key = `${ctx.path}-[${_.toLower(ctx.request.method)}]`;
    if (!ctx.app.joiSchemas || !ctx.app.joiSchemas[key]) {
      return next();
    }
    const schema = ctx.app.joiSchemas[key];
    await joiValidate(ctx.request.body, schema.body)
      .then(result => {
        return joiValidate(ctx.query, schema.query);
      })
      .then(result => {
        return joiValidate(ctx.params, schema.pathParams);
      })
      .then(result => {
        return joiValidate(ctx.request.body, schema.formData);
      })
      .catch(err => {
        return ctx.throw(422, JSON.stringify(err));
      });
    return next();
  };
};

```

ts 项目
yarn build
npm publish
