#!/usr/bin/env node

const commander = require('commander');
const chalk = require('chalk');

const fs = require('fs');

const defaults = {
    configFile: 'gnrtr.config.json'
};

commander
    .option('-c, --config <filename>', 'Specify config file')
    .parse(process.argv);

let configFile = commander.config || defaults.configFile;
console.log(`Config file: ${chalk.bold.yellow( configFile )}`);

fs.open(configFile, 'r', ( err, fd ) => {
    if ( err ) {
        if ( err.code === 'ENOENT' ) {
            console.log(chalk.red(`File ${configFile} does not exist`));
            return;
        }

        throw err;
    }

    fs.readFile(fd, 'utf-8', ( err, data ) => {
        if ( err ) {
            fs.close(fd);

            throw err;
        }

        console.log(chalk.green('File content:'));
        console.log(data);

        fs.close(fd);
    });
})