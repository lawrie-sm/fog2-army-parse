'use-strict';
const fs = require('fs');

if (process.argv.length < 4) {
  console.log('Need to input filenames (quads_s.json & Text2.txt) Text2.txt must be UTF8');
  process.exit(1);
}

let dataFilename = process.argv[2];
let textFilename = process.argv[3];
let output = [];

fs.readFile(dataFilename, 'utf8', parseJSON);

function parseJSON(err, data) {
  let jsonData = JSON.parse(data);
  output = jsonData;
  //console.log(jsonData);
  fs.readFile(textFilename, 'utf8', addUnitData);
}

function addUnitData (err, data) {
  let lines = data.split('\r\n');
  lines.forEach((line) => {
    if (line.toLowerCase().includes('unitname')) {
      let captureIDandName = /IDS_UNITNAME(.*?),(.*),/g;
      let match = captureIDandName.exec(line);
      if (match) {
        let thisUnitI = output.findIndex((u) => u.ID === parseInt(match[1]));
        if (output[thisUnitI]) output[thisUnitI].fullName = match[2].replace(/"/g, '').trim();
      }
    } else if (line.toLowerCase().includes('unitinfo')) {
      let captureIDandInfo = /IDS_UNITINFO(.*?),(.*),/g;
      let match = captureIDandInfo.exec(line);
      if (match) {
        let thisUnitI = output.findIndex((u) => u.ID === parseInt(match[1]));
        if (output[thisUnitI]) output[thisUnitI].info = match[2].replace(/"/g, '').trim();
      }
    }
  });

  outputJSON();
}


function outputJSON() {
  let outputName = `UnitData.json`;
   fs.writeFile(outputName, JSON.stringify(output));
  }