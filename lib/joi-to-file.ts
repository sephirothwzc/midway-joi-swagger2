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
export const joiTest = (controllerList: IClassIn[], apiName: string, options: WrapperOptions): string | boolean => {
  const citem = controllerList.find(p => p.api === apiName);
  if (!citem) {
    return false;
  }
  return templateTest(citem, options);
};

export const joiInterface = async (controllerList: IClassIn[], apiName: string, options: WrapperOptions): Promise<string | boolean> => {
  const citem = controllerList.find(p => p.api === apiName);
  if (!citem) {
    return false;
  }
  return templateInterface(citem, options);
};
