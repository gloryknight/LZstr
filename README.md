# LZstr
JSON focused compression with minimal size. Binary compatible with lz-string.

Forked from https://github.com/JobLeonard/lz-string

Just two functions:
```javascript
var encrypted = Lc("String to encrypt");
var decrypted = Ld(encrypted);
```

The functions can be used separate. Inlining is a good choise.

Size: 1024 bytes (Lc=578 , Ld=446).
