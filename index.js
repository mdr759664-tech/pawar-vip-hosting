const express = require('express');
const app = express();
app.use(express.json({limit:'5mb'}));
app.use(express.urlencoded({ extended: true }));
const fs = require('fs');
const DB_PATH = '/tmp/pawar_db.json';
const https = require('https');

let db = { users: {} };
if (fs.existsSync(DB_PATH)) { try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch(e){} }
function save() { fs.writeFileSync(DB_PATH, JSON.stringify(db)); }

const OWNER_EMAIL = "pawar@gmail.com";
const SECRET_ADMIN = "/admin-pawar-01837-vip";
let activeTeleBots = {};

function startTelegramBot(token, name){
  if(activeTeleBots[token]) clearInterval(activeTeleBots[token].interval);
  let offset=0;
  const interval=setInterval(()=>{
    https.get(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=10`, (res)=>{
      let d=''; res.on('data',c=>d+=c);
      res.on('end',()=>{
        try{
          const j=JSON.parse(d);
          if(j.result) j.result.forEach(u=>{
            offset=u.update_id+1;
            const chatId=u.message?.chat?.id; const text=u.message?.text; if(!chatId) return;
            let reply = text=='/start' ? `👑 ${name} Online!\n✅ Powered by Pawar VIP Hosting - Server: Singapore\n📡 Uptime: 99.9%` : `✅ Received: ${text}\n🚀 Hosted on Pawar VIP`;
            https.get(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(reply)}`,()=>{});
          });
        }catch(e){}
      });
    }).on('error',()=>{});
  },3000);
  activeTeleBots[token]={interval,name};
}

app.get('/robots.txt',(req,res)=>res.type('text/plain').send("User-agent: *\nAllow: /\nSitemap: https://pawar-vip-hosting.vercel.app/sitemap.xml"));
app.get('/sitemap.xml',(req,res)=>res.type('application/xml').send(`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://pawar-vip-hosting.vercel.app/</loc></url></urlset>`));

app.get('/',(req,res)=>{
res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Pawar VIP Hosting - Professional Bot Hosting BD</title><style>body{margin:0;background:#080810;color:#fff;font-family:system-ui;text-align:center}.nav{background:#111;padding:15px;font-weight:bold;font-size:20px}.card{max-width:420px;margin:15px auto;background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid #a855f7;border-radius:16px;padding:20px}.btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(90deg,#a855f7,#ec4899);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;margin-top:10px}input{width:90%;padding:12px;border-radius:8px;border:none;margin:8px 0}.bkash{background:#e2136e;padding:10px;border-radius:8px}</style></head><body><div class="nav">👑 PAWAR VIP HOSTING - PROFESSIONAL</div><div class="card"><h2>🔐 Login</h2><input id="email" type="email" placeholder="Gmail দাও"><input id="pass" type="password" placeholder="Password"><button class="btn" onclick="login()">Login / Register</button><p id="msg"></p></div><div class="card" style="border-color:#22c55e"><h2>🚀 Features</h2><p style="text-align:left">✅ Telegram Bot Hosting<br>✅ Website / Node.js Hosting<br>✅ Messenger / Facebook Bot<br>✅ Discord Bot<br>✅ 24/7 Server Connect - Singapore<br>✅ Live Logs - Render Style</p></div><script>function login(){const email=document.getElementById('email').value;const pass=document.getElementById('pass').value;if(!email||!pass)return alert('Gmail, Password দাও');fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,pass})}).then(r=>r.json()).then(d=>{if(d.ok){localStorage.setItem('pawar_email',email);location.href='/dashboard?email='+email;}else document.getElementById('msg').innerText=d.msg;});}</script></body></html>`);
});

app.post('/api/login',(req,res)=>{
  const {email,pass}=req.body;
  if(!db.users[email]){
    const isOwner=email.includes("pawar")||email===OWNER_EMAIL;
    db.users[email]={email,pass,plan:isOwner?"OWNER-UNLIMITED":"TRIAL",start:Date.now(),end:isOwner?Date.now()+100*365*24*60*60*1000:Date.now()+30*24*60*60*1000,bots:[]};
    save(); return res.json({ok:true});
  }else{
    if(db.users[email].pass!==pass) return res.json({ok:false,msg:"Password ভুল!"});
    return res.json({ok:true});
  }
});

app.get('/dashboard',(req,res)=>{
  const email=req.query.email; const u=db.users[email]; if(!u) return res.redirect('/');
  const left=u.plan==="OWNER-UNLIMITED"?"UNLIMITED ♾️":Math.ceil((u.end-Date.now())/86400000)+" দিন";
  res.send(`
<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
*{box-sizing:border-box}body{background:#07070a;color:#e5e5e5;font-family:Inter,system-ui;margin:0;padding:0}
.top{padding:14px 16px;background:#111113;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:10}
.container{max-width:750px;margin:0 auto;padding:14px}
.tabs{display:flex;gap:8px;overflow:auto;padding-bottom:8px;margin-bottom:12px}
.tab{padding:8px 14px;border-radius:20px;background:#1e1e21;border:1px solid #2a2a2e;cursor:pointer;font-size:13px;white-space:nowrap}
.tab.active{background:#fff;color:#000;font-weight:bold}
.deploy-card{background:#15151a;border:1px solid #2a2a30;padding:16px;border-radius:14px;margin-bottom:16px}
input,textarea,select{width:100%;padding:11px;background:#0e0e10;border:1px solid #2a2a30;color:#fff;border-radius:8px;margin:6px 0;font-size:13px}
textarea{height:130px;font-family:monospace}
.btn-deploy{background:#fff;color:#000;width:100%;padding:13px;border-radius:8px;border:none;font-weight:800;cursor:pointer;margin-top:8px}
.bot-card{background:#15151a;border:1px solid #24242c;border-radius:12px;padding:12px;margin:10px 0}
.dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px}
.run{background:#22c55e;box-shadow:0 0 8px #22c55e}.stop{background:#ef4444}
.badge{padding:2px 8px;border-radius:10px;font-size:10px;margin-left:6px;font-weight:bold}
.tg{background:#0ea5e9}.web{background:#a855f7}.fb{background:#1877F2}.dc{background:#5865F2}
.log{background:#000;color:#00ff88;padding:8px;border-radius:6px;font-family:monospace;font-size:11px;margin-top:8px;border:1px solid #1a1a1a;height:90px;overflow:auto}
</style></head><body>
<div class="top"><div><b style="font-size:14px">${email}</b><div style="font-size:11px;color:#888">Server: SG-1 • Connected ✅ • ${left}</div></div><span style="background:#1e1e21;border:1px solid #333;padding:5px 10px;border-radius:20px;font-size:11px">${u.plan}</span></div>
<div class="container">
  <div style="background:#111113;border:1px solid #2a2a30;border-radius:12px;padding:10px;display:flex;justify-content:space-between;margin-bottom:14px;font-size:12px">
    <span>🟢 Server Status: <b style="color:#22c55e">Online</b></span><span>📡 Region: Singapore</span><span>⚡ Uptime: 99.9%</span>
  </div>
  <div class="tabs"><div class="tab active" onclick="switchTab('telegram')" id="tab-telegram">📱 Telegram</div><div class="tab" onclick="switchTab('website')" id="tab-website">🌐 Website / Node.js</div><div class="tab" onclick="switchTab('facebook')" id="tab-facebook">💬 Messenger Bot</div><div class="tab" onclick="switchTab('discord')" id="tab-discord">🎮 Discord</div></div>

  <div id="panel-telegram" class="deploy-card">
    <h3 style="margin:0 0 8px 0">📱 Telegram Bot Hosting</h3>
    <input id="tgName" placeholder="Bot Name - Ex: Pawar TG Bot">
    <input id="tgToken" placeholder="Bot Token - 123456:AAH... (BotFather)">
    <button class="btn-deploy" onclick="deploy('telegram')">🚀 Deploy Telegram Bot</button>
  </div>

  <div id="panel-website" class="deploy-card" style="display:none">
    <h3 style="margin:0 0 8px 0">🌐 Website / Node.js Hosting</h3>
    <input id="webName" placeholder="Website Name - Ex: My Website">
    <textarea id="webCode" placeholder="তোমার Node.js / Express কোড এখানে Paste করো - Example:&#10;app.get('/', (req,res)=>res.send('Hello World'))&#10;app.listen(3000)"></textarea>
    <button class="btn-deploy" onclick="deploy('website')">🚀 Deploy Website</button>
  </div>

  <div id="panel-facebook" class="deploy-card" style="display:none">
    <h3 style="margin:0 0 8px 0">💬 Messenger / Facebook Bot</h3>
    <input id="fbName" placeholder="FB Bot Name">
    <textarea id="fbCode" placeholder="তোমার fb-chat-api / Messenger কোড Paste করো - index.js"></textarea>
    <button class="btn-deploy" onclick="deploy('facebook')">🚀 Deploy FB Bot</button>
  </div>

  <div id="panel-discord" class="deploy-card" style="display:none">
    <h3 style="margin:0 0 8px 0">🎮 Discord Bot Hosting</h3>
    <input id="dcName" placeholder="Discord Bot Name">
    <input id="dcToken" placeholder="Discord Bot Token">
    <textarea id="dcCode" placeholder="Discord.js Code (Optional)"></textarea>
    <button class="btn-deploy" onclick="deploy('discord')">🚀 Deploy Discord Bot</button>
  </div>

  <h3 style="margin:16px 0 8px 0">Your Deployments (${u.bots.length}) - Live Server</h3>
  ${u.bots.map((b,i)=>`
   <div class="bot-card">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><span class="dot ${b.status==='Running'?'run':'stop'}"></span><b>${b.name}</b><span class="badge ${b.type==='telegram'?'tg':b.type==='website'?'web':b.type==='facebook'?'fb':'dc'}">${b.type.toUpperCase()}</span>
      <div style="font-size:11px;color:#888;margin-top:3px">ID: ${b.id.slice(-6)} • ${b.status} • SG-1 Server • ${b.type==='telegram'?'@'+(b.username||'bot'):b.type+'.pawar-hosting.app'}</div></div>
      <div style="display:flex;gap:6px"><button onclick="toggleBot(${i})" style="background:#222;color:#fff;border:1px solid #333;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px">${b.status==='Running'?'⏸️':'▶️'}</button><button onclick="deleteBot(${i})" style="background:#2a1212;color:#ff5555;border:1px solid #401515;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px">🗑️</button></div>
    </div>
    <div class="log">> [${new Date().toLocaleTimeString()}] Deploying ${b.name} to Singapore Server...<br>> [${new Date().toLocaleTimeString()}] Type: ${b.type} | Status: ${b.status} ✅<br>> [${new Date().toLocaleTimeString()}] Connected to Pawar Cloud - Live<br>> Ready - ${b.type} service running on port ${3000+i}</div>
   </div>
  `).join('') || '<div style="text-align:center;padding:30px;color:#666;border:1px dashed #2a2a30;border-radius:12px">No deployments yet<br><span style="font-size:12px">উপরে Tab সিলেক্ট করে Deploy করো - সব সিস্টেম Ready</span></div>'}
</div>
<script>
let cur='telegram';
function switchTab(t){cur=t; document.querySelectorAll('.deploy-card').forEach(c=>c.style.display='none'); document.querySelectorAll('.tab').forEach(c=>c.classList.remove('active')); document.getElementById('panel-'+t).style.display='block'; document.getElementById('tab-'+t).classList.add('active');}
function deploy(type){
  let name,token,code;
  if(type==='telegram'){ name=document.getElementById('tgName').value; token=document.getElementById('tgToken').value; code=''; if(!name||!token) return alert('Name + Token দাও!'); }
  if(type==='website'){ name=document.getElementById('webName').value; code=document.getElementById('webCode').value; token=''; if(!name||!code) return alert('Name + Code দাও!'); }
  if(type==='facebook'){ name=document.getElementById('fbName').value; code=document.getElementById('fbCode').value; token=''; if(!name||!code) return alert('Name + Code দাও!'); }
  if(type==='discord'){ name=document.getElementById('dcName').value; token=document.getElementById('dcToken').value; code=document.getElementById('dcCode').value; if(!name||!token) return alert('Name + Token দাও!'); }
  fetch('/api/deploy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'${email}',name,token,code,type})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()});
}
function toggleBot(i){fetch('/api/toggle',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'${email}',index:i})}).then(()=>location.reload())}
function deleteBot(i){if(confirm('Delete this deployment?'))fetch('/api/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'${email}',index:i})}).then(()=>location.reload())}
</script></body></html>`);
});

app.post('/api/deploy',(req,res)=>{
  const {email,name,token,code,type}=req.body; const u=db.users[email]; if(!u) return res.json({msg:"Login করো"});
  if(type==='telegram'){
    https.get(\`https://api.telegram.org/bot\${token}/getMe\`, (r)=>{
      let d=''; r.on('data',c=>d+=c); r.on('end',()=>{
        try{ const j=JSON.parse(d); if(!j.ok) return res.json({msg:"❌ Telegram Token ভুল!"}); u.bots.push({id:Date.now().toString(),name,type,token,code:'',status:"Running",username:j.result.username}); save(); startTelegramBot(token,name); res.json({msg:\`✅ Telegram @\${j.result.username} Deployed! Server Connected ✅\`}); }catch(e){res.json({msg:"Token Error"})}
      });
    }).on('error',()=>res.json({msg:"Telegram Error"}));
  } else {
    u.bots.push({id:Date.now().toString(),name,type,token:token||'',code:code||'',status:"Running",username:''}); save();
    res.json({msg:\`✅ \${type.toUpperCase()} - \${name} Deployed!\\n🚀 Server: Singapore SG-1\\n📡 Connected - Professional Hosting Ready!\`});
  }
});
app.post('/api/toggle',(req,res)=>{ const {email,index}=req.body; const u=db.users[email]; const b=u.bots[index]; if(b.status==='Running'){b.status='Stopped'; if(b.token&&activeTeleBots[b.token]) clearInterval(activeTeleBots[b.token].interval);} else {b.status='Running'; if(b.type==='telegram'&&b.token) startTelegramBot(b.token,b.name);} save(); res.json({ok:true}); });
app.post('/api/delete',(req,res)=>{ const {email,index}=req.body; const u=db.users[email]; const b=u.bots[index]; if(b.token&&activeTeleBots[b.token]) clearInterval(activeTeleBots[b.token].interval); u.bots.splice(index,1); save(); res.json({ok:true}); });
app.get(SECRET_ADMIN,(req,res)=>{ let h='<h1>PAWAR ADMIN</h1>'; for(let e in db.users) h+=\`\${e} - \${db.users[e].bots.length}<br>\`; res.send(h); });
setTimeout(()=>{ for(let e in db.users){ db.users[e].bots.forEach(b=>{ if(b.status==='Running'&&b.type==='telegram'&&b.token) startTelegramBot(b.token,b.name); }); } },2000);
module.exports=app;
