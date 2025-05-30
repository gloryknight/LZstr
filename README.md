# LZstr ✨

**Ultra-lightweight, [lz-string](https://github.com/JobLeonard/lz-string) compatible string compression for JavaScript.**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/gloryknight/LZstr.svg?style=social&label=Star)](https://github.com/gloryknight/LZstr) <!-- Replace your-username -->

LZstr provides efficient string compression with a minimal footprint, making it ideal for environments where library size is critical. It maintains binary compatibility* with the original `lz-string`'s core compression algorithm.

**Key Features:**

* **🚀 Extremely Small:** 886 bytes minified, perfect for size-constrained applications, microcontrollers, objuscation.
* **🧩 Simple API:** Just two functions: `Lc` (compress) and `Ld` (decompress).
* **🔄 `lz-string` Compatible:** (*See Compatibility Note below*) Drop-in replacement for `lz-string`.
* **📄 "JSON Focused":** Like `lz-string`, it performs well on repetitive text structures commonly found in JSON data.
* **🔧 Actively Maintained:** Bugs are addressed, and the library is kept up-to-date.
* ** MIT Licensed:** Use it freely in your projects.

Forked from https://github.com/JobLeonard/lz-string

## Why LZstr?

In scenarios like browser extensions, embedded widgets, micro-frontends, or optimizing for legacy devices, every kilobyte matters. LZstr provides a reliable compression solution without the overhead of larger libraries. While not aiming for the highest compression ratios or speeds like Brotli or zstd, it strikes a unique balance for **size-sensitive string compression tasks**.

## Installation

Include it directly into a `script` tag of your HTML (individual parts will also work):

```javascript
Lc=r=>{let e,h,t=String.fromCharCode,o=[],d=0,n=0,f=0,l=0,a=0,i={},u=!0,C=0,c=2,g=4,s=(r,e)=>{for(f=0;e>>=1;f++)d=r>>f&1|d<<1,16==++n&&(n=0,o.push(t(d)),d=0)},A=()=>{u?u=!1:s(e.v,g),null==i[C]&&(++c>=g&&(g<<=1),a=C<256?0:1,s(a,g),s(C,a?65536:256),i[C]={v:c,d:{}},u=!0),++c>=g&&(g<<=1)};for(C=r.charCodeAt(0),A(),g=4,--c,e=i[C],l=1;l<r.length;l++)C=r.charCodeAt(l),h=e.d[C],h?e=h:(A(),e.d[C]={v:c,d:{}},e=i[C]);return A(),s(2,g),d<<=16-n,o.push(t(d)),o.join("")}
```
```javascript
Ld=r=>{var h,o,e=String.fromCharCode,t=r.length,d=r.charCodeAt.bind(r),n=["","",""],a=4,f=4,u=3,i=[],C=0,c=2,l=0,s=d(0),v=16,g=1,p=()=>{for(C=l=0;l!=c;)C+=(s>>--v&1)<<l++,0==v&&(v=16,s=d(g++))};for(p(),c=8*C+8,p(),o=e(C),n[3]=o,i.push(o);g<=t;){if(c=u,p(),C<2)c=8+8*C,p(),n[f]=e(C),C=f++,0==--a&&(a=1<<u++);else if(2==C)return i.join("");h=C<n.length?n[C]:o+o.charAt(0),i.push(h),n[f++]=o+h.charAt(0),o=h,0==--a&&(a=1<<u++)}}
```

Size: 886 bytes (Lc=461 , Ld=425).

Or as a link to separate script copied from this repository:

```html
<!-- Get the minified version from the repository or a CDN -->
<script src="LZstr.min.js"></script>
<script>
  // Functions Lc and Ld are now globally available
  const compressed = Lc("Your string here...");
  console.log(compressed);
</script>
```

## Basic Usage

```javascript
// Assuming Lc and Ld are available globally by inlined code or imported

const originalString = "Your string here...";

// Compress
const compressedString = Lc(originalString);
// compressedString: "⚇낮ӠЌဥ胬๥Xᓂ堝ŀ"}

// Be carefull: Direct output from Lc will contain characters that are problematic in certain contexts (like URLs or HTML)
// Store or transfer compressedString in a UTF-16 compatible way.

// Later or on another side:
const new_originalString = Ld(compressedString);
console.log("Strings are equal", new_originalString === originalString);
// Strings are equal true
```

## Understanding the Output & Compatibility [*]

* **Output Format:** `Lc` produces a raw string containing JavaScript UTF-16 characters, potentially including high-bit-value characters (those above `\u00FF`). This raw format achieves maximum compression but can be problematic.
* **Storage/Transmission:** Storing this raw string might lead to corruption if the environment doesn't fully support UTF-16 or expects ASCII/UTF-8.
* **localStorage and websockets:** fully support UTF-16.

* **`lz-string` Compatibility:** LZstr aims for binary compatibility with the raw string output of the original `lz-string`'s core compression algorithm (typically the `compress` function or equivalent). It does *not* produce output compatible with `lz-string`'s encoded formats like `compressToBase64` or `compressToUTF16` directly. If you need compatibility with those specific functions, use the `LZstr2.js` library.

## "JSON Focused"

The term "JSON focused" is inherited from the original `lz-string` library. LZ-based algorithms naturally perform well on text data with repeating patterns, which is common in JSON structures (repeated keys, similar string values). LZstr doesn't include any specific JSON parsing logic; its effectiveness comes from the general nature of the compression algorithm on text.

## Performance

* **Library Size:** LZstr excels here. Its minimal size is its primary advantage.
* **Compression Ratio & Speed:** Expect moderate compression ratios (~3) and speeds (~5 MB/s).

Choose LZstr when the **minimal library size** is the most critical factor for string compression.

## Python version

* **Python folder:** Contains Python implementation with binary compatible compression/decompression.

## Contributing

Found a bug or have a suggestion? Please open an issue or submit a pull request! We appreciate community contributions.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/my-new-feature`).
3.  Commit your changes (`git commit -am 'Add some feature'`).
4.  Push to the branch (`git push origin feature/my-new-feature`).
5.  Open a new Pull Request.

## Alternatives
For demanding applications requiring higher compression ratios or faster processing, consider:
* **Browser Native:** [`Compression Streams API`](https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API) (for gzip/deflate, requires streams/Blobs).
* **Libraries:** [`pako`](https://github.com/nodeca/pako) (zlib port), or WASM-based libraries for Brotli/Zstandard. These offer better performance but have a larger library footprint.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Found LZstr useful? Give it a star ⭐ to show your support!
