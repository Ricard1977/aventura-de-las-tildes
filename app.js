'use strict';
const RAW=[
['canción','can-ción',1,'aguda'],['camión','ca-mión',1,'aguda'],['limón','li-món',1,'aguda'],['balón','ba-lón',1,'aguda'],['ratón','ra-tón',1,'aguda'],['jardín','jar-dín',1,'aguda'],['café','ca-fé',1,'aguda'],['sofá','so-fá',1,'aguda'],['compás','com-pás',1,'aguda'],['bebé','be-bé',1,'aguda'],['avión','a-vión',1,'aguda'],['jamás','ja-más',1,'aguda'],['papel','pa-pel',1,'aguda'],['reloj','re-loj',1,'aguda'],['animal','a-ni-mal',2,'aguda'],['pared','pa-red',1,'aguda'],['hotel','ho-tel',1,'aguda'],['doctor','doc-tor',1,'aguda'],['corazón','co-ra-zón',2,'aguda'],['colibrí','co-li-brí',2,'aguda'],
['árbol','ár-bol',0,'llana'],['lápiz','lá-piz',0,'llana'],['fácil','fá-cil',0,'llana'],['difícil','di-fí-cil',1,'llana'],['césped','cés-ped',0,'llana'],['azúcar','a-zú-car',1,'llana'],['móvil','mó-vil',0,'llana'],['fútbol','fút-bol',0,'llana'],['cárcel','cár-cel',0,'llana'],['débil','dé-bil',0,'llana'],['útil','ú-til',0,'llana'],['túnel','tú-nel',0,'llana'],['mesa','me-sa',0,'llana'],['libro','li-bro',0,'llana'],['ventana','ven-ta-na',1,'llana'],['camino','ca-mi-no',1,'llana'],['escuela','es-cue-la',1,'llana'],['zapato','za-pa-to',1,'llana'],['montaña','mon-ta-ña',1,'llana'],['examen','e-xa-men',1,'llana'],
['música','mú-si-ca',0,'esdrújula'],['pájaro','pá-ja-ro',0,'esdrújula'],['médico','mé-di-co',0,'esdrújula'],['teléfono','te-lé-fo-no',1,'esdrújula'],['brújula','brú-ju-la',0,'esdrújula'],['plátano','plá-ta-no',0,'esdrújula'],['sábado','sá-ba-do',0,'esdrújula'],['miércoles','miér-co-les',0,'esdrújula'],['rápido','rá-pi-do',0,'esdrújula'],['máquina','má-qui-na',0,'esdrújula'],['número','nú-me-ro',0,'esdrújula'],['página','pá-gi-na',0,'esdrújula'],['lámpara','lám-pa-ra',0,'esdrújula'],['cámara','cá-ma-ra',0,'esdrújula'],['príncipe','prín-ci-pe',0,'esdrújula'],['matemáticas','ma-te-má-ti-cas',2,'esdrújula'],['océano','o-cé-a-no',1,'esdrújula'],['semáforo','se-má-fo-ro',1,'esdrújula'],['triángulo','trián-gu-lo',0,'esdrújula'],['kilómetro','ki-ló-me-tro',1,'esdrújula']
];
const WORDS=RAW.map(([word,syllables,stress,kind])=>({word,syllables:syllables.split('-'),stress,kind}));
const TYPES=['stress','accent','correct','classify'],AVATARS=['🦊','🐼','🦄','🐯','🐸','🐙','🐲','🐨','🐧','🦋','🐱','🚀'];
const AVATAR_FILES=['fox','panda','unicorn','tiger','frog','octopus','dragon','koala','penguin','butterfly','cat','rocket'];
function avatarHtml(value){const i=AVATARS.indexOf(value);const file=AVATAR_FILES[i<0?0:i];return '<img class="animal-avatar" src="avatars/'+file+'.svg" alt="Avatar '+file+'" width="44" height="44">'}
const $=x=>document.getElementById(x),STORE='liga-tildes-v1',cfg=window.TILDES_CONFIG||{},online=!!(cfg.supabaseUrl&&cfg.supabaseAnonKey&&window.supabase),db=online?window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey):null;
let profiles=load(),player=null,avatar=AVATARS[0],deck=[],index=0,score=0,hits=0,locked=false,authId=null,onlineReady=false;
function load(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return {}}}
function save(){localStorage.setItem(STORE,JSON.stringify(profiles))}
function fmt(n){return (Math.round(n*2)/2).toLocaleString('es-ES',{maximumFractionDigits:1})}
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function plain(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function safe(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function view(id){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===id));$('main-nav').style.display=player?'flex':'none';window.scrollTo(0,0);if(id==='home')home();if(id==='ranking')ranking()}
function selectPlayer(name){player=profiles[name];localStorage.setItem('liga-last-user',name);$('current-name').textContent=name;view('home')}
function avatars(){$('avatars').innerHTML=AVATARS.map(a=>'<button type="button" class="'+(a===avatar?'selected':'')+'" data-avatar="'+a+'" aria-label="Seleccionar avatar" aria-pressed="'+(a===avatar)+'">'+avatarHtml(a)+'</button>').join('');document.querySelectorAll('[data-avatar]').forEach(b=>b.onclick=()=>{avatar=b.dataset.avatar;avatars()})}
async function connect(){
 if(!db){$('mode-label').textContent='⚠️ Sin conexión a Supabase';$('mode-label').title='Comprueba que se carga la librería de Supabase y config.js';return;}
 try{
  let result=await db.auth.getUser(),user=result.data&&result.data.user;
  if(!user){const session=await db.auth.signInAnonymously();if(session.error)throw session.error;user=session.data.user}
  authId=user.id;
  const check=await db.from('liga_tildes_players').select('id').limit(1);
  if(check.error)throw check.error;
  onlineReady=true;
  $('mode-label').textContent='🌍 Liga global';
  await syncAll();
 }catch(e){
  console.warn('Liga global no disponible:',e);
  onlineReady=false;
  var message=String((e&&e.message)||e||'Error de conexión');
  var detail=/anonymous/i.test(message)?'Activa Anonymous Sign-Ins en Authentication > Providers':/liga_tildes_players|schema cache|does not exist/i.test(message)?'Ejecuta supabase.sql en el proyecto indicado':/fetch|network/i.test(message)?'No se puede conectar con Supabase desde este navegador':message.slice(0,130);
  $('mode-label').textContent='⚠️ Liga local: conexión pendiente';
  $('mode-label').title=detail;
  var status=$('ranking-status');if(status)status.textContent='La liga global no está activa: '+detail;
 }
}
async function syncProfile(p){
 if(!onlineReady||!db||!authId||!p)return;
 const remote=await db.from('liga_tildes_players').select('id,owner_id,score,games,hits').ilike('nickname',p.name).maybeSingle();
 if(remote.error)throw remote.error;
 if(remote.data){
  // La tabla de acceso por PIN permite que un jugador entre desde varios dispositivos.
  const serverScore=Number(remote.data.score)||0,serverGames=Number(remote.data.games)||0,serverHits=Number(remote.data.hits)||0;
  // Conservar los valores más altos de ambos lados al importar perfiles locales.
  p.score=Math.max(p.score,serverScore);
  p.games=Math.max(p.games,serverGames);
  p.hits=Math.max(p.hits,serverHits);
  save();
  const update=await db.from('liga_tildes_players').update({avatar:p.avatar,score:p.score,games:p.games,hits:p.hits,updated_at:new Date().toISOString()}).eq('id',remote.data.id).select('id');
  if(update.error)throw update.error;
  if(!update.data||update.data.length!==1)throw new Error('Esta sesión no tiene permiso de escritura para este jugador; utiliza su PIN.');
 }else{
  const created=await db.from('liga_tildes_players').insert({owner_id:authId,nickname:p.name,avatar:p.avatar,score:p.score,games:p.games,hits:p.hits});
  if(created.error)throw created.error;
 }
}
async function sync(){
 if(!onlineReady||!player)return;
 try{await syncProfile(player);$('ranking-status').textContent='Clasificación global sincronizada';}
 catch(e){console.warn('No se pudieron sincronizar puntos:',e);$('ranking-status').textContent='Puntos guardados aquí; sincronización pendiente.'}
}
async function syncAll(){
 for(const p of Object.values(profiles)){try{await syncProfile(p)}catch(e){console.warn(e)}}
}
function home(){if(!player)return;$('hello-name').textContent=player.name;$('home-avatar').innerHTML=avatarHtml(player.avatar);$('total-score').textContent=fmt(player.score);$('total-games').textContent=player.games;$('total-hits').textContent=player.hits;ranking(true)}
function begin(){deck=shuffle(WORDS.slice()).slice(0,10).map((word,i)=>({word,type:TYPES[i%4]}));deck=shuffle(deck);index=0;score=0;hits=0;view('game');question()}
function addButton(area,label,ok){const b=document.createElement('button');b.className='answer';b.textContent=label;b.onclick=()=>answer(ok);area.append(b)}
function question(){locked=false;const {word:w,type}=deck[index];$('card-count').textContent='Tarjeta '+(index+1)+' de 10';$('cards-left').textContent='Quedan '+(9-index);$('progress-bar').style.width=(index*10)+'%';$('round-score').textContent=fmt(score);$('feedback').textContent='';$('feedback').className='feedback';$('next-question').classList.add('hidden');$('next-question').textContent=index===9?'Ver resultado 🏆':'Siguiente tarjeta ➜';
const info={stress:['🔎 SÍLABA TÓNICA','🎯','¿Cuál es la sílaba tónica?','Elige la sílaba que suena más fuerte.'],accent:['✍️ PON LA TILDE','✏️','¡Escribe la palabra correctamente!','Si no lleva tilde, escríbela sin tilde.'],correct:['🛠️ DETECTIVE','🕵️','¿Cuál es la escritura correcta?','Descubre el error de acentuación.'],classify:['🧠 CLASIFICA','🧠','¿Qué tipo de palabra es?','Piensa dónde está la sílaba tónica.']}[type];$('task-label').textContent=info[0];$('task-icon').textContent=info[1];$('question-title').textContent=info[2];$('question-hint').textContent=info[3];
const area=$('question-area');area.replaceChildren();const prompt=document.createElement('div');prompt.style.fontSize='35px';prompt.style.fontWeight='900';prompt.textContent=type==='accent'?plain(w.word):w.word;area.append(prompt);
if(type==='stress'){const row=document.createElement('div');row.style.display='flex';row.style.justifyContent='center';row.style.gap='8px';row.style.flexWrap='wrap';w.syllables.forEach((s,i)=>addButton(row,s,i===w.stress));area.append(row)}
if(type==='accent'){const form=document.createElement('form');form.innerHTML='<input aria-label="Escribe la palabra" maxlength="35" autocomplete="off" spellcheck="false" required placeholder="Escribe aquí"><button class="btn primary" type="submit">Comprobar ✓</button>';form.onsubmit=e=>{e.preventDefault();answer(form.querySelector('input').value.trim().toLocaleLowerCase('es-ES').normalize('NFC')===w.word)};area.append(form)}
if(type==='correct'){let incorrect=plain(w.word);if(incorrect===w.word){const i=[...incorrect].findIndex(c=>'aeiou'.includes(c));if(i>=0)incorrect=incorrect.slice(0,i)+({a:'á',e:'é',i:'í',o:'ó',u:'ú'}[incorrect[i]])+incorrect.slice(i+1)}shuffle([w.word,incorrect]).forEach(c=>addButton(area,c,c===w.word))}
if(type==='classify'){['aguda','llana','esdrújula'].forEach(t=>addButton(area,t.charAt(0).toUpperCase()+t.slice(1),t===w.kind))}
}
function answer(ok){if(locked)return;locked=true;const w=deck[index].word;score+=ok?1:-0.5;if(ok)hits++;$('round-score').textContent=fmt(score);$('feedback').className='feedback '+(ok?'good':'bad');$('feedback').textContent=(ok?'🌟 ¡Correcto! +1 punto. ':'💡 Casi. −0,5 puntos. ')+'Respuesta: '+w.word+' · '+w.syllables.join(' · ')+' · '+w.kind+'.';document.querySelectorAll('#question-area button,#question-area input').forEach(x=>x.disabled=true);$('next-question').classList.remove('hidden')}
async function finish(){player.score=Math.round((player.score+score)*2)/2;player.games++;player.hits+=hits;save();$('result-score').textContent=fmt(score);$('result-correct').textContent=hits;$('result-wrong').textContent=10-hits;$('result-emoji').textContent=hits>=8?'🏆':hits>=5?'🌟':'💪';$('result-title').textContent=hits>=8?'¡Eres una estrella!':hits>=5?'¡Gran aventura!':'¡Sigue practicando!';$('result-desc').textContent='Has terminado 10 tarjetas. Tu puntuación acumulada es '+fmt(player.score)+' puntos.';view('results');await sync()}
async function ranking(preview=false){let list=Object.values(profiles),shared=false;if(onlineReady){try{const {data,error}=await db.from('liga_tildes_players').select('nickname,avatar,score,games,hits').order('score',{ascending:false}).limit(100);if(error)throw error;list=data.map(p=>({...p,name:p.nickname,score:Number(p.score)}));shared=true}catch(e){console.warn(e)}}list.sort((a,b)=>b.score-a.score||b.hits-a.hits||a.name.localeCompare(b.name,'es'));const html=(preview?list.slice(0,5):list).map((p,i)=>'<div class="rank-row"><span>'+(['🥇','🥈','🥉'][i]||i+1)+'</span><span class="player">'+avatarHtml(p.avatar)+' '+safe(p.name)+'</span><strong>'+fmt(p.score)+' ⭐</strong></div>').join('')||'<p>Aún no hay participantes.</p>';if(preview){$('ranking-preview').innerHTML=html;$('ranking-status').textContent=shared?'Clasificación compartida':'Clasificación de este dispositivo'}else{$('ranking-list').innerHTML=html;$('ranking-mode').textContent=shared?'Todos los jugadores':'Este dispositivo';$('ranking-explain').textContent=shared?'Usa apodos, nunca datos personales.':'Para compartir puntos entre dispositivos, configura Supabase según el README.'}}
// Administración separada: no cambia la sesión anónima con la que juegan los niños.
let adminClient=null,adminAccess=false;
function adminDb(){
 if(!db)throw new Error('La liga global todavía no está conectada');
 if(!adminClient)adminClient=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,
   {auth:{storageKey:'liga-tildes-admin-session',persistSession:true,autoRefreshToken:true}});
 return adminClient;
}
function adminStatus(s){$('admin-status').textContent=s}
function adminRow(p,scope){
 const row=document.createElement('div');row.className='rank-row';
 const name=document.createElement('span');name.className='player';
 const avatarPic=document.createElement('span');avatarPic.innerHTML=avatarHtml(p.avatar);
 name.appendChild(avatarPic);name.appendChild(document.createTextNode(' '+p.name));
 const points=document.createElement('strong');points.textContent=fmt(Number(p.score)||0)+' pts';
 const btn=document.createElement('button');btn.className='btn secondary';
 btn.textContent='Borrar';btn.type='button';
 btn.style.gridColumn='1/-1';btn.style.justifySelf='end';
 btn.addEventListener('click',async function(){
   if(!adminAccess)return;
   const msg=scope==='global'?'¿Borrar DEFINITIVAMENTE de la clasificación global a '+p.name+'?':'¿Borrar el perfil local de '+p.name+' de este navegador?';
   if(!confirm(msg))return;
   btn.disabled=true;
   try{
     if(scope==='global'){
       const result=await adminDb().rpc('liga_admin_delete_player',{p_nickname:p.name});
       if(result.error)throw result.error;
       if(!result.data)throw new Error('No se ha encontrado ese jugador');
       const localName=Object.keys(profiles).find(x=>x.toLowerCase()===p.name.toLowerCase());
       if(localName){delete profiles[localName];save();if(player&&player.name===localName){player=null;localStorage.removeItem('liga-last-user')}}
     }else{
       delete profiles[p.name];save();
       if(player&&player.name===p.name){player=null;localStorage.removeItem('liga-last-user')}
     }
     adminStatus('Jugador borrado de '+(scope==='global'?'la liga global':'este dispositivo')+'.');
     await adminRender();
   }catch(e){adminStatus('No se pudo borrar: '+(e.message||e));btn.disabled=false}
 });
 row.appendChild(document.createElement('span'));row.appendChild(name);row.appendChild(points);row.appendChild(btn);
 return row;
}
async function adminRender(){
 if(!adminAccess)return;
 const local=$('admin-local'),global=$('admin-global');
 local.replaceChildren();global.replaceChildren();
 const owned=Object.values(profiles).sort((a,b)=>a.name.localeCompare(b.name,'es'));
 if(!owned.length)local.textContent='No hay perfiles locales.';
 for(const p of owned)local.appendChild(adminRow(p,'local'));
 const response=await adminDb().from('liga_tildes_players').select('nickname,avatar,score').order('score',{ascending:false}).limit(500);
 if(response.error)throw response.error;
 if(!response.data.length)global.textContent='No hay jugadores globales.';
 for(const p of response.data)global.appendChild(adminRow({...p,name:p.nickname},'global'));
}
$('open-admin').onclick=function(){view('admin');if(adminAccess)adminRender()};
$('admin-form').onsubmit=async function(e){
 e.preventDefault();adminStatus('Comprobando autorización...');
 try{
  const client=adminDb();
  const login=await client.auth.signInWithPassword({email:$('admin-email').value.trim(),password:$('admin-password').value});
  $('admin-password').value='';
  if(login.error)throw login.error;
  const check=await client.rpc('liga_admin_check');
  if(check.error)throw check.error;
  if(check.data!==true){await client.auth.signOut();throw new Error('Esta cuenta no está autorizada como administradora. Ejecuta admin.sql y registra tu User UID.')}
  adminAccess=true;$('admin-form').classList.add('hidden');$('admin-content').classList.remove('hidden');
  adminStatus('Acceso de administrador autorizado.');
  await adminRender();
 }catch(error){adminStatus('Acceso no disponible: '+(error.message||error))}
};
$('admin-signout').onclick=async function(){
 if(adminClient)await adminClient.auth.signOut();
 adminAccess=false;$('admin-form').classList.remove('hidden');$('admin-content').classList.add('hidden');
 adminStatus('Sesión de administrador cerrada.');
};
function validPin(pin){return /^[0-9]{6,8}$/.test(pin)}
async function setPlayerPin(pin){
 if(!onlineReady)throw new Error('Primero debe estar conectada la Liga global.');
 if(!validPin(pin))throw new Error('El PIN debe tener entre 6 y 8 cifras.');
 const result=await db.rpc('liga_set_pin',{p_nickname:player.name,p_pin:pin});
 if(result.error)throw result.error;
}
$('set-pin-form').onsubmit=async function(e){
 e.preventDefault();
 const pin=$('set-pin-input').value;
 $('set-pin-input').value='';
 try{await setPlayerPin(pin);$('pin-status').textContent='PIN guardado. Ya puedes usar el mismo apodo y PIN en otro ordenador.'}
 catch(e){$('pin-status').textContent='No se pudo guardar: '+(e.message||e)+'. Si falta la función, ejecuta login-pin.sql en Supabase.'}
};
$('join-form').onsubmit=async function(e){
 e.preventDefault();
 const name=$('nickname').value.trim(),pin=$('player-pin').value;
 $('join-message').textContent='';
 if(!/^[a-zA-ZÀ-ÿ0-9_-]{3,18}$/.test(name)){$('join-message').textContent='Usa un apodo de 3 a 18 letras o números.';return}
 if(profiles[name]){
  selectPlayer(name);
  if(pin){try{await setPlayerPin(pin)}catch(err){$('pin-status').textContent='PIN no configurado: '+(err.message||err)}}
  return;
 }
 if(onlineReady){
  if(!validPin(pin)){$('join-message').textContent='Para crear un jugador global introduce un PIN de 6 a 8 cifras.';return}
  try{
   const found=await db.from('liga_tildes_players').select('id').ilike('nickname',name).maybeSingle();
   if(found.error)throw found.error;
   if(found.data){$('join-message').textContent='Este jugador ya existe. Pulsa «Ya tengo jugador» e introduce su PIN.';return}
  }catch(e){$('join-message').textContent='No se pudo comprobar el apodo: '+(e.message||e);return}
 }
 profiles[name]={name:name,avatar:avatar,score:0,games:0,hits:0};
 save();selectPlayer(name);
 if(onlineReady){
  await sync();
  try{await setPlayerPin(pin);$('pin-status').textContent='PIN guardado para entrar desde otros ordenadores.'}
  catch(e){$('pin-status').textContent='El perfil está creado, pero falta configurar el PIN: '+(e.message||e)}
 }
};
$('login-player').onclick=async function(){
 const name=$('nickname').value.trim(),pin=$('player-pin').value;
 if(!name){$('join-message').textContent='Escribe primero tu apodo.';return}
 if(profiles[name]){selectPlayer(name);return}
 if(!onlineReady){$('join-message').textContent='Se necesita la Liga global para entrar desde otro dispositivo.';return}
 if(!validPin(pin)){$('join-message').textContent='Introduce tu PIN de 6 a 8 cifras.';return}
 $('join-message').textContent='Comprobando PIN...';
 try{
  const response=await db.rpc('liga_login_player',{p_nickname:name,p_pin:pin});
  if(response.error)throw response.error;
  if(!response.data||!response.data.length)throw new Error('Apodo o PIN incorrecto, o acceso bloqueado temporalmente.');
  const p=response.data[0];
  profiles[p.nickname]={name:p.nickname,avatar:p.avatar,score:Number(p.score),games:p.games,hits:p.hits};
  save();$('player-pin').value='';selectPlayer(p.nickname);
 }catch(e){$('join-message').textContent='No se pudo entrar: '+(e.message||e)+'. Si no has configurado tu PIN, hazlo desde el ordenador original.'}
};
$('switch-profile').onclick=$('nav-profile').onclick=()=>{player=null;$('nickname').value='';$('join-message').textContent='';view('welcome')};
$('start-game').onclick=begin;$('play-again').onclick=begin;$('next-question').onclick=()=>{index++;index===10?finish():question()};$('leave-game').onclick=()=>{if(confirm('¿Salir de la partida? Perderás los puntos de esta ronda.'))view('home')};document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));avatars();connect().then(()=>{const last=localStorage.getItem('liga-last-user');if(last&&profiles[last])selectPlayer(last);else view('welcome')});