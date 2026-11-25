/* Ahmed Zoghlan personal site — public frontend (multi-page) */
var API_URL = 'https://script.google.com/macros/s/AKfycbyJogsSnA5f4_KyxM4hOSYFJC5oeNjS-25r6kCbRRG64P5Ia-D8VBbJU9R_Pn-x_lbA/exec';

var STR = {
  ar: {
    nav_home:'الرئيسية',
    tab_about:'نبذة', tab_exp:'الخبرات', tab_skills:'المهارات والتعليم', tab_lead:'القيادة والعمل العام', tab_photos:'صور', tab_contact:'تواصل',
    sec_about:'نبذة مهنية', sec_photos:'صور', sec_exp:'الخبرات العملية', sec_skills:'المهارات', sec_edu:'التعليم والتدريب', sec_lead:'الأنشطة القيادية والتمثيل', sec_community:'العمل المجتمعي', sec_contact:'تواصل',
    home_sections:'الأقسام', back_home:'العودة للرئيسية',
    d_exp:'الأدوار والمشروعات', d_skills:'المهارات والتعليم والتدريب', d_lead:'القيادة والتمثيل والعمل العام', d_photos:'صور من المناسبات والأنشطة', d_contact:'قنوات التواصل ونموذج الرسائل',
    cta_linkedin:'LinkedIn', cta_contact:'تواصل معي',
    contact_note:'للتواصل المهني — يسعدني الرد على رسالتك عبر أي من هذه القنوات.',
    fact_edu:'التعليم', fact_service:'الخدمة العسكرية', fact_loc:'الموقع',
    cf_name:'الاسم', cf_contact:'وسيلة التواصل (اختياري)', cf_msg:'رسالتك', cf_send:'إرسال',
    cf_ok:'وصلت رسالتك، شكرًا لك.', cf_err:'تعذر الإرسال الآن، جرّب لاحقًا.',
    chat_title:'مساعد الموقع', chat_ph:'اسأل عن أحمد...',
    chat_welcome:'أهلًا! أنا مساعد موقع أحمد زغلان. اسألني عن خبراته ومهاراته وتعليمه.',
    chat_err:'المساعد غير متاح الآن، جرّب لاحقًا.',
    footer:'أحمد زغلان — أخصائي مخازن | عضو برلمان شباب مصر، الدورة الحالية 2026',
    credit:'طوِّر هذا الموقع بواسطة ACTT'
  },
  en: {
    nav_home:'Home',
    tab_about:'About', tab_exp:'Experience', tab_skills:'Skills & Education', tab_lead:'Leadership & Public Life', tab_photos:'Photos', tab_contact:'Contact',
    sec_about:'Professional Summary', sec_photos:'Photos', sec_exp:'Work Experience', sec_skills:'Skills', sec_edu:'Education & Training', sec_lead:'Leadership & Representation', sec_community:'Community Work', sec_contact:'Contact',
    home_sections:'Sections', back_home:'Back to home',
    d_exp:'Roles and projects', d_skills:'Skills, education and training', d_lead:'Leadership, representation and public life', d_photos:'Photos from events and activities', d_contact:'Contact channels and message form',
    cta_linkedin:'LinkedIn', cta_contact:'Get in touch',
    contact_note:'For professional contact — happy to respond on any of these channels.',
    fact_edu:'Education', fact_service:'Military service', fact_loc:'Location',
    cf_name:'Name', cf_contact:'Contact detail (optional)', cf_msg:'Your message', cf_send:'Send',
    cf_ok:'Your message was received, thank you.', cf_err:'Could not send right now, try later.',
    chat_title:'Site Assistant', chat_ph:'Ask about Ahmed...',
    chat_welcome:"Hi! I'm the assistant of Ahmed Zoghlan's site. Ask me about his experience, skills and education.",
    chat_err:'Assistant unavailable right now, try later.',
    footer:'Ahmed Zoghlan — Storekeeper Specialist | Member, Egyptian Youth Parliament, current session 2026',
    credit:'Developed by ACTT'
  }
};

var lang = localStorage.getItem('az_lang') || 'ar';
var DATA = window.SITE_DATA;
try{ var _stored=localStorage.getItem('az_content_v1'); if(_stored){ DATA=JSON.parse(_stored); } }catch(e){}

/* serve right-sized images from Google's resizer (no visible quality loss at display size) */
function optImg(u, w){
  if(typeof u==='string' && u.indexOf('https://lh3.googleusercontent.com/d/')===0 && u.indexOf('=')===-1){
    return u + '=w' + w;
  }
  return u;
}

/* Full-screen photo lightbox */
function openLightbox(src, alt){
  var lb=document.createElement('div');
  lb.className='lb'; lb.setAttribute('role','dialog'); lb.setAttribute('aria-label',alt||'');
  var im=document.createElement('img'); im.src=src; im.alt=alt||'';
  var x=document.createElement('button'); x.className='lb-close'; x.setAttribute('aria-label','Close'); x.textContent='\u00D7';
  lb.appendChild(im); lb.appendChild(x);
  function close(){ lb.classList.remove('open'); setTimeout(function(){ lb.remove(); },180); document.removeEventListener('keydown',onKey); }
  function onKey(e){ if(e.key==='Escape') close(); }
  lb.addEventListener('click', function(e){ if(e.target!==im) close(); });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(lb);
  requestAnimationFrame(function(){ lb.classList.add('open'); });
}

var PAGE = document.body.getAttribute('data-page') || 'index';

function t(k){ return STR[lang][k] || k; }
function esc(s){ var d=document.createElement('div'); d.textContent=s==null?'':s; return d.innerHTML; }

function applyI18n(){
  document.documentElement.lang = lang;
  document.documentElement.dir = lang==='ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(function(el){ el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el){ el.placeholder = t(el.getAttribute('data-i18n-ph')); });
  document.getElementById('langToggle').textContent = lang==='ar' ? 'EN' : 'عربي';
  document.title = lang==='ar' ? document.title : document.title;
}

/* Nav: mark current page, scroll fades on overflow */
function updateNavFades(){
  var nav=document.getElementById('topnav');
  var wrap=nav&&nav.parentElement;
  if(!nav||!wrap||!wrap.classList.contains('nav-wrap')) return;
  var max=nav.scrollWidth-nav.clientWidth;
  if(max<=2){ wrap.classList.remove('can-scroll-left','can-scroll-right'); return; }
  var sl=nav.scrollLeft;
  var rtl=getComputedStyle(nav).direction==='rtl';
  var fromStart=rtl?-sl:sl;
  wrap.classList.toggle('can-scroll-right', rtl ? fromStart>2 : fromStart<max-2);
  wrap.classList.toggle('can-scroll-left', rtl ? fromStart<max-2 : fromStart>2);
}
function markCurrentNav(){
  var cur=document.querySelector('.topnav a[data-nav="'+PAGE+'"]');
  if(cur){
    cur.setAttribute('aria-current','page');
    var nav=document.getElementById('topnav');
    var target=cur.offsetLeft - (nav.clientWidth - cur.offsetWidth)/2;
    nav.scrollLeft = (getComputedStyle(nav).direction==='rtl') ? -target : target;
  }
}

function renderContactGrid(){
  var el=document.getElementById('contactGrid');
  if(!el) return;
  var cl=[];
  if(DATA.contact.linkedin) cl.push({href:DATA.contact.linkedin, ico:'in', label:'LinkedIn'});
  if(DATA.contact.whatsapp) cl.push({href:DATA.contact.whatsapp, ico:'✆', label:'WhatsApp'});
  if(DATA.contact.facebook) cl.push({href:DATA.contact.facebook, ico:'f', label:'Facebook'});
  if(DATA.contact.instagram) cl.push({href:DATA.contact.instagram, ico:'◎', label:'Instagram'});
  el.innerHTML = cl.map(function(c){
    return '<a class="contact-card" href="'+esc(c.href)+'" target="_blank" rel="noopener"><span class="ico">'+c.ico+'</span>'+esc(c.label)+'</a>';
  }).join('');
}

function render(){
  var m = DATA.meta;
  document.getElementById('brand').textContent = m['name_'+lang];
  var ft = document.getElementById('footerText');
  ft.textContent = t('footer');
  var cr = document.createElement('div');
  cr.className = 'footer-credit';
  cr.innerHTML = '<img class="actt-logo" src="https://mubader.pages.dev/assets/img/actt-logo.webp" alt="ACTT logo" loading="lazy"><span>'+esc(t('credit'))+'</span>';
  ft.appendChild(cr);

  if(PAGE==='index'){
    document.getElementById('heroBadge').textContent = m['title_'+lang].split('|')[0].trim();
    document.getElementById('heroBadge2').textContent = DATA['hero_extra_'+lang] || '';
    document.getElementById('heroName').textContent = m['name_'+lang];
    document.getElementById('heroTitle').textContent = m['title_'+lang];
    if(DATA.hero_photo){
      var hp=document.getElementById('heroPhoto');
      hp.classList.remove('hidden');
      var hi=document.getElementById('heroImg');
      hi.onerror=function(){
        hi.style.display='none';
        var fb=document.getElementById('heroFallback');
        if(!fb){
          fb=document.createElement('div');
          fb.id='heroFallback'; fb.className='hero-fallback';
          fb.textContent=(m['name_'+lang]||'').split(' ').slice(0,2).map(function(w){return w[0];}).join(' ');
          hp.appendChild(fb);
        }
        fb.style.display='flex';
      };
      hi.style.display='';
      hi.src = optImg(DATA.hero_photo, 800);
      hi.alt = m['name_'+lang];
    }
    document.getElementById('heroLinkedin').href = DATA.contact.linkedin;
    document.getElementById('aboutText').textContent = DATA.about[lang];
    var facts=[];
    if(DATA.education) facts.push([t('fact_edu'), DATA.education[lang]]);
    if(DATA.service && DATA.service[lang]) facts.push([t('fact_service'), DATA.service[lang]]);
    if(m['location_'+lang]) facts.push([t('fact_loc'), m['location_'+lang]]);
    document.getElementById('facts').innerHTML = facts.map(function(f){
      return '<div class="fact"><b>'+esc(f[0])+'</b><span>'+esc(f[1])+'</span></div>';
    }).join('');
  }

  if(PAGE==='experience'){
    document.getElementById('timeline').innerHTML = DATA.experience.map(function(e){
      var pts = (e['points_'+lang]||[]).map(function(p){ return '<li>'+esc(p)+'</li>'; }).join('');
      return '<div class="tl-item"><div class="tl-head"><span class="tl-org">'+esc(e['org_'+lang])+'</span>'+
        '<span class="tl-dates">'+esc(e['from_'+lang])+' — '+esc(e['to_'+lang])+'</span></div>'+
        '<div class="tl-role">'+esc(e['role_'+lang])+'</div>'+
        (pts?'<ul class="tl-points">'+pts+'</ul>':'')+'</div>';
    }).join('');
    document.getElementById('serviceLine').textContent = '';
  }

  if(PAGE==='skills'){
    document.getElementById('skillsTags').innerHTML = (DATA.skills[lang]||[]).map(function(s){ return '<span>'+esc(s)+'</span>'; }).join('');
    document.getElementById('eduText').textContent = DATA.education[lang];
    document.getElementById('trainingList').innerHTML = DATA.training.map(function(x){ return '<li>'+esc(x[lang])+'</li>'; }).join('');
  }

  if(PAGE==='leadership'){
    document.getElementById('leadershipList').innerHTML = DATA.leadership.filter(function(x){ return !x.pending && x[lang]; }).map(function(x){ return '<li>'+esc(x[lang])+'</li>'; }).join('');
    document.getElementById('communityList').innerHTML = (DATA.community||[]).filter(function(x){return x[lang];}).map(function(x){ return '<li>'+esc(x[lang])+'</li>'; }).join('');
  }

  if(PAGE==='photos'){
    var gal = document.getElementById('gallery');
    if(DATA.photos && DATA.photos.length){
      var alts=(DATA.photo_alts&&DATA.photo_alts[lang])||[];
      gal.innerHTML = DATA.photos.map(function(u,i){ return '<img src="'+esc(optImg(u,1600))+'" alt="'+esc(alts[i]||DATA.meta['name_'+lang])+'" loading="lazy" onerror="this.style.display=\'none\'">'; }).join('');
      gal.querySelectorAll('img').forEach(function(im){ im.style.cursor='zoom-in'; im.addEventListener('click', function(){ openLightbox(im.currentSrc||im.src, im.alt); }); });
    } else {
      gal.innerHTML='';
    }
  }

  if(PAGE==='contact'){ renderContactGrid(); }

  var apiReady = API_URL.indexOf('PASTE_')!==0;
  var cf=document.getElementById('contactForm');
  if(cf) cf.style.display = (DATA.contact.showForm && apiReady) ? '' : 'none';
  document.getElementById('chatFab').style.display = (DATA.assistant && DATA.assistant.enabled && apiReady) ? '' : 'none';
}

function api(action, payload){
  payload = payload || {}; payload.action = action;
  return fetch(API_URL, {method:'POST', headers:{'Content-Type':'text/plain'}, body:JSON.stringify(payload)})
    .then(function(r){ return r.json(); });
}

function applyRemote(res){
  if(!(res && res.ok && res.content)) return;
  var incoming;
  try{ incoming = JSON.stringify(res.content); }catch(e){ return; }
  if(incoming === JSON.stringify(DATA)) return;
  try{ localStorage.setItem('az_content_v1', incoming); }catch(e){}
  if(!sessionStorage.getItem('az_reloaded_v1')){
    sessionStorage.setItem('az_reloaded_v1', '1');
    location.reload();
  } else {
    DATA = res.content; render();
  }
}

function loadRemote(){
  if(API_URL.indexOf('PASTE_')===0) return;
  fetch(API_URL + '?action=getContent').then(function(r){ return r.json(); }).then(applyRemote).catch(function(){});
}
setInterval(loadRemote, 60000);

document.getElementById('langToggle').addEventListener('click', function(){
  lang = lang==='ar' ? 'en' : 'ar';
  localStorage.setItem('az_lang', lang);
  applyI18n(); render(); markCurrentNav();
  setTimeout(updateNavFades, 60);
});

var contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', function(ev){
    ev.preventDefault();
    var note = document.getElementById('cfNote');
    note.className = 'form-note';
    if(API_URL.indexOf('PASTE_')===0){ note.textContent = t('cf_err'); note.classList.add('err'); return; }
    api('contact', {
      name: document.getElementById('cfName').value.trim(),
      contact: document.getElementById('cfContact').value.trim(),
      message: document.getElementById('cfMsg').value.trim()
    }).then(function(res){
      if(res && res.ok){ note.textContent = t('cf_ok'); note.classList.add('ok'); ev.target.reset(); }
      else { note.textContent = t('cf_err'); note.classList.add('err'); }
    }).catch(function(){ note.textContent = t('cf_err'); note.classList.add('err'); });
  });
}

var chatBox = document.getElementById('chatBox');
var chatMsgs = document.getElementById('chatMsgs');
var chatOpened = false;
document.getElementById('chatFab').addEventListener('click', function(){
  chatBox.classList.toggle('hidden');
  if(!chatOpened){ chatOpened = true; addMsg('bot', t('chat_welcome')); }
});
document.getElementById('chatClose').addEventListener('click', function(){ chatBox.classList.add('hidden'); });
function addMsg(cls, text){
  var d = document.createElement('div');
  d.className = 'm ' + cls; d.textContent = text;
  chatMsgs.appendChild(d); chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

/* Interactive action buttons: only already-published contact links and site pages */
function chatActions(q){
  var s = (' ' + q.toLowerCase() + ' ');
  function has(){ for(var i=0;i<arguments.length;i++){ if(s.indexOf(arguments[i])!==-1) return true; } return false; }
  var acts = [], seen = {};
  function add(label, href, ext){ if(!href || seen[href]) return; seen[href]=1; acts.push({label:label, href:href, ext:!!ext}); }
  var ct = DATA.contact || {};
  if(has('تواصل','اتصل','contact','whatsapp','واتس','reach','linkedin','لينكد','فيسبوك','facebook','انست','instagram','بريد','email','رقم','phone','قناة')){
    add('WhatsApp', ct.whatsapp, true);
    add('LinkedIn', ct.linkedin, true);
    add('Facebook', ct.facebook, true);
    add('Instagram', ct.instagram, true);
  }
  if(has('خبرة','experience','work','وظيف','مشروعات','projects','شركة')) add(t('tab_exp'), 'experience.html');
  if(has('مهار','skill','تعليم','education','تدريب','training','دورة','course','شهاد')) add(t('tab_skills'), 'skills.html');
  if(has('قياد','leadership','برلمان','parliament','تمثيل','العمل العام','مجتمع')) add(t('tab_lead'), 'leadership.html');
  if(has('صور','photo','صورة','picture')) add(t('tab_photos'), 'photos.html');
  return acts.slice(0,5);
}
function addActions(acts){
  if(!acts.length) return;
  var w = document.createElement('div');
  w.className = 'chat-actions';
  acts.forEach(function(a){
    var b = document.createElement('a');
    b.className = 'chat-act'; b.href = a.href; b.textContent = a.label;
    if(a.ext){ b.target = '_blank'; b.rel = 'noopener'; }
    w.appendChild(b);
  });
  chatMsgs.appendChild(w); chatMsgs.scrollTop = chatMsgs.scrollHeight;
}
document.getElementById('chatForm').addEventListener('submit', function(ev){
  ev.preventDefault();
  var inp = document.getElementById('chatInput');
  var q = inp.value.trim(); if(!q) return;
  addMsg('user', q); inp.value = '';
  if(API_URL.indexOf('PASTE_')===0){ addMsg('err', t('chat_err')); return; }
  api('assistant', {message: q, lang: lang}).then(function(res){
    if(res && res.ok && res.reply){ addMsg('bot', res.reply); addActions(chatActions(q)); }
    else addMsg('err', t('chat_err'));
  }).catch(function(){ addMsg('err', t('chat_err')); });
});

document.getElementById('topnav').addEventListener('scroll', updateNavFades, {passive:true});
window.addEventListener('resize', updateNavFades);

/* Reveal on scroll */
function initReveal(){
  var els = document.querySelectorAll('.panel, .sec-card, .tl-item, .gallery img, .fact, .contact-card, .page-head');
  if(!('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('in'); }); return; }
  els.forEach(function(e){ e.classList.add('rv'); });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, {threshold: .08, rootMargin: '0px 0px -20px 0px'});
  els.forEach(function(e){ io.observe(e); });
}

applyI18n(); render(); markCurrentNav(); initReveal();
loadRemote();
setTimeout(function(){ updateNavFades(); initReveal(); }, 60);
setTimeout(initReveal, 900);
