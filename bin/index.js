#!/usr/bin/env node

const yargs = require("yargs");

const options = yargs
 .usage("Usage: -n <name> -l <lastName>")
 .option("n", { alias: "name", describe: "Your name", type: "string", demandOption: true })
 .option("l", { alias: "lastName", describe: "Your last name", type: "string", demandOption: true })
 .argv;

 const greeting = `Hello, ${options.name} ${options.lastName}!`;

if (options.name == 'zalkar' && options.lastName == 'ziiaidin') {
    console.log(greeting);
} else {
    console.log("Wrong credentials!");
    process.exit(1);
}


