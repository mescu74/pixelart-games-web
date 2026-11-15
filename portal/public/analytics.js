/* Pixel Sur GA4. Basic consent: no Google request before an explicit acceptance. */
(()=>{'use strict';
if(window.top!==window||location.pathname.startsWith('/admin'))return;
const ID='G-R5P1YY93LP',KEY='pixel-sur:analytics-consent:v1',TTL=180*86400000,production=location.hostname==='games.soloescus.com';
let consent=null,loaded=false,pageSent=false,gameSent=false,openedGame=null,contentReady=!location.pathname.startsWith('/juegos/');
try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&Date.now()-v.at<TTL&&['granted','denied'].includes(v.value))consent=v.value;}catch{}
const send=(...args)=>{if(consent==='granted'&&production&&window.gtag)window.gtag(...args);};
function page(){if(pageSent||!contentReady||location.pathname.startsWith('/jugar/')&&!openedGame)return;pageSent=true;send('event','page_view',{page_location:location.origin+location.pathname,page_title:document.title,page_referrer:referrer(),send_to:ID});}
function referrer(){try{return document.referrer?new URL(document.referrer).origin:'';}catch{return '';}}
function game(){if(!openedGame||gameSent)return;gameSent=true;send('event','game_open',{game_id:openedGame.slug,game_name:openedGame.title,send_to:ID});}
function activate(){
 if(consent!=='granted'||!production)return;
 window['ga-disable-'+ID]=false;
 if(!loaded){loaded=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
 window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 window.gtag('js',new Date());window.gtag('config',ID,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:location.origin+location.pathname,page_referrer:referrer(),cookie_domain:'games.soloescus.com',cookie_flags:'SameSite=Lax;Secure'});
 const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+ID;s.id='pixel-sur-ga';document.head.append(s);
 }else window.gtag('consent','update',{analytics_storage:'granted'});
 page();game();
}
function clearCookies(){for(const part of document.cookie.split(';')){const name=part.split('=')[0].trim();if(!/^_ga(?:_|$)/.test(name))continue;for(const domain of ['','; Domain=games.soloescus.com','; Domain=.soloescus.com'])document.cookie=name+'=; Max-Age=0; Path=/'+domain+'; SameSite=Lax; Secure';}}
function choose(value){consent=value;try{localStorage.setItem(KEY,JSON.stringify({value,at:Date.now()}));}catch{}panel.hidden=true;if(value==='granted')activate();else{window['ga-disable-'+ID]=true;clearCookies();}}
const panel=document.createElement('section');panel.className='analytics-consent';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Estadísticas y privacidad');panel.innerHTML='<div><strong>¿Nos ayudás a mejorar la arcade?</strong><p>Con tu permiso usamos Google Analytics para medir visitas y qué juegos se abren. Podés jugar sin aceptar y cambiar tu elección en Privacidad.</p><a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Privacidad de Google ↗</a></div><div class="analytics-actions"><button type="button" data-consent="denied">Rechazar estadísticas</button><button type="button" data-consent="granted">Aceptar estadísticas</button></div>';panel.hidden=consent!==null;document.body.append(panel);panel.querySelectorAll('[data-consent]').forEach(b=>b.onclick=()=>choose(b.dataset.consent));
const preferences=document.createElement('button');preferences.type='button';preferences.className='analytics-preferences';preferences.textContent='Privacidad';preferences.onclick=()=>{panel.hidden=false;panel.querySelector('button').focus();};(document.querySelector('.site-footer>div')||document.querySelector('.player-header>div:last-child')||document.body).append(preferences);
window.addEventListener('pixel-sur:game-open',e=>{if(!e.detail||!/^[-a-z0-9]{1,60}$/.test(e.detail.slug))return;openedGame={slug:e.detail.slug,title:String(e.detail.title).slice(0,80)};if(consent==='granted'){page();game();}});
window.addEventListener('pixel-sur:page-ready',()=>{contentReady=true;if(consent==='granted')page();});
// Script is intentionally absent from admin pages and all uploaded games.
activate();
})();
