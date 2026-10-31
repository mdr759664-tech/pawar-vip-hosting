const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const fs = require('fs');
const DB_PATH = '/tmp/pawar_db.json';
const https = require('https');

let db = { users: {} };
if (fs.existsSync(DB_PATH)) {
  try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch(e){}
}
function save() { fs.writeFileSync(DB_PATH, JSON.stringify(db)); }

const OWNER_EMAIL = "pawar@gmail.com";
const SECRET_ADMIN = "/admin-pawar-01837-vip";

let activeTeleBots = {}; // token -> interval

function startTelegramBot(token, name, customCode){
  if(activeTeleBots[token]) clearInterval(activeTeleBots[token].interval);
  
  let offset = 0;
  const interval = setInterval(()=>{
    https.get(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=10`, (res)=>{
      let data=''; res.on('data', c=>data+=c);
      res.on('end', ()=>{
        try{
          const j = JSON.parse(data);
          if(j.result) j.result.forEach(u=>{
            offset = u.update_id+1;
            const chatId = u.message?.chat?.id;
            const text = u.message?.text;
            if(!chatId) return;
            let reply = `👑 Pawar Hosting\nYou said: ${text}`;
            
            // যদি কাস্টম কোডে reply থাকে
            if(customCode && customCode.includes('reply')) {
               // simple eval for user code
               try { 
                 const func = new Function('text','chatId','return `'+customCode.replace(/`/g,'').slice(0,500)+'`');
                 reply = func(text, chatId) || reply;
               } catch(e){}
            } else {
              if(text=='/start') reply = `🔥 Welcome to ${name}!\nPowered by Pawar VIP Hosting`;
              else if(text) reply = `✅ ${name} Received: ${text}`;
            }

            const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(reply)}`;
            https.get(url, ()=>{});
          });
        }catch(e){}
      });
    }).on('error', ()=>{});
  }, 3000);
  activeTeleBots[token] = {interval, name};
}

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send("User-agent: *\nAllow: /\nSitemap: https://pawar-vip-hosting.vercel.app/sitemap.xml");
});
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://pawar-vip-hosting.vercel.app/</loc><priority>1.0</priority></url></urlset>`);
});

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pawar VIP Hosting</title>
<style>body{margin:0;background:#080810;color:#fff;font-family:system-ui;text-align:center}
.nav{background:#111;padding:15px;font-weight:bold;font-size:20px}
.card{max-width:400px;margin:15px auto;background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid #a855f7;border-radius:16px;padding:20px}
.btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(90deg,#a855f7,#ec4899);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;margin-top:10px}
input{width:90%;padding:12px;border-radius:8px;border:none;margin:8px 0}
.bkash{background:#e2136e;padding:10px;border-radius:8px;font-weight:bold}
</style></head><body>
<div class="nav">👑 PAWAR VIP HOSTING</div>
<div class="card"><h2>🔐 Login / Register</h2><input id="email" type="email" placeholder="Gmail দাও"><input id="pass" type="password" placeholder="Password দাও"><button class="btn" onclick="login()">Login / Register</button><p id="msg"></p></div>
<div class="card" style="border-color:#facc15"><h2>🎁 1 Month Free Trial</h2><h1 style="color:#facc15">0 TK</h1></div>
<script>function login(){const email=document.getElementById('email').value;const pass=document.getElementById('pass').value;if(!email||!pass)return alert('Gmail, Password দাও');fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,pass})}).then(r=>r.json()).then(d=>{if(d.ok){localStorage.setItem('pawar_email',email);location.href='/dashboard?email='+email;}else document.getElementById('msg').innerText=d.msg;});}</script></body></html>`);
});

app.post('/api/login', (req, res) => {
  const { email, pass } = req.body;
  if (!db.users[email]) {
    const isOwner = email.includes("pawar") || email === OWNER_EMAIL;
    db.users[email] = { email, pass, plan: isOwner ? "OWNER-UNLIMITED" : "TRIAL", start: Date.now(), end: isOwner ? Date.now() + 100*365*24*60*60*1000 : Date.now() + 30*24*60*60*1000, bots: [] };
    save(); return res.json({ ok: true });
  } else {
    if (db.users[email].pass !== pass) return res.json({ ok: false, msg: "Password ভুল!" });
    return res.json({ ok: true });
  }
});

app.get('/dashboard', (req, res) => {
  const email = req.query.email; const u = db.users[email]; if (!u) return res.redirect('/');
  const left = u.plan === "OWNER-UNLIMITED" ? "UNLIMITED ♾️" : Math.ceil((u.end - Date.now())/(86400000)) + " দিন বাকি";
  res.send(`
<html><head><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{background:#0a0a0a;color:#e5e5e5;font-family:system-ui;padding:0;margin:0}
.top{padding:15px;background:#111;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center}
.container{max-width:700px;margin:0 auto;padding:15px}
.deploy-card{background:#171717;border:1px solid #2a2a2a;padding:18px;border-radius:12px;margin-bottom:20px}
input,textarea{width:100%;padding:12px;background:#0f0f0f;border:1px solid #333;color:#fff;border-radius:8px;box-sizing:border-box;margin:6px 0;font-size:14px}
textarea{height:120px;font-family:monospace}
.btn-deploy{background:#fff;color:#000;width:100%;padding:14px;border-radius:8px;border:none;font-weight:bold;cursor:pointer;margin-top:10px}
.bot-card{background:#171717;border:1px solid #2a2a2a;border-radius:12px;padding:14px;margin:10px 0}
.status-dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px}
.running{background:#22c55e;box-shadow:0 0 8px #22c55e}
.badge{background:#0ea5e9;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;margin-left:6px}
</style></head><body>
<div class="top"><b>${email}</b><span style="background:#222;padding:4px 10px;border-radius:20px;font-size:12px">${u.plan} - ${left}</span></div>
<div class="container">
  <div class="deploy-card">
   <h3 style="margin:0 0 12px 0">🤖 Deploy Telegram Bot - Render Style</h3>
   <label style="font-size:12px;color:#888">Bot Name</label>
   <input id="botName" placeholder="Ex: My Telegram Bot">
   <label style="font-size:12px;color:#888">Telegram Bot Token ( BotFather থেকে )</label>
   <input id="botToken" placeholder="Ex: 123456:AAH...">
   <label style="font-size:12px;color:#888">Custom Reply Code ( Optional )</label>
   <textarea id="botCode" placeholder="Custom reply লিখতে পারো, না দিলে Auto reply চলবে&#10;Example: Hello! You said: \${text}"></textarea>
   <button class="btn-deploy" onclick="deploy()">🚀 Deploy - Telegram Token দিয়ে</button>
   <p style="font-size:11px;color:#666;margin-top:8px">💡 BotFather থেকে token নিয়ে এখানে বসালেই Bot 24/7 Running হবে, Render এর মতো!</p>
  </div>
  <h3>Your Services (${u.bots.length})</h3>
  ${u.bots.map((b,i)=>`
   <div class="bot-card">
    <div style="display:flex;justify-content:space-between">
      <div><span class="status-dot ${b.status==='Running'?'running':''}" style="background:${b.status==='Running'?'#22c55e':'#ef4444'}"></span><b>${b.name}</b><span class="badge">TELEGRAM</span>
      <div style="font-size:11px;color:#888;margin-top:4px;word-break:break-all">Token: ${b.token ? b.token.slice(0,12)+'****' : 'No Token'} • ${b.status}</div>
      </div>
      <div style="display:flex;gap:6px"><button onclick="toggleBot(${i})" style="background:#222;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px">${b.status==='Running'?'⏸️':'▶️'}</button><button onclick="deleteBot(${i})" style="background:#331111;color:#ff5555;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px">🗑️</button></div>
    </div>
    <div style="background:#000;color:#0f0;padding:8px;border-radius:6px;font-family:monospace;font-size:11px;margin-top:8px">> Bot ${b.name} is ${b.status}<br>> Token Connected: ${b.token?'Yes ✅':'No'}<br>> Logs: Listening for Telegram messages...</div>
   </div>
  `).join('') || '<p style="color:#666;text-align:center">No bots yet - উপরে Token দিয়ে Deploy করো</p>'}
</div>
<script>
function deploy(){
  const name=document.getElementById('botName').value;
  const token=document.getElementById('botToken').value;
  const code=document.getElementById('botCode').value;
  if(!name) return alert('Bot Name দাও!');
  if(!token) return alert('Telegram Bot Token দাও! BotFather থেকে নাও');
  fetch('/api/deploy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'${email}',name,token,code})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()});
}
function toggleBot(i){fetch('/api/toggle',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'${email}',index:i})}).then(()=>location.reload())}
function deleteBot(i){if(confirm('Delete?'))fetch('/api/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'${email}',index:i})}).then(()=>location.reload())}
</script></body></html>`);
});

app.post('/api/deploy', (req, res) => {
  const { email, name, token, code } = req.body;
  const u = db.users[email]; if (!u) return res.json({ msg: "Login করো" });
  
  // Test token
  https.get(`https://api.telegram.org/bot${token}/getMe`, (r)=>{
    let d=''; r.on('data',c=>d+=c);
    r.on('end',()=>{
      try{
        const j = JSON.parse(d);
        if(!j.ok) return res.json({msg: "❌ Token ভুল! BotFather থেকে সঠিক Token দাও"});
        
        u.bots.push({ id: Date.now().toString(), name: name || j.result.username, token, code: code || "", status: "Running", username: j.result.username });
        save();
        startTelegramBot(token, name, code);
        res.json({ msg: `✅ Bot @${j.result.username} Deploy Success! এখন Telegram এ /start দাও!` });
      }catch(e){ res.json({msg:"Token Check Error"})}
    });
  }).on('error', ()=> res.json({msg:"Telegram Connection Error"}));
});

app.post('/api/toggle',(req,res)=>{
  const {email,index}=req.body; const u=db.users[email]; const b=u.bots[index];
  if(b.status==='Running'){ b.status='Stopped'; if(activeTeleBots[b.token]) clearInterval(activeTeleBots[b.token].interval); }
  else { b.status='Running'; startTelegramBot(b.token, b.name, b.code); }
  save(); res.json({ok:true});
});
app.post('/api/delete',(req,res)=>{
  const {email,index}=req.body; const u=db.users[email]; const b=u.bots[index];
  if(activeTeleBots[b.token]) clearInterval(activeTeleBots[b.token].interval);
  u.bots.splice(index,1); save(); res.json({ok:true});
});

app.get(SECRET_ADMIN, (req, res) => { let html = `<h1 style="color:white">🔐 PAWAR ADMIN</h1>`; for (let e in db.users) html+=`${e} - ${db.users[e].bots.length} bots<br>`; res.send(html); });

// Restore bots on restart
setTimeout(()=>{ for(let e in db.users){ db.users[e].bots.forEach(b=>{ if(b.status==='Running' && b.token) startTelegramBot(b.token, b.name, b.code); }); } }, 2000);

module.exports = app;
