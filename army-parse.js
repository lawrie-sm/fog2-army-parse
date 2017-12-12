'use-strict';
const fs = require('fs');

if (process.argv.length < 3) {
  console.log('Need to input filename');
  process.exit(1);
}

let filename = process.argv[2];

fs.readFile(filename, 'utf8', parseArmyList);

function parseArmyList(err, data) {
  if (err) throw err;
  console.log('OK: ' + filename);
  console.log(data)
}