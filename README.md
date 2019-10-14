# LZstr
JSON focused compression with minimal size. Binary compatible with lz-string.

```javascript
Lc=r=>{var h,o,e=String.fromCharCode,t=[],d=[],n=0,a=0,f=0,u=0,i={},C=!0,c=0,l=2,s=4,v=(r,h)=>{t.push([r,h]);for(var o=0;h>>=1;o++)n=r>>o&1|n<<1,16==++a&&(a=0,d.push(e(n)),n=0)},g=()=>{C?C=!1:v(h.v,s),null==i[c]&&(++l>=s&&(s<<=1),v(u=c<256?0:1,s),v(c,u?65536:256),i[c]={v:l,d:{}},C=!0),++l>=s&&(s<<=1)};for(c=r.charCodeAt(0),g(),s=4,--l,h=i[c],f=1;f<r.length;f++)c=r.charCodeAt(f),(o=h.d[c])?h=o:(g(),h.d[c]={v:l,d:{}},h=i[c]);return g(),v(2,s),n<<=16-a,d.push(e(n)),d.join("")}
Ld=r=>{var h,o,e=String.fromCharCode,t=r.length,d=r.charCodeAt.bind(r),n=["","",""],a=4,f=4,u=3,i=[],C=0,c=2,l=0,s=d(0),v=16,g=1,p=()=>{for(C=l=0;l!=c;)C+=(s>>--v&1)<<l++,0==v&&(v=16,s=d(g++))};for(p(),c=8*C+8,p(),o=e(C),n[3]=o,i.push(o);g<=t;){if(c=u,p(),C<2)c=8+8*C,p(),n[f]=e(C),C=f++,0==--a&&(a=1<<u++);else if(2==C)return i.join("");h=C<n.length?n[C]:o+o.charAt(0),i.push(h),n[f++]=o+h.charAt(0),o=h,0==--a&&(a=1<<u++)}}
```

Forked from https://github.com/JobLeonard/lz-string

Just two functions:
```javascript
var compresseed = Lc("String to compress");
var original = Ld(compresseed);
```

The functions can be used separate. Inlining is a good choise.

Size: 903 bytes (Lc=478 , Ld=425).
