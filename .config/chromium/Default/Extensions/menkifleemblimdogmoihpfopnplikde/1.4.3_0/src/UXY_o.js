importScripts("ROwkd.js");var tu="",uu,su={"ŢỊỈ":function(a){a&&(Nt[mn][km]=JSON.parse(a))},pushLineConfig:function(a){Nt[Er]=a[Er]?a[Er]:Nt[Er],Nt.LEGY_ENCRYPT_KEY=a.LEGY_ENCRYPT_KEY||Nt.LEGY_ENCRYPT_KEY,Nt[vn]=a[vn]||Nt[vn],Nt.B=a.B||Nt.B,Nt.A=a.A||Nt.A,Nt[Me]=a[Me]||Nt[Me],Nt[Rh]=a[Rh]||Nt[Rh],Nt[mn]=a[mn]||Nt[mn]},close:function(){self.close()},"ٱÌŤ":function(a,b,c){c||(c="");try{var d=Yt.ЇІΙĮǏЇIŢỊḮ(Nt[vn],b);Ja("ٱÌŤ"+c,d,a)}catch(e){lu.ǀŦЇ().ḮٳṪỊIĮḬĮŦٲ(e,"ٱÌŤ"+c)}},"ǏǏṬ":function(a,b,c,d){d||(d="");try{var e=Yt.lLLŦΪIỈỈŦṪ(Nt[vn],b,c.oid);Ja("ǏǏṬ"+d,e,a)}catch(f){lu.ǀŦЇ().ḮٳṪỊIĮḬĮŦٲ(f,"ǏǏṬ"+d)}},"ỊĬÍ":function(a,b,c){c||(c="");try{var d=Yt.ǀṰǀȈŦȊǀṪṬŢ(Nt[vn],b);Ja("ỊĬÍ"+c,d,a)}catch(e){lu.ǀŦЇ().ḮٳṪỊIĮḬĮŦٲ(e,"ỊĬÍ"+c)}},"ḮṮỊ":function(a,b,c){c||(c="");try{var d=Yt.ṰІΙÎĮĨĮȊṪḬ(Nt[vn],b);Ja("ḮṮỊ"+c,d,a)}catch(e){lu.ǀŦЇ().ḮٳṪỊIĮḬĮŦٲ(e,"ḮṮỊ"+c)}},copyChatMessageContentT:function(a,b){b||(b="");try{var c=Yt.ЇΪΙΙḮǏĬÏٱĮ(Nt[vn]);Ja("copyChatMessageContentT"+b,c,a)}catch(d){lu.ǀŦЇ().ḮٳṪỊIĮḬĮŦٲ(d,"copyChatMessageContentT"+b)}},"ṬṬІ":function(){uu&&(null==tu&&(tu=!1),uu.abort())}};onmessage=function(a){if(a.data instanceof Object&&a.data.hasOwnProperty("method")&&a.data.hasOwnProperty("arguments")){var b=Array.prototype.slice.call(a.data.arguments);su[a.data[mr]].apply(self,b)}else Ia(a.data)};var reply=function(){if(arguments[nr]<1)throw new TypeError("reply - not enough arguments");postMessage({method:arguments[0],arguments:Array.prototype.slice.call(arguments,1)})}