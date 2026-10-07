const fs = require('fs');
const content = fs.readFileSync('index.html');

// The file has triple-encoded UTF-8. The byte patterns we see are:
// For ↗ (NE arrow, U+2197, UTF-8: E2 86 97):
//   E2 86 97 -> mis-read as Latin-1 'â†—' -> UTF-8 encoded: C3 A2, E2 80 A0, C2 97
// For ↓ (down arrow, U+2193, UTF-8: E2 86 93):  
//   Actual bytes in file: C3 A2 E2 80 A0 E2 80 9C
// For ✦ (U+2726, UTF-8: E2 9C A6):
// For ✕ (U+2715, UTF-8: E2 9C 95):

// Let's find all multi-byte patterns that are clearly garbage and replace with entity refs
// Strategy: find patterns, replace bytes

// Known broken byte sequences -> replacement HTML entity (as ASCII bytes)
const patterns = [
  // C3 A2 E2 80 A0 E2 80 9C -> ↓ &#8595; (down arrow)
  // This came from: â† + " which Latin-1 bytes E2 86 93 then each byte UTF-8 encoded
  { find: Buffer.from([0xC3, 0xA2, 0xE2, 0x80, 0xA0, 0xE2, 0x80, 0x9C]), replace: Buffer.from('&#8595;') },
  // C3 A2 E2 80 A0 E2 80 99 -> ↙ or other variant
  { find: Buffer.from([0xC3, 0xA2, 0xE2, 0x80, 0xA0, 0xE2, 0x80, 0x99]), replace: Buffer.from('&#8599;') },
  // C3 A2 E2 80 A0 E2 80 9D -> ↗ NE arrow &#8599
  { find: Buffer.from([0xC3, 0xA2, 0xE2, 0x80, 0xA0, 0xE2, 0x80, 0x9D]), replace: Buffer.from('&#8599;') },
  // C3 A2 E2 80 A0 E2 80 98 -> ↖
  { find: Buffer.from([0xC3, 0xA2, 0xE2, 0x80, 0xA0, 0xE2, 0x80, 0x98]), replace: Buffer.from('&#8598;') },
  // C3 A2 E2 80 A0 E2 80 93 -> →
  { find: Buffer.from([0xC3, 0xA2, 0xE2, 0x80, 0xA0, 0xE2, 0x80, 0x93]), replace: Buffer.from('&#8594;') },
  // C3 A2 E2 80 A0 E2 80 94 -> ↔
  { find: Buffer.from([0xC3, 0xA2, 0xE2, 0x80, 0xA0, 0xE2, 0x80, 0x94]), replace: Buffer.from('&#8596;') },
  // C3 A2 E2 80 A0 C2 97 -> another arrow variant  
  { find: Buffer.from([0xC3, 0xA2, 0xE2, 0x80, 0xA0, 0xC2, 0x97]), replace: Buffer.from('&#8599;') },
  // C3 A2 E2 80 A0 C2 93 -> down arrow variant
  { find: Buffer.from([0xC3, 0xA2, 0xE2, 0x80, 0xA0, 0xC2, 0x93]), replace: Buffer.from('&#8595;') },
  // C3 A2 E2 80 A0 C2 9D -> NE arrow variant
  { find: Buffer.from([0xC3, 0xA2, 0xE2, 0x80, 0xA0, 0xC2, 0x9D]), replace: Buffer.from('&#8599;') },
  // ✦ corruption: C3 A2 C5 93 C2 A6
  { find: Buffer.from([0xC3, 0xA2, 0xC5, 0x93, 0xC2, 0xA6]), replace: Buffer.from('&#10022;') },
  // ✕ corruption (close button): C3 A2 C5 93 E2 80 A2
  { find: Buffer.from([0xC3, 0xA2, 0xC5, 0x93, 0xE2, 0x80, 0xA2]), replace: Buffer.from('&#10005;') },
  // hud-skill-exp: C3 A2 E2 82 AC E2 80 9D -> &#8599; or → 
  { find: Buffer.from([0xC3, 0xA2, 0xE2, 0x82, 0xAC, 0xE2, 0x80, 0x9D]), replace: Buffer.from('&#8599;') },
  // footer-dot bullet (•): C3 A2 E2 82 AC C2 A2 -> &bull;
  { find: Buffer.from([0xC3, 0xA2, 0xE2, 0x82, 0xAC, 0xC2, 0xA2]), replace: Buffer.from('&bull;') },
  // Also check ✕ as C3 A2 C2 9C C2 95 (old pattern)
  { find: Buffer.from([0xC3, 0xA2, 0xC2, 0x9C, 0xC2, 0xA6]), replace: Buffer.from('&#10022;') },
  { find: Buffer.from([0xC3, 0xA2, 0xC2, 0x9C, 0xC2, 0x95]), replace: Buffer.from('&#10005;') },
];

// Convert buffer to array for searching
let arr = Array.from(content);

function replacePattern(arr, find, replace) {
  const findArr = Array.from(find);
  const replaceArr = Array.from(replace);
  const result = [];
  let i = 0;
  let count = 0;
  while (i < arr.length) {
    let match = true;
    if (i + findArr.length <= arr.length) {
      for (let j = 0; j < findArr.length; j++) {
        if (arr[i + j] !== findArr[j]) { match = false; break; }
      }
    } else {
      match = false;
    }
    if (match) {
      result.push(...replaceArr);
      i += findArr.length;
      count++;
    } else {
      result.push(arr[i]);
      i++;
    }
  }
  return { arr: result, count };
}

let totalFixes = 0;
for (const { find, replace } of patterns) {
  const { arr: newArr, count } = replacePattern(arr, find, replace);
  if (count > 0) {
    console.log(`Fixed ${count}x: [${Array.from(find).map(b=>b.toString(16).padStart(2,'0')).join(' ')}] -> ${replace.toString()}`);
    totalFixes += count;
  }
  arr = newArr;
}

fs.writeFileSync('index.html', Buffer.from(arr));
console.log(`\nTotal byte-level fixes: ${totalFixes}`);
