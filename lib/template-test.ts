/*
 * @Author: 吴占超
 * @Date: 2019-07-24 20:21:16
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-07-25 16:51:59
 */
import * as _ from 'lodash';
import { IClassIn, WrapperOptions } from './interface';

const templateTest = (controller: IClassIn, options: WrapperOptions) => {
  const inlist = [];
  const outlist = [];

  const actionStr = _.chain(controller.actions).map(p => {
    // 判断参数
    let param = '';
    if (p.body) {
      inlist.push(`${_.camelCase(p.summary)}In`);
      outlist.push(`${_.camelCase(p.summary)}Out`);
      param = `
    const { swagger as schema } = j2s(${p.summary}In);
    const paramMock = mock(schema as any);
    `;
    }
    const auth = p.auth ? `.set('${_.get(options, 'swaggerOptions.securityDefinitions.apikey.name')}',token)` : '';
    return `
    /**
     * ${p.description}
     */
    it('${p.method} ${p.path}', async () => {
    ${param}
    const result = await app
      .httpRequest()
      .${p.method}('${controller.path}/${p.path}')
      ${param ? `.send(paramMock)` : ''}
      ${auth};
    assert(result.status === 200);
    assert(result.body && ${_.camelCase(p.summary)}Out.validate(result.body).error === null);
  });`;
  }).value().join(`
  `);

  return `
import { app, assert } from 'midway-mock/bootstrap';
import { findToken } from '../utils/auth-cache';
import { ${inlist.join(',')} } from '../../../src/lib/schemas/${_.kebabCase(controller.api)}';
import { ${outlist.join(',')} } from '../../../src/lib/schemas/${_.kebabCase(controller.api)}';
import { mocks } from '../../mocks/mini-app';
const j2s = require('joi-to-swagger');

let token = undefined;

describe('test/app/controller/mini-app.test.ts', () => {
  before(async () => {
    token = await findToken(app);
    mocks(app);
  });
  ${actionStr}
});
`;
};
export default templateTest;
