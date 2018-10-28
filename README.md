# LZstr
JSON focused compression with minimal size. Binary compatible with lz-string.

```javascript
function Lc(r){var n,o=String.fromCharCode,t=[],h=0,d=0,e=16,f=0,i=0,a={},c=!0,u=0,v={v:3,d:{}},C=3,g=4,s=!0;function A(r,n){for(var f=0;n>>=1;f++)h=r>>f&1|h<<1,++d===e&&(d=0,t.push(o(h)),h=0)}function l(){void 0==a[u]&&(++C>=g&&(g<<=1),A(i=u<256?0:1,g),A(u,i?65536:256),a[u]={v:C,d:{}},c=!0),++C>=g&&(g<<=1)}for(u=r.charCodeAt(0),A(i=u<256?0:1,g),A(u,i?65536:256),a[u]=v,f=1;f<r.length;f++)44===(u=r.charCodeAt(f))&&s?(s=!1,n=!1):n=v.d[u],n?v=n:(c?c=!1:A(i=v.v,g),l(),44===u||s||(s=!0),v.d[u]={v:C,d:{}},v=a[u]);return c||A(v.v,g),l(),A(2,g),h<<=e-d,t.push(o(h)),t.join("")}
function Ld(r){var n,o,t=String.fromCharCode,h=r.length,d=r.charCodeAt.bind(r),e=["","",""],f=4,i=4,a=3,c=[],u=0,v=2,C=0,g=d(0),s=16,A=1,l=()=>{for(u=C=0;C!=v;)u+=(g>>--s&1)<<C++,0==s&&(s=16,g=d(A++))};for(l(),v=8*u+8,l(),o=t(u),e[3]=o,c.push(o);A<=h;){if(v=a,l(),u<2)v=8+8*u,l(),e[i]=t(u),u=i++,0==--f&&(f=1<<a++);else if(2==u)return c.join("");n=u<e.length?e[u]:o+o.charAt(0),c.push(n),e[i++]=o+n.charAt(0),o=n,0==--f&&(f=1<<a++)}}
```

Forked from https://github.com/JobLeonard/lz-string

Just two functions:
```javascript
var compresseed = Lc("String to compress");
var original = Ld(compresseed);
```

The functions can be used separate. Inlining is a good choise.

Size: 1008 bytes (Lc=575 , Ld=433).
