'use-strict';
import UnitData from 'UnitData';
const fs = require('fs');

if (process.argv.length < 4) {
  console.log('Need to input filenames (UnitData.json & Text2) Text2.txt must be UTF8');
  process.exit(1);
}

let filename = process.argv[2];
fs.readFile(filename, 'utf8', addUnitData);

function addUnitData(err, data) {
  console.log(data);
  console.log(UnitData);
}

