# LZstr
JSON focused compression with minimal size. Binary compatible with lz-string.

```javascript
function Lc(r){var o,d=String.fromCharCode,n=[],t=0,v=0,h=16,a=0,c=0,e={},f=!0,u=0,i=0,C={v:3,d:{}},g=3,p=4;function s(r,o){for(var a=0;o>>=1;a++)t=r>>a&1|t<<1,++v===h&&(v=0,n.push(d(t)),t=0)}for(s(c=(u=r.charCodeAt(0))<256?0:1,p),s(u,c?65536:256),e[u]=C,a=1;a<r.length;a++)44===(u=r.charCodeAt(a))&&0===i?(o=!1,i=1):o=C.d[u],o?C=o:(44!==u&&(i=0),f?f=!1:s(c=C.v,p),e[u]||(++g>=p&&(p<<=1),s(c=u<256?0:1,p),s(u,c?65536:256),e[u]={v:g,d:{}},f=!0),C.d[u]={v:++g,d:{}},g>=p&&(p<<=1),C=e[u]);return f||s(C.v,p),e[u]||(++g>=p&&(p<<=1),s(c=u<256?0:1,p),s(u,256<<c)),++g>=p&&(p<<=1),s(2,p),t<<=h-v,n.push(d(t)),n.join("")}
function Ld(r){var n,o,t=String.fromCharCode,h=r.length,d=r.charCodeAt.bind(r),e=["","",""],f=4,a=4,i=3,c=[],u=0,v=2,C=0,g=d(0),s=16,A=1,l=()=>{for(;C!=v;)u+=(g>>--s&1)<<C++,0==s&&(s=16,g=d(A++))};for(l(),v=8*u+8,u=C=0,l(),o=t(u),e[3]=o,c.push(o);A<=h;){if(v=i,u=C=0,l(),u<2)v=8+8*u,u=C=0,l(),e[a]=t(u),u=a++,0==--f&&(f=1<<i++);else if(2==u)return c.join("");n=u<e.length?e[u]:o+o.charAt(0),c.push(n),e[a++]=o+n.charAt(0),o=n,0==--f&&(f=1<<i++)}}
```

Forked from https://github.com/JobLeonard/lz-string

Just two functions:
```javascript
var encrypted = Lc("String to encrypt");
var decrypted = Ld(encrypted);
```

The functions can be used separate. Inlining is a good choise.

Size: 1060 bytes (Lc=613 , Ld=446).
