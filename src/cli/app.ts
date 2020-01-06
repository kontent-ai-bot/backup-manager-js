#!/usr/bin/env node
const yargs = require('yargs');


const argv = yargs['argv'];

// config
const projectId = argv.projectId;

if (!projectId) {
  throw Error(`Please provide project id using 'projectId' argument`);
}

// start


