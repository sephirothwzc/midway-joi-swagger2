/*
 * @Author: 吴占超
 * @Date: 2019-06-16 20:17:43
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-06-18 18:17:11
 * 初始化对象默认值合并
 */

/**
 * init swagger definitions
 */
export default (
  title: string,
  description: string,
  version: string,
  options = {}
) =>
  Object.assign(
    {
      info: { title, description, version },
      paths: {},
      responses: {}
    },
    {
      definitions: {},
      tags: [],
      swagger: '2.0',
      securityDefinitions: {
        Token: {
          type: 'apiKey',
          in: 'header',
          name: 'token'
        }
      }
    },
    options
  );
