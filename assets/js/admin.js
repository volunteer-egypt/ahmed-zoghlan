/* Admin panel — Ahmed Zoghlan personal site */
var API_URL = 'https://script.google.com/macros/s/AKfycbyJogsSnA5f4_KyxM4hOSYFJC5oeNjS-25r6kCbRRG64P5Ia-D8VBbJU9R_Pn-x_lbA/exec';
var app = document.getElementById('app');
var S = { token: sessionStorage.getItem('az_admin') ? JSON.parse(sessionStorage.getItem('az_admin')).token : null,
          name: null, username: null, perms: [] };
try{ var saved = JSON.parse(sessionStorage.getItem('az_admin')||'null'); if(saved){ S.name=saved.name; S.username=saved.username; S.perms=saved.perms||[]; } }catch(e){}

function esc(s){ var d=document.createElement('div'); d.textContent=s==null?'':s; return d.innerHTML; }
function api(action, payload){
  payload = payload || {}; payload.action = action;
  return fetch(API_URL, {method:'POST', headers:{'Content-Type':'text/plain'}, body:JSON.stringify(payload)})
    .then(function(r){ return r.json(); });
}
function toast(msg){
  var d=document.createElement('div'); d.className='toast'; d.textContent=msg;
  document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600);
}
function hasPerm(p){ return S.perms.indexOf('all')>=0 || S.perms.indexOf(p)>=0; }
function adminBase(){ return location.href.split('#')[0]; }

/* ---------- views ---------- */
function renderLogin(note){
  app.innerHTML = '<div class="center-box"><h1>لوحة إدارة الموقع</h1><p>تسجيل الدخول</p>'+
    '<form id="lf"><label>اسم المستخدم</label><input id="lu" autocomplete="username" required>'+
    '<label>كلمة المرور</label><input id="lp" type="password" autocomplete="current-password" required>'+
    '<div style="margin-top:16px"><button class="btn primary" type="submit">دخول</button></div>'+
    '<p class="note err" id="ln">'+(note||'')+'</p></form></div>';
  document.getElementById('lf').addEventListener('submit', function(ev){
    ev.preventDefault();
    api('login', {username:document.getElementById('lu').value.trim(), password:document.getElementById('lp').value})
      .then(function(res){
        if(res && res.ok){
          S.token=res.token; S.name=res.name; S.username=res.username; S.perms=res.perms||[];
          sessionStorage.setItem('az_admin', JSON.stringify({token:S.token,name:S.name,username:S.username,perms:S.perms}));
          location.hash=''; renderDash('content');
        } else {
          document.getElementById('ln').textContent='بيانات الدخول غير صحيحة';
        }
      }).catch(function(){ document.getElementById('ln').textContent='خطأ في الاتصال'; });
  });
}

function renderActivate(token){
  app.innerHTML = '<div class="center-box"><h1>تفعيل حسابك</h1><p>اختر كلمة مرور (٨ أحرف على الأقل)</p>'+
    '<form id="af"><label>كلمة المرور الجديدة</label><input id="ap1" type="password" minlength="8" required>'+
    '<label>تأكيد كلمة المرور</label><input id="ap2" type="password" minlength="8" required>'+
    '<div style="margin-top:16px"><button class="btn primary" type="submit">تفعيل</button></div>'+
    '<p class="note err" id="an"></p></form></div>';
  document.getElementById('af').addEventListener('submit', function(ev){
    ev.preventDefault();
    var p1=document.getElementById('ap1').value, p2=document.getElementById('ap2').value;
    if(p1!==p2){ document.getElementById('an').textContent='كلمتا المرور غير متطابقتين'; return; }
    api('activate', {token:token, password:p1}).then(function(res){
      if(res && res.ok){
        S.token=res.token; S.name=res.name; S.username=res.username; S.perms=res.perms||[];
        sessionStorage.setItem('az_admin', JSON.stringify({token:S.token,name:S.name,username:S.username,perms:S.perms}));
        location.hash=''; renderDash('content');
      } else {
        var m={bad_invite:'رابط التفعيل غير صالح', invite_used:'هذا الرابط استُخدم من قبل', invite_expired:'انتهت صلاحية الرابط — اطلب رابطًا جديدًا', weak_password:'كلمة المرور قصيرة'};
        document.getElementById('an').textContent=m[res&&res.error]||'تعذر التفعيل';
      }
    }).catch(function(){ document.getElementById('an').textContent='خطأ في الاتصال'; });
  });
}

function shell(tab, inner){
  var tabs=[['content','المحتوى'],['messages','الرسائل'],['users','المستخدمون'],['account','حسابي']];
  var nav=tabs.map(function(x){
    if(x[0]==='users' && !hasPerm('users')) return '';
    if(x[0]==='messages' && !hasPerm('messages')) return '';
    return '<a href="javascript:void(0)" data-tab="'+x[0]+'" class="'+(tab===x[0]?'active':'')+'">'+x[1]+'</a>';
  }).join('');
  app.innerHTML='<div class="layout"><div class="side"><div class="brand">أحمد زغلان</div>'+nav+
    '<a href="javascript:void(0)" id="logoutBtn" class="out">خروج</a></div><div class="main" id="mainBody">'+inner+'</div></div>';
  app.querySelectorAll('.side a[data-tab]').forEach(function(a){
    a.addEventListener('click', function(){ renderDash(a.getAttribute('data-tab')); });
  });
  document.getElementById('logoutBtn').addEventListener('click', function(){
    api('logout',{token:S.token}); sessionStorage.removeItem('az_admin');
    S.token=null; renderLogin();
  });
}

function renderDash(tab){
  tab = tab || 'content';
  if(tab==='content') return tabContent();
  if(tab==='messages') return tabMessages();
  if(tab==='users') return tabUsers();
  if(tab==='account') return tabAccount();
}

/* ---------- content tab ---------- */
var C = null;

function gv(id){ var e=document.getElementById(id); return e?e.value:''; }
function gc(id){ var e=document.getElementById(id); return e?e.checked:false; }

function paintSingles(listId, arr, ph){
  document.getElementById(listId).innerHTML = (arr||[]).map(function(s,i){
    return '<div class="item-row"><input class="sg_v" value="'+esc(s||'')+'" placeholder="'+esc(ph||'')+'">'+
      '<button type="button" class="btn danger small row-del" data-list="'+listId+'" data-single="1" data-i="'+i+'">حذف</button></div>';
  }).join('') || '<p class="note">لا عناصر بعد — أضف من الزر أدناه.</p>';
}
function collectSingles(listId){
  var out=[];
  document.querySelectorAll('#'+listId+' .item-row .sg_v').forEach(function(e){ if(e.value.trim()) out.push(e.value.trim()); });
  return out;
}
function paintPairs(listId, arr){
  document.getElementById(listId).innerHTML = (arr||[]).map(function(it,i){
    return '<div class="item-row"><input class="pr_ar" value="'+esc(it.ar||'')+'" placeholder="عربي">'+
      '<input class="pr_en" dir="ltr" value="'+esc(it.en||'')+'" placeholder="English">'+
      '<button type="button" class="btn danger small row-del" data-list="'+listId+'" data-i="'+i+'">حذف</button></div>';
  }).join('') || '<p class="note">لا عناصر بعد — أضف من الزر أدناه.</p>';
}
function collectPairs(listId){
  var out=[];
  document.querySelectorAll('#'+listId+' .item-row').forEach(function(r){
    out.push({ar:r.querySelector('.pr_ar').value.trim(), en:r.querySelector('.pr_en').value.trim()});
  });
  return out;
}

function paintExp(){
  document.getElementById('expList').innerHTML = (C.experience||[]).map(function(x,i){
    return '<div class="exp-card" data-i="'+i+'"><div class="exp-head"><strong>خبرة '+(i+1)+'</strong><span>'+
      '<button type="button" class="btn small exp-up" data-i="'+i+'" title="أعلى">↑</button> '+
      '<button type="button" class="btn small exp-dn" data-i="'+i+'" title="أسفل">↓</button> '+
      '<button type="button" class="btn danger small exp-del" data-i="'+i+'">حذف</button></span></div>'+
      '<div class="grid2"><div><label>الجهة (عربي)</label><input class="x_org_ar" value="'+esc(x.org_ar||'')+'"></div>'+
      '<div><label>الجهة (إنجليزي)</label><input class="x_org_en" dir="ltr" value="'+esc(x.org_en||'')+'"></div>'+
      '<div><label>الدور (عربي)</label><input class="x_role_ar" value="'+esc(x.role_ar||'')+'"></div>'+
      '<div><label>الدور (إنجليزي)</label><input class="x_role_en" dir="ltr" value="'+esc(x.role_en||'')+'"></div>'+
      '<div><label>من (عربي)</label><input class="x_from_ar" value="'+esc(x.from_ar||'')+'"></div>'+
      '<div><label>من (إنجليزي)</label><input class="x_from_en" dir="ltr" value="'+esc(x.from_en||'')+'"></div>'+
      '<div><label>إلى (عربي)</label><input class="x_to_ar" value="'+esc(x.to_ar||'')+'"></div>'+
      '<div><label>إلى (إنجليزي)</label><input class="x_to_en" dir="ltr" value="'+esc(x.to_en||'')+'"></div></div>'+
      '<label>النقاط (عربي) — سطر لكل نقطة</label><textarea class="x_pts_ar" rows="3">'+esc((x.points_ar||[]).join('\n'))+'</textarea>'+
      '<label>النقاط (إنجليزي) — سطر لكل نقطة</label><textarea class="x_pts_en" dir="ltr" rows="3">'+esc((x.points_en||[]).join('\n'))+'</textarea></div>';
  }).join('') || '<p class="note">لا خبرات بعد — أضف من الزر أدناه.</p>';
}
function collectExp(){
  var out=[];
  document.querySelectorAll('#expList .exp-card').forEach(function(card){
    var g=function(cls){ var e=card.querySelector(cls); return e?e.value.trim():''; };
    out.push({
      org_ar:g('.x_org_ar'), org_en:g('.x_org_en'),
      role_ar:g('.x_role_ar'), role_en:g('.x_role_en'),
      from_ar:g('.x_from_ar'), from_en:g('.x_from_en'),
      to_ar:g('.x_to_ar'), to_en:g('.x_to_en'),
      points_ar:g('.x_pts_ar').split('\n').map(function(s){return s.trim();}).filter(Boolean),
      points_en:g('.x_pts_en').split('\n').map(function(s){return s.trim();}).filter(Boolean)
    });
  });
  C.experience = out;
}

function paintPhotos(){
  var altsAr=(C.photo_alts&&C.photo_alts.ar)||[], altsEn=(C.photo_alts&&C.photo_alts.en)||[];
  document.getElementById('photoList').innerHTML = (C.photos||[]).map(function(u,i){
    return '<div class="photo-row"><img class="thumb" src="'+esc(u)+'" alt="" onerror="this.style.visibility=\'hidden\'">'+
      '<div class="photo-fields"><input class="ph_url" dir="ltr" value="'+esc(u)+'" placeholder="رابط الصورة">'+
      '<div class="grid2"><div><input class="ph_alt_ar" value="'+esc(altsAr[i]||'')+'" placeholder="وصف الصورة (عربي)"></div>'+
      '<div><input class="ph_alt_en" dir="ltr" value="'+esc(altsEn[i]||'')+'" placeholder="Alt text (English)"></div></div></div>'+
      '<button type="button" class="btn danger small photo-del" data-i="'+i+'">حذف</button></div>';
  }).join('') || '<p class="note">لا صور بعد.</p>';
}
function collectPhotos(){
  var urls=[], aAr=[], aEn=[];
  document.querySelectorAll('#photoList .photo-row').forEach(function(r){
    var u=r.querySelector('.ph_url').value.trim();
    if(!u) return;
    urls.push(u);
    aAr.push(r.querySelector('.ph_alt_ar').value.trim());
    aEn.push(r.querySelector('.ph_alt_en').value.trim());
  });
  C.photos=urls; C.photo_alts={ar:aAr, en:aEn};
}

function syncLists(){
  collectExp();
  C.skills={ar:collectSingles('skillsList'), en:collectSingles('skillsEnList')};
  C.training=collectPairs('trainingList');
  C.leadership=collectPairs('leadershipList');
  C.community=collectPairs('communityList');
  collectPhotos();
}
function paintLists(){
  paintExp();
  paintSingles('skillsList', (C.skills&&C.skills.ar)||[], 'مهارة بالعربي');
  paintSingles('skillsEnList', (C.skills&&C.skills.en)||[], 'Skill in English');
  paintPairs('trainingList', C.training||[]);
  paintPairs('leadershipList', C.leadership||[]);
  paintPairs('communityList', C.community||[]);
  paintPhotos();
}

function tabContent(){
  api('getContent',{token:S.token}).then(function(res){
    C = (res && res.ok && res.content) ? res.content : JSON.parse(JSON.stringify(window.SITE_DATA));
    C.experience=C.experience||[]; C.training=C.training||[]; C.leadership=C.leadership||[];
    C.community=C.community||[]; C.photos=C.photos||[]; C.photo_alts=C.photo_alts||{ar:[],en:[]};
    C.contact=C.contact||{}; C.assistant=C.assistant||{};
    var f = function(v){ return esc(v==null?'':v); };
    var inner='<h2>محتوى الموقع</h2>'+
    '<div class="card"><h3>الأساسيات</h3>'+
      '<div class="grid2"><div><label>الاسم (عربي)</label><input id="c_name_ar" value="'+f(C.meta.name_ar)+'"></div>'+
      '<div><label>الاسم (إنجليزي)</label><input id="c_name_en" dir="ltr" value="'+f(C.meta.name_en)+'"></div>'+
      '<div><label>اللقب المهني (عربي)</label><input id="c_title_ar" value="'+f(C.meta.title_ar)+'"></div>'+
      '<div><label>اللقب المهني (إنجليزي)</label><input id="c_title_en" dir="ltr" value="'+f(C.meta.title_en)+'"></div>'+
      '<div><label>الموقع/البلد (عربي)</label><input id="c_loc_ar" value="'+f(C.meta.location_ar)+'"></div>'+
      '<div><label>الموقع/البلد (إنجليزي)</label><input id="c_loc_en" dir="ltr" value="'+f(C.meta.location_en)+'"></div>'+
      '<div><label>الشارة الإضافية تحت اللقب (عربي)</label><input id="c_hx_ar" value="'+f(C.hero_extra_ar)+'"></div>'+
      '<div><label>الشارة الإضافية (إنجليزي)</label><input id="c_hx_en" dir="ltr" value="'+f(C.hero_extra_en)+'"></div></div>'+
      '<label>النبذة (عربي)</label><textarea id="c_about_ar" rows="4">'+f(C.about.ar)+'</textarea>'+
      '<label>النبذة (إنجليزي)</label><textarea id="c_about_en" dir="ltr" rows="4">'+f(C.about.en)+'</textarea>'+
      '<div class="grid2"><div><label>الخدمة العسكرية (عربي)</label><input id="c_service_ar" value="'+f(C.service?C.service.ar:'')+'"></div>'+
      '<div><label>الخدمة العسكرية (إنجليزي)</label><input id="c_service_en" dir="ltr" value="'+f(C.service?C.service.en:'')+'"></div>'+
      '<div><label>التعليم (عربي)</label><input id="c_edu_ar" value="'+f(C.education.ar)+'"></div>'+
      '<div><label>التعليم (إنجليزي)</label><input id="c_edu_en" dir="ltr" value="'+f(C.education.en)+'"></div></div></div>'+
    '<div class="card"><h3>الخبرات العملية</h3><div id="expList"></div>'+
      '<button type="button" class="btn dark small" id="expAdd">+ إضافة خبرة</button></div>'+
    '<div class="card"><h3>المهارات (عربي)</h3><div id="skillsList"></div>'+
      '<button type="button" class="btn dark small pair-add" data-single="1" data-list="skillsList">+ إضافة مهارة</button>'+
      '<h3 style="margin-top:14px">المهارات (إنجليزي)</h3><div id="skillsEnList"></div>'+
      '<button type="button" class="btn dark small pair-add" data-single="1" data-list="skillsEnList">+ Add skill</button></div>'+
    '<div class="card"><h3>التدريبات</h3><div id="trainingList"></div>'+
      '<button type="button" class="btn dark small pair-add" data-list="trainingList">+ إضافة تدريب</button></div>'+
    '<div class="card"><h3>القيادة والعمل العام</h3><div id="leadershipList"></div>'+
      '<button type="button" class="btn dark small pair-add" data-list="leadershipList">+ إضافة بند</button></div>'+
    '<div class="card"><h3>العمل المجتمعي</h3><div id="communityList"></div>'+
      '<button type="button" class="btn dark small pair-add" data-list="communityList">+ إضافة بند</button></div>'+
    '<div class="card"><h3>الصور</h3>'+
      '<label>صورة الواجهة الرئيسية</label>'+
      '<div class="photo-row"><img class="thumb" id="c_hero_thumb" src="'+f(C.hero_photo)+'" alt="" onerror="this.style.visibility=\'hidden\'">'+
      '<div class="photo-fields"><input id="c_hero" dir="ltr" value="'+f(C.hero_photo)+'" placeholder="رابط صورة الواجهة"></div></div>'+
      '<label style="margin-top:10px">معرض الصور</label><div id="photoList"></div>'+
      '<input type="file" id="photoFile" accept="image/*" style="display:none">'+
      '<button type="button" class="btn dark small" id="photoAddUrl">+ إضافة صورة برابط</button> '+
      '<button type="button" class="btn primary small" id="photoUpload">رفع صورة من الجهاز</button> '+
      '<span class="note" id="photoNote"></span></div>'+
    '<div class="card"><h3>التواصل</h3>'+
      '<div class="grid2"><div><label>لينكدإن</label><input id="c_linkedin" dir="ltr" value="'+f(C.contact.linkedin)+'"></div>'+
      '<div><label>واتساب</label><input id="c_whatsapp" dir="ltr" value="'+f(C.contact.whatsapp)+'"></div>'+
      '<div><label>فيسبوك</label><input id="c_facebook" dir="ltr" value="'+f(C.contact.facebook)+'"></div>'+
      '<div><label>إنستغرام</label><input id="c_instagram" dir="ltr" value="'+f(C.contact.instagram)+'"></div></div>'+
      '<label><input type="checkbox" id="c_showform" style="width:auto" '+(C.contact.showForm?'checked':'')+'> إظهار نموذج التواصل</label>'+
      '<label><input type="checkbox" id="c_assistant" style="width:auto" '+(C.assistant.enabled?'checked':'')+'> تفعيل مساعد الموقع الذكي</label></div>'+
    '<div style="position:sticky;bottom:10px;text-align:center"><button class="btn primary" id="saveBtn" style="box-shadow:0 6px 20px rgba(0,0,0,.25)">حفظ ونشر</button> <span class="note" id="saveNote"></span></div>';
    shell('content', inner);
    paintLists();

    /* list mutations */
    document.getElementById('mainBody').addEventListener('click', function(ev){
      var b=ev.target.closest('button'); if(!b) return;
      if(b.classList.contains('pair-add')){
        var listId=b.getAttribute('data-list');
        if(b.getAttribute('data-single')){ var sa=collectSingles(listId); sa.push(''); paintSingles(listId, sa); }
        else { var arr=collectPairs(listId); arr.push({ar:'',en:''}); paintPairs(listId, arr); }
      }
      if(b.classList.contains('row-del')){
        var listId2=b.getAttribute('data-list');
        if(b.getAttribute('data-single')){ var sa2=collectSingles(listId2); sa2.splice(+b.getAttribute('data-i'),1); paintSingles(listId2, sa2); }
        else { var arr2=collectPairs(listId2); arr2.splice(+b.getAttribute('data-i'),1); paintPairs(listId2, arr2); }
      }
      if(b.id==='expAdd'){ collectExp(); C.experience.push({org_ar:'',org_en:'',role_ar:'',role_en:'',from_ar:'',from_en:'',to_ar:'',to_en:'',points_ar:[],points_en:[]}); paintExp(); }
      if(b.classList.contains('exp-del')){ collectExp(); C.experience.splice(+b.getAttribute('data-i'),1); paintExp(); }
      if(b.classList.contains('exp-up')||b.classList.contains('exp-dn')){
        collectExp(); var i=+b.getAttribute('data-i'); var j=b.classList.contains('exp-up')?i-1:i+1;
        if(j>=0&&j<C.experience.length){ var t=C.experience[i]; C.experience[i]=C.experience[j]; C.experience[j]=t; paintExp(); }
      }
      if(b.id==='photoAddUrl'){ collectPhotos(); C.photos.push(''); C.photo_alts.ar.push(''); C.photo_alts.en.push(''); paintPhotos(); }
      if(b.classList.contains('photo-del')){ collectPhotos(); var k=+b.getAttribute('data-i'); C.photos.splice(k,1); C.photo_alts.ar.splice(k,1); C.photo_alts.en.splice(k,1); paintPhotos(); }
      if(b.id==='photoUpload'){ document.getElementById('photoFile').click(); }
    });

    document.getElementById('photoFile').addEventListener('change', function(ev){
      var file=ev.target.files[0]; if(!file) return;
      var note=document.getElementById('photoNote');
      note.className='note'; note.textContent='جارٍ الرفع...';
      var rd=new FileReader();
      rd.onload=function(){
        var b64=String(rd.result).split(',')[1]||'';
        api('uploadPhoto',{token:S.token, filename:file.name, mime:file.type||'image/jpeg', data:b64}).then(function(r){
          if(r&&r.ok){ collectPhotos(); C.photos.push(r.url); C.photo_alts.ar.push(''); C.photo_alts.en.push(''); paintPhotos(); note.className='note ok'; note.textContent='تم رفع الصورة ✓'; }
          else { note.className='note err'; note.textContent='فشل الرفع ('+((r&&r.error)||'')+')'; }
        }).catch(function(){ note.className='note err'; note.textContent='خطأ في الاتصال'; });
      };
      rd.readAsDataURL(file);
      ev.target.value='';
    });

    document.getElementById('c_hero').addEventListener('input', function(){
      document.getElementById('c_hero_thumb').src=this.value;
    });

    document.getElementById('saveBtn').addEventListener('click', function(){
      var note=document.getElementById('saveNote');
      C.meta.name_ar=gv('c_name_ar'); C.meta.name_en=gv('c_name_en');
      C.meta.title_ar=gv('c_title_ar'); C.meta.title_en=gv('c_title_en');
      C.meta.location_ar=gv('c_loc_ar'); C.meta.location_en=gv('c_loc_en');
      C.hero_extra_ar=gv('c_hx_ar'); C.hero_extra_en=gv('c_hx_en');
      C.about.ar=gv('c_about_ar'); C.about.en=gv('c_about_en');
      C.service={ar:gv('c_service_ar'), en:gv('c_service_en')};
      C.education={ar:gv('c_edu_ar'), en:gv('c_edu_en')};
      C.hero_photo=gv('c_hero').trim();
      C.contact.linkedin=gv('c_linkedin').trim();
      C.contact.whatsapp=gv('c_whatsapp').trim();
      C.contact.facebook=gv('c_facebook').trim();
      C.contact.instagram=gv('c_instagram').trim();
      C.contact.showForm=gc('c_showform');
      C.assistant={enabled:gc('c_assistant')};
      syncLists();
      note.className='note'; note.textContent='جارٍ الحفظ...';
      api('saveContent',{token:S.token, content:C}).then(function(r){
        if(r&&r.ok){ note.className='note ok'; note.textContent='تم الحفظ والنشر ✓'; toast('تم نشر المحتوى'); }
        else { note.className='note err'; note.textContent='فشل الحفظ ('+((r&&r.error)||'')+')'; }
      }).catch(function(){ note.className='note err'; note.textContent='خطأ في الاتصال'; });
    });
  });
}

/* ---------- messages tab ---------- */
function tabMessages(){
  api('listMessages',{token:S.token}).then(function(res){
    var list=(res&&res.ok)?res.messages:[];
    var inner='<h2>رسائل نموذج التواصل</h2>';
    if(!list.length) inner+='<div class="card"><p class="note">لا رسائل بعد.</p></div>';
    inner+=list.map(function(m){
      return '<div class="msg '+(m.read?'':'unread')+'"><div class="meta">'+esc(m.name)+' — '+esc(m.contact||'بدون وسيلة تواصل')+' — '+esc((m.ts||'').slice(0,16).replace('T',' '))+'</div>'+
        '<div>'+esc(m.message)+'</div>'+
        (m.read?'':'<div style="margin-top:8px"><button class="btn small dark" data-read="'+esc(m.id)+'">تحديد كمقروءة</button></div>')+'</div>';
    }).join('');
    shell('messages', inner);
    app.querySelectorAll('[data-read]').forEach(function(b){
      b.addEventListener('click', function(){ api('markMessageRead',{token:S.token,id:b.getAttribute('data-read')}).then(function(){ tabMessages(); }); });
    });
  });
}

/* ---------- users tab ---------- */
function tabUsers(){
  api('listUsers',{token:S.token}).then(function(res){
    var users=(res&&res.ok)?res.users:[];
    var inner='<h2>المستخدمون</h2><div class="card"><table><tr><th>المستخدم</th><th>الاسم</th><th>الصلاحيات</th><th>الحالة</th><th></th></tr>'+
      users.map(function(u){
        return '<tr><td dir="ltr" style="text-align:start">'+esc(u.username)+(u.owner?' <span class="badge owner">مالك</span>':'')+'</td><td>'+esc(u.name)+'</td>'+
          '<td>'+esc((u.perms||[]).join(', '))+'</td>'+
          '<td><span class="badge '+(u.active?'on':'off')+'">'+(u.active?'نشط':'غير نشط')+'</span></td>'+
          '<td class="row-actions">'+
            (u.owner?'':'<button class="btn small dark" data-toggle="'+esc(u.username)+'" data-active="'+u.active+'">'+(u.active?'إيقاف':'تفعيل')+'</button>'+
            '<button class="btn small dark" data-reset="'+esc(u.username)+'">إعادة تعيين</button>'+
            '<button class="btn small danger" data-del="'+esc(u.username)+'">حذف</button>')+
          '</td></tr>';
      }).join('')+'</table></div>'+
      '<div class="card"><h2 style="font-size:1.05rem">إضافة مستخدم بدعوة واتساب</h2>'+
      '<div class="grid2"><div><label>اسم المستخدم (إنجليزي بلا مسافات)</label><input id="nu_name" dir="ltr" placeholder="User-Name"></div>'+
      '<div><label>الاسم الظاهر</label><input id="nu_disp"></div></div>'+
      '<label>رقم واتساب بصيغة دولية (اختياري — لاقتراح رابط الإرسال)</label><input id="nu_phone" dir="ltr" placeholder="20xxxxxxxxxx">'+
      '<label>الصلاحيات</label>'+
      '<label style="font-weight:400"><input type="checkbox" class="nu_perm" value="content" checked style="width:auto"> المحتوى</label>'+
      '<label style="font-weight:400"><input type="checkbox" class="nu_perm" value="messages" checked style="width:auto"> الرسائل</label>'+
      '<label style="font-weight:400"><input type="checkbox" class="nu_perm" value="users" style="width:auto"> المستخدمون</label>'+
      '<div style="margin-top:10px"><button class="btn primary" id="inviteBtn">إنشاء دعوة</button> <span class="note err" id="invNote"></span></div>'+
      '<div id="waArea"></div></div>';
    shell('users', inner);
    app.querySelectorAll('[data-toggle]').forEach(function(b){
      b.addEventListener('click', function(){
        api('updateUser',{token:S.token, username:b.getAttribute('data-toggle'), active:b.getAttribute('data-active')!=='true'})
          .then(function(r){ if(r&&r.ok) tabUsers(); else toast('تعذر التعديل: '+((r&&r.error)||'')); });
      });
    });
    app.querySelectorAll('[data-del]').forEach(function(b){
      b.addEventListener('click', function(){
        if(!confirm('حذف المستخدم «'+b.getAttribute('data-del')+'» نهائيًا؟')) return;
        api('deleteUser',{token:S.token, username:b.getAttribute('data-del')})
          .then(function(r){ if(r&&r.ok){ toast('تم الحذف'); tabUsers(); } else toast('تعذر الحذف: '+((r&&r.error)||'')); });
      });
    });
    app.querySelectorAll('[data-reset]').forEach(function(b){
      b.addEventListener('click', function(){
        api('resetUser',{token:S.token, username:b.getAttribute('data-reset')}).then(function(r){
          if(r&&r.ok) showWaBlock(r.invite_token, r.username, '');
          else toast('تعذر: '+((r&&r.error)||''));
        });
      });
    });
    document.getElementById('inviteBtn').addEventListener('click', function(){
      var perms=[]; app.querySelectorAll('.nu_perm:checked').forEach(function(c){ perms.push(c.value); });
      api('inviteUser',{token:S.token, username:document.getElementById('nu_name').value.trim(),
        name:document.getElementById('nu_disp').value.trim(), phone:document.getElementById('nu_phone').value.trim(), perms:perms})
        .then(function(r){
          if(r&&r.ok){ showWaBlock(r.invite_token, r.username, document.getElementById('nu_phone').value.trim()); }
          else { var m={bad_username:'اسم مستخدم غير صالح (إنجليزي، بلا مسافات، ٣+ أحرف)', username_taken:'اسم المستخدم مستخدم بالفعل'};
            document.getElementById('invNote').textContent=m[r&&r.error]||('خطأ: '+((r&&r.error)||'')); }
        });
    });
  });
}
function showWaBlock(token, username, phone){
  var link = adminBase() + '#/activate/' + token;
  var text = 'مرحبًا! تم إنشاء حسابك «'+username+'» في لوحة إدارة موقع أحمد زغلان. فعّل حسابك من هذا الرابط (صالح ٧٢ ساعة، مرة واحدة): ' + link;
  var wa = 'https://wa.me/?text=' + encodeURIComponent(text);
  if(phone) wa = 'https://wa.me/' + phone.replace(/[^0-9]/g,'') + '?text=' + encodeURIComponent(text);
  document.getElementById('waArea').innerHTML =
    '<div class="wa-block"><strong>الدعوة جاهزة ✓</strong> — أرسلها عبر واتساب:'+
    '<span class="lnk">'+esc(link)+'</span>'+
    '<a class="btn primary" href="'+esc(wa)+'" target="_blank" rel="noopener">فتح واتساب مع الرسالة</a></div>';
}

/* ---------- account tab ---------- */
function tabAccount(){
  var inner='<h2>حسابي</h2><div class="card" style="max-width:420px"><p class="note">'+esc(S.name)+' — <span dir="ltr">'+esc(S.username)+'</span></p>'+
    '<form id="cpf"><label>كلمة المرور الحالية</label><input id="cp_old" type="password" required>'+
    '<label>كلمة المرور الجديدة</label><input id="cp_new" type="password" minlength="8" required>'+
    '<label>تأكيد الجديدة</label><input id="cp_new2" type="password" minlength="8" required>'+
    '<div style="margin-top:14px"><button class="btn primary" type="submit">تغيير كلمة المرور</button></div>'+
    '<p class="note" id="cpn"></p></form></div>';
  shell('account', inner);
  document.getElementById('cpf').addEventListener('submit', function(ev){
    ev.preventDefault();
    var n1=document.getElementById('cp_new').value, n2=document.getElementById('cp_new2').value, note=document.getElementById('cpn');
    if(n1!==n2){ note.className='note err'; note.textContent='كلمتا المرور غير متطابقتين'; return; }
    api('changePassword',{token:S.token, old_password:document.getElementById('cp_old').value, new_password:n1}).then(function(r){
      if(r&&r.ok){ note.className='note ok'; note.textContent='تم تغيير كلمة المرور ✓'; ev.target.reset(); }
      else { note.className='note err'; note.textContent = (r&&r.error)==='bad_old'?'كلمة المرور الحالية غير صحيحة':'تعذر التغيير'; }
    });
  });
}

/* ---------- boot ---------- */
var m = location.hash.match(/#\/activate\/([a-f0-9]+)/);
if(m){ renderActivate(m[1]); }
else if(S.token){
  api('session',{token:S.token}).then(function(res){
    if(res&&res.ok){ S.name=res.name; S.username=res.username; S.perms=res.perms||[]; renderDash('content'); }
    else { sessionStorage.removeItem('az_admin'); S.token=null; renderLogin(); }
  }).catch(function(){ renderLogin('خطأ في الاتصال'); });
} else { renderLogin(); }
