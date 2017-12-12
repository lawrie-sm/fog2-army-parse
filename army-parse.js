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
let output = [];

function parseArmyList(err, data) {
  if (err) throw err;
  let lines = data.split('\r\n');
  lines.forEach(parseLine);
  console.log(output);
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
        output.push({identifier: chunkName});
        currChunk = output[output.length - 1];
        
        return (0);

      } else {
        console.log('ERROR on line ' + lineNo + ' no enclosing \']\'')
        return (0);
      }
    } else if (currChunk) {

      let words = line.split(' ');
      if (words[0] === 'SORTNAME') {
        currChunk.name = words[1];
      }

    }

  }
  
}