/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1669029865627_8535';

  // add your middleware config here
  config.middleware = [
    'errorHandler',
  ];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  config.mongoose = {
    url: 'mongodb://127.0.0.1/youtobe_clone', // 定义数据库
    options: {
      useUnifiedTopology: true,
    },
    // mongoose global plugins, expected a function or an array of function and options
    plugins: [],
  };

  config.security = {
    csrf: {
      enable: false, // 关闭csrf安全校验
    },
  };

  config.jwt = {
    secret: '988a2a13-3011-41e5-ad84-274bd4cc22ee',
    expiresIn: '1d',
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  return {
    ...config,
    ...userConfig,
  };
};
