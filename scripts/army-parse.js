/* 

Parses FoG2 army list from and additional data ("Text2") from txt

*/

'use-strict';
const fs = require('fs');

if (process.argv.length < 4) {
  console.log('Need to input filenames (ArmyList.txt & Text2_utf8.txt) Text2 must be utf8');
  process.exit(1);
}

let filename = process.argv[2];
let txt2filename = process.argv[3];
fs.readFile(filename, 'utf8', parseArmyList);


let isFirstChunk = true;
let chunkName = '';
let currChunk = {};
let currUnitI = -1;
let output = [];

function parseArmyList(err, data) {
  if (err) throw err;
  let lines = data.split('\r\n');
  lines.forEach(parseLine); //Adds to output
  fs.readFile(txt2filename, 'utf8', addInfoFromTxt2ToOutput); //Updates output with text info and creates json
}

function parseLine(line, lineNo, lines) {
  
  //Remove comments and empty lines
  let captureComment = /((\/\/)).*$/gm;
  line = line.replace(captureComment, '');
  line = (line === ' ') ? '' : line;

  if (line) {

    //Check for army tag
    if (line[0] === '[') {
      if (line[line.length - 1] === ']') {
        
        // Check if this is the first chunk (potluck) and skip it
        if (isFirstChunk) {
          isFirstChunk = false;
          return (0)
        }

        let captureTagName = /\[(.*)\]/g;
        let chunkName = captureTagName.exec(line)[1];
        output.push({identifier: chunkName, units: []});
        currChunk = output[output.length - 1];
        
        return (0);

      } else {
        console.log('ERROR on line ' + lineNo + ' no enclosing \']\'')
        return (0);
      }
    } else if (currChunk) {
      let words = line.split(' ');
      parseWords (words);
    }

  }
  
}

function parseWords (words) {

  if (words[0] === 'YEARS') {

    /*
    Must subtract 3000 as the game start date is 3000BC
    a negative number is BC, a positive one is AD.
    */

    currChunk.startDate = parseInt(words[1]) - 3000;
    currChunk.endDate = parseInt(words[2]) - 3000;

  } else if (words[0] === 'DEPLOYMENT') {

    currChunk.deploymentStyle = words[1];

  } else if (words[0] === 'MAPSET') {

    currChunk.map = words[1];

  } else if (words[0] === 'INTRO') {
    currChunk.introIdentifier = words[1];
  } else {

    let captureUnitID = /UNIT_([0-9])/g;
    let unitMatch = captureUnitID.exec(words[0]);
    if (unitMatch) {
      currUnitI = parseInt(unitMatch[1]);
      currChunk.units[currUnitI] = {
        name: words[1],
        min: -1,
        max: -1 };
      return (0);
    }

    let captureUnitRange = /(MIN|MAX)_([0-9])/g;
    let rangeMatch = captureUnitRange.exec(words[0]);
    if (rangeMatch) {
      let value = parseInt(words[1]);
      let unitI = parseInt(rangeMatch[2]);
      let rangeName = rangeMatch[1].toLowerCase();
      currChunk.units[unitI][rangeName] = value;
      return (0);
    }
  }
}

function addInfoFromTxt2ToOutput(err, data) {
  let lines = data.split('\r\n');
  lines.forEach((line) => {
  if (line.toLowerCase().includes('ids_army_')) {
    if (!(line.toLowerCase().includes('intro'))) {
      let captureID = /IDS_ARMY_(.*?),(.*),/g;
      let match = captureID.exec(line);
      let thisArmyI = output.findIndex((o) => o.identifier === match[1]);
      if (output[thisArmyI]) output[thisArmyI].fullName = match[2].replace(/"/g, '').trim();
      } else if ((line.toLowerCase().includes('intro'))) {
        let captureID = /(.*?),(.*),/g;
        let match = captureID.exec(line);
        let thisArmyI = output.findIndex((o) => o.introIdentifier === match[1]);
        if (output[thisArmyI]) output[thisArmyI].intro = match[2].replace(/"/g, '').trim();
      }
    }
  });
  outputJSON();
}

function outputJSON() {
let outputName = `${filename.slice(0, filename.indexOf('.'))}.json`;
 fs.writeFile(outputName, JSON.stringify(output));
}