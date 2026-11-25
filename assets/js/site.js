/* Ahmed Zoghlan personal site — public frontend */
var API_URL = 'PASTE_EXEC_URL_HERE';

var STR = {
  ar: {
    nav_about:'نبذة', nav_exp:'الخبرات', nav_skills:'المهارات', nav_edu:'التعليم', nav_lead:'القيادة', nav_contact:'تواصل',
    sec_about:'نبذة مهنية', sec_photos:'صور', sec_exp:'الخبرات العملية', sec_skills:'المهارات', sec_edu:'التعليم والتدريب', sec_training:'دورات وتدريبات', sec_lead:'الأنشطة القيادية والتمثيل', sec_community:'العمل المجتمعي', sec_contact:'تواصل',
    cta_linkedin:'LinkedIn', cta_contact:'تواصل معي',
    cf_name:'الاسم', cf_contact:'وسيلة التواصل (اختياري)', cf_msg:'رسالتك', cf_send:'إرسال',
    cf_ok:'وصلت رسالتك، شكرًا لك.', cf_err:'تعذر الإرسال الآن، جرّب لاحقًا.',
    chat_title:'مساعد الموقع', chat_ph:'اسأل عن أحمد...',
    chat_welcome:'أهلًا! أنا مساعد موقع أحمد زغلان. اسألني عن خبراته ومهاراته وتعليمه.',
    chat_err:'المساعد غير متاح الآن، جرّب لاحقًا.',
    footer:'أحمد زغلان — أخصائي مخازن | مشروعات التشييد والبنية التحتية'
  },
  en: {
    nav_about:'About', nav_exp:'Experience', nav_skills:'Skills', nav_edu:'Education', nav_lead:'Leadership', nav_contact:'Contact',
    sec_about:'Professional Summary', sec_photos:'Photos', sec_exp:'Work Experience', sec_skills:'Skills', sec_edu:'Education & Training', sec_training:'Courses & Training', sec_lead:'Leadership & Representation', sec_community:'Community Work', sec_contact:'Contact',
    cta_linkedin:'LinkedIn', cta_contact:'Get in touch',
    cf_name:'Name', cf_contact:'Contact detail (optional)', cf_msg:'Your message', cf_send:'Send',
    cf_ok:'Your message was received, thank you.', cf_err:'Could not send right now, try later.',
    chat_title:'Site Assistant', chat_ph:'Ask about Ahmed...',
    chat_welcome:"Hi! I'm the assistant of Ahmed Zoghlan's site. Ask me about his experience, skills and education.",
    chat_err:'Assistant unavailable right now, try later.',
    footer:'Ahmed Zoghlan — Storekeeper Specialist | Construction & Infrastructure Projects'
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
  document.getElementById('heroName').textContent = m['name_'+lang];
  document.getElementById('heroTitle').textContent = m['title_'+lang];
  document.getElementById('heroLoc').textContent = m['location_'+lang] || '';
  if(DATA.hero_photo){
    var hp=document.getElementById('heroPhoto');
    hp.classList.remove('hidden');
    document.getElementById('heroImg').src = DATA.hero_photo;
    document.getElementById('heroImg').alt = m['name_'+lang];
  }
  document.getElementById('heroLinkedin').href = DATA.contact.linkedin;
  document.getElementById('contactLinkedin').href = DATA.contact.linkedin;
  document.getElementById('aboutText').textContent = DATA.about[lang];

  var tl = document.getElementById('timeline');
  tl.innerHTML = DATA.experience.map(function(e){
    var pts = (e['points_'+lang]||[]).map(function(p){ return '<li>'+esc(p)+'</li>'; }).join('');
    return '<div class="tl-item"><div class="tl-org">'+esc(e['org_'+lang])+'</div>'+
      '<div class="tl-role">'+esc(e['role_'+lang])+'</div>'+
      '<div class="tl-dates">'+esc(e['from_'+lang])+' — '+esc(e['to_'+lang])+'</div>'+
      (pts?'<ul class="tl-points">'+pts+'</ul>':'')+'</div>';
  }).join('');
  document.getElementById('serviceLine').textContent = DATA.service ? DATA.service[lang] : '';

  document.getElementById('skillsTags').innerHTML = (DATA.skills[lang]||[]).map(function(s){ return '<span>'+esc(s)+'</span>'; }).join('');
  document.getElementById('eduText').textContent = DATA.education[lang];
  document.getElementById('trainingList').innerHTML = DATA.training.map(function(x){ return '<li>'+esc(x[lang])+'</li>'; }).join('');
  document.getElementById('communityList').innerHTML = (DATA.community||[]).filter(function(x){return x[lang];}).map(function(x){ return '<li>'+esc(x[lang])+'</li>'; }).join('');
  document.getElementById('leadershipList').innerHTML = DATA.leadership.filter(function(x){ return !x.pending && x[lang]; }).map(function(x){ return '<li>'+esc(x[lang])+'</li>'; }).join('');
  document.getElementById('footerText').textContent = t('footer');
  var gal = document.getElementById('photos');
  if(DATA.photos && DATA.photos.length){
    gal.classList.remove('hidden');
    document.getElementById('gallery').innerHTML = DATA.photos.map(function(u){ return '<img src="'+esc(u)+'" alt="'+esc(DATA.meta['name_'+lang])+'" loading="lazy">'; }).join('');
  } else { gal.classList.add('hidden'); }
  var apiReady = API_URL.indexOf('PASTE_')!==0;
  document.getElementById('contactForm').style.display = (DATA.contact.showForm && apiReady) ? '' : 'none';
  document.getElementById('chatFab').style.display = (DATA.assistant && DATA.assistant.enabled && apiReady) ? '' : 'none';
}

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

applyI18n(); render(); loadRemote();
