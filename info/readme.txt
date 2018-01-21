These scripts (army-parse, unit-info-adder) are used to assist in importing game data for the fog-2 data viewer app.


---------------------------------------------------------------------------
Game data import process
---------------------------------------------------------------------------
- Cut down squads.csv, removing unused headers and columns (can also remove unused capabilities columns e.g hand cannon)
- Convert to JSON using csvtojson
- Run a regex replace to convert string digits into ints
Find: "([0-9]+)"
Replace: $1
- Use the script to parse the ArmyList.json & Text2_utf8.txt documents
- Add unit names to the json using unit-info-adder script
- Make both jsons into js files for importation by the frontend

UNIT INFO AND NAMES
- Included in \Field of Glory II\Data\Text as "Text2.txt"