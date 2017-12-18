'use-strict';
const fs = require('fs');

if (process.argv.length < 3) {
  console.log('Need to input filename');
  process.exit(1);
}

let filename = process.argv[2];
fs.readFile(filename, 'utf8', parseArmyList);


let isFirstChunk = true;
let chunkName = '';
let currChunk = {};
let currUnitI = -1;
let output = [];

function parseArmyList(err, data) {
  if (err) throw err;
  let lines = data.split('\r\n');
  lines.forEach(parseLine);
  outputJSON();
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
  
  if (words[0] === 'SORTNAME') {

    currChunk.name = words[1];

  } else if (words[0] === 'YEARS') {

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

function outputJSON() {
let outputName = `${filename.slice(0, filename.indexOf('.'))}.json`;
 fs.writeFile(outputName, JSON.stringify(output));
}