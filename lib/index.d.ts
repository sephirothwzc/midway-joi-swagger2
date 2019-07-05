import { Application } from 'midway';
import {
  WrapperOptions,
  IClassIn,
  IMethodIn,
  ISwaggerConfig
} from './interface';

/*
 * @Author: 吴占超
 * @Date: 2019-07-05 09:39:05
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-07-05 11:16:18
 */
export declare function wrapper(
  app: Application,
  options?: WrapperOptions
): void;

export declare function SwaggerJoiController(paramIn: IClassIn): ClassDecorator;
export declare function SwaggerJoiGet(paramIn: IMethodIn): MethodDecorator;
export declare function SwaggerJoiPost(paramIn: IMethodIn): MethodDecorator;
export declare function SwaggerJoiPut(paramIn: IMethodIn): MethodDecorator;
export declare function SwaggerJoiDel(paramIn: IMethodIn): MethodDecorator;
export declare const ISwaggerConfig: ISwaggerConfig;
