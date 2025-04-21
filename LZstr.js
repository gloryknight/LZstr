// Original source/documentation: http://pieroxy.net/blog/pages/lz-string/testing.html
// This file implements the LZString algorithm, version 1.4.6.
// LZString is an LZ-based compression algorithm optimized for storing strings
// efficiently, particularly in environments like localStorage.

// NOTE: This original source distribution is used for development.
// It is intended to create a minified version (LZstr.min.js) 
// where functions might be inlined for performance/size.

/**
 * Compresses an input string using the LZString algorithm.
 * @param {string} uncompressed The string to compress.
 * @returns {string} The compressed string, potentially containing non-printable characters.
 */
Lc = (uncompressed) => {

    // --- Private Properties & State Variables ---

    // Configuration
    // Using 16-bit characters (String.fromCharCode) for output stream.
    let bitsPerChar = 16;

    // Utilities
    // Cache for potential minor performance gain.
    let fromCharCode = String.fromCharCode;

    // Output Bit Stream Simulation State:
    // We simulate writing bits to an output stream which is finally joined into a string.
    // Stores the output characters (16-bit char codes) as they are filled.
    let StringStream_d = [];
    // The current bit buffer being filled.
    let StringStream_v = 0;
    // The current position (number of bits filled) in the bit buffer `StringStream_v`.
    let StringStream_p = 0;

    // loop variables - placed here for convenience during minimization
    let i=0;
    let j = 0;
    let value = 0;

    // Dictionary (Trie) & Compression State:
    // The dictionary, implemented as a Trie (nested objects). Keys are char codes.
    // `dictionary[charCode] = { v: code, d: {} }` where `v` is the numerical code for the sequence
    // ending in `charCode`, and `d` is the nested dictionary for the next character.
    let dictionary = {};
    // Flag: True if the current `node` represents a single character just added to the dictionary root.
    // This avoids writing the code for a single character immediately after adding it.
    let freshNode = true;
    // Current character code being processed.
    let c = 0;
    // The current node in the dictionary (Trie) representing the sequence matched so far.
    let node;
    // The potential next node in the dictionary based on the current char `c`.
    let nextNode;
    // The next available code to assign in the dictionary. Starts at 2 because:
    // 0: Represents a new 8-bit character code following.
    // 1: Represents a new 16-bit character code following.
    // 2: Represents the end-of-stream marker.
    // Codes 3+ represent sequences stored in the dictionary.
    let dictSize = 2;
    // Represents the dictionary capacity (a power of 2). When `dictSize` reaches this,
    // we need more bits (`numBits`) to represent the dictionary codes.
    // Starts at 4 (needs 2 bits), then 8 (3 bits), 16 (4 bits), etc.
    // Corresponds to `1 << numBits`.
    let numBitsMask = 0b100;

    // --- Helper Functions ---

    /**
     * Writes a value using a specified number of bits (`numBitsMask` actually indicates capacity)
     * to the simulated output bit stream (`StringStream_*` variables).
     * @param {number} value The numerical value to write.
     * @param {number} numBits The number of bits required to represent the current dictionary size (derived from numBitsMask).
     */
    let StringStream_s = (value, numBitsMask) => { //streamBits
        // Iterate through the bits of the value, from least significant to most significant.
        for (i = 0; numBitsMask >>= 1; i++) { // Loop based on numBits capacity
            // Prepend the bit to the current buffer `StringStream_v`.
            StringStream_v = value >> i & 1 | StringStream_v << 1;
            // If the buffer is full (contains `bitsPerChar` bits)...
            if (++StringStream_p === bitsPerChar) {
                // Reset the buffer position.
                StringStream_p = 0;
                // Add the character represented by the buffer's value to the output array.
                StringStream_d.push(fromCharCode(StringStream_v));
                // Reset the buffer value.
                StringStream_v = 0;
            }
        }
    };

    /**
     * Handles the case where the current sequence (represented by `node`) followed by
     * the current character (`c`) is *not* found in the dictionary.
     * Writes the code for the existing sequence (`node.v`) to the stream.
     * Handles adding the new character `c` to the dictionary root if it's unseen.
     * Updates dictionary size and bit requirements if needed.
     */
    let newSymbol = () => {
        // If the current `node` represents a sequence (not just a freshly added single char)...
        if (freshNode) {
            // If it was a fresh node (single char), its token (0 or 1 + char code)
            // was already written when it was added. Reset the flag.
            freshNode = false;
        } else {
            // ...write the code for that sequence to the bitstream.
            // The number of bits needed is determined by the current dictionary capacity `numBitsMask`.
            StringStream_s(node.v, numBitsMask);
        }

        // Check if the current character `c` is completely new (not even at the root of the dictionary).
        if (dictionary[c] == undefined) {
            // If the dictionary is full for the current number of bits...
            if (++dictSize >= numBitsMask) {
                // ...double the capacity, which means we need one more bit per code.
                numBitsMask <<= 1;
            }

            // Determine the token type: 0 for 8-bit char code, 1 for 16-bit.
            // Write the "new character" token (0 or 1).
            value = c < 256 ? 0 : 1;
            StringStream_s(value, numBitsMask);
            // Write the actual character code using 8 or 16 bits.
            // The number of bits here is fixed (8 or 16), not dependent on dictSize/numBitsMask.
            StringStream_s(c, value ? 0b10000000000000000 : 0b100000000); // 16 bits or 8 bits capacity

            // Add the new character to the root of the dictionary.
            // Assign it the next available code (`dictSize`).
            dictionary[c] = { v: dictSize, d: {} };
            // Mark that we just added this char, so its code shouldn't be written immediately by the next `newSymbol` call.
            freshNode = true;
        }

        // After potentially adding `c` to the root, we are about to add the sequence `node + c`.
        // Check again if the dictionary needs resizing before adding this *new sequence code*.
        if (++dictSize >= numBitsMask) {
            numBitsMask <<= 1;
        }
    };

    // --- Main Compression Logic ---

    // 1. Handle the very first character.
    c = uncompressed.charCodeAt(0);
    // It's guaranteed to be a new symbol. Add it to the dictionary and write its token(s).
    newSymbol();
    // After the first char, the initial codes 0, 1, (and potentially 3 if first char was added) are used.
    // The next code will be 3 (or 4). We need 3 bits to represent codes 0, 1, 2, 3.
    // So, set the capacity `numBitsMask` to 8 (1 << 3).
    numBitsMask = 4; // Requires 3 bits (1 << 3)
    --dictSize;
    // Note: `newSymbol` already incremented dictSize, so we don't decrement here anymore.
    // The current node represents the first character sequence.
    node = dictionary[c];

    // 2. Process the rest of the string.
    for (j = 1; j < uncompressed.length; j++) {
        c = uncompressed.charCodeAt(j); // Get the next character code.

        // Check if the current sequence (`node`) followed by the new character (`c`) exists in the dictionary.
        nextNode = node.d[c];

        if (nextNode) {
            // --- Sequence Found ---
            // Yes, the sequence `node + c` exists. Update `node` to represent this longer sequence
            // and continue to the next character in the input.
            node = nextNode;
        } else {
            // --- Sequence Not Found ---
            // The sequence `node + c` is new.

            // Call `newSymbol` to:
            // 1. Write the code for the existing sequence (`node.v`).
            // 2. Check if `c` itself is a new character (add to root, write 0/1 token + char code if needed).
            // 3. Ensure `dictSize` and `numBitsMask` are ready for the new entry.
            newSymbol();

            // Add the new sequence (`node + c`) to the dictionary.
            // It's stored under the `d` (dictionary) property of the *current* node (`node`).
            // The new sequence gets the next available code (`dictSize`).
            node.d[c] = { v: dictSize, d: {} };

            // Start the next sequence search from the root node corresponding to the single character `c`.
            node = dictionary[c];
            // `node` might be marked as `freshNode=true` if `c` was just added to the root by `newSymbol`.
        }
    }

    // 3. Handle the end of the input string.
    // The last matched sequence (`node`) hasn't been written yet.
    // Call `newSymbol` one last time to write the code for `node.v`.
    // It also handles the case where the very last character `c` might have been new to the root dictionary.
    newSymbol();

    // 4. Write the End-of-Stream marker.
    // Code `2` signifies the end of the compressed data.
    StringStream_s(2, numBitsMask);

    // 5. Flush any remaining bits in the buffer.
    // If `StringStream_p` is not 0, there are leftover bits in `StringStream_v`.
    // Shift them to the left to fill the remaining space in the 16-bit character.
    StringStream_v <<= bitsPerChar - StringStream_p;
    // Push the final character (even if partially filled).
    StringStream_d.push(fromCharCode(StringStream_v));

    // 6. Join the output characters into the final compressed string.
    return StringStream_d.join('');
};


/**
 * Decompresses a string compressed by the Lc function (LZString algorithm).
 * @param {string} compressed The compressed string.
 * @returns {string} The original uncompressed string.
 */
Ld = (compressed) => {
    // --- Private Properties & State Variables ---

    // Utilities
    // Cache for potential minor performance gain.
    let fromCharCode = String.fromCharCode;
    // Cache length.
    let length = compressed.length;
    // Efficiently get char codes from input.
    let getNextValue = compressed.charCodeAt.bind(compressed);

    // Configuration
    // Input stream uses 16-bit characters.
    let resetBits = 16;
    // Empty string constant for joining result.
    let empty = '';

    // Dictionary & Decompression State:
    // The dictionary is an array where the index is the code.
    // Initial state mimics the compressor's initial codes:
    // Index 0: Represents an 8-bit character follows.
    // Index 1: Represents a 16-bit character follows.
    // Index 2: Represents the end-of-stream marker.
    // Index 3: Will hold the first decompressed character.
    let dictionary = [empty, empty, empty];
    // Counter: Number of codes left to read before increasing the number of bits per code (`numBits`).
    // Starts at 4 because codes 0, 1, 2, 3 are initial. Next is code 4. Needs 2^2 = 4 codes total before needing 3 bits.
    let enlargeIn = 4;
    // The next available index (code) in the dictionary array. Starts at 4.
    let dictSize = 4;
    // The current number of bits used to represent a dictionary code. Starts at 3 (can represent codes 0-7).
    let numBits = 3;
    // The current sequence being processed or outputted.
    let entry;
    // An array to build the decompressed string efficiently.
    let result = [];

    // Input Bit Stream State:
    // Holds the value read from the bit stream.
    let bits = 0;
    // The number of bits to read in the current `getBits` call.
    let maxpower = 2;
    // Loop counter within `getBits`.
    let power = 0;
    // Stores the *previous* decompressed sequence. Used for dictionary building.
    let c;
    // The character code (16 bits) of the current input character being processed.
    let data_val = getNextValue(0);
    // The current bit position within `data_val` (reading from right to left, 16 down to 1).
    let data_position = resetBits;
    // The index of the *next* character to read from the `compressed` string.
    let data_index = 1;

    // --- Helper Function ---

    /**
     * Reads `maxpower` bits from the compressed input stream (`data_val`).
     * Updates the input stream state (`data_position`, `data_index`, `data_val`).
     * Stores the result in the `bits` variable in the outer scope.
     */
    let getBits = () => {
        // Reset the result bits accumulator
        // Reset the bit position counter for the current read
        bits = power = 0;

        // Read `maxpower` bits
        while (power < maxpower) {
            // Get the next bit from the current input character `data_val`.
            // `data_position` decreases from 16 down to 1.
            bits += (data_val >> --data_position & 1) << power++;

            // If we've consumed all bits from the current input character `data_val`...
            if (data_position == 0) {
                // ...reset the position to 16.
                data_position = resetBits;
                // ...and read the next character code from the input string.
                data_val = getNextValue(data_index++);
            }
        }
        // `bits` now holds the `maxpower` bits read from the stream.
    };

    // --- Main Decompression Logic ---

    // 1. Read the first token.
    // It's guaranteed by the compressor to be either a "new character" token (0 or 1)
    // or potentially the end-of-stream marker (2) if the input was empty (handled earlier).
    // Read the initial number of bits (3)
    getBits();
    // `bits` now holds the first token (should be 0 or 1).

    // Determine if it's an 8-bit (token 0) or 16-bit (token 1) character.
    maxpower = bits * 8 + 8;
    // Read the character code into `bits`.
    getBits();

    // Convert the character code (`bits`) into a character.
    c = fromCharCode(bits);
    // Add this first character to the dictionary at index 3.
    dictionary[3] = c;
    // Add the first character to the result.
    result.push(c);

    // 2. Process the rest of the compressed string.
    // Loop while there are potentially more characters to read in the input stream.
    // The loop should normally terminate when the end-of-stream token (2) is encountered.
    // Ensure all bits are processed
    while (data_index <= length) {
        // Read the next token (dictionary code or special marker).
        // Use the current number of bits per token.
        maxpower = numBits;
        getBits();

        // Handle the different types of codes:
        if (bits < 2) {
            // --- New Character Token (0 or 1) ---
            // This means the *next* sequence of bits represents a character code.
            // 8 bits if code was 0, 16 bits if code was 1.
            maxpower = (8 + 8 * bits);
            // Read the character code into `bits`.
            getBits();

            // Add the new character to the dictionary at the next available slot.
            dictionary[dictSize] = fromCharCode(bits);
            // The code for this new character *is* its position in the dictionary.
            // Increment dictionary size for the next entry.
            bits = dictSize++;

            // Check if the dictionary needs to grow (require more bits per code).
            if (--enlargeIn == 0) {
                // Reset counter for the new bit level. Increase the number of bits per code.
                enlargeIn = 1 << numBits++;
            }
            // Note: For a "new character" token, the token itself (`code` 0 or 1) isn't the entry.
            // The entry is the character read immediately after. `bits` gets overwritten by getBits().
            // We need to set `entry` correctly here. The value `bits` *after* reading the char code isn't used directly as a code lookup.
            // The *previous* value of `code` (0 or 1) indicated *how many* bits to read for the char.
            // The actual sequence added to the result is just the character itself.
            // Let's rethink this section slightly based on LZString logic.
            // The compressor writes 0/1, then the char code.
            // The decompressor reads 0/1, reads the char code, adds char to dict, sets `code` to `dictSize-1`.

            // Fall through to process `bits` as the code for the new character entry.

        } else if (bits == 2) {
            // --- End-of-Stream Token (2) ---
            // Compression is complete. Join the result array and return.
            return result.join(empty);
        }
        // --- Existing Sequence Token (code >= 3) ---
        // `bits` (which is `code`) holds the dictionary index for a sequence.

        // Look up the entry in the dictionary.
        // There's an edge case: the code might refer to the sequence that is *currently* being defined.
        // This happens when the input is like "ababab". The compressor outputs code for "ab", then sees "a" again,
        // then sees "b" which matches the start of "ab", then sees "a" again. It outputs the code for "aba".
        // The decompressor sees code for "ab", outputs it. Current char `c` is "ab". Next code is for "aba".
        // But "aba" hasn't been added to the dictionary yet! It *will* be `c + c.charAt(0)`.
        entry = bits < dictionary.length ? dictionary[bits] : c + c.charAt(0);
        // Add the decompressed sequence (`entry`) to the result.
        result.push(entry);

        // Add the new sequence to the dictionary.
        // The new sequence is the *previous* sequence (`c`) plus the *first character* of the *current* sequence (`entry`).
        dictionary[dictSize++] = c + entry.charAt(0);

        // Update the previous sequence `c` to the current sequence `entry`.
        c = entry;

        // Check if the dictionary needs to grow after adding the new entry.
        if (--enlargeIn == 0) {
            // Reset counter. Increase bits per code for next read.
            enlargeIn = 1 << numBits++;
        }

    }
};

// --- Node.js Export ---
// Basic check to allow usage in Node.js environments (require).
if (typeof module !== 'undefined' && module != null) {
    module.exports = { Lc, Ld };
}

// --- Browser Global Scope ---
// In a browser environment, if not using modules (e.g., via a simple <script> tag),
// Lc and Ld will be defined in the global scope (window).
// No explicit `window.Lc = Lc;` is needed unless strict mode or module context prevents it.
