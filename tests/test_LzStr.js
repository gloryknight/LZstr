const { Lc, Ld } = require('../LZstr.js');
const assert = require('assert');
//eval.apply(global, [require("fs").readFileSync("LZstr.js").toString()]);

const originalString = "Your string here...";

// Compress
const compressedString = Lc(originalString);
// compressedString: "⚇낮ӠЌဥ胬๥Xᓂ堝ŀ"}

// Be carefull: Direct output from Lc will contain characters that are problematic in certain contexts (like URLs or HTML)
// Store or transfer compressedString in a UTF-16 compatible way.

// Later or on another side:
const new_originalString = Ld(compressedString);
assert(new_originalString === originalString);
