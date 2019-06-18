/*
 * @Author: 吴占超
 * @Date: 2019-06-16 19:31:10
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-06-18 20:33:57
 * 生成swagger json doc
 */
import * as _ from 'lodash';
import { WrapperOptions, IResponse } from './interface';
import createInit from './swagger-template';

// const tagList = [];
/**
 * 配凑swagger json
 * @param options
 * @param apiObjects
 */
const swaggerJSON = (options: WrapperOptions, apiObjects: any) => {
  const {
    title = 'API DOC',
    description = 'API DOC',
    version = '1.0.0',
    prefix = '',
    swaggerOptions = {}
  } = options;

  const resultJSON = createInit(title, description, version, swaggerOptions);

  _.chain(apiObjects)
    .forEach(value => {
      const { method } = value;
      let { path } = value;
      // path = getPath(prefix, path); // 根据前缀补全path
      path = `${prefix}${path}`.replace('//', '/');
      const summary = _.get(value, 'summary', '');
      const apiDescription = _.get(value, 'description', summary);
      const responses: IResponse = _.get(value, 'responses', {
        200: {
          description: 'success'
        }
      });
      const {
        query = [],
        pathParams = [],
        body = [],
        tags,
        formData = [],
        security
      } = value;
      const parameters = [...pathParams, ...query, ...formData, ...body];

      if (!resultJSON.paths[path]) {
        resultJSON.paths[path] = {};
      }

      // add content type [multipart/form-data] to support file upload
      const consumes =
        formData.length > 0 ? ['multipart/form-data'] : undefined;

      resultJSON.paths[path][method] = {
        consumes,
        summary,
        description: apiDescription,
        parameters,
        responses,
        tags,
        security
      };
    })
    .value();
  return resultJSON;
};

export default swaggerJSON;
