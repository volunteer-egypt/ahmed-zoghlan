/* Ahmed Zoghlan personal site — public frontend */
var API_URL = 'PASTE_EXEC_URL_HERE';

var STR = {
  ar: {
    tab_about:'نبذة', tab_exp:'الخبرات', tab_skills:'المهارات والتعليم', tab_lead:'القيادة والعمل العام', tab_photos:'صور', tab_contact:'تواصل',
    sec_about:'نبذة مهنية', sec_photos:'صور', sec_exp:'الخبرات العملية', sec_skills:'المهارات', sec_edu:'التعليم والتدريب', sec_lead:'الأنشطة القيادية والتمثيل', sec_community:'العمل المجتمعي', sec_contact:'تواصل',
    cta_linkedin:'LinkedIn', cta_contact:'تواصل معي',
    contact_note:'للتواصل المهني — يسعدني الرد على رسالتك عبر أي من هذه القنوات.',
    fact_edu:'التعليم', fact_service:'الخدمة العسكرية', fact_loc:'الموقع',
    cf_name:'الاسم', cf_contact:'وسيلة التواصل (اختياري)', cf_msg:'رسالتك', cf_send:'إرسال',
    cf_ok:'وصلت رسالتك، شكرًا لك.', cf_err:'تعذر الإرسال الآن، جرّب لاحقًا.',
    chat_title:'مساعد الموقع', chat_ph:'اسأل عن أحمد...',
    chat_welcome:'أهلًا! أنا مساعد موقع أحمد زغلان. اسألني عن خبراته ومهاراته وتعليمه.',
    chat_err:'المساعد غير متاح الآن، جرّب لاحقًا.',
    footer:'أحمد زغلان — أخصائي مخازن | عضو برلمان شباب مصر، الدورة الحالية 2026'
  },
  en: {
    tab_about:'About', tab_exp:'Experience', tab_skills:'Skills & Education', tab_lead:'Leadership & Public Life', tab_photos:'Photos', tab_contact:'Contact',
    sec_about:'Professional Summary', sec_photos:'Photos', sec_exp:'Work Experience', sec_skills:'Skills', sec_edu:'Education & Training', sec_lead:'Leadership & Representation', sec_community:'Community Work', sec_contact:'Contact',
    cta_linkedin:'LinkedIn', cta_contact:'Get in touch',
    contact_note:'For professional contact — happy to respond on any of these channels.',
    fact_edu:'Education', fact_service:'Military service', fact_loc:'Location',
    cf_name:'Name', cf_contact:'Contact detail (optional)', cf_msg:'Your message', cf_send:'Send',
    cf_ok:'Your message was received, thank you.', cf_err:'Could not send right now, try later.',
    chat_title:'Site Assistant', chat_ph:'Ask about Ahmed...',
    chat_welcome:"Hi! I'm the assistant of Ahmed Zoghlan's site. Ask me about his experience, skills and education.",
    chat_err:'Assistant unavailable right now, try later.',
    footer:'Ahmed Zoghlan — Storekeeper Specialist | Member, Egyptian Youth Parliament, current session 2026'
  }
};

var lang = localStorage.getItem('az_lang') || 'ar';
var DATA = window.SITE_DATA;

function t(k){ return STR[lang][k] || k; }
function esc(s){ var d=document.createElement('div'); d.textContent=s==null?'':s; return d.innerHTML; }

function applyI18n(){
  document.documentElement.lang = lang;
  document.documentElement.dir = lang==='ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(function(el){ el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el){ el.placeholder = t(el.getAttribute('data-i18n-ph')); });
  document.getElementById('langToggle').textContent = lang==='ar' ? 'EN' : 'عربي';
  document.title = lang==='ar' ? 'أحمد زغلان | Ahmed Zoghlan' : 'Ahmed Zoghlan | Storekeeper Specialist';
}

function render(){
  var m = DATA.meta;
  document.getElementById('brand').textContent = m['name_'+lang];
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
    hi.src = DATA.hero_photo;
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

  var tl = document.getElementById('timeline');
  tl.innerHTML = DATA.experience.map(function(e){
    var pts = (e['points_'+lang]||[]).map(function(p){ return '<li>'+esc(p)+'</li>'; }).join('');
    return '<div class="tl-item"><div class="tl-head"><span class="tl-org">'+esc(e['org_'+lang])+'</span>'+
      '<span class="tl-dates">'+esc(e['from_'+lang])+' — '+esc(e['to_'+lang])+'</span></div>'+
      '<div class="tl-role">'+esc(e['role_'+lang])+'</div>'+
      (pts?'<ul class="tl-points">'+pts+'</ul>':'')+'</div>';
  }).join('');
  document.getElementById('serviceLine').textContent = '';

  document.getElementById('skillsTags').innerHTML = (DATA.skills[lang]||[]).map(function(s){ return '<span>'+esc(s)+'</span>'; }).join('');
  document.getElementById('eduText').textContent = DATA.education[lang];
  document.getElementById('trainingList').innerHTML = DATA.training.map(function(x){ return '<li>'+esc(x[lang])+'</li>'; }).join('');
  document.getElementById('communityList').innerHTML = (DATA.community||[]).filter(function(x){return x[lang];}).map(function(x){ return '<li>'+esc(x[lang])+'</li>'; }).join('');
  document.getElementById('leadershipList').innerHTML = DATA.leadership.filter(function(x){ return !x.pending && x[lang]; }).map(function(x){ return '<li>'+esc(x[lang])+'</li>'; }).join('');
  document.getElementById('footerText').textContent = t('footer');

  var gal = document.getElementById('panel-photos');
  if(DATA.photos && DATA.photos.length){
    var alts=(DATA.photo_alts&&DATA.photo_alts[lang])||[];
    document.getElementById('gallery').innerHTML = DATA.photos.map(function(u,i){ return '<img src="'+esc(u)+'" alt="'+esc(alts[i]||DATA.meta['name_'+lang])+'" loading="lazy" onerror="this.style.display=\'none\'">'; }).join('');
  } else {
    document.getElementById('gallery').innerHTML='';
  }

  var cl=[];
  if(DATA.contact.linkedin) cl.push({href:DATA.contact.linkedin, ico:'in', label:'LinkedIn'});
  if(DATA.contact.whatsapp) cl.push({href:DATA.contact.whatsapp, ico:'✆', label:'WhatsApp'});
  if(DATA.contact.facebook) cl.push({href:DATA.contact.facebook, ico:'f', label:'Facebook'});
  if(DATA.contact.instagram) cl.push({href:DATA.contact.instagram, ico:'◎', label:'Instagram'});
  document.getElementById('contactGrid').innerHTML = cl.map(function(c){
    return '<a class="contact-card" href="'+esc(c.href)+'" target="_blank" rel="noopener"><span class="ico">'+c.ico+'</span>'+esc(c.label)+'</a>';
  }).join('');

  var apiReady = API_URL.indexOf('PASTE_')!==0;
  document.getElementById('contactForm').style.display = (DATA.contact.showForm && apiReady) ? '' : 'none';
  document.getElementById('chatFab').style.display = (DATA.assistant && DATA.assistant.enabled && apiReady) ? '' : 'none';
}

/* Tabs */
function setTab(name){
  var tabs=document.querySelectorAll('.tab');
  var found=false;
  tabs.forEach(function(b){
    var on = b.getAttribute('data-tab')===name;
    b.classList.toggle('active', on);
    if(on) found=true;
  });
  if(!found){
    name='about';
    tabs.forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-tab')==='about'); });
  }
  document.querySelectorAll('.panel').forEach(function(p){
    p.classList.toggle('hidden', p.id!=='panel-'+name);
  });
}
document.getElementById('tabs').addEventListener('click', function(ev){
  var b=ev.target.closest('.tab'); if(!b) return;
  var name=b.getAttribute('data-tab');
  setTab(name);
  if(history.replaceState) history.replaceState(null,'','#'+name);
});
document.querySelectorAll('[data-tablink]').forEach(function(a){
  a.addEventListener('click', function(ev){
    ev.preventDefault();
    var name=a.getAttribute('data-tablink');
    setTab(name);
    if(history.replaceState) history.replaceState(null,'','#'+name);
    document.getElementById('tabs').scrollIntoView({behavior:'smooth'});
  });
});

function api(action, payload){
  payload = payload || {}; payload.action = action;
  return fetch(API_URL, {method:'POST', headers:{'Content-Type':'text/plain'}, body:JSON.stringify(payload)})
    .then(function(r){ return r.json(); });
}

function loadRemote(){
  if(API_URL.indexOf('PASTE_')===0) return;
  fetch(API_URL + '?action=getContent').then(function(r){ return r.json(); }).then(function(res){
    if(res && res.ok && res.content){ DATA = res.content; render(); }
  }).catch(function(){});
}

document.getElementById('langToggle').addEventListener('click', function(){
  lang = lang==='ar' ? 'en' : 'ar';
  localStorage.setItem('az_lang', lang);
  applyI18n(); render();
});

document.getElementById('contactForm').addEventListener('submit', function(ev){
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
document.getElementById('chatForm').addEventListener('submit', function(ev){
  ev.preventDefault();
  var inp = document.getElementById('chatInput');
  var q = inp.value.trim(); if(!q) return;
  addMsg('user', q); inp.value = '';
  if(API_URL.indexOf('PASTE_')===0){ addMsg('err', t('chat_err')); return; }
  api('assistant', {message: q, lang: lang}).then(function(res){
    if(res && res.ok && res.reply) addMsg('bot', res.reply);
    else addMsg('err', t('chat_err'));
  }).catch(function(){ addMsg('err', t('chat_err')); });
});

applyI18n(); render();
var h=(location.hash||'').replace('#','');
setTab(h||'about');
loadRemote();
