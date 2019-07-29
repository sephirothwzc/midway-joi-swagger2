import { IClassIn, WrapperOptions } from "./interface";
import templateTest from './template-test';
import templateInterface from './template-interface';

/*
 * @Author: 吴占超
 * @Date: 2019-07-24 17:50:13
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-07-25 11:52:24
 * 生成joi-swagger test
 */
export const joiTest = (controllerList: IClassIn[], apiName: string, options: WrapperOptions) => {
  return templateTest(controllerList.find(p => p.api === apiName), options);
};

export const joiInterface = (controllerList: IClassIn[], apiName: string, options: WrapperOptions) => {
  const citem = controllerList.find(p => p.api === apiName);
  return templateInterface(citem, options);
};
