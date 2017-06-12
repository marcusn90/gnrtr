#!/usr/bin/env node

const commander = require('commander');
const chalk = require('chalk');

const defaults = {
    configFile: 'gnrtr.json'
};

commander
    .option('-c, --config <filename>', 'Specify config file')
    .parse(process.argv);

let configFile = commander.config || defaults.config;
console.log(`Config file: ${chalk.bold.yellow( configFile )}`);