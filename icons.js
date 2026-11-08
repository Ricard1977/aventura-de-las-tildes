(function(){
'use strict';
var icons={"🟣":"dot","👤":"user","🎮":"game","⚡":"lightning","🏆":"trophy","🎯":"target","⭐":"star","✳️":"spark","🚀":"rocket","👋":"wave","🌟":"star","🔎":"search","✍️":"write","🛠️":"tools","🧠":"brain","🏅":"medal","🥇":"medal","🥈":"medal","🥉":"medal","✏️":"write","🕵️":"detective","💡":"bulb","💪":"muscle","✅":"check","❌":"cross","🔁":"refresh","🏠":"home","💜":"heart","🌍":"globe","🎉":"spark","🔥":"fire"};
var keys=Object.keys(icons).sort(function(a,b){return b.length-a.length});
var re=new RegExp(keys.join('|'),'g');
function fix(node){
if(!node)return;
if(node.nodeType===3){
 var s=node.nodeValue;
 re.lastIndex=0;
 if(!s||!re.test(s)){re.lastIndex=0;return}
 re.lastIndex=0;
 var frag=document.createDocumentFragment(),last=0,m;
 while((m=re.exec(s))!==null){
  if(m.index>last)frag.appendChild(document.createTextNode(s.slice(last,m.index)));
  var img=document.createElement('img');
  img.className='ui-svg-icon';img.src='icons/'+icons[m[0]]+'.svg';img.alt=m[0];img.width=20;img.height=20;
  frag.appendChild(img);
  last=m.index+m[0].length;
 }
 if(last<s.length)frag.appendChild(document.createTextNode(s.slice(last)));
 node.parentNode.replaceChild(frag,node);return;
}
if(node.nodeType!==1&&node.nodeType!==9&&node.nodeType!==11)return;
if(node.nodeType===1&&/^(SCRIPT|STYLE|TEXTAREA|SVG|NOSCRIPT)$/i.test(node.tagName))return;
var child=node.firstChild;
while(child){var next=child.nextSibling;fix(child);child=next}
}
function start(){
 fix(document.body);
 if(typeof MutationObserver==='function'){
  var obs=new MutationObserver(function(changes){
   for(var i=0;i<changes.length;i++){
    var c=changes[i];
    if(c.type==='characterData')fix(c.target);
    else for(var j=0;j<c.addedNodes.length;j++)fix(c.addedNodes[j]);
   }
  });
  obs.observe(document.body,{childList:true,characterData:true,subtree:true});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();