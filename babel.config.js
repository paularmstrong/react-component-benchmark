'use strict';

const options = {};
if (process.env.BUILD_TARGETS && process.env.BUILD_TARGETS !== 'defaults') {
  options.targets = { [process.env.BUILD_TARGETS]: true };
}

module.exports = {
  presets: [['@babel/preset-env', options], '@babel/preset-react', '@babel/preset-flow'],
  plugins: ['@babel/plugin-proposal-class-properties'],
};
