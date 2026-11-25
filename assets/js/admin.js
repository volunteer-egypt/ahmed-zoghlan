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
function tabContent(){
  api('getContent',{token:S.token}).then(function(res){
    var c = (res && res.ok && res.content) ? res.content : JSON.parse(JSON.stringify(window.SITE_DATA));
    var f = function(v){ return esc(v==null?'':v); };
    var inner='<h2>محتوى الموقع</h2><div class="card">'+
      '<div class="grid2"><div><label>الاسم (عربي)</label><input id="c_name_ar" value="'+f(c.meta.name_ar)+'"></div>'+
      '<div><label>الاسم (إنجليزي)</label><input id="c_name_en" value="'+f(c.meta.name_en)+'"></div>'+
      '<div><label>اللقب المهني (عربي)</label><input id="c_title_ar" value="'+f(c.meta.title_ar)+'"></div>'+
      '<div><label>اللقب المهني (إنجليزي)</label><input id="c_title_en" value="'+f(c.meta.title_en)+'"></div>'+
      '<div><label>الموقع/البلد (عربي)</label><input id="c_loc_ar" value="'+f(c.meta.location_ar)+'"></div>'+
      '<div><label>الموقع/البلد (إنجليزي)</label><input id="c_loc_en" value="'+f(c.meta.location_en)+'"></div></div>'+
      '<label>النبذة (عربي)</label><textarea id="c_about_ar" rows="4">'+f(c.about.ar)+'</textarea>'+
      '<label>النبذة (إنجليزي)</label><textarea id="c_about_en" rows="4">'+f(c.about.en)+'</textarea>'+
      '<div class="grid2"><div><label>الخدمة العسكرية (عربي)</label><input id="c_service_ar" value="'+f(c.service?c.service.ar:'')+'"></div>'+
      '<div><label>الخدمة العسكرية (إنجليزي)</label><input id="c_service_en" value="'+f(c.service?c.service.en:'')+'"></div></div>'+
      '<div class="grid2"><div><label>التعليم (عربي)</label><input id="c_edu_ar" value="'+f(c.education.ar)+'"></div>'+
      '<div><label>التعليم (إنجليزي)</label><input id="c_edu_en" value="'+f(c.education.en)+'"></div></div>'+
      '<label>لينكدإن</label><input id="c_linkedin" dir="ltr" value="'+f(c.contact.linkedin)+'"></div>'+
      '<div class="card"><label>الخبرات (JSON — عربي/إنجليزي)</label><textarea id="c_exp" rows="10" dir="ltr" style="text-align:left;font-family:monospace;font-size:.82rem">'+f(JSON.stringify(c.experience,null,1))+'</textarea></div>'+
      '<div class="card"><label>المهارات (JSON)</label><textarea id="c_skills" rows="4" dir="ltr" style="text-align:left;font-family:monospace;font-size:.82rem">'+f(JSON.stringify(c.skills,null,1))+'</textarea>'+
      '<label>التدريبات (JSON)</label><textarea id="c_training" rows="5" dir="ltr" style="text-align:left;font-family:monospace;font-size:.82rem">'+f(JSON.stringify(c.training,null,1))+'</textarea>'+
      '<label>الأنشطة القيادية (JSON)</label><textarea id="c_leadership" rows="5" dir="ltr" style="text-align:left;font-family:monospace;font-size:.82rem">'+f(JSON.stringify(c.leadership,null,1))+'</textarea>'+
      '<label>العمل المجتمعي (JSON)</label><textarea id="c_community" rows="3" dir="ltr" style="text-align:left;font-family:monospace;font-size:.82rem">'+f(JSON.stringify(c.community||[],null,1))+'</textarea></div>'+
      '<div class="card"><label>روابط الصور (رابط في كل سطر)</label><textarea id="c_photos" rows="4" dir="ltr" style="text-align:left">'+f((c.photos||[]).join('\n'))+'</textarea>'+
      '<label><input type="checkbox" id="c_showform" style="width:auto" '+(c.contact.showForm?'checked':'')+'> إظهار نموذج التواصل</label>'+
      '<label><input type="checkbox" id="c_assistant" style="width:auto" '+((c.assistant&&c.assistant.enabled)?'checked':'')+'> تفعيل مساعد الموقع الذكي</label></div>'+
      '<div style="margin-top:6px"><button class="btn primary" id="saveBtn">حفظ ونشر</button> <span class="note" id="saveNote"></span></div>';
    shell('content', inner);
    document.getElementById('saveBtn').addEventListener('click', function(){
      var note=document.getElementById('saveNote');
      var exp, sk, tr, ld, cm;
      try{ exp=JSON.parse(document.getElementById('c_exp').value);
           sk=JSON.parse(document.getElementById('c_skills').value);
           tr=JSON.parse(document.getElementById('c_training').value);
           cm=JSON.parse(document.getElementById('c_community').value);
           ld=JSON.parse(document.getElementById('c_leadership').value);
      }catch(e){ note.className='note err'; note.textContent='صيغة JSON غير صحيحة في أحد الحقول'; return; }
      c.meta.name_ar=document.getElementById('c_name_ar').value; c.meta.name_en=document.getElementById('c_name_en').value;
      c.meta.title_ar=document.getElementById('c_title_ar').value; c.meta.title_en=document.getElementById('c_title_en').value;
      c.meta.location_ar=document.getElementById('c_loc_ar').value; c.meta.location_en=document.getElementById('c_loc_en').value;
      c.about.ar=document.getElementById('c_about_ar').value; c.about.en=document.getElementById('c_about_en').value;
      c.service={ar:document.getElementById('c_service_ar').value, en:document.getElementById('c_service_en').value};
      c.education={ar:document.getElementById('c_edu_ar').value, en:document.getElementById('c_edu_en').value};
      c.contact.linkedin=document.getElementById('c_linkedin').value.trim();
      c.contact.showForm=document.getElementById('c_showform').checked;
      c.assistant={enabled:document.getElementById('c_assistant').checked};
      c.photos=document.getElementById('c_photos').value.split('\n').map(function(x){return x.trim();}).filter(Boolean);
      c.experience=exp; c.skills=sk; c.training=tr; c.leadership=ld; c.community=cm;
      api('saveContent',{token:S.token, content:c}).then(function(r){
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
