import{t as O,r as i,a as qr}from"./app-edf555a5.js";var G=function(){return G=Object.assign||function(t){for(var n,r=1,o=arguments.length;r<o;r++){n=arguments[r];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(t[a]=n[a])}return t},G.apply(this,arguments)};function gt(e,t,n){if(n||arguments.length===2)for(var r=0,o=t.length,a;r<o;r++)(a||!(r in t))&&(a||(a=Array.prototype.slice.call(t,0,r)),a[r]=t[r]);return e.concat(a||Array.prototype.slice.call(t))}var H="-ms-",Ye="-moz-",T="-webkit-",Wn="comm",yt="rule",Gt="decl",Xr="@import",Bn="@keyframes",Kr="@layer",Gn=Math.abs,Ut=String.fromCharCode,jt=Object.assign;function Zr(e,t){return z(e,0)^45?(((t<<2^z(e,0))<<2^z(e,1))<<2^z(e,2))<<2^z(e,3):0}function Un(e){return e.trim()}function pe(e,t){return(e=t.exec(e))?e[0]:e}function E(e,t,n){return e.replace(t,n)}function st(e,t,n){return e.indexOf(t,n)}function z(e,t){return e.charCodeAt(t)|0}function Fe(e,t,n){return e.slice(t,n)}function le(e){return e.length}function Vn(e){return e.length}function Ve(e,t){return t.push(e),e}function Qr(e,t){return e.map(t).join("")}function yn(e,t){return e.filter(function(n){return!pe(n,t)})}var xt=1,_e=1,Yn=0,ee=0,_=0,We="";function vt(e,t,n,r,o,a,s,l){return{value:e,root:t,parent:n,type:r,props:o,children:a,line:xt,column:_e,length:s,return:"",siblings:l}}function ye(e,t){return jt(vt("",null,null,"",null,null,0,e.siblings),e,{length:-e.length},t)}function He(e){for(;e.root;)e=ye(e.root,{children:[e]});Ve(e,e.siblings)}function Jr(){return _}function eo(){return _=ee>0?z(We,--ee):0,_e--,_===10&&(_e=1,xt--),_}function re(){return _=ee<Yn?z(We,ee++):0,_e++,_===10&&(_e=1,xt++),_}function ke(){return z(We,ee)}function lt(){return ee}function Ct(e,t){return Fe(We,e,t)}function Ft(e){switch(e){case 0:case 9:case 10:case 13:case 32:return 5;case 33:case 43:case 44:case 47:case 62:case 64:case 126:case 59:case 123:case 125:return 4;case 58:return 3;case 34:case 39:case 40:case 91:return 2;case 41:case 93:return 1}return 0}function to(e){return xt=_e=1,Yn=le(We=e),ee=0,[]}function no(e){return We="",e}function At(e){return Un(Ct(ee-1,_t(e===91?e+2:e===40?e+1:e)))}function ro(e){for(;(_=ke())&&_<33;)re();return Ft(e)>2||Ft(_)>3?"":" "}function oo(e,t){for(;--t&&re()&&!(_<48||_>102||_>57&&_<65||_>70&&_<97););return Ct(e,lt()+(t<6&&ke()==32&&re()==32))}function _t(e){for(;re();)switch(_){case e:return ee;case 34:case 39:e!==34&&e!==39&&_t(_);break;case 40:e===41&&_t(e);break;case 92:re();break}return ee}function ao(e,t){for(;re()&&e+_!==47+10;)if(e+_===42+42&&ke()===47)break;return"/*"+Ct(t,ee-1)+"*"+Ut(e===47?e:re())}function io(e){for(;!Ft(ke());)re();return Ct(e,ee)}function so(e){return no(ct("",null,null,null,[""],e=to(e),0,[0],e))}function ct(e,t,n,r,o,a,s,l,d){for(var f=0,u=0,p=s,x=0,h=0,m=0,R=1,k=1,$=1,C=0,b="",v=o,A=a,S=r,g=b;k;)switch(m=C,C=re()){case 40:if(m!=108&&z(g,p-1)==58){st(g+=E(At(C),"&","&\f"),"&\f",Gn(f?l[f-1]:0))!=-1&&($=-1);break}case 34:case 39:case 91:g+=At(C);break;case 9:case 10:case 13:case 32:g+=ro(m);break;case 92:g+=oo(lt()-1,7);continue;case 47:switch(ke()){case 42:case 47:Ve(lo(ao(re(),lt()),t,n,d),d);break;default:g+="/"}break;case 123*R:l[f++]=le(g)*$;case 125*R:case 59:case 0:switch(C){case 0:case 125:k=0;case 59+u:$==-1&&(g=E(g,/\f/g,"")),h>0&&le(g)-p&&Ve(h>32?vn(g+";",r,n,p-1,d):vn(E(g," ","")+";",r,n,p-2,d),d);break;case 59:g+=";";default:if(Ve(S=xn(g,t,n,f,u,o,l,b,v=[],A=[],p,a),a),C===123)if(u===0)ct(g,t,S,S,v,a,p,l,A);else switch(x===99&&z(g,3)===110?100:x){case 100:case 108:case 109:case 115:ct(e,S,S,r&&Ve(xn(e,S,S,0,0,o,l,b,o,v=[],p,A),A),o,A,p,l,r?v:A);break;default:ct(g,S,S,S,[""],A,0,l,A)}}f=u=h=0,R=$=1,b=g="",p=s;break;case 58:p=1+le(g),h=m;default:if(R<1){if(C==123)--R;else if(C==125&&R++==0&&eo()==125)continue}switch(g+=Ut(C),C*R){case 38:$=u>0?1:(g+="\f",-1);break;case 44:l[f++]=(le(g)-1)*$,$=1;break;case 64:ke()===45&&(g+=At(re())),x=ke(),u=p=le(b=g+=io(lt())),C++;break;case 45:m===45&&le(g)==2&&(R=0)}}return a}function xn(e,t,n,r,o,a,s,l,d,f,u,p){for(var x=o-1,h=o===0?a:[""],m=Vn(h),R=0,k=0,$=0;R<r;++R)for(var C=0,b=Fe(e,x+1,x=Gn(k=s[R])),v=e;C<m;++C)(v=Un(k>0?h[C]+" "+b:E(b,/&\f/g,h[C])))&&(d[$++]=v);return vt(e,t,n,o===0?yt:l,d,f,u,p)}function lo(e,t,n,r){return vt(e,t,n,Wn,Ut(Jr()),Fe(e,2,-2),0,r)}function vn(e,t,n,r,o){return vt(e,t,n,Gt,Fe(e,0,r),Fe(e,r+1,-1),r,o)}function qn(e,t,n){switch(Zr(e,t)){case 5103:return T+"print-"+e+e;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 6391:case 5879:case 5623:case 6135:case 4599:case 4855:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:return T+e+e;case 4789:return Ye+e+e;case 5349:case 4246:case 4810:case 6968:case 2756:return T+e+Ye+e+H+e+e;case 5936:switch(z(e,t+11)){case 114:return T+e+H+E(e,/[svh]\w+-[tblr]{2}/,"tb")+e;case 108:return T+e+H+E(e,/[svh]\w+-[tblr]{2}/,"tb-rl")+e;case 45:return T+e+H+E(e,/[svh]\w+-[tblr]{2}/,"lr")+e}case 6828:case 4268:case 2903:return T+e+H+e+e;case 6165:return T+e+H+"flex-"+e+e;case 5187:return T+e+E(e,/(\w+).+(:[^]+)/,T+"box-$1$2"+H+"flex-$1$2")+e;case 5443:return T+e+H+"flex-item-"+E(e,/flex-|-self/g,"")+(pe(e,/flex-|baseline/)?"":H+"grid-row-"+E(e,/flex-|-self/g,""))+e;case 4675:return T+e+H+"flex-line-pack"+E(e,/align-content|flex-|-self/g,"")+e;case 5548:return T+e+H+E(e,"shrink","negative")+e;case 5292:return T+e+H+E(e,"basis","preferred-size")+e;case 6060:return T+"box-"+E(e,"-grow","")+T+e+H+E(e,"grow","positive")+e;case 4554:return T+E(e,/([^-])(transform)/g,"$1"+T+"$2")+e;case 6187:return E(E(E(e,/(zoom-|grab)/,T+"$1"),/(image-set)/,T+"$1"),e,"")+e;case 5495:case 3959:return E(e,/(image-set\([^]*)/,T+"$1$`$1");case 4968:return E(E(e,/(.+:)(flex-)?(.*)/,T+"box-pack:$3"+H+"flex-pack:$3"),/s.+-b[^;]+/,"justify")+T+e+e;case 4200:if(!pe(e,/flex-|baseline/))return H+"grid-column-align"+Fe(e,t)+e;break;case 2592:case 3360:return H+E(e,"template-","")+e;case 4384:case 3616:return n&&n.some(function(r,o){return t=o,pe(r.props,/grid-\w+-end/)})?~st(e+(n=n[t].value),"span",0)?e:H+E(e,"-start","")+e+H+"grid-row-span:"+(~st(n,"span",0)?pe(n,/\d+/):+pe(n,/\d+/)-+pe(e,/\d+/))+";":H+E(e,"-start","")+e;case 4896:case 4128:return n&&n.some(function(r){return pe(r.props,/grid-\w+-start/)})?e:H+E(E(e,"-end","-span"),"span ","")+e;case 4095:case 3583:case 4068:case 2532:return E(e,/(.+)-inline(.+)/,T+"$1$2")+e;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(le(e)-1-t>6)switch(z(e,t+1)){case 109:if(z(e,t+4)!==45)break;case 102:return E(e,/(.+:)(.+)-([^]+)/,"$1"+T+"$2-$3$1"+Ye+(z(e,t+3)==108?"$3":"$2-$3"))+e;case 115:return~st(e,"stretch",0)?qn(E(e,"stretch","fill-available"),t,n)+e:e}break;case 5152:case 5920:return E(e,/(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/,function(r,o,a,s,l,d,f){return H+o+":"+a+f+(s?H+o+"-span:"+(l?d:+d-+a)+f:"")+e});case 4949:if(z(e,t+6)===121)return E(e,":",":"+T)+e;break;case 6444:switch(z(e,z(e,14)===45?18:11)){case 120:return E(e,/(.+:)([^;\s!]+)(;|(\s+)?!.+)?/,"$1"+T+(z(e,14)===45?"inline-":"")+"box$3$1"+T+"$2$3$1"+H+"$2box$3")+e;case 100:return E(e,":",":"+H)+e}break;case 5719:case 2647:case 2135:case 3927:case 2391:return E(e,"scroll-","scroll-snap-")+e}return e}function ft(e,t){for(var n="",r=0;r<e.length;r++)n+=t(e[r],r,e,t)||"";return n}function co(e,t,n,r){switch(e.type){case Kr:if(e.children.length)break;case Xr:case Gt:return e.return=e.return||e.value;case Wn:return"";case Bn:return e.return=e.value+"{"+ft(e.children,r)+"}";case yt:if(!le(e.value=e.props.join(",")))return""}return le(n=ft(e.children,r))?e.return=e.value+"{"+n+"}":""}function uo(e){var t=Vn(e);return function(n,r,o,a){for(var s="",l=0;l<t;l++)s+=e[l](n,r,o,a)||"";return s}}function po(e){return function(t){t.root||(t=t.return)&&e(t)}}function go(e,t,n,r){if(e.length>-1&&!e.return)switch(e.type){case Gt:e.return=qn(e.value,e.length,n);return;case Bn:return ft([ye(e,{value:E(e.value,"@","@"+T)})],r);case yt:if(e.length)return Qr(n=e.props,function(o){switch(pe(o,r=/(::plac\w+|:read-\w+)/)){case":read-only":case":read-write":He(ye(e,{props:[E(o,/:(read-\w+)/,":"+Ye+"$1")]})),He(ye(e,{props:[o]})),jt(e,{props:yn(n,r)});break;case"::placeholder":He(ye(e,{props:[E(o,/:(plac\w+)/,":"+T+"input-$1")]})),He(ye(e,{props:[E(o,/:(plac\w+)/,":"+Ye+"$1")]})),He(ye(e,{props:[E(o,/:(plac\w+)/,H+"input-$1")]})),He(ye(e,{props:[o]})),jt(e,{props:yn(n,r)});break}return""})}}var fo={animationIterationCount:1,aspectRatio:1,borderImageOutset:1,borderImageSlice:1,borderImageWidth:1,boxFlex:1,boxFlexGroup:1,boxOrdinalGroup:1,columnCount:1,columns:1,flex:1,flexGrow:1,flexPositive:1,flexShrink:1,flexNegative:1,flexOrder:1,gridRow:1,gridRowEnd:1,gridRowSpan:1,gridRowStart:1,gridColumn:1,gridColumnEnd:1,gridColumnSpan:1,gridColumnStart:1,msGridRow:1,msGridRowSpan:1,msGridColumn:1,msGridColumnSpan:1,fontWeight:1,lineHeight:1,opacity:1,order:1,orphans:1,tabSize:1,widows:1,zIndex:1,zoom:1,WebkitLineClamp:1,fillOpacity:1,floodOpacity:1,stopOpacity:1,strokeDasharray:1,strokeDashoffset:1,strokeMiterlimit:1,strokeOpacity:1,strokeWidth:1},Me=typeof process<"u"&&process.env!==void 0&&({}.REACT_APP_SC_ATTR||{}.SC_ATTR)||"data-styled",Xn="active",Kn="data-styled-version",St="6.1.19",Vt=`/*!sc*/
`,ht=typeof window<"u"&&typeof document<"u",ho=!!(typeof SC_DISABLE_SPEEDY=="boolean"?SC_DISABLE_SPEEDY:typeof process<"u"&&process.env!==void 0&&{}.REACT_APP_SC_DISABLE_SPEEDY!==void 0&&{}.REACT_APP_SC_DISABLE_SPEEDY!==""?{}.REACT_APP_SC_DISABLE_SPEEDY!=="false"&&{}.REACT_APP_SC_DISABLE_SPEEDY:typeof process<"u"&&process.env!==void 0&&{}.SC_DISABLE_SPEEDY!==void 0&&{}.SC_DISABLE_SPEEDY!==""&&{}.SC_DISABLE_SPEEDY!=="false"&&{}.SC_DISABLE_SPEEDY),Rt=Object.freeze([]),Le=Object.freeze({});function mo(e,t,n){return n===void 0&&(n=Le),e.theme!==n.theme&&e.theme||t||n.theme}var Zn=new Set(["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","big","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","keygen","label","legend","li","link","main","map","mark","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","small","source","span","strong","style","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","tr","track","u","ul","use","var","video","wbr","circle","clipPath","defs","ellipse","foreignObject","g","image","line","linearGradient","marker","mask","path","pattern","polygon","polyline","radialGradient","rect","stop","svg","text","tspan"]),bo=/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-]+/g,wo=/(^-|-$)/g;function Cn(e){return e.replace(bo,"-").replace(wo,"")}var yo=/(a)(d)/gi,rt=52,Sn=function(e){return String.fromCharCode(e+(e>25?39:97))};function Mt(e){var t,n="";for(t=Math.abs(e);t>rt;t=t/rt|0)n=Sn(t%rt)+n;return(Sn(t%rt)+n).replace(yo,"$1-$2")}var Dt,Qn=5381,je=function(e,t){for(var n=t.length;n;)e=33*e^t.charCodeAt(--n);return e},Jn=function(e){return je(Qn,e)};function xo(e){return Mt(Jn(e)>>>0)}function vo(e){return e.displayName||e.name||"Component"}function It(e){return typeof e=="string"&&!0}var er=typeof Symbol=="function"&&Symbol.for,tr=er?Symbol.for("react.memo"):60115,Co=er?Symbol.for("react.forward_ref"):60112,So={childContextTypes:!0,contextType:!0,contextTypes:!0,defaultProps:!0,displayName:!0,getDefaultProps:!0,getDerivedStateFromError:!0,getDerivedStateFromProps:!0,mixins:!0,propTypes:!0,type:!0},Ro={name:!0,length:!0,prototype:!0,caller:!0,callee:!0,arguments:!0,arity:!0},nr={$$typeof:!0,compare:!0,defaultProps:!0,displayName:!0,propTypes:!0,type:!0},$o=((Dt={})[Co]={$$typeof:!0,render:!0,defaultProps:!0,displayName:!0,propTypes:!0},Dt[tr]=nr,Dt);function Rn(e){return("type"in(t=e)&&t.type.$$typeof)===tr?nr:"$$typeof"in e?$o[e.$$typeof]:So;var t}var Eo=Object.defineProperty,ko=Object.getOwnPropertyNames,$n=Object.getOwnPropertySymbols,Oo=Object.getOwnPropertyDescriptor,Po=Object.getPrototypeOf,En=Object.prototype;function rr(e,t,n){if(typeof t!="string"){if(En){var r=Po(t);r&&r!==En&&rr(e,r,n)}var o=ko(t);$n&&(o=o.concat($n(t)));for(var a=Rn(e),s=Rn(t),l=0;l<o.length;++l){var d=o[l];if(!(d in Ro||n&&n[d]||s&&d in s||a&&d in a)){var f=Oo(t,d);try{Eo(e,d,f)}catch{}}}}return e}function Pe(e){return typeof e=="function"}function Yt(e){return typeof e=="object"&&"styledComponentId"in e}function Ee(e,t){return e&&t?"".concat(e," ").concat(t):e||t||""}function kn(e,t){if(e.length===0)return"";for(var n=e[0],r=1;r<e.length;r++)n+=t?t+e[r]:e[r];return n}function Ke(e){return e!==null&&typeof e=="object"&&e.constructor.name===Object.name&&!("props"in e&&e.$$typeof)}function Lt(e,t,n){if(n===void 0&&(n=!1),!n&&!Ke(e)&&!Array.isArray(e))return t;if(Array.isArray(t))for(var r=0;r<t.length;r++)e[r]=Lt(e[r],t[r]);else if(Ke(t))for(var r in t)e[r]=Lt(e[r],t[r]);return e}function qt(e,t){Object.defineProperty(e,"toString",{value:t})}function Ae(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];return new Error("An error occurred. See https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/utils/errors.md#".concat(e," for more information.").concat(t.length>0?" Args: ".concat(t.join(", ")):""))}var Ao=function(){function e(t){this.groupSizes=new Uint32Array(512),this.length=512,this.tag=t}return e.prototype.indexOfGroup=function(t){for(var n=0,r=0;r<t;r++)n+=this.groupSizes[r];return n},e.prototype.insertRules=function(t,n){if(t>=this.groupSizes.length){for(var r=this.groupSizes,o=r.length,a=o;t>=a;)if((a<<=1)<0)throw Ae(16,"".concat(t));this.groupSizes=new Uint32Array(a),this.groupSizes.set(r),this.length=a;for(var s=o;s<a;s++)this.groupSizes[s]=0}for(var l=this.indexOfGroup(t+1),d=(s=0,n.length);s<d;s++)this.tag.insertRule(l,n[s])&&(this.groupSizes[t]++,l++)},e.prototype.clearGroup=function(t){if(t<this.length){var n=this.groupSizes[t],r=this.indexOfGroup(t),o=r+n;this.groupSizes[t]=0;for(var a=r;a<o;a++)this.tag.deleteRule(r)}},e.prototype.getGroup=function(t){var n="";if(t>=this.length||this.groupSizes[t]===0)return n;for(var r=this.groupSizes[t],o=this.indexOfGroup(t),a=o+r,s=o;s<a;s++)n+="".concat(this.tag.getRule(s)).concat(Vt);return n},e}(),dt=new Map,mt=new Map,ut=1,ot=function(e){if(dt.has(e))return dt.get(e);for(;mt.has(ut);)ut++;var t=ut++;return dt.set(e,t),mt.set(t,e),t},Do=function(e,t){ut=t+1,dt.set(e,t),mt.set(t,e)},Io="style[".concat(Me,"][").concat(Kn,'="').concat(St,'"]'),To=new RegExp("^".concat(Me,'\\.g(\\d+)\\[id="([\\w\\d-]+)"\\].*?"([^"]*)')),Ho=function(e,t,n){for(var r,o=n.split(","),a=0,s=o.length;a<s;a++)(r=o[a])&&e.registerName(t,r)},jo=function(e,t){for(var n,r=((n=t.textContent)!==null&&n!==void 0?n:"").split(Vt),o=[],a=0,s=r.length;a<s;a++){var l=r[a].trim();if(l){var d=l.match(To);if(d){var f=0|parseInt(d[1],10),u=d[2];f!==0&&(Do(u,f),Ho(e,u,d[3]),e.getTag().insertRules(f,o)),o.length=0}else o.push(l)}}},On=function(e){for(var t=document.querySelectorAll(Io),n=0,r=t.length;n<r;n++){var o=t[n];o&&o.getAttribute(Me)!==Xn&&(jo(e,o),o.parentNode&&o.parentNode.removeChild(o))}};function Fo(){return typeof __webpack_nonce__<"u"?__webpack_nonce__:null}var or=function(e){var t=document.head,n=e||t,r=document.createElement("style"),o=function(l){var d=Array.from(l.querySelectorAll("style[".concat(Me,"]")));return d[d.length-1]}(n),a=o!==void 0?o.nextSibling:null;r.setAttribute(Me,Xn),r.setAttribute(Kn,St);var s=Fo();return s&&r.setAttribute("nonce",s),n.insertBefore(r,a),r},_o=function(){function e(t){this.element=or(t),this.element.appendChild(document.createTextNode("")),this.sheet=function(n){if(n.sheet)return n.sheet;for(var r=document.styleSheets,o=0,a=r.length;o<a;o++){var s=r[o];if(s.ownerNode===n)return s}throw Ae(17)}(this.element),this.length=0}return e.prototype.insertRule=function(t,n){try{return this.sheet.insertRule(n,t),this.length++,!0}catch{return!1}},e.prototype.deleteRule=function(t){this.sheet.deleteRule(t),this.length--},e.prototype.getRule=function(t){var n=this.sheet.cssRules[t];return n&&n.cssText?n.cssText:""},e}(),Mo=function(){function e(t){this.element=or(t),this.nodes=this.element.childNodes,this.length=0}return e.prototype.insertRule=function(t,n){if(t<=this.length&&t>=0){var r=document.createTextNode(n);return this.element.insertBefore(r,this.nodes[t]||null),this.length++,!0}return!1},e.prototype.deleteRule=function(t){this.element.removeChild(this.nodes[t]),this.length--},e.prototype.getRule=function(t){return t<this.length?this.nodes[t].textContent:""},e}(),Lo=function(){function e(t){this.rules=[],this.length=0}return e.prototype.insertRule=function(t,n){return t<=this.length&&(this.rules.splice(t,0,n),this.length++,!0)},e.prototype.deleteRule=function(t){this.rules.splice(t,1),this.length--},e.prototype.getRule=function(t){return t<this.length?this.rules[t]:""},e}(),Pn=ht,No={isServer:!ht,useCSSOMInjection:!ho},ar=function(){function e(t,n,r){t===void 0&&(t=Le),n===void 0&&(n={});var o=this;this.options=G(G({},No),t),this.gs=n,this.names=new Map(r),this.server=!!t.isServer,!this.server&&ht&&Pn&&(Pn=!1,On(this)),qt(this,function(){return function(a){for(var s=a.getTag(),l=s.length,d="",f=function(p){var x=function($){return mt.get($)}(p);if(x===void 0)return"continue";var h=a.names.get(x),m=s.getGroup(p);if(h===void 0||!h.size||m.length===0)return"continue";var R="".concat(Me,".g").concat(p,'[id="').concat(x,'"]'),k="";h!==void 0&&h.forEach(function($){$.length>0&&(k+="".concat($,","))}),d+="".concat(m).concat(R,'{content:"').concat(k,'"}').concat(Vt)},u=0;u<l;u++)f(u);return d}(o)})}return e.registerId=function(t){return ot(t)},e.prototype.rehydrate=function(){!this.server&&ht&&On(this)},e.prototype.reconstructWithOptions=function(t,n){return n===void 0&&(n=!0),new e(G(G({},this.options),t),this.gs,n&&this.names||void 0)},e.prototype.allocateGSInstance=function(t){return this.gs[t]=(this.gs[t]||0)+1},e.prototype.getTag=function(){return this.tag||(this.tag=(t=function(n){var r=n.useCSSOMInjection,o=n.target;return n.isServer?new Lo(o):r?new _o(o):new Mo(o)}(this.options),new Ao(t)));var t},e.prototype.hasNameForId=function(t,n){return this.names.has(t)&&this.names.get(t).has(n)},e.prototype.registerName=function(t,n){if(ot(t),this.names.has(t))this.names.get(t).add(n);else{var r=new Set;r.add(n),this.names.set(t,r)}},e.prototype.insertRules=function(t,n,r){this.registerName(t,n),this.getTag().insertRules(ot(t),r)},e.prototype.clearNames=function(t){this.names.has(t)&&this.names.get(t).clear()},e.prototype.clearRules=function(t){this.getTag().clearGroup(ot(t)),this.clearNames(t)},e.prototype.clearTag=function(){this.tag=void 0},e}(),zo=/&/g,Wo=/^\s*\/\/.*$/gm;function ir(e,t){return e.map(function(n){return n.type==="rule"&&(n.value="".concat(t," ").concat(n.value),n.value=n.value.replaceAll(",",",".concat(t," ")),n.props=n.props.map(function(r){return"".concat(t," ").concat(r)})),Array.isArray(n.children)&&n.type!=="@keyframes"&&(n.children=ir(n.children,t)),n})}function Bo(e){var t,n,r,o=e===void 0?Le:e,a=o.options,s=a===void 0?Le:a,l=o.plugins,d=l===void 0?Rt:l,f=function(x,h,m){return m.startsWith(n)&&m.endsWith(n)&&m.replaceAll(n,"").length>0?".".concat(t):x},u=d.slice();u.push(function(x){x.type===yt&&x.value.includes("&")&&(x.props[0]=x.props[0].replace(zo,n).replace(r,f))}),s.prefix&&u.push(go),u.push(co);var p=function(x,h,m,R){h===void 0&&(h=""),m===void 0&&(m=""),R===void 0&&(R="&"),t=R,n=h,r=new RegExp("\\".concat(n,"\\b"),"g");var k=x.replace(Wo,""),$=so(m||h?"".concat(m," ").concat(h," { ").concat(k," }"):k);s.namespace&&($=ir($,s.namespace));var C=[];return ft($,uo(u.concat(po(function(b){return C.push(b)})))),C};return p.hash=d.length?d.reduce(function(x,h){return h.name||Ae(15),je(x,h.name)},Qn).toString():"",p}var Go=new ar,Nt=Bo(),sr=O.createContext({shouldForwardProp:void 0,styleSheet:Go,stylis:Nt});sr.Consumer;O.createContext(void 0);function An(){return i.useContext(sr)}var Uo=function(){function e(t,n){var r=this;this.inject=function(o,a){a===void 0&&(a=Nt);var s=r.name+a.hash;o.hasNameForId(r.id,s)||o.insertRules(r.id,s,a(r.rules,s,"@keyframes"))},this.name=t,this.id="sc-keyframes-".concat(t),this.rules=n,qt(this,function(){throw Ae(12,String(r.name))})}return e.prototype.getName=function(t){return t===void 0&&(t=Nt),this.name+t.hash},e}(),Vo=function(e){return e>="A"&&e<="Z"};function Dn(e){for(var t="",n=0;n<e.length;n++){var r=e[n];if(n===1&&r==="-"&&e[0]==="-")return e;Vo(r)?t+="-"+r.toLowerCase():t+=r}return t.startsWith("ms-")?"-"+t:t}var lr=function(e){return e==null||e===!1||e===""},cr=function(e){var t,n,r=[];for(var o in e){var a=e[o];e.hasOwnProperty(o)&&!lr(a)&&(Array.isArray(a)&&a.isCss||Pe(a)?r.push("".concat(Dn(o),":"),a,";"):Ke(a)?r.push.apply(r,gt(gt(["".concat(o," {")],cr(a),!1),["}"],!1)):r.push("".concat(Dn(o),": ").concat((t=o,(n=a)==null||typeof n=="boolean"||n===""?"":typeof n!="number"||n===0||t in fo||t.startsWith("--")?String(n).trim():"".concat(n,"px")),";")))}return r};function Oe(e,t,n,r){if(lr(e))return[];if(Yt(e))return[".".concat(e.styledComponentId)];if(Pe(e)){if(!Pe(a=e)||a.prototype&&a.prototype.isReactComponent||!t)return[e];var o=e(t);return Oe(o,t,n,r)}var a;return e instanceof Uo?n?(e.inject(n,r),[e.getName(r)]):[e]:Ke(e)?cr(e):Array.isArray(e)?Array.prototype.concat.apply(Rt,e.map(function(s){return Oe(s,t,n,r)})):[e.toString()]}function Yo(e){for(var t=0;t<e.length;t+=1){var n=e[t];if(Pe(n)&&!Yt(n))return!1}return!0}var qo=Jn(St),Xo=function(){function e(t,n,r){this.rules=t,this.staticRulesId="",this.isStatic=(r===void 0||r.isStatic)&&Yo(t),this.componentId=n,this.baseHash=je(qo,n),this.baseStyle=r,ar.registerId(n)}return e.prototype.generateAndInjectStyles=function(t,n,r){var o=this.baseStyle?this.baseStyle.generateAndInjectStyles(t,n,r):"";if(this.isStatic&&!r.hash)if(this.staticRulesId&&n.hasNameForId(this.componentId,this.staticRulesId))o=Ee(o,this.staticRulesId);else{var a=kn(Oe(this.rules,t,n,r)),s=Mt(je(this.baseHash,a)>>>0);if(!n.hasNameForId(this.componentId,s)){var l=r(a,".".concat(s),void 0,this.componentId);n.insertRules(this.componentId,s,l)}o=Ee(o,s),this.staticRulesId=s}else{for(var d=je(this.baseHash,r.hash),f="",u=0;u<this.rules.length;u++){var p=this.rules[u];if(typeof p=="string")f+=p;else if(p){var x=kn(Oe(p,t,n,r));d=je(d,x+u),f+=x}}if(f){var h=Mt(d>>>0);n.hasNameForId(this.componentId,h)||n.insertRules(this.componentId,h,r(f,".".concat(h),void 0,this.componentId)),o=Ee(o,h)}}return o},e}(),bt=O.createContext(void 0);bt.Consumer;function Ko(e){var t=O.useContext(bt),n=i.useMemo(function(){return function(r,o){if(!r)throw Ae(14);if(Pe(r)){var a=r(o);return a}if(Array.isArray(r)||typeof r!="object")throw Ae(8);return o?G(G({},o),r):r}(e.theme,t)},[e.theme,t]);return e.children?O.createElement(bt.Provider,{value:n},e.children):null}var Tt={};function Zo(e,t,n){var r=Yt(e),o=e,a=!It(e),s=t.attrs,l=s===void 0?Rt:s,d=t.componentId,f=d===void 0?function(v,A){var S=typeof v!="string"?"sc":Cn(v);Tt[S]=(Tt[S]||0)+1;var g="".concat(S,"-").concat(xo(St+S+Tt[S]));return A?"".concat(A,"-").concat(g):g}(t.displayName,t.parentComponentId):d,u=t.displayName,p=u===void 0?function(v){return It(v)?"styled.".concat(v):"Styled(".concat(vo(v),")")}(e):u,x=t.displayName&&t.componentId?"".concat(Cn(t.displayName),"-").concat(t.componentId):t.componentId||f,h=r&&o.attrs?o.attrs.concat(l).filter(Boolean):l,m=t.shouldForwardProp;if(r&&o.shouldForwardProp){var R=o.shouldForwardProp;if(t.shouldForwardProp){var k=t.shouldForwardProp;m=function(v,A){return R(v,A)&&k(v,A)}}else m=R}var $=new Xo(n,x,r?o.componentStyle:void 0);function C(v,A){return function(S,g,I){var Y=S.attrs,U=S.componentStyle,Q=S.defaultProps,oe=S.foldedComponentIds,j=S.styledComponentId,ge=S.target,ve=O.useContext(bt),fe=An(),ae=S.shouldForwardProp||fe.shouldForwardProp,De=mo(g,ve,Q)||Le,q=function(de,K,me){for(var ue,J=G(G({},K),{className:void 0,theme:me}),Se=0;Se<de.length;Se+=1){var Z=Pe(ue=de[Se])?ue(J):ue;for(var W in Z)J[W]=W==="className"?Ee(J[W],Z[W]):W==="style"?G(G({},J[W]),Z[W]):Z[W]}return K.className&&(J.className=Ee(J.className,K.className)),J}(Y,g,De),he=q.as||ge,ce={};for(var N in q)q[N]===void 0||N[0]==="$"||N==="as"||N==="theme"&&q.theme===De||(N==="forwardedAs"?ce.as=q.forwardedAs:ae&&!ae(N,he)||(ce[N]=q[N]));var Ce=function(de,K){var me=An(),ue=de.generateAndInjectStyles(K,me.styleSheet,me.stylis);return ue}(U,q),X=Ee(oe,j);return Ce&&(X+=" "+Ce),q.className&&(X+=" "+q.className),ce[It(he)&&!Zn.has(he)?"class":"className"]=X,I&&(ce.ref=I),i.createElement(he,ce)}(b,v,A)}C.displayName=p;var b=O.forwardRef(C);return b.attrs=h,b.componentStyle=$,b.displayName=p,b.shouldForwardProp=m,b.foldedComponentIds=r?Ee(o.foldedComponentIds,o.styledComponentId):"",b.styledComponentId=x,b.target=r?o.target:e,Object.defineProperty(b,"defaultProps",{get:function(){return this._foldedDefaultProps},set:function(v){this._foldedDefaultProps=r?function(A){for(var S=[],g=1;g<arguments.length;g++)S[g-1]=arguments[g];for(var I=0,Y=S;I<Y.length;I++)Lt(A,Y[I],!0);return A}({},o.defaultProps,v):v}}),qt(b,function(){return".".concat(b.styledComponentId)}),a&&rr(b,e,{attrs:!0,componentStyle:!0,displayName:!0,foldedComponentIds:!0,shouldForwardProp:!0,styledComponentId:!0,target:!0}),b}function In(e,t){for(var n=[e[0]],r=0,o=t.length;r<o;r+=1)n.push(t[r],e[r+1]);return n}var Tn=function(e){return Object.assign(e,{isCss:!0})};function L(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];if(Pe(e)||Ke(e))return Tn(Oe(In(Rt,gt([e],t,!0))));var r=e;return t.length===0&&r.length===1&&typeof r[0]=="string"?Oe(r):Tn(Oe(In(r,t)))}function zt(e,t,n){if(n===void 0&&(n=Le),!t)throw Ae(1,t);var r=function(o){for(var a=[],s=1;s<arguments.length;s++)a[s-1]=arguments[s];return e(t,n,L.apply(void 0,gt([o],a,!1)))};return r.attrs=function(o){return zt(e,t,G(G({},n),{attrs:Array.prototype.concat(n.attrs,o).filter(Boolean)}))},r.withConfig=function(o){return zt(e,t,G(G({},n),o))},r}var dr=function(e){return zt(Zo,e)},P=dr;Zn.forEach(function(e){P[e]=dr(e)});var xe;function Ne(e,t){return e[t]}function Wt(e,t){return t.split(".").reduce((n,r)=>{const o=r.match(/[^\]\\[.]+/g);if(o&&o.length>1)for(let a=0;a<o.length;a++)return n[o[a]][o[a+1]];return n[r]},e)}function Qo(e=[],t,n=0){return[...e.slice(0,n),t,...e.slice(n)]}function Jo(e=[],t,n="id"){const r=e.slice(),o=Ne(t,n);return o?r.splice(r.findIndex(a=>Ne(a,n)===o),1):r.splice(r.findIndex(a=>a===t),1),r}function Hn(e){return e.map((t,n)=>{const r=Object.assign(Object.assign({},t),{sortable:t.sortable||!!t.sortFunction||void 0});return t.id||(r.id=n+1),r})}function qe(e,t){return Math.ceil(e/t)}function Ht(e,t){return Math.min(e,t)}(function(e){e.ASC="asc",e.DESC="desc"})(xe||(xe={}));const M=()=>null;function ur(e,t=[],n=[]){let r={},o=[...n];return t.length&&t.forEach(a=>{if(!a.when||typeof a.when!="function")throw new Error('"when" must be defined in the conditional style object and must be function');a.when(e)&&(r=a.style||{},a.classNames&&(o=[...o,...a.classNames]),typeof a.style=="function"&&(r=a.style(e)||{}))}),{style:r,classNames:o.join(" ")}}function pt(e,t=[],n="id"){const r=Ne(e,n);return r?t.some(o=>Ne(o,n)===r):t.some(o=>o===e)}function at(e,t){return t?e.findIndex(n=>Xe(n.id,t)):-1}function Xe(e,t){return e==t}function ea(e,t){const n=!e.toggleOnSelectedRowsChange;switch(t.type){case"SELECT_ALL_ROWS":{const{keyField:r,rows:o,rowCount:a,mergeSelections:s}=t,l=!e.allSelected,d=!e.toggleOnSelectedRowsChange;if(s){const f=l?[...e.selectedRows,...o.filter(u=>!pt(u,e.selectedRows,r))]:e.selectedRows.filter(u=>!pt(u,o,r));return Object.assign(Object.assign({},e),{allSelected:l,selectedCount:f.length,selectedRows:f,toggleOnSelectedRowsChange:d})}return Object.assign(Object.assign({},e),{allSelected:l,selectedCount:l?a:0,selectedRows:l?o:[],toggleOnSelectedRowsChange:d})}case"SELECT_SINGLE_ROW":{const{keyField:r,row:o,isSelected:a,rowCount:s,singleSelect:l}=t;return l?a?Object.assign(Object.assign({},e),{selectedCount:0,allSelected:!1,selectedRows:[],toggleOnSelectedRowsChange:n}):Object.assign(Object.assign({},e),{selectedCount:1,allSelected:!1,selectedRows:[o],toggleOnSelectedRowsChange:n}):a?Object.assign(Object.assign({},e),{selectedCount:e.selectedRows.length>0?e.selectedRows.length-1:0,allSelected:!1,selectedRows:Jo(e.selectedRows,o,r),toggleOnSelectedRowsChange:n}):Object.assign(Object.assign({},e),{selectedCount:e.selectedRows.length+1,allSelected:e.selectedRows.length+1===s,selectedRows:Qo(e.selectedRows,o),toggleOnSelectedRowsChange:n})}case"SELECT_MULTIPLE_ROWS":{const{keyField:r,selectedRows:o,totalRows:a,mergeSelections:s}=t;if(s){const l=[...e.selectedRows,...o.filter(d=>!pt(d,e.selectedRows,r))];return Object.assign(Object.assign({},e),{selectedCount:l.length,allSelected:!1,selectedRows:l,toggleOnSelectedRowsChange:n})}return Object.assign(Object.assign({},e),{selectedCount:o.length,allSelected:o.length===a,selectedRows:o,toggleOnSelectedRowsChange:n})}case"CLEAR_SELECTED_ROWS":{const{selectedRowsFlag:r}=t;return Object.assign(Object.assign({},e),{allSelected:!1,selectedCount:0,selectedRows:[],selectedRowsFlag:r})}case"SORT_CHANGE":{const{sortDirection:r,selectedColumn:o,clearSelectedOnSort:a}=t;return Object.assign(Object.assign(Object.assign({},e),{selectedColumn:o,sortDirection:r,currentPage:1}),a&&{allSelected:!1,selectedCount:0,selectedRows:[],toggleOnSelectedRowsChange:n})}case"CHANGE_PAGE":{const{page:r,paginationServer:o,visibleOnly:a,persistSelectedOnPageChange:s}=t,l=o&&s,d=o&&!s||a;return Object.assign(Object.assign(Object.assign(Object.assign({},e),{currentPage:r}),l&&{allSelected:!1}),d&&{allSelected:!1,selectedCount:0,selectedRows:[],toggleOnSelectedRowsChange:n})}case"CHANGE_ROWS_PER_PAGE":{const{rowsPerPage:r,page:o}=t;return Object.assign(Object.assign({},e),{currentPage:o,rowsPerPage:r})}}}const ta=L`
	pointer-events: none;
	opacity: 0.4;
`,na=P.div`
	position: relative;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	max-width: 100%;
	${({disabled:e})=>e&&ta};
	${({theme:e})=>e.table.style};
`,ra=L`
	position: sticky;
	position: -webkit-sticky; /* Safari */
	top: 0;
	z-index: 1;
`,oa=P.div`
	display: flex;
	width: 100%;
	${({$fixedHeader:e})=>e&&ra};
	${({theme:e})=>e.head.style};
`,aa=P.div`
	display: flex;
	align-items: stretch;
	width: 100%;
	${({theme:e})=>e.headRow.style};
	${({$dense:e,theme:t})=>e&&t.headRow.denseStyle};
`,pr=(e,...t)=>L`
		@media screen and (max-width: ${599}px) {
			${L(e,...t)}
		}
	`,ia=(e,...t)=>L`
		@media screen and (max-width: ${959}px) {
			${L(e,...t)}
		}
	`,sa=(e,...t)=>L`
		@media screen and (max-width: ${1280}px) {
			${L(e,...t)}
		}
	`,la=e=>(t,...n)=>L`
				@media screen and (max-width: ${e}px) {
					${L(t,...n)}
				}
			`,Be=P.div`
	position: relative;
	display: flex;
	align-items: center;
	box-sizing: border-box;
	line-height: normal;
	${({theme:e,$headCell:t})=>e[t?"headCells":"cells"].style};
	${({$noPadding:e})=>e&&"padding: 0"};
`,gr=P(Be)`
	flex-grow: ${({button:e,grow:t})=>t===0||e?0:t||1};
	flex-shrink: 0;
	flex-basis: 0;
	max-width: ${({maxWidth:e})=>e||"100%"};
	min-width: ${({minWidth:e})=>e||"100px"};
	${({width:e})=>e&&L`
			min-width: ${e};
			max-width: ${e};
		`};
	${({right:e})=>e&&"justify-content: flex-end"};
	${({button:e,center:t})=>(t||e)&&"justify-content: center"};
	${({compact:e,button:t})=>(e||t)&&"padding: 0"};

	/* handle hiding cells */
	${({hide:e})=>e&&e==="sm"&&pr`
    display: none;
  `};
	${({hide:e})=>e&&e==="md"&&ia`
    display: none;
  `};
	${({hide:e})=>e&&e==="lg"&&sa`
    display: none;
  `};
	${({hide:e})=>e&&Number.isInteger(e)&&la(e)`
    display: none;
  `};
`,ca=L`
	div:first-child {
		white-space: ${({$wrapCell:e})=>e?"normal":"nowrap"};
		overflow: ${({$allowOverflow:e})=>e?"visible":"hidden"};
		text-overflow: ellipsis;
	}
`,da=P(gr).attrs(e=>({style:e.style}))`
	${({$renderAsCell:e})=>!e&&ca};
	${({theme:e,$isDragging:t})=>t&&e.cells.draggingStyle};
	${({$cellStyle:e})=>e};
`;var ua=i.memo(function({id:e,column:t,row:n,rowIndex:r,dataTag:o,isDragging:a,onDragStart:s,onDragOver:l,onDragEnd:d,onDragEnter:f,onDragLeave:u}){const{style:p,classNames:x}=ur(n,t.conditionalCellStyles,["rdt_TableCell"]);return i.createElement(da,{id:e,"data-column-id":t.id,role:"cell",className:x,"data-tag":o,$cellStyle:t.style,$renderAsCell:!!t.cell,$allowOverflow:t.allowOverflow,button:t.button,center:t.center,compact:t.compact,grow:t.grow,hide:t.hide,maxWidth:t.maxWidth,minWidth:t.minWidth,right:t.right,width:t.width,$wrapCell:t.wrap,style:p,$isDragging:a,onDragStart:s,onDragOver:l,onDragEnd:d,onDragEnter:f,onDragLeave:u},!t.cell&&i.createElement("div",{"data-tag":o},function(h,m,R,k){if(!m)return null;if(typeof m!="string"&&typeof m!="function")throw new Error("selector must be a . delimited string eg (my.property) or function (e.g. row => row.field");return R&&typeof R=="function"?R(h,k):m&&typeof m=="function"?m(h,k):Wt(h,m)}(n,t.selector,t.format,r)),t.cell&&t.cell(n,r,t,e))}),fr=i.memo(function({name:e,component:t="input",componentOptions:n={style:{}},indeterminate:r=!1,checked:o=!1,disabled:a=!1,onClick:s=M}){const l=t,d=l!=="input"?n.style:(u=>Object.assign(Object.assign({fontSize:"18px"},!u&&{cursor:"pointer"}),{padding:0,marginTop:"1px",verticalAlign:"middle",position:"relative"}))(a),f=i.useMemo(()=>function(u,...p){let x;return Object.keys(u).map(h=>u[h]).forEach((h,m)=>{typeof h=="function"&&(x=Object.assign(Object.assign({},u),{[Object.keys(u)[m]]:h(...p)}))}),x||u}(n,r),[n,r]);return i.createElement(l,Object.assign({type:"checkbox",ref:u=>{u&&(u.indeterminate=r)},style:d,onClick:a?M:s,name:e,"aria-label":e,checked:o,disabled:a},f,{onChange:M}))});const pa=P(Be)`
	flex: 0 0 48px;
	min-width: 48px;
	justify-content: center;
	align-items: center;
	user-select: none;
	white-space: nowrap;
`;function ga({name:e,keyField:t,row:n,rowCount:r,selected:o,selectableRowsComponent:a,selectableRowsComponentProps:s,selectableRowsSingle:l,selectableRowDisabled:d,onSelectedRow:f}){const u=!(!d||!d(n));return i.createElement(pa,{onClick:p=>p.stopPropagation(),className:"rdt_TableCell",$noPadding:!0},i.createElement(fr,{name:e,component:a,componentOptions:s,checked:o,"aria-checked":o,onClick:()=>{f({type:"SELECT_SINGLE_ROW",row:n,isSelected:o,keyField:t,rowCount:r,singleSelect:l})},disabled:u}))}const fa=P.button`
	display: inline-flex;
	align-items: center;
	user-select: none;
	white-space: nowrap;
	border: none;
	background-color: transparent;
	${({theme:e})=>e.expanderButton.style};
`;function ha({disabled:e=!1,expanded:t=!1,expandableIcon:n,id:r,row:o,onToggled:a}){const s=t?n.expanded:n.collapsed;return i.createElement(fa,{"aria-disabled":e,onClick:()=>a&&a(o),"data-testid":`expander-button-${r}`,disabled:e,"aria-label":t?"Collapse Row":"Expand Row",role:"button",type:"button"},s)}const ma=P(Be)`
	white-space: nowrap;
	font-weight: 400;
	min-width: 48px;
	${({theme:e})=>e.expanderCell.style};
`;function ba({row:e,expanded:t=!1,expandableIcon:n,id:r,onToggled:o,disabled:a=!1}){return i.createElement(ma,{onClick:s=>s.stopPropagation(),$noPadding:!0},i.createElement(ha,{id:r,row:e,expanded:t,expandableIcon:n,disabled:a,onToggled:o}))}const wa=P.div`
	width: 100%;
	box-sizing: border-box;
	${({theme:e})=>e.expanderRow.style};
	${({$extendedRowStyle:e})=>e};
`;var ya=i.memo(function({data:e,ExpanderComponent:t,expanderComponentProps:n,extendedRowStyle:r,extendedClassNames:o}){const a=["rdt_ExpanderRow",...o.split(" ").filter(s=>s!=="rdt_TableRow")].join(" ");return i.createElement(wa,{className:a,$extendedRowStyle:r},i.createElement(t,Object.assign({data:e},n)))}),wt,Bt,jn;(function(e){e.LTR="ltr",e.RTL="rtl",e.AUTO="auto"})(wt||(wt={})),function(e){e.LEFT="left",e.RIGHT="right",e.CENTER="center"}(Bt||(Bt={})),function(e){e.SM="sm",e.MD="md",e.LG="lg"}(jn||(jn={}));const xa=L`
	&:hover {
		${({$highlightOnHover:e,theme:t})=>e&&t.rows.highlightOnHoverStyle};
	}
`,va=L`
	&:hover {
		cursor: pointer;
	}
`,Ca=P.div.attrs(e=>({style:e.style}))`
	display: flex;
	align-items: stretch;
	align-content: stretch;
	width: 100%;
	box-sizing: border-box;
	${({theme:e})=>e.rows.style};
	${({$dense:e,theme:t})=>e&&t.rows.denseStyle};
	${({$striped:e,theme:t})=>e&&t.rows.stripedStyle};
	${({$highlightOnHover:e})=>e&&xa};
	${({$pointerOnHover:e})=>e&&va};
	${({$selected:e,theme:t})=>e&&t.rows.selectedHighlightStyle};
`;function Sa({columns:e=[],conditionalRowStyles:t=[],defaultExpanded:n=!1,defaultExpanderDisabled:r=!1,dense:o=!1,expandableIcon:a,expandableRows:s=!1,expandableRowsComponent:l,expandableRowsComponentProps:d,expandableRowsHideExpander:f,expandOnRowClicked:u=!1,expandOnRowDoubleClicked:p=!1,highlightOnHover:x=!1,id:h,expandableInheritConditionalStyles:m,keyField:R,onRowClicked:k=M,onRowDoubleClicked:$=M,onRowMouseEnter:C=M,onRowMouseLeave:b=M,onRowExpandToggled:v=M,onSelectedRow:A=M,pointerOnHover:S=!1,row:g,rowCount:I,rowIndex:Y,selectableRowDisabled:U=null,selectableRows:Q=!1,selectableRowsComponent:oe,selectableRowsComponentProps:j,selectableRowsHighlight:ge=!1,selectableRowsSingle:ve=!1,selected:fe,striped:ae=!1,draggingColumnId:De,onDragStart:q,onDragOver:he,onDragEnd:ce,onDragEnter:N,onDragLeave:Ce}){const[X,de]=i.useState(n);i.useEffect(()=>{de(n)},[n]);const K=i.useCallback(()=>{de(!X),v(!X,g)},[X,v,g]),me=S||s&&(u||p),ue=i.useCallback(F=>{F.target&&F.target.getAttribute("data-tag")==="allowRowEvents"&&(k(g,F),!r&&s&&u&&K())},[r,u,s,K,k,g]),J=i.useCallback(F=>{F.target&&F.target.getAttribute("data-tag")==="allowRowEvents"&&($(g,F),!r&&s&&p&&K())},[r,p,s,K,$,g]),Se=i.useCallback(F=>{C(g,F)},[C,g]),Z=i.useCallback(F=>{b(g,F)},[b,g]),W=Ne(g,R),{style:Qe,classNames:Je}=ur(g,t,["rdt_TableRow"]),$t=ge&&fe,Et=m?Qe:{},kt=ae&&Y%2==0;return i.createElement(i.Fragment,null,i.createElement(Ca,{id:`row-${h}`,role:"row",$striped:kt,$highlightOnHover:x,$pointerOnHover:!r&&me,$dense:o,onClick:ue,onDoubleClick:J,onMouseEnter:Se,onMouseLeave:Z,className:Je,$selected:$t,style:Qe},Q&&i.createElement(ga,{name:`select-row-${W}`,keyField:R,row:g,rowCount:I,selected:fe,selectableRowsComponent:oe,selectableRowsComponentProps:j,selectableRowDisabled:U,selectableRowsSingle:ve,onSelectedRow:A}),s&&!f&&i.createElement(ba,{id:W,expandableIcon:a,expanded:X,row:g,onToggled:K,disabled:r}),e.map(F=>F.omit?null:i.createElement(ua,{id:`cell-${F.id}-${W}`,key:`cell-${F.id}-${W}`,dataTag:F.ignoreRowClick||F.button?null:"allowRowEvents",column:F,row:g,rowIndex:Y,isDragging:Xe(De,F.id),onDragStart:q,onDragOver:he,onDragEnd:ce,onDragEnter:N,onDragLeave:Ce}))),s&&X&&i.createElement(ya,{key:`expander-${W}`,data:g,extendedRowStyle:Et,extendedClassNames:Je,ExpanderComponent:l,expanderComponentProps:d}))}const Ra=P.span`
	padding: 2px;
	color: inherit;
	flex-grow: 0;
	flex-shrink: 0;
	${({$sortActive:e})=>e?"opacity: 1":"opacity: 0"};
	${({$sortDirection:e})=>e==="desc"&&"transform: rotate(180deg)"};
`,$a=({sortActive:e,sortDirection:t})=>O.createElement(Ra,{$sortActive:e,$sortDirection:t},"▲"),Ea=P(gr)`
	${({button:e})=>e&&"text-align: center"};
	${({theme:e,$isDragging:t})=>t&&e.headCells.draggingStyle};
`,ka=L`
	cursor: pointer;
	span.__rdt_custom_sort_icon__ {
		i,
		svg {
			transform: 'translate3d(0, 0, 0)';
			${({sortActive:e})=>e?"opacity: 1":"opacity: 0"};
			color: inherit;
			font-size: 18px;
			height: 18px;
			width: 18px;
			backface-visibility: hidden;
			transform-style: preserve-3d;
			transition-duration: 95ms;
			transition-property: transform;
		}

		&.asc i,
		&.asc svg {
			transform: rotate(180deg);
		}
	}

	${({sortActive:e})=>!e&&L`
			&:hover,
			&:focus {
				opacity: 0.7;

				span,
				span.__rdt_custom_sort_icon__ * {
					opacity: 0.7;
				}
			}
		`};
`,Oa=P.div`
	display: inline-flex;
	align-items: center;
	justify-content: inherit;
	height: 100%;
	width: 100%;
	outline: none;
	user-select: none;
	overflow: hidden;
	${({disabled:e})=>!e&&ka};
`,Pa=P.div`
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;var Aa=i.memo(function({column:e,disabled:t,draggingColumnId:n,selectedColumn:r={},sortDirection:o,sortIcon:a,sortServer:s,pagination:l,paginationServer:d,persistSelectedOnSort:f,selectableRowsVisibleOnly:u,onSort:p,onDragStart:x,onDragOver:h,onDragEnd:m,onDragEnter:R,onDragLeave:k}){i.useEffect(()=>{typeof e.selector=="string"&&console.error(`Warning: ${e.selector} is a string based column selector which has been deprecated as of v7 and will be removed in v8. Instead, use a selector function e.g. row => row[field]...`)},[]);const[$,C]=i.useState(!1),b=i.useRef(null);if(i.useEffect(()=>{b.current&&C(b.current.scrollWidth>b.current.clientWidth)},[$]),e.omit)return null;const v=()=>{if(!e.sortable&&!e.selector)return;let j=o;Xe(r.id,e.id)&&(j=o===xe.ASC?xe.DESC:xe.ASC),p({type:"SORT_CHANGE",sortDirection:j,selectedColumn:e,clearSelectedOnSort:l&&d&&!f||s||u})},A=j=>i.createElement($a,{sortActive:j,sortDirection:o}),S=()=>i.createElement("span",{className:[o,"__rdt_custom_sort_icon__"].join(" ")},a),g=!(!e.sortable||!Xe(r.id,e.id)),I=!e.sortable||t,Y=e.sortable&&!a&&!e.right,U=e.sortable&&!a&&e.right,Q=e.sortable&&a&&!e.right,oe=e.sortable&&a&&e.right;return i.createElement(Ea,{"data-column-id":e.id,className:"rdt_TableCol",$headCell:!0,allowOverflow:e.allowOverflow,button:e.button,compact:e.compact,grow:e.grow,hide:e.hide,maxWidth:e.maxWidth,minWidth:e.minWidth,right:e.right,center:e.center,width:e.width,draggable:e.reorder,$isDragging:Xe(e.id,n),onDragStart:x,onDragOver:h,onDragEnd:m,onDragEnter:R,onDragLeave:k},e.name&&i.createElement(Oa,{"data-column-id":e.id,"data-sort-id":e.id,role:"columnheader",tabIndex:0,className:"rdt_TableCol_Sortable",onClick:I?void 0:v,onKeyPress:I?void 0:j=>{j.key==="Enter"&&v()},sortActive:!I&&g,disabled:I},!I&&oe&&S(),!I&&U&&A(g),typeof e.name=="string"?i.createElement(Pa,{title:$?e.name:void 0,ref:b,"data-column-id":e.id},e.name):e.name,!I&&Q&&S(),!I&&Y&&A(g)))});const Da=P(Be)`
	flex: 0 0 48px;
	justify-content: center;
	align-items: center;
	user-select: none;
	white-space: nowrap;
	font-size: unset;
`;function Ia({headCell:e=!0,rowData:t,keyField:n,allSelected:r,mergeSelections:o,selectedRows:a,selectableRowsComponent:s,selectableRowsComponentProps:l,selectableRowDisabled:d,onSelectAllRows:f}){const u=a.length>0&&!r,p=d?t.filter(m=>!d(m)):t,x=p.length===0,h=Math.min(t.length,p.length);return i.createElement(Da,{className:"rdt_TableCol",$headCell:e,$noPadding:!0},i.createElement(fr,{name:"select-all-rows",component:s,componentOptions:l,onClick:()=>{f({type:"SELECT_ALL_ROWS",rows:p,rowCount:h,mergeSelections:o,keyField:n})},checked:r,indeterminate:u,disabled:x}))}function hr(e=wt.AUTO){const t=typeof window=="object",[n,r]=i.useState(!1);return i.useEffect(()=>{if(t)if(e!=="auto")r(e==="rtl");else{const o=!(!window.document||!window.document.createElement),a=document.getElementsByTagName("BODY")[0],s=document.getElementsByTagName("HTML")[0],l=a.dir==="rtl"||s.dir==="rtl";r(o&&l)}},[e,t]),n}const Ta=P.div`
	display: flex;
	align-items: center;
	flex: 1 0 auto;
	height: 100%;
	color: ${({theme:e})=>e.contextMenu.fontColor};
	font-size: ${({theme:e})=>e.contextMenu.fontSize};
	font-weight: 400;
`,Ha=P.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex-wrap: wrap;
`,Fn=P.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	box-sizing: inherit;
	z-index: 1;
	align-items: center;
	justify-content: space-between;
	display: flex;
	${({$rtl:e})=>e&&"direction: rtl"};
	${({theme:e})=>e.contextMenu.style};
	${({theme:e,$visible:t})=>t&&e.contextMenu.activeStyle};
`;function ja({contextMessage:e,contextActions:t,contextComponent:n,selectedCount:r,direction:o}){const a=hr(o),s=r>0;return n?i.createElement(Fn,{$visible:s},i.cloneElement(n,{selectedCount:r})):i.createElement(Fn,{$visible:s,$rtl:a},i.createElement(Ta,null,((l,d,f)=>{if(d===0)return null;const u=d===1?l.singular:l.plural;return f?`${d} ${l.message||""} ${u}`:`${d} ${u} ${l.message||""}`})(e,r,a)),i.createElement(Ha,null,t))}const Fa=P.div`
	position: relative;
	box-sizing: border-box;
	overflow: hidden;
	display: flex;
	flex: 1 1 auto;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	flex-wrap: wrap;
	${({theme:e})=>e.header.style}
`,_a=P.div`
	flex: 1 0 auto;
	color: ${({theme:e})=>e.header.fontColor};
	font-size: ${({theme:e})=>e.header.fontSize};
	font-weight: 400;
`,Ma=P.div`
	flex: 1 0 auto;
	display: flex;
	align-items: center;
	justify-content: flex-end;

	> * {
		margin-left: 5px;
	}
`,La=({title:e,actions:t=null,contextMessage:n,contextActions:r,contextComponent:o,selectedCount:a,direction:s,showMenu:l=!0})=>i.createElement(Fa,{className:"rdt_TableHeader",role:"heading","aria-level":1},i.createElement(_a,null,e),t&&i.createElement(Ma,null,t),l&&i.createElement(ja,{contextMessage:n,contextActions:r,contextComponent:o,direction:s,selectedCount:a}));function mr(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function"){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n}const Na={left:"flex-start",right:"flex-end",center:"center"},za=P.header`
	position: relative;
	display: flex;
	flex: 1 1 auto;
	box-sizing: border-box;
	align-items: center;
	padding: 4px 16px 4px 24px;
	width: 100%;
	justify-content: ${({align:e})=>Na[e]};
	flex-wrap: ${({$wrapContent:e})=>e?"wrap":"nowrap"};
	${({theme:e})=>e.subHeader.style}
`,Wa=e=>{var{align:t="right",wrapContent:n=!0}=e,r=mr(e,["align","wrapContent"]);return i.createElement(za,Object.assign({align:t,$wrapContent:n},r))},Ba=P.div`
	display: flex;
	flex-direction: column;
`,Ga=P.div`
	position: relative;
	width: 100%;
	border-radius: inherit;
	${({$responsive:e,$fixedHeader:t})=>e&&L`
			overflow-x: auto;

			// hidden prevents vertical scrolling in firefox when fixedHeader is disabled
			overflow-y: ${t?"auto":"hidden"};
			min-height: 0;
		`};

	${({$fixedHeader:e=!1,$fixedHeaderScrollHeight:t="100vh"})=>e&&L`
			max-height: ${t};
			-webkit-overflow-scrolling: touch;
		`};

	${({theme:e})=>e.responsiveWrapper.style};
`,_n=P.div`
	position: relative;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	${e=>e.theme.progress.style};
`,Ua=P.div`
	position: relative;
	width: 100%;
	${({theme:e})=>e.tableWrapper.style};
`,Va=P(Be)`
	white-space: nowrap;
	${({theme:e})=>e.expanderCell.style};
`,Ya=P.div`
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	${({theme:e})=>e.noData.style};
`,qa=()=>O.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24"},O.createElement("path",{d:"M7 10l5 5 5-5z"}),O.createElement("path",{d:"M0 0h24v24H0z",fill:"none"})),Xa=P.select`
	cursor: pointer;
	height: 24px;
	max-width: 100%;
	user-select: none;
	padding-left: 8px;
	padding-right: 24px;
	box-sizing: content-box;
	font-size: inherit;
	color: inherit;
	border: none;
	background-color: transparent;
	appearance: none;
	direction: ltr;
	flex-shrink: 0;

	&::-ms-expand {
		display: none;
	}

	&:disabled::-ms-expand {
		background: #f60;
	}

	option {
		color: initial;
	}
`,Ka=P.div`
	position: relative;
	flex-shrink: 0;
	font-size: inherit;
	color: inherit;
	margin-top: 1px;

	svg {
		top: 0;
		right: 0;
		color: inherit;
		position: absolute;
		fill: currentColor;
		width: 24px;
		height: 24px;
		display: inline-block;
		user-select: none;
		pointer-events: none;
	}
`,Za=e=>{var{defaultValue:t,onChange:n}=e,r=mr(e,["defaultValue","onChange"]);return i.createElement(Ka,null,i.createElement(Xa,Object.assign({onChange:n,defaultValue:t},r)),i.createElement(qa,null))},c={columns:[],data:[],title:"",keyField:"id",selectableRows:!1,selectableRowsHighlight:!1,selectableRowsNoSelectAll:!1,selectableRowSelected:null,selectableRowDisabled:null,selectableRowsComponent:"input",selectableRowsComponentProps:{},selectableRowsVisibleOnly:!1,selectableRowsSingle:!1,clearSelectedRows:!1,expandableRows:!1,expandableRowDisabled:null,expandableRowExpanded:null,expandOnRowClicked:!1,expandableRowsHideExpander:!1,expandOnRowDoubleClicked:!1,expandableInheritConditionalStyles:!1,expandableRowsComponent:function(){return O.createElement("div",null,"To add an expander pass in a component instance via ",O.createElement("strong",null,"expandableRowsComponent"),". You can then access props.data from this component.")},expandableIcon:{collapsed:O.createElement(()=>O.createElement("svg",{fill:"currentColor",height:"24",viewBox:"0 0 24 24",width:"24",xmlns:"http://www.w3.org/2000/svg"},O.createElement("path",{d:"M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"}),O.createElement("path",{d:"M0-.25h24v24H0z",fill:"none"})),null),expanded:O.createElement(()=>O.createElement("svg",{fill:"currentColor",height:"24",viewBox:"0 0 24 24",width:"24",xmlns:"http://www.w3.org/2000/svg"},O.createElement("path",{d:"M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z"}),O.createElement("path",{d:"M0-.75h24v24H0z",fill:"none"})),null)},expandableRowsComponentProps:{},progressPending:!1,progressComponent:O.createElement("div",{style:{fontSize:"24px",fontWeight:700,padding:"24px"}},"Loading..."),persistTableHead:!1,sortIcon:null,sortFunction:null,sortServer:!1,striped:!1,highlightOnHover:!1,pointerOnHover:!1,noContextMenu:!1,contextMessage:{singular:"item",plural:"items",message:"selected"},actions:null,contextActions:null,contextComponent:null,defaultSortFieldId:null,defaultSortAsc:!0,responsive:!0,noDataComponent:O.createElement("div",{style:{padding:"24px"}},"There are no records to display"),disabled:!1,noTableHead:!1,noHeader:!1,subHeader:!1,subHeaderAlign:Bt.RIGHT,subHeaderWrap:!0,subHeaderComponent:null,fixedHeader:!1,fixedHeaderScrollHeight:"100vh",pagination:!1,paginationServer:!1,paginationServerOptions:{persistSelectedOnSort:!1,persistSelectedOnPageChange:!1},paginationDefaultPage:1,paginationResetDefaultPage:!1,paginationTotalRows:0,paginationPerPage:10,paginationRowsPerPageOptions:[10,15,20,25,30],paginationComponent:null,paginationComponentOptions:{},paginationIconFirstPage:O.createElement(()=>O.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24","aria-hidden":"true",role:"presentation"},O.createElement("path",{d:"M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"}),O.createElement("path",{fill:"none",d:"M24 24H0V0h24v24z"})),null),paginationIconLastPage:O.createElement(()=>O.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24","aria-hidden":"true",role:"presentation"},O.createElement("path",{d:"M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"}),O.createElement("path",{fill:"none",d:"M0 0h24v24H0V0z"})),null),paginationIconNext:O.createElement(()=>O.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24","aria-hidden":"true",role:"presentation"},O.createElement("path",{d:"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"}),O.createElement("path",{d:"M0 0h24v24H0z",fill:"none"})),null),paginationIconPrevious:O.createElement(()=>O.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24","aria-hidden":"true",role:"presentation"},O.createElement("path",{d:"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"}),O.createElement("path",{d:"M0 0h24v24H0z",fill:"none"})),null),dense:!1,conditionalRowStyles:[],theme:"default",customStyles:{},direction:wt.AUTO,onChangePage:M,onChangeRowsPerPage:M,onRowClicked:M,onRowDoubleClicked:M,onRowMouseEnter:M,onRowMouseLeave:M,onRowExpandToggled:M,onSelectedRowsChange:M,onSort:M,onColumnOrderChange:M},Qa={rowsPerPageText:"Rows per page:",rangeSeparatorText:"of",noRowsPerPage:!1,selectAllRowsItem:!1,selectAllRowsItemText:"All"},Ja=P.nav`
	display: flex;
	flex: 1 1 auto;
	justify-content: flex-end;
	align-items: center;
	box-sizing: border-box;
	padding-right: 8px;
	padding-left: 8px;
	width: 100%;
	${({theme:e})=>e.pagination.style};
`,it=P.button`
	position: relative;
	display: block;
	user-select: none;
	border: none;
	${({theme:e})=>e.pagination.pageButtonsStyle};
	${({$isRTL:e})=>e&&"transform: scale(-1, -1)"};
`,ei=P.div`
	display: flex;
	align-items: center;
	border-radius: 4px;
	white-space: nowrap;
	${pr`
    width: 100%;
    justify-content: space-around;
  `};
`,br=P.span`
	flex-shrink: 1;
	user-select: none;
`,ti=P(br)`
	margin: 0 24px;
`,ni=P(br)`
	margin: 0 4px;
`;var ri=i.memo(function({rowsPerPage:e,rowCount:t,currentPage:n,direction:r=c.direction,paginationRowsPerPageOptions:o=c.paginationRowsPerPageOptions,paginationIconLastPage:a=c.paginationIconLastPage,paginationIconFirstPage:s=c.paginationIconFirstPage,paginationIconNext:l=c.paginationIconNext,paginationIconPrevious:d=c.paginationIconPrevious,paginationComponentOptions:f=c.paginationComponentOptions,onChangeRowsPerPage:u=c.onChangeRowsPerPage,onChangePage:p=c.onChangePage}){const x=(()=>{const j=typeof window=="object";function ge(){return{width:j?window.innerWidth:void 0,height:j?window.innerHeight:void 0}}const[ve,fe]=i.useState(ge);return i.useEffect(()=>{if(!j)return()=>null;function ae(){fe(ge())}return window.addEventListener("resize",ae),()=>window.removeEventListener("resize",ae)},[]),ve})(),h=hr(r),m=x.width&&x.width>599,R=qe(t,e),k=n*e,$=k-e+1,C=n===1,b=n===R,v=Object.assign(Object.assign({},Qa),f),A=n===R?`${$}-${t} ${v.rangeSeparatorText} ${t}`:`${$}-${k} ${v.rangeSeparatorText} ${t}`,S=i.useCallback(()=>p(n-1),[n,p]),g=i.useCallback(()=>p(n+1),[n,p]),I=i.useCallback(()=>p(1),[p]),Y=i.useCallback(()=>p(qe(t,e)),[p,t,e]),U=i.useCallback(j=>u(Number(j.target.value),n),[n,u]),Q=o.map(j=>i.createElement("option",{key:j,value:j},j));v.selectAllRowsItem&&Q.push(i.createElement("option",{key:-1,value:t},v.selectAllRowsItemText));const oe=i.createElement(Za,{onChange:U,defaultValue:e,"aria-label":v.rowsPerPageText},Q);return i.createElement(Ja,{className:"rdt_Pagination"},!v.noRowsPerPage&&m&&i.createElement(i.Fragment,null,i.createElement(ni,null,v.rowsPerPageText),oe),m&&i.createElement(ti,null,A),i.createElement(ei,null,i.createElement(it,{id:"pagination-first-page",type:"button","aria-label":"First Page","aria-disabled":C,onClick:I,disabled:C,$isRTL:h},s),i.createElement(it,{id:"pagination-previous-page",type:"button","aria-label":"Previous Page","aria-disabled":C,onClick:S,disabled:C,$isRTL:h},d),!v.noRowsPerPage&&!m&&oe,i.createElement(it,{id:"pagination-next-page",type:"button","aria-label":"Next Page","aria-disabled":b,onClick:g,disabled:b,$isRTL:h},l),i.createElement(it,{id:"pagination-last-page",type:"button","aria-label":"Last Page","aria-disabled":b,onClick:Y,disabled:b,$isRTL:h},a)))});const $e=(e,t)=>{const n=i.useRef(!0);i.useEffect(()=>{n.current?n.current=!1:e()},t)};var oi=function(e){return function(t){return!!t&&typeof t=="object"}(e)&&!function(t){var n=Object.prototype.toString.call(t);return n==="[object RegExp]"||n==="[object Date]"||function(r){return r.$$typeof===ai}(t)}(e)},ai=typeof Symbol=="function"&&Symbol.for?Symbol.for("react.element"):60103;function Ze(e,t){return t.clone!==!1&&t.isMergeableObject(e)?ze((n=e,Array.isArray(n)?[]:{}),e,t):e;var n}function ii(e,t,n){return e.concat(t).map(function(r){return Ze(r,n)})}function Mn(e){return Object.keys(e).concat(function(t){return Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(t).filter(function(n){return t.propertyIsEnumerable(n)}):[]}(e))}function Ln(e,t){try{return t in e}catch{return!1}}function si(e,t,n){var r={};return n.isMergeableObject(e)&&Mn(e).forEach(function(o){r[o]=Ze(e[o],n)}),Mn(t).forEach(function(o){(function(a,s){return Ln(a,s)&&!(Object.hasOwnProperty.call(a,s)&&Object.propertyIsEnumerable.call(a,s))})(e,o)||(Ln(e,o)&&n.isMergeableObject(t[o])?r[o]=function(a,s){if(!s.customMerge)return ze;var l=s.customMerge(a);return typeof l=="function"?l:ze}(o,n)(e[o],t[o],n):r[o]=Ze(t[o],n))}),r}function ze(e,t,n){(n=n||{}).arrayMerge=n.arrayMerge||ii,n.isMergeableObject=n.isMergeableObject||oi,n.cloneUnlessOtherwiseSpecified=Ze;var r=Array.isArray(t);return r===Array.isArray(e)?r?n.arrayMerge(e,t,n):si(e,t,n):Ze(t,n)}ze.all=function(e,t){if(!Array.isArray(e))throw new Error("first argument should be an array");return e.reduce(function(n,r){return ze(n,r,t)},{})};var li=ze;const Nn={text:{primary:"rgba(0, 0, 0, 0.87)",secondary:"rgba(0, 0, 0, 0.54)",disabled:"rgba(0, 0, 0, 0.38)"},background:{default:"#FFFFFF"},context:{background:"#e3f2fd",text:"rgba(0, 0, 0, 0.87)"},divider:{default:"rgba(0,0,0,.12)"},button:{default:"rgba(0,0,0,.54)",focus:"rgba(0,0,0,.12)",hover:"rgba(0,0,0,.12)",disabled:"rgba(0, 0, 0, .18)"},selected:{default:"#e3f2fd",text:"rgba(0, 0, 0, 0.87)"},highlightOnHover:{default:"#EEEEEE",text:"rgba(0, 0, 0, 0.87)"},striped:{default:"#FAFAFA",text:"rgba(0, 0, 0, 0.87)"}},zn={default:Nn,light:Nn,dark:{text:{primary:"#FFFFFF",secondary:"rgba(255, 255, 255, 0.7)",disabled:"rgba(0,0,0,.12)"},background:{default:"#424242"},context:{background:"#E91E63",text:"#FFFFFF"},divider:{default:"rgba(81, 81, 81, 1)"},button:{default:"#FFFFFF",focus:"rgba(255, 255, 255, .54)",hover:"rgba(255, 255, 255, .12)",disabled:"rgba(255, 255, 255, .18)"},selected:{default:"rgba(0, 0, 0, .7)",text:"#FFFFFF"},highlightOnHover:{default:"rgba(0, 0, 0, .7)",text:"#FFFFFF"},striped:{default:"rgba(0, 0, 0, .87)",text:"#FFFFFF"}}};function ci(e,t,n,r){const[o,a]=i.useState(()=>Hn(e)),[s,l]=i.useState(""),d=i.useRef("");$e(()=>{a(Hn(e))},[e]);const f=i.useCallback(k=>{var $,C,b;const{attributes:v}=k.target,A=($=v.getNamedItem("data-column-id"))===null||$===void 0?void 0:$.value;A&&(d.current=((b=(C=o[at(o,A)])===null||C===void 0?void 0:C.id)===null||b===void 0?void 0:b.toString())||"",l(d.current))},[o]),u=i.useCallback(k=>{var $;const{attributes:C}=k.target,b=($=C.getNamedItem("data-column-id"))===null||$===void 0?void 0:$.value;if(b&&d.current&&b!==d.current){const v=at(o,d.current),A=at(o,b),S=[...o];S[v]=o[A],S[A]=o[v],a(S),t(S)}},[t,o]),p=i.useCallback(k=>{k.preventDefault()},[]),x=i.useCallback(k=>{k.preventDefault()},[]),h=i.useCallback(k=>{k.preventDefault(),d.current="",l("")},[]),m=function(k=!1){return k?xe.ASC:xe.DESC}(r),R=i.useMemo(()=>o[at(o,n==null?void 0:n.toString())]||{},[n,o]);return{tableColumns:o,draggingColumnId:s,handleDragStart:f,handleDragEnter:u,handleDragOver:p,handleDragLeave:x,handleDragEnd:h,defaultSortDirection:m,defaultSortColumn:R}}var gi=i.memo(function(e){const{data:t=c.data,columns:n=c.columns,title:r=c.title,actions:o=c.actions,keyField:a=c.keyField,striped:s=c.striped,highlightOnHover:l=c.highlightOnHover,pointerOnHover:d=c.pointerOnHover,dense:f=c.dense,selectableRows:u=c.selectableRows,selectableRowsSingle:p=c.selectableRowsSingle,selectableRowsHighlight:x=c.selectableRowsHighlight,selectableRowsNoSelectAll:h=c.selectableRowsNoSelectAll,selectableRowsVisibleOnly:m=c.selectableRowsVisibleOnly,selectableRowSelected:R=c.selectableRowSelected,selectableRowDisabled:k=c.selectableRowDisabled,selectableRowsComponent:$=c.selectableRowsComponent,selectableRowsComponentProps:C=c.selectableRowsComponentProps,onRowExpandToggled:b=c.onRowExpandToggled,onSelectedRowsChange:v=c.onSelectedRowsChange,expandableIcon:A=c.expandableIcon,onChangeRowsPerPage:S=c.onChangeRowsPerPage,onChangePage:g=c.onChangePage,paginationServer:I=c.paginationServer,paginationServerOptions:Y=c.paginationServerOptions,paginationTotalRows:U=c.paginationTotalRows,paginationDefaultPage:Q=c.paginationDefaultPage,paginationResetDefaultPage:oe=c.paginationResetDefaultPage,paginationPerPage:j=c.paginationPerPage,paginationRowsPerPageOptions:ge=c.paginationRowsPerPageOptions,paginationIconLastPage:ve=c.paginationIconLastPage,paginationIconFirstPage:fe=c.paginationIconFirstPage,paginationIconNext:ae=c.paginationIconNext,paginationIconPrevious:De=c.paginationIconPrevious,paginationComponent:q=c.paginationComponent,paginationComponentOptions:he=c.paginationComponentOptions,responsive:ce=c.responsive,progressPending:N=c.progressPending,progressComponent:Ce=c.progressComponent,persistTableHead:X=c.persistTableHead,noDataComponent:de=c.noDataComponent,disabled:K=c.disabled,noTableHead:me=c.noTableHead,noHeader:ue=c.noHeader,fixedHeader:J=c.fixedHeader,fixedHeaderScrollHeight:Se=c.fixedHeaderScrollHeight,pagination:Z=c.pagination,subHeader:W=c.subHeader,subHeaderAlign:Qe=c.subHeaderAlign,subHeaderWrap:Je=c.subHeaderWrap,subHeaderComponent:$t=c.subHeaderComponent,noContextMenu:Et=c.noContextMenu,contextMessage:kt=c.contextMessage,contextActions:F=c.contextActions,contextComponent:wr=c.contextComponent,expandableRows:et=c.expandableRows,onRowClicked:Kt=c.onRowClicked,onRowDoubleClicked:Zt=c.onRowDoubleClicked,onRowMouseEnter:Qt=c.onRowMouseEnter,onRowMouseLeave:Jt=c.onRowMouseLeave,sortIcon:yr=c.sortIcon,onSort:xr=c.onSort,sortFunction:en=c.sortFunction,sortServer:Ot=c.sortServer,expandableRowsComponent:vr=c.expandableRowsComponent,expandableRowsComponentProps:Cr=c.expandableRowsComponentProps,expandableRowDisabled:tn=c.expandableRowDisabled,expandableRowsHideExpander:nn=c.expandableRowsHideExpander,expandOnRowClicked:Sr=c.expandOnRowClicked,expandOnRowDoubleClicked:Rr=c.expandOnRowDoubleClicked,expandableRowExpanded:rn=c.expandableRowExpanded,expandableInheritConditionalStyles:$r=c.expandableInheritConditionalStyles,defaultSortFieldId:Er=c.defaultSortFieldId,defaultSortAsc:kr=c.defaultSortAsc,clearSelectedRows:on=c.clearSelectedRows,conditionalRowStyles:Or=c.conditionalRowStyles,theme:an=c.theme,customStyles:sn=c.customStyles,direction:Ge=c.direction,onColumnOrderChange:Pr=c.onColumnOrderChange,className:Ar}=e,{tableColumns:ln,draggingColumnId:cn,handleDragStart:dn,handleDragEnter:un,handleDragOver:pn,handleDragLeave:gn,handleDragEnd:fn,defaultSortDirection:Dr,defaultSortColumn:Ir}=ci(n,Pr,Er,kr),[{rowsPerPage:be,currentPage:te,selectedRows:Pt,allSelected:hn,selectedCount:mn,selectedColumn:ie,sortDirection:Ie,toggleOnSelectedRowsChange:Tr},Re]=i.useReducer(ea,{allSelected:!1,selectedCount:0,selectedRows:[],selectedColumn:Ir,toggleOnSelectedRowsChange:!1,sortDirection:Dr,currentPage:Q,rowsPerPage:j,selectedRowsFlag:!1,contextMessage:c.contextMessage}),{persistSelectedOnSort:bn=!1,persistSelectedOnPageChange:tt=!1}=Y,wn=!(!I||!tt&&!bn),Hr=Z&&!N&&t.length>0,jr=q||ri,Fr=i.useMemo(()=>((y={},D="default",V="default")=>{const ne=zn[D]?D:V;return li({table:{style:{color:(w=zn[ne]).text.primary,backgroundColor:w.background.default}},tableWrapper:{style:{display:"table"}},responsiveWrapper:{style:{}},header:{style:{fontSize:"22px",color:w.text.primary,backgroundColor:w.background.default,minHeight:"56px",paddingLeft:"16px",paddingRight:"8px"}},subHeader:{style:{backgroundColor:w.background.default,minHeight:"52px"}},head:{style:{color:w.text.primary,fontSize:"12px",fontWeight:500}},headRow:{style:{backgroundColor:w.background.default,minHeight:"52px",borderBottomWidth:"1px",borderBottomColor:w.divider.default,borderBottomStyle:"solid"},denseStyle:{minHeight:"32px"}},headCells:{style:{paddingLeft:"16px",paddingRight:"16px"},draggingStyle:{cursor:"move"}},contextMenu:{style:{backgroundColor:w.context.background,fontSize:"18px",fontWeight:400,color:w.context.text,paddingLeft:"16px",paddingRight:"8px",transform:"translate3d(0, -100%, 0)",transitionDuration:"125ms",transitionTimingFunction:"cubic-bezier(0, 0, 0.2, 1)",willChange:"transform"},activeStyle:{transform:"translate3d(0, 0, 0)"}},cells:{style:{paddingLeft:"16px",paddingRight:"16px",wordBreak:"break-word"},draggingStyle:{}},rows:{style:{fontSize:"13px",fontWeight:400,color:w.text.primary,backgroundColor:w.background.default,minHeight:"48px","&:not(:last-of-type)":{borderBottomStyle:"solid",borderBottomWidth:"1px",borderBottomColor:w.divider.default}},denseStyle:{minHeight:"32px"},selectedHighlightStyle:{"&:nth-of-type(n)":{color:w.selected.text,backgroundColor:w.selected.default,borderBottomColor:w.background.default}},highlightOnHoverStyle:{color:w.highlightOnHover.text,backgroundColor:w.highlightOnHover.default,transitionDuration:"0.15s",transitionProperty:"background-color",borderBottomColor:w.background.default,outlineStyle:"solid",outlineWidth:"1px",outlineColor:w.background.default},stripedStyle:{color:w.striped.text,backgroundColor:w.striped.default}},expanderRow:{style:{color:w.text.primary,backgroundColor:w.background.default}},expanderCell:{style:{flex:"0 0 48px"}},expanderButton:{style:{color:w.button.default,fill:w.button.default,backgroundColor:"transparent",borderRadius:"2px",transition:"0.25s",height:"100%",width:"100%","&:hover:enabled":{cursor:"pointer"},"&:disabled":{color:w.button.disabled},"&:hover:not(:disabled)":{cursor:"pointer",backgroundColor:w.button.hover},"&:focus":{outline:"none",backgroundColor:w.button.focus},svg:{margin:"auto"}}},pagination:{style:{color:w.text.secondary,fontSize:"13px",minHeight:"56px",backgroundColor:w.background.default,borderTopStyle:"solid",borderTopWidth:"1px",borderTopColor:w.divider.default},pageButtonsStyle:{borderRadius:"50%",height:"40px",width:"40px",padding:"8px",margin:"px",cursor:"pointer",transition:"0.4s",color:w.button.default,fill:w.button.default,backgroundColor:"transparent","&:disabled":{cursor:"unset",color:w.button.disabled,fill:w.button.disabled},"&:hover:not(:disabled)":{backgroundColor:w.button.hover},"&:focus":{outline:"none",backgroundColor:w.button.focus}}},noData:{style:{display:"flex",alignItems:"center",justifyContent:"center",color:w.text.primary,backgroundColor:w.background.default}},progress:{style:{display:"flex",alignItems:"center",justifyContent:"center",color:w.text.primary,backgroundColor:w.background.default}}},y);var w})(sn,an),[sn,an]),_r=i.useMemo(()=>Object.assign({},Ge!=="auto"&&{dir:Ge}),[Ge]),B=i.useMemo(()=>{if(Ot)return t;if(ie!=null&&ie.sortFunction&&typeof ie.sortFunction=="function"){const y=ie.sortFunction,D=Ie===xe.ASC?y:(V,ne)=>-1*y(V,ne);return[...t].sort(D)}return function(y,D,V,ne){return D?ne&&typeof ne=="function"?ne(y.slice(0),D,V):y.slice(0).sort((w,nt)=>{let we,se;if(typeof D=="string"?(we=Wt(w,D),se=Wt(nt,D)):(we=D(w),se=D(nt)),V==="asc"){if(we<se)return-1;if(we>se)return 1}if(V==="desc"){if(we>se)return-1;if(we<se)return 1}return 0}):y}(t,ie==null?void 0:ie.selector,Ie,en)},[Ot,ie,Ie,t,en]),Ue=i.useMemo(()=>{if(Z&&!I){const y=te*be,D=y-be;return B.slice(D,y)}return B},[te,Z,I,be,B]),Mr=i.useCallback(y=>{Re(y)},[]),Lr=i.useCallback(y=>{Re(y)},[]),Nr=i.useCallback(y=>{Re(y)},[]),zr=i.useCallback((y,D)=>Kt(y,D),[Kt]),Wr=i.useCallback((y,D)=>Zt(y,D),[Zt]),Br=i.useCallback((y,D)=>Qt(y,D),[Qt]),Gr=i.useCallback((y,D)=>Jt(y,D),[Jt]),Te=i.useCallback(y=>Re({type:"CHANGE_PAGE",page:y,paginationServer:I,visibleOnly:m,persistSelectedOnPageChange:tt}),[I,tt,m]),Ur=i.useCallback(y=>{const D=qe(U||Ue.length,y),V=Ht(te,D);I||Te(V),Re({type:"CHANGE_ROWS_PER_PAGE",page:V,rowsPerPage:y})},[te,Te,I,U,Ue.length]);if(Z&&!I&&B.length>0&&Ue.length===0){const y=qe(B.length,be),D=Ht(te,y);Te(D)}$e(()=>{v({allSelected:hn,selectedCount:mn,selectedRows:Pt.slice(0)})},[Tr]),$e(()=>{xr(ie,Ie,B.slice(0))},[ie,Ie]),$e(()=>{g(te,U||B.length)},[te]),$e(()=>{S(be,te)},[be]),$e(()=>{Te(Q)},[Q,oe]),$e(()=>{if(Z&&I&&U>0){const y=qe(U,be),D=Ht(te,y);te!==D&&Te(D)}},[U]),i.useEffect(()=>{Re({type:"CLEAR_SELECTED_ROWS",selectedRowsFlag:on})},[p,on]),i.useEffect(()=>{if(!R)return;const y=B.filter(V=>R(V)),D=p?y.slice(0,1):y;Re({type:"SELECT_MULTIPLE_ROWS",keyField:a,selectedRows:D,totalRows:B.length,mergeSelections:wn})},[t,R]);const Vr=m?Ue:B,Yr=tt||p||h;return i.createElement(Ko,{theme:Fr},!ue&&(!!r||!!o)&&i.createElement(La,{title:r,actions:o,showMenu:!Et,selectedCount:mn,direction:Ge,contextActions:F,contextComponent:wr,contextMessage:kt}),W&&i.createElement(Wa,{align:Qe,wrapContent:Je},$t),i.createElement(Ga,Object.assign({$responsive:ce,$fixedHeader:J,$fixedHeaderScrollHeight:Se,className:Ar},_r),i.createElement(Ua,null,N&&!X&&i.createElement(_n,null,Ce),i.createElement(na,{disabled:K,className:"rdt_Table",role:"table"},!me&&(!!X||B.length>0&&!N)&&i.createElement(oa,{className:"rdt_TableHead",role:"rowgroup",$fixedHeader:J},i.createElement(aa,{className:"rdt_TableHeadRow",role:"row",$dense:f},u&&(Yr?i.createElement(Be,{style:{flex:"0 0 48px"}}):i.createElement(Ia,{allSelected:hn,selectedRows:Pt,selectableRowsComponent:$,selectableRowsComponentProps:C,selectableRowDisabled:k,rowData:Vr,keyField:a,mergeSelections:wn,onSelectAllRows:Lr})),et&&!nn&&i.createElement(Va,null),ln.map(y=>i.createElement(Aa,{key:y.id,column:y,selectedColumn:ie,disabled:N||B.length===0,pagination:Z,paginationServer:I,persistSelectedOnSort:bn,selectableRowsVisibleOnly:m,sortDirection:Ie,sortIcon:yr,sortServer:Ot,onSort:Mr,onDragStart:dn,onDragOver:pn,onDragEnd:fn,onDragEnter:un,onDragLeave:gn,draggingColumnId:cn})))),!B.length&&!N&&i.createElement(Ya,null,de),N&&X&&i.createElement(_n,null,Ce),!N&&B.length>0&&i.createElement(Ba,{className:"rdt_TableBody",role:"rowgroup"},Ue.map((y,D)=>{const V=Ne(y,a),ne=function(se=""){return typeof se!="number"&&(!se||se.length===0)}(V)?D:V,w=pt(y,Pt,a),nt=!!(et&&rn&&rn(y)),we=!!(et&&tn&&tn(y));return i.createElement(Sa,{id:ne,key:ne,keyField:a,"data-row-id":ne,columns:ln,row:y,rowCount:B.length,rowIndex:D,selectableRows:u,expandableRows:et,expandableIcon:A,highlightOnHover:l,pointerOnHover:d,dense:f,expandOnRowClicked:Sr,expandOnRowDoubleClicked:Rr,expandableRowsComponent:vr,expandableRowsComponentProps:Cr,expandableRowsHideExpander:nn,defaultExpanderDisabled:we,defaultExpanded:nt,expandableInheritConditionalStyles:$r,conditionalRowStyles:Or,selected:w,selectableRowsHighlight:x,selectableRowsComponent:$,selectableRowsComponentProps:C,selectableRowDisabled:k,selectableRowsSingle:p,striped:s,onRowExpandToggled:b,onRowClicked:zr,onRowDoubleClicked:Wr,onRowMouseEnter:Br,onRowMouseLeave:Gr,onSelectedRow:Nr,draggingColumnId:cn,onDragStart:dn,onDragOver:pn,onDragEnd:fn,onDragEnter:un,onDragLeave:gn})}))))),Hr&&i.createElement("div",null,i.createElement(jr,{onChangePage:Te,onChangeRowsPerPage:Ur,rowCount:U||B.length,currentPage:te,rowsPerPage:be,direction:Ge,paginationRowsPerPageOptions:ge,paginationIconLastPage:ve,paginationIconFirstPage:fe,paginationIconNext:ae,paginationIconPrevious:De,paginationComponentOptions:he})))});function fi({className:e="",disabled:t,children:n,...r}){return qr("button",{...r,className:`inline-flex items-center rounded-md border border-transparent bg-primary px-2 py-1 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-primary-light focus:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:bg-primary-dark ${t&&"opacity-25"} `+e,disabled:t,children:n})}var di={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};const ui=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),Xt=(e,t)=>{const n=i.forwardRef(({color:r="currentColor",size:o=24,strokeWidth:a=2,absoluteStrokeWidth:s,children:l,...d},f)=>i.createElement("svg",{ref:f,...di,width:o,height:o,stroke:r,strokeWidth:s?Number(a)*24/Number(o):a,className:`lucide lucide-${ui(e)}`,...d},[...t.map(([u,p])=>i.createElement(u,p)),...(Array.isArray(l)?l:[l])||[]]));return n.displayName=`${e}`,n},hi=Xt("MoreVertical",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"12",cy:"5",r:"1",key:"gxeob9"}],["circle",{cx:"12",cy:"19",r:"1",key:"lyex9k"}]]),mi=Xt("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]),bi=Xt("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);export{hi as M,fi as P,gi as Q,mi as S,bi as U};
