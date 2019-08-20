/*
 * @Author: 吴占超
 * @Date: 2019-07-24 20:21:16
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-07-29 14:41:05
 */
import * as _ from 'lodash';
import { IClassIn, WrapperOptions } from './interface';

const templateTest = (controller: IClassIn, options: WrapperOptions) => {
  const inlist: string[] = [];
  const outlist: string[] = [];

  const actionStr = _.chain(controller.actions)
    .map(p => {
      // 判断参数
      let param = '';
      if (p.body) {
        inlist.push(`S${_.upperFirst(_.camelCase(p.summary))}In`);
        outlist.push(`S${_.upperFirst(_.camelCase(p.summary))}Out`);
        param = `
    const { swagger as schema } = j2s(S${_.upperFirst(
      _.camelCase(p.summary)
    )}In);
    const paramMock = mock(schema as any);
    `;
      }
      const sendPath = `${controller.path}/${p.path}`.replace('//', '/');
      const auth = p.auth
        ? `.set('${_.get(
            options,
            'swaggerOptions.securityDefinitions.apikey.name'
          )}',token)`
        : '';
      return `
  /**
   * ${p.description}
   */
  it('${p.method} ${p.path}', async () => {
    ${param}
    const result = await app
      .httpRequest()
      .${p.method}('${sendPath}')
      ${param ? `.send(paramMock)` : ''}
      ${auth};
    assert(result.status === 200);
    assert(result.body);
    const val = await S${_.upperFirst(
      _.camelCase(p.summary)
    )}Out.validate(result.body);
    assert(!val.error);
  });`;
    })
    .value().join(`
  `);

  return `
import { app, assert } from 'midway-mock/bootstrap';
import { findToken } from '../utils/auth-cache';
import { ${inlist.join(',')},${outlist.join(
    ','
  )} } from '../../../src/lib/schemas/${_.kebabCase(controller.api)}';
import { mock } from 'mock-json-schema';
// import mocksApi from '../../mocks/${_.kebabCase(controller.api)}';
const j2s = require('joi-to-swagger');

let token = undefined;

describe('test/app/controller/${_.kebabCase(controller.api)}.test.ts', () => {
  before(async () => {
    token = await findToken(app);
    // mocksApi(app);
  });
  ${actionStr}
});
`;
};
export default templateTest;
