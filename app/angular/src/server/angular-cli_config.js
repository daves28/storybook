const path = require('path');
const fs = require('fs');

const logger = console;

export function isAngularCliInstalled() {
  try {
    require.resolve('@angular/cli');
    return true;
  } catch (e) {
    return false;
  }
}

export function getAngularCliWebpackConfigOptions(dirToSearch, appIndex = 0) {
  const fname = path.join(dirToSearch, '.angular-cli.json');
  if (!fs.existsSync(fname)) {
    return null;
  }
  const cliConfig = JSON.parse(fs.readFileSync(fname, 'utf8'));
  if (!cliConfig.apps || !cliConfig.apps.length) {
    throw new Error('.angular-cli.json must have apps entry.');
  }
  const appConfig = cliConfig.apps[appIndex];

  // FIXME dummy value
  const cliWebpackConfigOptions = {
    projectRoot: dirToSearch,
    appConfig,
    buildOptions: {
      outputPath: 'outputPath',
    },
    supportES2015: false,
  };

  return cliWebpackConfigOptions;
}

export function applyAngularCliWebpackConfig(baseConfig, cliWebpackConfigOptions) {
  if (!cliWebpackConfigOptions) return baseConfig;

  if (!isAngularCliInstalled()) {
    logger.info('=> Using base config because @angular/cli is not installed.');
    return baseConfig;
  }

  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  const ngcliConfigFactory = require('@angular/cli/models/webpack-configs');

  let cliCommonConfig;
  let cliStyleConfig;
  try {
    cliCommonConfig = ngcliConfigFactory.getCommonConfig(cliWebpackConfigOptions);
    cliStyleConfig = ngcliConfigFactory.getStylesConfig(cliWebpackConfigOptions);
  } catch (e) {
    logger.warn('=> Failed to get angular-cli webpack config.');
    return baseConfig;
  }
  logger.info('=> Get angular-cli webpack config.');

  // Don't use storybooks .css rules because we have to use .css rules created by @angualr/cli
  // because @angular/cli created has include/exclude rules of global .css files.
  const styleRules = baseConfig.module.rules.filter(
    rule => !rule.test || rule.test.toString() !== '/\\.css$/'
  );

  // cliStyleConfig.entry adds global style files to the webpack context
  const entry = {
    ...baseConfig.entry,
    ...cliStyleConfig.entry,
  };

  const mod = {
    ...baseConfig.module,
    rules: [...cliStyleConfig.module.rules, ...styleRules],
  };

  // We use cliCommonConfig plugins to serve static assets files.
  const plugins = [...cliStyleConfig.plugins, ...cliCommonConfig.plugins, ...baseConfig.plugins];

  return {
    ...baseConfig,
    entry,
    module: mod,
    plugins,
  };
}
