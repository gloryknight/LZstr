const { Lc, Ld } = require('../LZstr.js');
const { performance } = require('perf_hooks');

// const value = "hi there";
const value = require("fs").readFileSync("README.md").toString();
const startTime = performance.now();
for (let i=0;i<100;i++){Ld(Lc(value))}
const endTime = performance.now();
console.log(`Call took ${endTime - startTime} milliseconds`);
console.log("original:", value.length, "compressed:", Lc(value).length)
console.log(0.001*100*value.length/(endTime - startTime), "Mb/s",  "ratio:",value.length/Lc(value).length)
