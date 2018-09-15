# LZstr
JSON focused compression with minimal size. Binary compatible with lz-string.

```javascript
function Lc(r){var n,o=String.fromCharCode,t=[],h=0,d=0,e=16,f=0,a=0,i={},c=!0,u=0,v={v:3,d:{}},C=3,g=4;function s(r,n){for(var f=0;n>>=1;f++)h=r>>f&1|h<<1,++d===e&&(d=0,t.push(o(h)),h=0)}for(s(a=(u=r.charCodeAt(0))<256?0:1,g),s(u,a?65536:256),i[u]=v,f=1;f<r.length;f++)(n=44!==(u=r.charCodeAt(f))&&v.d[u])?v=n:(c?c=!1:s(a=v.v,g),i[u]||(++C>=g&&(g<<=1),s(a=u<256?0:1,g),s(u,a?65536:256),i[u]={v:C,d:{}},c=!0),v.d[u]={v:++C,d:{}},C>=g&&(g<<=1),v=i[u]);return c||s(v.v,g),i[u]||(++C>=g&&(g<<=1),s(a=u<256?0:1,g),s(u,256<<a)),++C>=g&&(g<<=1),s(2,g),h<<=e-d,t.push(o(h)),t.join("")}
function Ld(r){var n,o,t=String.fromCharCode,h=r.length,d=r.charCodeAt.bind(r),e=["","",""],f=4,a=4,i=3,c=[],u=0,v=2,C=0,g=d(0),s=16,A=1,l=()=>{for(;C!=v;)u+=(g>>--s&1)<<C++,0==s&&(s=16,g=d(A++))};for(l(),v=8*u+8,u=C=0,l(),o=t(u),e[3]=o,c.push(o);A<=h;){if(v=i,u=C=0,l(),u<2)v=8+8*u,u=C=0,l(),e[a]=t(u),u=a++,0==--f&&(f=1<<i++);else if(2==u)return c.join("");n=u<e.length?e[u]:o+o.charAt(0),c.push(n),e[a++]=o+n.charAt(0),o=n,0==--f&&(f=1<<i++)}}
```

Forked from https://github.com/JobLeonard/lz-string

Just two functions:
```javascript
var encrypted = Lc("String to encrypt");
var decrypted = Ld(encrypted);
```

The functions can be used separate. Inlining is a good choise.

Size: 1024 bytes (Lc=578 , Ld=446).
