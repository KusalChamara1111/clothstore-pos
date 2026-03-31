const fs = require('fs');
const content = fs.readFileSync('c:/Users/kusal/Desktop/Clothstore_pos/js/app.js', 'utf8');
let openCount = 0;
let inString = false;
let stringChar = '';
let inComment = false;
let inMultilineComment = false;

let lines = content.split('\n');
lines.forEach((line, i) => {
    inComment = false;
    for (let j = 0; j < line.length; j++) {
        let char = line[j];
        let nextChar = line[j + 1];

        if (inMultilineComment) {
            if (char === '*' && nextChar === '/') {
                inMultilineComment = false;
                j++;
            }
            continue;
        }

        if (inComment) continue;

        if (inString) {
            if (char === '\\') { j++; continue; }
            if (char === stringChar) inString = false;
            continue;
        }

        if (char === '/' && nextChar === '/') { inComment = true; continue; }
        if (char === '/' && nextChar === '*') { inMultilineComment = true; j++; continue; }

        if (char === "'" || char === '"' || char === '`') {
            inString = true;
            stringChar = char;
            continue;
        }

        if (char === '{') openCount++;
        if (char === '}') openCount--;

        if (openCount < 0) {
            console.log(`Unmatched closing brace at line ${i + 1}: ${line.trim()}`);
            openCount = 0;
        }
    }
});
console.log(`Final open count: ${openCount}`);
