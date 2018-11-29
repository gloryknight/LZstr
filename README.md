# LZstr
JSON focused compression with minimal size. Binary compatible with lz-string.

```javascript
function Lc(r){var o,h,d=String.fromCharCode,n=[],t=[],e=0,a=0,f=0,i=0,u={},c=!0,v=0,C=2,s=4,g=!0,p=(r,o)=>{n.push([r,o]);for(var h=0;o>>=1;h++)e=r>>h&1|e<<1,16==++a&&(a=0,t.push(d(e)),e=0)},A=()=>{c?c=!1:p(o.v,s),void 0==u[v]&&(++C>=s&&(s<<=1),p(i=v<256?0:1,s),p(v,i?65536:256),u[v]={v:C,d:{}},c=!0),++C>=s&&(s<<=1)};for(v=r.charCodeAt(0),A(),s=4,--C,o=u[v],f=1;f<r.length;f++)v=r.charCodeAt(f),(h=o.d[v])?o=h:(A(),44===v?g?g=!1:o.d[v]={v:C,d:{}}:(g=!0,o.d[v]={v:C,d:{}}),o=u[v]);return A(),p(2,s),e<<=16-a,t.push(d(e)),t.join("")}
function Ld(r){var o,h,d=String.fromCharCode,n=r.length,t=r.charCodeAt.bind(r),e=["","",""],a=4,f=4,i=3,u=[],c=0,v=2,C=0,s=t(0),g=16,p=1,A=()=>{for(c=C=0;C!=v;)c+=(s>>--g&1)<<C++,0==g&&(g=16,s=t(p++))};for(A(),v=8*c+8,A(),h=d(c),e[3]=h,u.push(h);p<=n;){if(v=i,A(),c<2)v=8+8*c,A(),e[f]=d(c),c=f++,0==--a&&(a=1<<i++);else if(2==c)return u.join("");o=c<e.length?e[c]:h+h.charAt(0),u.push(o),e[f++]=h+o.charAt(0),h=o,0==--a&&(a=1<<i++)}}
```

Forked from https://github.com/JobLeonard/lz-string

Just two functions:
```javascript
var compresseed = Lc("String to compress");
var original = Ld(compresseed);
```

The functions can be used separate. Inlining is a good choise.

Size: 965 bytes (Lc=532 , Ld=433).
