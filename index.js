#!/usr/bin/env node

const commander = require('commander');
const chalk = require('chalk');

const fs = require('fs');
const mkdirp = require('mkdirp')

const defaults = {
    configFile: 'gnrtr.config.json'
};

commander
    .option('-c, --config <filename>', 'Specify config file')
    .option('-p --path <path>', 'Specify start path');
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
        }).forEach( groupKey => {
            // console.log(groupKey);
            commander
                .command( `${groupKey} <group_name>` )
                .action( function ( groupName ) {
                    createFiles(getFilesToGenerate(cObj, groupKey, groupName));
                });
        });
    }

    commander.parse(process.argv)

    // console.log(process.argv);
}

function getFilesToGenerate ( cObj, groupKey, groupName ) {
    let files = [];

    if ( cObj['group_details'] && cObj['group_details'][groupKey] ) {
        let groupConf = cObj['group_details'][groupKey];
        let hasExtend = groupConf.extend && [].concat(groupConf.extend).length;

        if ( hasExtend ) {
            [].concat(groupConf.extend).forEach( gKey => {
                if ( cObj['group_details'][gKey] && cObj['group_details'][gKey]['files'] ) {
                    files = files.concat(cObj['group_details'][gKey]['files']);
                }
            });
        }

        files = files.concat(groupConf['files'])
            .map( fileName => fileName.replace('<group_name>', groupName));
    }

    console.log('Files:');
    console.log(files);

    return files;
}

function createFiles ( files ) {
    
    console.log(`Path: ${commander.path}`);

    let { path } = commander;

    if ( commander.path ) {
        mkdirp('./' + path);
    }

    [].concat(files).forEach(
        fName => {
            let file = './' + (path ? `${path}/` : '') + fName;

            console.log('file: ' + file)

            fs.writeFile(
                file,
                `/* File ${file} \ngenerated by gnrtr*/`,
                (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log('The file has been saved!');
                }
            );

        }
    );
    
}