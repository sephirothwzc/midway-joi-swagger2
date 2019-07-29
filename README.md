### 关于 swagger joi

项目地址：
https://github.com/sephirothwzc/midway-joi-swagger2

- auth 需要对应到全局设置
- 参数：pathParams、body、query、formData（不推荐）
- https://github.com/hapijs/joi
- https://github.com/Twipped/joi-to-swagger#readme

感谢：
https://github.com/Cody2333/egg-swagger-decorator

使用说明：

1. app.ts 绑定 swagger 初始化配置（auth）
2. 访问地址 [根目录]/swagger-html
3. /interface/:api
4. /unittest/:api
5. api='controllerName'
6. summary='actionName'

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
  test:true,
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

### 中间件

中间件已经集成在包内部，默认启动不允许关闭。

ts 项目
yarn build
npm publish
