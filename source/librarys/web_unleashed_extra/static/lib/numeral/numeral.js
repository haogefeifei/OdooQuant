/*!
 * numeral.js
 * version : 1.5.1
 * author : Adam Draper
 * license : MIT
 * http://adamwdraper.github.com/Numeral-js/
 */
(function(){function a(a){this._value=a}function b(a,b,c){var d,e,f=Math.pow(10,b);return e=(Math.round(a*f)/f).toFixed(b),c&&(d=new RegExp("0{1,"+c+"}$"),e=e.replace(d,"")),e}function c(a,b){var c;return c=b.indexOf("$")>-1?e(a,b):b.indexOf("%")>-1?f(a,b):b.indexOf(":")>-1?g(a,b):i(a._value,b)}function d(a,b){var c,d,e,f,g,i=b,j=["KB","MB","GB","TB","PB","EB","ZB","YB"],k=!1;if(b.indexOf(":")>-1)a._value=h(b);else if(b===o)a._value=0;else{for("."!==m[n].delimiters.decimal&&(b=b.replace(/\./g,"").replace(m[n].delimiters.decimal,".")),c=new RegExp("[^a-zA-Z]"+m[n].abbreviations.thousand+"(?:\\)|(\\"+m[n].currency.symbol+")?(?:\\))?)?$"),d=new RegExp("[^a-zA-Z]"+m[n].abbreviations.million+"(?:\\)|(\\"+m[n].currency.symbol+")?(?:\\))?)?$"),e=new RegExp("[^a-zA-Z]"+m[n].abbreviations.billion+"(?:\\)|(\\"+m[n].currency.symbol+")?(?:\\))?)?$"),f=new RegExp("[^a-zA-Z]"+m[n].abbreviations.trillion+"(?:\\)|(\\"+m[n].currency.symbol+")?(?:\\))?)?$"),g=0;g<=j.length&&!(k=b.indexOf(j[g])>-1?Math.pow(1024,g+1):!1);g++);a._value=(k?k:1)*(i.match(c)?Math.pow(10,3):1)*(i.match(d)?Math.pow(10,6):1)*(i.match(e)?Math.pow(10,9):1)*(i.match(f)?Math.pow(10,12):1)*(b.indexOf("%")>-1?.01:1)*((b.split("-").length+Math.min(b.split("(").length-1,b.split(")").length-1))%2?1:-1)*Number(b.replace(/[^0-9\.]+/g,"")),a._value=k?Math.ceil(a._value):a._value}return a._value}function e(a,b){var c,d=b.indexOf("$")<=1?!0:!1,e="";return b.indexOf(" $")>-1?(e=" ",b=b.replace(" $","")):b.indexOf("$ ")>-1?(e=" ",b=b.replace("$ ","")):b=b.replace("$",""),c=i(a._value,b),d?c.indexOf("(")>-1||c.indexOf("-")>-1?(c=c.split(""),c.splice(1,0,m[n].currency.symbol+e),c=c.join("")):c=m[n].currency.symbol+e+c:c.indexOf(")")>-1?(c=c.split(""),c.splice(-1,0,e+m[n].currency.symbol),c=c.join("")):c=c+e+m[n].currency.symbol,c}function f(a,b){var c,d="",e=100*a._value;return b.indexOf(" %")>-1?(d=" ",b=b.replace(" %","")):b=b.replace("%",""),c=i(e,b),c.indexOf(")")>-1?(c=c.split(""),c.splice(-1,0,d+"%"),c=c.join("")):c=c+d+"%",c}function g(a){var b=Math.floor(a._value/60/60),c=Math.floor((a._value-60*60*b)/60),d=Math.round(a._value-60*60*b-60*c);return b+":"+(10>c?"0"+c:c)+":"+(10>d?"0"+d:d)}function h(a){var b=a.split(":"),c=0;return 3===b.length?(c+=60*60*Number(b[0]),c+=60*Number(b[1]),c+=Number(b[2])):2===b.length&&(c+=60*Number(b[0]),c+=Number(b[1])),Number(c)}function i(a,c){var d,e,f,g,h,i,j=!1,k=!1,l=!1,p="",q="",r="",s=Math.abs(a),t=["B","KB","MB","GB","TB","PB","EB","ZB","YB"],u="",v=!1;if(0===a&&null!==o)return o;if(c.indexOf("(")>-1?(j=!0,c=c.slice(1,-1)):c.indexOf("+")>-1&&(k=!0,c=c.replace(/\+/g,"")),c.indexOf("a")>-1&&(c.indexOf(" a")>-1?(p=" ",c=c.replace(" a","")):c=c.replace("a",""),s>=Math.pow(10,12)?(p+=m[n].abbreviations.trillion,a/=Math.pow(10,12)):s<Math.pow(10,12)&&s>=Math.pow(10,9)?(p+=m[n].abbreviations.billion,a/=Math.pow(10,9)):s<Math.pow(10,9)&&s>=Math.pow(10,6)?(p+=m[n].abbreviations.million,a/=Math.pow(10,6)):s<Math.pow(10,6)&&s>=Math.pow(10,3)&&(p+=m[n].abbreviations.thousand,a/=Math.pow(10,3))),c.indexOf("b")>-1)for(c.indexOf(" b")>-1?(q=" ",c=c.replace(" b","")):c=c.replace("b",""),f=0;f<=t.length;f++)if(d=Math.pow(1024,f),e=Math.pow(1024,f+1),a>=d&&e>a){q+=t[f],d>0&&(a/=d);break}return c.indexOf("o")>-1&&(c.indexOf(" o")>-1?(r=" ",c=c.replace(" o","")):c=c.replace("o",""),r+=m[n].ordinal(a)),c.indexOf("[.]")>-1&&(l=!0,c=c.replace("[.]",".")),g=a.toString().split(".")[0],h=c.split(".")[1],i=c.indexOf(","),h?(h.indexOf("[")>-1?(h=h.replace("]",""),h=h.split("["),u=b(a,h[0].length+h[1].length,h[1].length)):u=b(a,h.length),g=u.split(".")[0],u=u.split(".")[1].length?m[n].delimiters.decimal+u.split(".")[1]:"",l&&0===Number(u.slice(1))&&(u="")):g=b(a,null),g.indexOf("-")>-1&&(g=g.slice(1),v=!0),i>-1&&(g=g.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,"$1"+m[n].delimiters.thousands)),0===c.indexOf(".")&&(g=""),(j&&v?"(":"")+(!j&&v?"-":"")+(!v&&k?"+":"")+g+u+(r?r:"")+(p?p:"")+(q?q:"")+(j&&v?")":"")}function j(a,b){m[a]=b}var k,l="1.5.1",m={},n="en",o=null,p="0,0",q="undefined"!=typeof module&&module.exports;k=function(b){return k.isNumeral(b)?b=b.value():0===b||"undefined"==typeof b?b=0:Number(b)||(b=k.fn.unformat(b)),new a(Number(b))},k.version=l,k.isNumeral=function(b){return b instanceof a},k.language=function(a,b){if(!a)return n;if(a&&!b){if(!m[a])throw new Error("Unknown language : "+a);n=a}return(b||!m[a])&&j(a,b),k},k.language("en",{delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(a){var b=a%10;return 1===~~(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th"},currency:{symbol:"$"}}),k.zeroFormat=function(a){o="string"==typeof a?a:null},k.defaultFormat=function(a){p="string"==typeof a?a:"0.0"},k.fn=a.prototype={clone:function(){return k(this)},format:function(a){return c(this,a?a:p)},unformat:function(a){return d(this,a?a:p)},value:function(){return this._value},valueOf:function(){return this._value},set:function(a){return this._value=Number(a),this},add:function(a){return this._value=this._value+Number(a),this},subtract:function(a){return this._value=this._value-Number(a),this},multiply:function(a){return this._value=this._value*Number(a),this},divide:function(a){return this._value=this._value/Number(a),this},difference:function(a){var b=this._value-Number(a);return 0>b&&(b=-b),b}},q&&(module.exports=k),"undefined"==typeof ender&&(this.numeral=k),"function"==typeof define&&define.amd&&define([],function(){return k})}).call(this);


/*! 
 * numeral.js language configuration
 * language : belgium-dutch (be-nl)
 * author : Dieter Luypaert : https://github.com/moeriki
 */
!function(){var a={delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"k",million:" mln",billion:" mld",trillion:" bln"},ordinal:function(a){var b=a%100;return 0!==a&&1>=b||8===b||b>=20?"ste":"de"},currency:{symbol:"€ "}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("be-nl",a)}(),/*!
 * numeral.js language configuration
 * language : czech (cs)
 * author : Anatoli Papirovski : https://github.com/apapirovski
 */
function(){var a={delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"tis.",million:"mil.",billion:"b",trillion:"t"},ordinal:function(){return"."},currency:{symbol:"Kč"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("cs",a)}(),/*! 
 * numeral.js language configuration
 * language : danish denmark (dk)
 * author : Michael Storgaard : https://github.com/mstorgaard
 */
function(){var a={delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"k",million:"mio",billion:"mia",trillion:"b"},ordinal:function(){return"."},currency:{symbol:"DKK"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("da-dk",a)}(),/*! 
 * numeral.js language configuration
 * language : German in Switzerland (de-ch)
 * author : Michael Piefel : https://github.com/piefel (based on work from Marco Krage : https://github.com/sinky)
 */
function(){var a={delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(){return"."},currency:{symbol:"CHF"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("de-ch",a)}(),/*! 
 * numeral.js language configuration
 * language : German (de) – generally useful in Germany, Austria, Luxembourg, Belgium
 * author : Marco Krage : https://github.com/sinky
 */
function(){var a={delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(){return"."},currency:{symbol:"€"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("de",a)}(),/*! 
 * numeral.js language configuration
 * language : english united kingdom (uk)
 * author : Dan Ristic : https://github.com/dristic
 */
function(){var a={delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(a){var b=a%10;return 1===~~(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th"},currency:{symbol:"£"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("en-gb",a)}(),/*! 
 * numeral.js language configuration
 * language : spanish Spain
 * author : Hernan Garcia : https://github.com/hgarcia
 */
function(){var a={delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"k",million:"mm",billion:"b",trillion:"t"},ordinal:function(a){var b=a%10;return 1===b||3===b?"er":2===b?"do":7===b||0===b?"mo":8===b?"vo":9===b?"no":"to"},currency:{symbol:"€"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("es",a)}(),/*! 
 * numeral.js language configuration
 * language : spanish
 * author : Hernan Garcia : https://github.com/hgarcia
 */
function(){var a={delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"k",million:"mm",billion:"b",trillion:"t"},ordinal:function(a){var b=a%10;return 1===b||3===b?"er":2===b?"do":7===b||0===b?"mo":8===b?"vo":9===b?"no":"to"},currency:{symbol:"$"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("es",a)}(),/*! 
 * numeral.js language configuration
 * language : Finnish
 * author : Sami Saada : https://github.com/samitheberber
 */
function(){var a={delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"k",million:"M",billion:"G",trillion:"T"},ordinal:function(){return"."},currency:{symbol:"€"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("fi",a)}(),/*! 
 * numeral.js language configuration
 * language : french (fr-ch)
 * author : Adam Draper : https://github.com/adamwdraper
 */
function(){var a={delimiters:{thousands:"'",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(a){return 1===a?"er":"e"},currency:{symbol:"CHF"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("fr-ch",a)}(),/*! 
 * numeral.js language configuration
 * language : french (fr)
 * author : Adam Draper : https://github.com/adamwdraper
 */
function(){var a={delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(a){return 1===a?"er":"e"},currency:{symbol:"€"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("fr",a)}(),/*! 
 * numeral.js language configuration
 * language : italian Italy (it)
 * author : Giacomo Trombi : http://cinquepunti.it
 */
function(){var a={delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"mila",million:"mil",billion:"b",trillion:"t"},ordinal:function(){return"º"},currency:{symbol:"€"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("it",a)}(),/*! 
 * numeral.js language configuration
 * language : japanese
 * author : teppeis : https://github.com/teppeis
 */
function(){var a={delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"千",million:"百万",billion:"十億",trillion:"兆"},ordinal:function(){return"."},currency:{symbol:"¥"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("ja",a)}(),/*! 
 * numeral.js language configuration
 * language : polish (pl)
 * author : Dominik Bulaj : https://github.com/dominikbulaj
 */
function(){var a={delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"tys.",million:"mln",billion:"mld",trillion:"bln"},ordinal:function(){return"."},currency:{symbol:"PLN"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("pl",a)}(),/*! 
 * numeral.js language configuration
 * language : portuguese brazil (pt-br)
 * author : Ramiro Varandas Jr : https://github.com/ramirovjr
 */
function(){var a={delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"mil",million:"milhões",billion:"b",trillion:"t"},ordinal:function(){return"º"},currency:{symbol:"R$"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("pt-br",a)}(),/*! 
 * numeral.js language configuration
 * language : portuguese (pt-pt)
 * author : Diogo Resende : https://github.com/dresende
 */
function(){var a={delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(){return"º"},currency:{symbol:"€"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("pt-pt",a)}(),function(){var a={delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"тыс.",million:"млн",billion:"b",trillion:"t"},ordinal:function(){return"."},currency:{symbol:"₴"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("ru-UA",a)}(),/*! 
 * numeral.js language configuration
 * language : russian (ru)
 * author : Anatoli Papirovski : https://github.com/apapirovski
 */
function(){var a={delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"тыс.",million:"млн",billion:"b",trillion:"t"},ordinal:function(){return"."},currency:{symbol:"руб."}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("ru",a)}(),/*! 
 * numeral.js language configuration
 * language : thai (th)
 * author : Sathit Jittanupat : https://github.com/jojosati
 */
function(){var a={delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"พัน",million:"ล้าน",billion:"พันล้าน",trillion:"ล้านล้าน"},ordinal:function(){return"."},currency:{symbol:"฿"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("th",a)}(),/*! 
 * numeral.js language configuration
 * language : turkish (tr)
 * author : Ecmel Ercan : https://github.com/ecmel, Erhan Gundogan : https://github.com/erhangundogan, Burak Yiğit Kaya: https://github.com/BYK
 */
function(){var a={1:"'inci",5:"'inci",8:"'inci",70:"'inci",80:"'inci",2:"'nci",7:"'nci",20:"'nci",50:"'nci",3:"'üncü",4:"'üncü",100:"'üncü",6:"'ncı",9:"'uncu",10:"'uncu",30:"'uncu",60:"'ıncı",90:"'ıncı"},b={delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"bin",million:"milyon",billion:"milyar",trillion:"trilyon"},ordinal:function(b){if(0===b)return"'ıncı";var c=b%10,d=b%100-c,e=b>=100?100:null;return a[c]||a[d]||a[e]},currency:{symbol:"₺"}};"undefined"!=typeof module&&module.exports&&(module.exports=b),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("tr",b)}(),function(){var a={delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"тис.",million:"млн",billion:"млрд",trillion:"блн"},ordinal:function(){return""},currency:{symbol:"₴"}};"undefined"!=typeof module&&module.exports&&(module.exports=a),"undefined"!=typeof window&&this.numeral&&this.numeral.language&&this.numeral.language("uk-UA",a)}();