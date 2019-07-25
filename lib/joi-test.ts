import { IClassIn, WrapperOptions } from "./interface";
import templateTest from './template-test';

/*
 * @Author: 吴占超
 * @Date: 2019-07-24 17:50:13
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-07-25 11:52:24
 * 生成joi-swagger test
 */
const joiTest = (controllerList: IClassIn[], apiName: string, options: WrapperOptions) => {
  return templateTest(controllerList.find(p => p.api === apiName), options);
};
export default joiTest;
