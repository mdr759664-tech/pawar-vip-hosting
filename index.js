const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const fs = require('fs');
const DB_PATH = '/tmp/pawar_db.json';

let db = { users: {} };
if (fs.existsSync(DB_PATH)) {
  try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch(e){}
}
function save() { fs.writeFileSync(DB_PATH, JSON.stringify(db)); }

const OWNER_EMAIL = "pawar@gmail.com";
const SECRET_ADMIN = "/admin-pawar-01837-vip";

// --- SEO - 100% FIXED ---
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send("User-agent: *\nAllow: /\nSitemap: https://pawar-vip-hosting.vercel.app/sitemap.xml");
});
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://pawar-vip-hosting.vercel.app/</loc></url></urlset>`);
});

// এইখানে তোমার GOOGLE CODE টা বসাবে - নিচের content="..." এর ভিতরে
const GOOGLE_VERIFY_CODE = "google9576568e"; // <-- এখানে HTML tag থেকে Copy করা পুরা কোডটা বসাও

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="google-site-verification" content="${GOOGLE_VERIFY_CODE}" />
<title>Pawar VIP Hosting - Best Bot Hosting BD</title>
<style>
body{margin:0;background:#080810;color:#fff;font-family:system-ui;text-align:center}
.nav{background:#111;padding:15px;font-weight:bold;font-size:20px}
.card{max-width:400px;margin:15px auto;background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid #a855f7;border-radius:16px;padding:20px}
.btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(90deg,#a855f7,#ec4899);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;margin-top:10px}
input{width:90%;padding:12px;border-radius:8px;border:none;margin:8px 0}
.bkash{background:#e2136e;padding:10px;border-radius:8px;font-weight:bold}
</style>
</head>
<body>
<div class="nav">👑 PAWAR VIP HOSTING</div>
<div class="card">
<h2>🔐 Login / Register</h2>
<input id="email" type="email" placeholder="Gmail দাও">
<input id="pass" type="password" placeholder="Password দাও">
<button class="btn" onclick="login()">Login / Register</button>
<p id="msg"></p>
</div>
<div class="card" style="border-color:#facc15">
<h2>🎁 1 Month Free Trial</h2><h1 style="color:#facc15">0 TK</h1>
</div>
<div class="card" style="border-color:gold">
<h2>💎 VIP PLAN - 300 TK</h2>
<div class="bkash">bKash Personal<br>01837450067<br>300 TK Send Money</div>
<button class="btn" onclick="location.href='https://wa.me/8801837450067'">VIP Buy - WhatsApp</button>
</div>
<script>
function login(){
  const email=document.getElementById('email').value;
  const pass=document.getElementById('pass').value;
  if(!email||!pass) return alert('Gmail, Password দাও');
  fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,pass})})
  .then(r=>r.json()).then(d=>{
    if(d.ok){ localStorage.setItem('pawar_email',email); location.href='/dashboard?email='+email; }
    else document.getElementById('msg').innerText=d.msg;
  });
}
</script>
</body></html>
`);
});

// ... বাকি তোমার কোড একই থাকবে ...
app.post('/api/login', (req, res) => {
  const { email, pass } = req.body;
  if (!email || !pass) return res.json({ ok: false, msg: "Gmail Pass লাগবে" });
  if (!db.users[email]) {
    const isOwner = email.includes("pawar") || email.includes("01837450067") || email === OWNER_EMAIL;
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
  res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#080810;color:#fff;font-family:system-ui;padding:15px} .card{max-width:500px;margin:auto;background:#1a1a2e;padding:20px;border-radius:15px;border:1px solid #a855f7}</style></head><body><div class="card"><h2>${email}</h2><p>${u.plan} | ${left}</p><hr><h3>🤖 Bot Hosting</h3><input id="botName" placeholder="Bot Name"><textarea id="botCode" rows="6" placeholder="index.js কোড"></textarea><button onclick="deploy()">Deploy</button><div>${u.bots.map(b=>`<p>${b.name} - ${b.status}</p>`).join('')}</div></div><script>function deploy(){fetch('/api/deploy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'${email}',name:document.getElementById('botName').value,code:document.getElementById('botCode').value})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()});}</script></body></html>`);
});
app.post('/api/deploy', (req, res) => { const { email, name, code } = req.body; const u = db.users[email]; if (!u) return res.json({ msg: "Login করো" }); u.bots.push({ id: Date.now().toString(), name: name || "MyBot", status: "Running", code }); save(); res.json({ msg: "Bot Deploy Success! ✅" }); });
app.post('/api/bot-action', (req, res) => { const { email, id, act } = req.body; const u = db.users[email]; if (act === "delete") u.bots = u.bots.filter(b=>b.id!==id); else u.bots.forEach(b=>{ if(b.id===id) b.status = act==="start"?"Running":"Stopped"; }); save(); res.json({ msg: act+" done" }); });
app.get(SECRET_ADMIN, (req, res) => { let html = `<h1 style="color:white">🔐 PAWAR ADMIN</h1><table border=1 cellpadding=8 style="color:white;background:#222;margin:auto"><tr><th>Gmail</th><th>Plan</th><th>Bots</th></tr>`; for (let e in db.users) { const u = db.users[e]; html+=`<tr><td>${e}</td><td>${u.plan}</td><td>${u.bots.length}</td></tr>`; } html+=`</table>`; res.send(html); });
module.exports = app;
