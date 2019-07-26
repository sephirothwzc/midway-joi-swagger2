/*
 * @Author: 吴占超
 * @Date: 2019-07-24 20:21:16
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-07-25 16:51:59
 */
import * as _ from 'lodash';
import { IClassIn, WrapperOptions, IMethodIn } from './interface';
import { compile } from 'json-schema-to-typescript';
import { JSONSchema4 } from 'json-schema';
import * as j2s from 'joi-to-swagger';

const createInterface = async (param: any, name: string) => {
  if (!param) {
    return '';
  }
  const { swagger } = j2s(param);
  return compile((swagger as JSONSchema4), name);
};

const templateInterface = async (controller: IClassIn, options: WrapperOptions) => {
  const inlist = [];
  const outlist = [];

  const actionStr = _.chain(controller.actions).map(async p => {
    // 判断参数
    let param = '';
    let interfaceList = `
${await createInterface(p.body, `I${_.upperFirst(_.camelCase(p.summary))}In`)}
    `;
    interfaceList += `
${await createInterface(p.pathParams, `I${_.upperFirst(_.camelCase(p.summary))}In`)}
    `;
    interfaceList += `
${await createInterface(p.query, `I${_.upperFirst(_.camelCase(p.summary))}In`)}
    `;
    interfaceList += `
${await createInterface(p.responses, `I${_.upperFirst(_.camelCase(p.summary))}Out`)}
    `;
    return interfaceList;
  }).value();
};

export default templateInterface;
