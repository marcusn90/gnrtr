#!/usr/bin/env node

const commander = require('commander');
const chalk = require('chalk');

const fs = require('fs');

const defaults = {
    configFile: 'gnrtr.config.json'
};

commander
    .option('-c, --config <filename>', 'Specify config file');
// commander
//     .command('add <group_name>')
//     .action( function ( groupName ) {
//         console.log(groupName)
//     })
    
commander.parse(process.argv);

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
        // console.log(data);

        try {
            let cObj = JSON.parse(data);
            processConfig(cObj);
        } catch ( err ) {
            console.log(err)
        }

        fs.close(fd);
    });
});

function processConfig ( cObj ) {
    console.log(cObj);

    if ( typeof cObj.groups !== 'undefined' ) {
        cObj.groups.map( g => {
            const parts = g.split(' as ');

            return parts.length > 1 ? parts[1] : parts[0];
        }).forEach( gNameArg => {
            console.log(gNameArg);
            commander
                .command( `${gNameArg} <group_name>` )
                .action( function ( groupName ) {
                    console.log(`generate ${groupName} using conf:`);
                    console.log(cObj.group_details[gNameArg]);
                })
        });
    }

    commander.parse(process.argv)

    // console.log(process.argv);
}