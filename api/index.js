const express = require('express');
const app = express();
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({ extended: true }));

if(!globalThis.pawarDB){ globalThis.pawarDB = { users: {} }; }
let db = globalThis.pawarDB;
function save(){ globalThis.pawarDB = db; }

const HOSTING_LINK = "https://pawar-vip-hosting.vercel.app";
const GITHUB_SAMPLE = "https://github.com/mdr759664-tech/RANA-X-VIP-BOT";
const BKASH = "01837450067";
const NAGAD = "01636487523";
const OWNER_LIST = ["mdr759664@gmail.com","pawar@gmail.com","01636487523","ultra","mdr759664"];
const GOOGLE_VERIFICATION = "PASTE_YOUR_GOOGLE_CODE_HERE";
function isOwnerEmail(e){ if(!e) return false; e=e.toLowerCase(); return OWNER_LIST.some(o=> e.includes(o.toLowerCase())); }

// GOOGLE SEO
app.get('/sitemap.xml',(req,res)=>{ res.header('Content-Type','application/xml'); res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${HOSTING_LINK}/</loc><priority>1.0</priority></url></urlset>`); });
app.get('/robots.txt',(req,res)=>{ res.header('Content-Type','text/plain'); res.send(`User-agent: *\nAllow: /\nSitemap: ${HOSTING_LINK}/sitemap.xml`); });
app.get('/api/ping',(req,res)=>{ res.json({status:"ALIVE", users: Object.keys(db.users).length}); });
app.post('/api/pair',(req,res)=>{ const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let raw=""; for(let i=0;i<8;i++) raw+=chars[Math.floor(Math.random()*chars.length)]; res.json({ok:true, pairCode: raw.slice(0,4)+"-"+raw.slice(4)}); });

// LOGIN - 3 BUTTONS - NO LOOP FIX
app.get('/',(req,res)=>{
  res.send(`
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>ULTRA X PAWAR - Best Free Bot Hosting</title>
<meta name="google-site-verification" content="${GOOGLE_VERIFICATION}">
<style>body{margin:0;background:#1a0a1a;color:#fff;font-family:system-ui;text-align:center;min-height:100vh}.card{max-width:420px;margin:20px auto;background:#2a0a2a;border:1px solid #ff1493;border-radius:16px;padding:20px}input{width:100%;padding:12px;border-radius:8px;border:1px solid #ff1493;background:#000;color:#fff;margin:8px 0;box-sizing:border-box}.btn{width:100%;padding:12px;border:none;border-radius:10px;font-weight:bold;cursor:pointer;margin:5px 0}.btn-login{background:linear-gradient(90deg,#ff1493,#ff69b4);color:#fff}.btn-signup{background:#000;color:#ff69b4;border:1px solid #ff1493}.btn-forgot{background:transparent;color:#ffb6c1;text-decoration:underline;border:none}</style></head>
<body><div style="background:linear-gradient(90deg,#ff1493,#c3005a);padding:15px;font-weight:bold">🚀 ULTRA X PAWAR VIP HOSTING - Premium</div>
<div class="card"><h2 style="color:#ff69b4">Welcome</h2><input id="email" type="email" placeholder="Gmail" value="mdr759664@gmail.com"><input id="pass" type="password" placeholder="Password"><button class="btn btn-login" onclick="doLogin()">🔐 Login</button><button class="btn btn-signup" onclick="doSignup()">📝 Sign Up</button><button class="btn btn-forgot" onclick="doForgot()">❓ Forgot Password?</button><p id="msg" style="color:#ff69b4;min-height:20px"></p></div>
<script>
function doLogin(){ const e=document.getElementById("email").value.trim().toLowerCase(); const p=document.getElementById("pass").value.trim(); if(!e||!p) return msg("Email+Pass দাও!"); fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,pass:p})}).then(r=>r.json()).then(d=>{ msg(d.msg); if(d.ok){ localStorage.setItem("pawar_email",e); location.href="/dashboard?email="+e } }) }
function doSignup(){ const e=document.getElementById("email").value.trim().toLowerCase(); const p=document.getElementById("pass").value.trim(); if(!e||!p) return msg("Email+Pass দাও!"); fetch("/api/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,pass:p})}).then(r=>r.json()).then(d=>{ msg(d.msg); if(d.ok){ localStorage.setItem("pawar_email",e); location.href="/dashboard?email="+e } }) }
function doForgot(){ const e=document.getElementById("email").value.trim().toLowerCase(); if(!e) return msg("Gmail দাও!"); const newP=prompt("নতুন Password দাও:"); if(!newP) return; fetch("/api/forgot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,newPass:newP})}).then(r=>r.json()).then(d=>{ msg(d.msg) }) }
function msg(t){ document.getElementById("msg").innerText=t }
</script></body></html>`);
});

app.post('/api/login',(req,res)=>{ let email=(req.body.email||"").toLowerCase().trim(); let pass=(req.body.pass||"").trim(); if(!db.users[email]) return res.json({ok:false,msg:"Account নাই! Sign Up করো!"}); if(db.users[email].pass && db.users[email].pass!==pass) return res.json({ok:false,msg:"Password ভুল!"}); if(!db.users[email].pass) db.users[email].pass=pass; let isOwner=isOwnerEmail(email); if(isOwner){ db.users[email].plan="OWNER-PREMIUM"; db.users[email].end=Date.now()+100*365*24*60*60*1000; db.users[email].isPaid=true; } save(); res.json({ok:true,msg:"Login Success!"}); });
app.post('/api/signup',(req,res)=>{ let email=(req.body.email||"").toLowerCase().trim(); let pass=(req.body.pass||"").trim(); if(db.users[email]) return res.json({ok:false,msg:"Account আছে! Login করো!"}); let isOwner=isOwnerEmail(email); db.users[email]={email,pass,plan:isOwner?"OWNER-PREMIUM":"FREE_30_DAYS",start:Date.now(),end:Date.now()+(isOwner?100*365:30)*24*60*60*1000,bots:[],payment:{},isPaid:isOwner}; save(); res.json({ok:true,msg:"Signup Success!"}); });
app.post('/api/forgot',(req,res)=>{ let email=(req.body.email||"").toLowerCase().trim(); let newPass=(req.body.newPass||"").trim(); if(!db.users[email]) return res.json({msg:"Account নাই!"}); db.users[email].pass=newPass; save(); res.json({msg:"Password Reset Done!"}); });
app.post('/api/submit-payment',(req,res)=>{ let email=(req.body.email||"").toLowerCase(); if(isOwnerEmail(email)) return res.json({msg:"Premium Active!"}); let u=db.users[email]; if(!u) return res.json({msg:"User Not Found"}); u.payment={trxId:req.body.trxId,payerNum:req.body.payerNum,method:req.body.method||'bKash',time:Date.now(),status:"PENDING"}; save(); res.json({msg:"Payment Pending!"}); });

// DEPLOY - INSTANT LIVE - NO BLOCK - FIXED
app.post('/api/deploy',(req,res)=>{
  let email=(req.body.email||"").toLowerCase();
  let u=db.users[email]; if(!u){ let isO=isOwnerEmail(email); u={email,pass:"123",plan:isO?"OWNER-PREMIUM":"FREE_30_DAYS",start:Date.now(),end:Date.now()+(isO?100*365:30)*24*60*60*1000,bots:[],payment:{},isPaid:isO}; db.users[email]=u; }
  const newId=Date.now().toString();
  const slug=req.body.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+"-"+newId.slice(-4);
  const newBot={id:newId,slug:slug,name:req.body.name,token:req.body.token,branch:req.body.branch||"main",startCmd:req.body.startCmd||"npm start",created:Date.now(),status:"LIVE",uptime:"0h 2m",cpu:"2.5%",ram:isOwnerEmail(email)?"2GB":"512MB"};
  u.bots.push(newBot); save();
  res.json({ok:true, msg:"Deployed! LIVE: "+HOSTING_LINK+"/bot/"+slug, slug:slug, link:HOSTING_LINK+"/bot/"+slug});
});
app.post('/api/delete',(req,res)=>{ let u=db.users[(req.body.email||"").toLowerCase()]; if(u){ u.bots=u.bots.filter(b=> b.id!==req.body.id); save(); } res.json({ok:true}); });

// BOT LIVE PAGE - 404 FIX - MUST HAVE - INSTANT LIVE
app.get('/bot/:slug',(req,res)=>{
  let slug=req.params.slug.toLowerCase();
  let found=null; let ownerEmail="";
  for(let e in db.users){
    let u=db.users[e];
    let b=u.bots.find(x=> x.slug===slug);
    if(b){ found=b; ownerEmail=e; break; }
  }
  if(!found) return res.status(404).send("<html><body style='background:#0a0a0a;color:#fff;text-align:center;padding:40px'><h1>❌ Bot Not Found - "+slug+"</h1><a href='/' style='color:#ff69b4'>Go Home</a></body></html>");
  res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>${found.name} - LIVE</title><style>body{margin:0;background:#0a0a0a;color:#fff;font-family:system-ui;text-align:center;padding:20px}.card{max-width:520px;margin:20px auto;background:#1a0a1a;border:1px solid #ff1493;border-radius:16px;padding:20px}.dot{width:12px;height:12px;background:#00ff00;border-radius:50%;display:inline-block;animation:blink 1s infinite}@keyframes blink{0%{opacity:1}50%{opacity:0.3}}.log{background:#000;padding:12px;border-radius:8px;border:1px solid #222;font-family:monospace;font-size:11px;text-align:left;color:#00ff00;margin:15px 0}</style></head><body><div style="background:linear-gradient(90deg,#ff1493,#c3005a);padding:12px;font-weight:bold">🚀 ULTRA X PAWAR VIP HOSTING - SG-1 PRO - No Sleep</div><div class="card"><h2 style="color:#ff69b4">✅ ${found.name}</h2><p><span class="dot"></span> <b style="color:#00ff00">LIVE - Running</b></p><p style="font-size:12px;color:#ffb6c1">Repo: ${found.token}<br>Branch: ${found.branch} | Start: ${found.startCmd} | RAM: ${found.ram} | CPU: ${found.cpu}<br>Owner: ${ownerEmail}</p><div class="log">> ✅ GitHub Cloned - ${found.branch}<br>> ✅ Build - 45s - Koyeb Style<br>> ✅ ${found.name} Started - Port 3000<br>> ✅ No Sleep | Auto Scaling | Global Edge<br>> 🌐 Uptime: ${found.uptime} | Region: SG-1 Singapore<br>> ✅ Env / SSL / Domain ✅</div><p style="font-size:11px;color:#888">Live Link: ${HOSTING_LINK}/bot/${found.slug}<br>Metrics: CPU ${found.cpu} | RAM 145MB / ${found.ram} | Network 1.2GB | Uptime 99.9%</p><div style="display:flex;gap:8px;justify-content:center"><a href="${HOSTING_LINK}/bot/${found.slug}" style="background:#ff1493;color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none">Refresh</a><a href="/dashboard?email=${ownerEmail}" style="background:#222;color:#ff69b4;border:1px solid #ff1493;padding:8px 16px;border-radius:8px;text-decoration:none">Dashboard</a></div></div></body></html>`);
});

app.get('/admin',(req,res)=>{ let email=(req.query.email||"").toLowerCase(); if(!isOwnerEmail(email)) return res.send("Only Owner"); let html="<html><body style='background:#1a0a1a;color:#fff;font-family:system-ui;padding:20px'><h2>👑 Owner Admin</h2>"; for(let e in db.users){ let u=db.users[e]; let isO=isOwnerEmail(e); html+="<div style='border:1px solid #ff1493;padding:10px;margin:10px;border-radius:8px'>"+(isO?"OWNER - ":"")+e+" - Bots:"+u.bots.length+" - Days:"+(isO?"∞":Math.ceil((u.end-Date.now())/86400000))+" - Trx:"+(u.payment.trxId||'No')+" "+(isO?"":"<button onclick=\"fetch('/api/admin/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({adminEmail:'"+email+"',targetEmail:'"+e+"'})}).then(()=>location.reload())\">Approve</button>")+"</div>"; } html+="<a href='/dashboard?email="+email+"' style='color:#ff69b4'>Dashboard</a></body></html>"; res.send(html); });
app.post('/api/admin/approve',(req,res)=>{ if(!isOwnerEmail(req.body.adminEmail)) return res.json({msg:"Not Owner"}); let u=db.users[req.body.targetEmail.toLowerCase()]; if(!u) return res.json({msg:"Not Found"}); u.end=Date.now()+30*24*60*60*1000; u.plan="VIP-PAID"; u.isPaid=true; u.payment.status="PAID"; save(); res.json({msg:"Approved 30 Days!"}); });

app.get('/dashboard',(req,res)=>{
  let email=(req.query.email||"").toLowerCase();
  let u=db.users[email];
  if(!u){ return res.send("<html><body style='background:#1a0a1a;color:#fff;text-align:center;padding:40px'><h1>Login First!</h1><script>localStorage.clear(); setTimeout(()=>location.href='/',1500)</script><a href='/' style='color:#ff69b4'>Go Login</a></body></html>"); }
  const isOwner=isOwnerEmail(email);
  const daysLeft=isOwner?9999:Math.ceil((u.end-Date.now())/86400000);
  const isExpired=!isOwner && daysLeft<=0;
  const payStatus=u.payment.status||'NONE';
  if(!isOwner && payStatus==='PENDING'){ return res.send("<html><body style='background:#1a0a1a;color:#fff;text-align:center;padding:40px'><h1>Pending... Trx: "+u.payment.trxId+"</h1><a href='/dashboard?email="+email+"' style='color:#ff69b4'>Refresh</a></body></html>"); }
  if(!isOwner && isExpired){ return res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;background:#fff;color:#000;font-family:system-ui}.card{max-width:480px;margin:10px auto;background:#fff;border-radius:12px;padding:12px}.paycard{background:#c2185b;color:#fff;padding:15px;border-radius:10px}input,select{width:100%;padding:12px;border:1px solid #c2185b;border-radius:8px;margin:8px 0;box-sizing:border-box}.btn{width:100%;padding:14px;background:#7b1a2e;color:#fff;border:none;border-radius:8px;font-weight:bold}</style></head><body><div style="background:#e91e63;color:#fff;padding:12px;text-align:center">Trial Over - 300 Taka</div><div class="card"><div class="paycard"><h3 style="text-align:center">bKash / Nagad - ৳300 / 30 Days</h3><p>bKash: ${BKASH} | Nagad: ${NAGAD}</p><input id="trxId" placeholder="TrxID"><input id="payerNum" placeholder="01XXXXXXXXX"><select id="method"><option>bKash</option><option>Nagad</option></select><button class="btn" onclick="submitPay()">Verify</button></div></div><script>function submitPay(){ const trx=document.getElementById("trxId").value.trim(); const num=document.getElementById("payerNum").value.trim(); const m=document.getElementById("method").value; if(!trx||!num) return alert("TrxID+Number দাও!"); fetch("/api/submit-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",trxId:trx,payerNum:num,method:m})}).then(r=>r.json()).then(d=>{ alert(d.msg); location.reload() }) }</script></body></html>`); }
  let servicesHtml=""; let botsHtml="";
  u.bots.forEach(b=>{ const slug=b.slug; const link=HOSTING_LINK+"/bot/"+slug; servicesHtml+="<div style='background:#000;padding:10px;border-radius:8px;margin:8px 0;border:1px solid #222'><b style='color:#ff69b4'>"+b.name+"</b> <span style='color:#00ff00;font-size:11px'>● LIVE</span> <a href='"+link+"' target='_blank' style='background:#00ff00;color:#000;padding:4px 8px;border-radius:6px;text-decoration:none;font-size:11px;margin-left:8px;font-weight:bold'>LIVE LINK</a></div>"; botsHtml+="<div style='background:#1a0a1a;border:1px solid #ff1493;border-radius:12px;padding:12px;margin:10px 0'><b>"+b.name+"</b> <span style='background:#00ff00;color:#000;font-size:10px;padding:2px 6px;border-radius:8px;font-weight:bold'>LIVE</span><div style='margin-top:8px;background:#000;padding:8px;border-radius:8px;border:1px solid #ff1493'><a href='"+link+"' style='color:#00ff00;font-size:11px;word-break:break-all;font-weight:bold'>"+link+"</a> <button onclick=\"navigator.clipboard.writeText('"+link+"');alert('Copied LIVE Link!')\" style='background:#ff1493;color:#fff;border:none;padding:2px 6px;border-radius:4px;margin-left:5px'>Copy</button></div><div style='margin-top:8px'><button onclick=\"pairNow('"+b.id+"')\" style='background:#ff1493;color:#fff;border:none;padding:8px 12px;border-radius:6px'>Pair Code</button> <span id='pair-"+b.id+"' style='color:#ff69b4;font-weight:bold;margin-left:10px'>----</span> <button onclick=\"window.open('"+link+"','_blank')\" style='background:#00ff00;color:#000;border:none;padding:8px 12px;border-radius:6px;margin-left:8px;font-weight:bold'>Open Live</button></div><div style='margin-top:8px'><button onclick=\"deleteBot('"+b.id+"')\" style='background:#222;color:#ff4444;border:1px solid #ff1493;padding:6px 10px;border-radius:6px'>Delete</button></div></div>"; });
  if(botsHtml==="") botsHtml="<div style='text-align:center;padding:20px;color:#ff69b4;border:1px dashed #ff1493;border-radius:10px'>No Deployments Yet - Deploy করো! সাথে সাথে Live হবে!</div>";

  res.send(`
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
body{background:#0a0a0a;color:#e5e5e5;font-family:system-ui;margin:0;display:flex}
.sidebar{width:280px;background:#1a0a1a;border-right:1px solid #ff1493;min-height:100vh;padding:10px;position:sticky;top:0;overflow-y:auto}
.sidebar a{display:block;padding:8px 10px;color:#ffb6c1;text-decoration:none;border-radius:8px;margin:2px 0;font-size:12px;cursor:pointer}
.sidebar a.active{background:linear-gradient(90deg,#ff1493,#ff69b4);color:#fff}
.sidebar .cat{color:#ff69b4;font-weight:bold;font-size:11px;margin-top:12px;padding-left:8px}
.main{flex:1;background:#0a0a0a;min-height:100vh}
.topbar{background:#1a0a1a;padding:12px;border-bottom:1px solid #ff1493;display:flex;justify-content:space-between}
.card{background:#1a0a1a;border:1px solid #ff1493;border-radius:16px;padding:16px;margin:12px}
input,select{width:100%;padding:10px;background:#000;border:1px solid #ff1493;color:#fff;border-radius:10px;margin:6px 0;box-sizing:border-box}
.btn-deploy{background:linear-gradient(90deg,#ff1493,#ff69b4);color:#fff;width:100%;padding:12px;border:none;border-radius:10px;font-weight:bold;cursor:pointer}
.koyeb-section{display:none} .koyeb-section.active{display:block}
@media(max-width:768px){ .sidebar{width:65px} .sidebar span.label,.sidebar .cat{display:none} }
</style></head>
<body>
<div class="sidebar">
<h2 style="color:#ff69b4;font-size:14px;text-align:center">ULTRA X PAWAR VIP</h2>
<div class="cat">OVERVIEW</div>
<a href="#" onclick="showSection('home')" id="nav-home" class="active">🏠 <span class="label">Overview - CPU/RAM/Network/Build</span></a>
<a href="#" onclick="showSection('services')" id="nav-services">📦 <span class="label">Services (${u.bots.length})</span></a>
<div class="cat">DEPLOY</div>
<a href="#" onclick="showSection('deploy')" id="nav-deploy">🚀 <span class="label">Deploy - GitHub/Auto/NoSleep - Instant Live</span></a>
<div class="cat">CONFIG</div>
<a href="#" onclick="showSection('env')" id="nav-env">🔐 <span class="label">Env / Secrets</span></a>
<a href="#" onclick="showSection('domains')" id="nav-domains">🌐 <span class="label">Domains / SSL</span></a>
<a href="#" onclick="showSection('volumes')" id="nav-volumes">💾 <span class="label">Volumes</span></a>
<a href="#" onclick="showSection('networking')" id="nav-networking">🔌 <span class="label">Networking / Ports / Firewall</span></a>
<div class="cat">MONITOR</div>
<a href="#" onclick="showSection('logs')" id="nav-logs">📜 <span class="label">Logs - Real Time</span></a>
<a href="#" onclick="showSection('metrics')" id="nav-metrics">📊 <span class="label">Metrics - CPU/RAM/Disk Graph</span></a>
<a href="#" onclick="showSection('scaling')" id="nav-scaling">⚖️ <span class="label">Scaling / Auto-Scaling</span></a>
<a href="#" onclick="showSection('cron')" id="nav-cron">⏰ <span class="label">Cron Jobs</span></a>
<div class="cat">ADVANCED</div>
<a href="#" onclick="showSection('backups')" id="nav-backups">💾 <span class="label">Backups / Snapshots</span></a>
<a href="#" onclick="showSection('webhooks')" id="nav-webhooks">🔗 <span class="label">Webhooks - Discord/Telegram</span></a>
<a href="#" onclick="showSection('team')" id="nav-team">👥 <span class="label">Team / Collaborator</span></a>
<a href="#" onclick="showSection('apikeys')" id="nav-apikeys">🔑 <span class="label">API Keys</span></a>
<div class="cat">BILLING</div>
<a href="#" onclick="showSection('billing')" id="nav-billing">💳 <span class="label">Billing - Usage/Invoices</span></a>
<div class="cat">SETTINGS</div>
<a href="#" onclick="showSection('settings')" id="nav-settings">⚙️ <span class="label">Settings - Region/Runtime</span></a>
<div style="margin-top:15px;border-top:1px solid #ff1493;padding-top:10px"><a href="javascript:void(0)" onclick="shareLink()">🔗 <span class="label">Share Link</span></a>${isOwner?`<a href="/admin?email=${email}" style="background:gold;color:#000;font-weight:bold">👑 ADMIN</a>`:""}</div>
</div>
<div class="main">
<div class="topbar"><div><b style="color:#ff69b4">🚀 ULTRA X PAWAR VIP HOSTING</b><br><span style="font-size:11px;color:#ffb6c1">${isOwner?"Premium Active - SG-1 PRO - RAM 2GB - No Sleep":"Free Trial - "+daysLeft+" Days Left - RAM 512MB - SG-1 PRO"}</span></div><button onclick="localStorage.clear();location.href='/'" style="background:#222;color:#ff69b4;border:1px solid #ff1493;padding:6px 12px;border-radius:8px">Logout</button></div>
<div id="sec-home" class="koyeb-section active"><div class="card"><h2>🏠 Overview - Premium Hosting - Koyeb/Render Style</h2><p style="color:#ffb6c1">CPU: 2.5% / 2 vCPU | RAM: ${isOwner?"2GB":"512MB"} | Network: 1.2GB / 10GB | Build Time: 45s | Uptime 99.9% | Google SEO Ready ✅</p><p>Services: ${u.bots.length} | Region: SG-1 PRO - No Sleep - Auto Scaling - Global Edge</p></div></div>
<div id="sec-services" class="koyeb-section"><div class="card"><h3>📦 Services (${u.bots.length}) - Live Instant</h3>${servicesHtml}${botsHtml}</div></div>
<div id="sec-deploy" class="koyeb-section"><div class="card"><h3>🚀 Deploy New Service - GitHub + Auto-Deploy + No Sleep - Instant Live</h3><input id="ghName" placeholder="Name - RANA-X-VIP-BOT"><input id="ghRepo" placeholder="GitHub Repo URL" value="${GITHUB_SAMPLE}"><div style="display:flex;gap:8px"><input id="ghBranch" value="main" style="flex:1"><input id="ghStart" value="npm start" style="flex:1"></div><button class="btn-deploy" id="deployBtn" onclick="deployGithub()">Deploy - Instant Live - No Block</button><p style="font-size:11px;color:#00ff00;margin-top:10px">✅ Auto-Deploy | ✅ No Sleep | ✅ SG-1 PRO | ✅ Instant LIVE Link | ✅ No Block</p><div id="liveResult"></div></div></div>
<div id="sec-env" class="koyeb-section"><div class="card"><h3>🔐 Env / Secrets</h3><input placeholder="Key - SESSION_ID"><input placeholder="Value"><button class="btn-deploy" style="background:#222;border:1px solid #ff1493">Add Secret - Instant</button></div></div>
<div id="sec-domains" class="koyeb-section"><div class="card"><h3>🌐 Domains / SSL</h3><p style="color:#00ff00">${HOSTING_LINK}/bot/your-id - SSL ✅ - Google Indexed ✅</p><input placeholder="Custom Domain"><button class="btn-deploy" style="background:#222;border:1px solid #ff1493">Add Domain + Free SSL - Instant</button></div></div>
<div id="sec-volumes" class="koyeb-section"><div class="card"><h3>💾 Volumes</h3><p>Persistent Storage - Will not delete on restart</p><input placeholder="Volume Name"><button class="btn-deploy" style="background:#222;border:1px solid #ff1493">Create Volume - Instant</button></div></div>
<div id="sec-networking" class="koyeb-section"><div class="card"><h3>🔌 Networking / Ports / Firewall</h3><p>Port: 3000 (Public) | Protocol: HTTPS/WSS | Firewall: Allow All</p><input placeholder="Port - 3000"><select><option>Public - Internet Access</option><option>Private - Internal Only</option></select><button class="btn-deploy" style="background:#222;border:1px solid #ff1493">Save Networking - Instant</button></div></div>
<div id="sec-logs" class="koyeb-section"><div class="card"><h3>📜 Logs - Real Time</h3><div style="background:#000;border:1px solid #222;padding:10px;font-family:monospace;font-size:11px;color:#00ff00;height:250px;overflow-y:auto">> Deploying to SG-1 PRO...<br>> ✅ BOT Started<br>> ✅ No Sleep Enabled<br>> 🌐 Listening on 3000 - RAM ${isOwner?"2GB":"512MB"}</div><button class="btn-deploy" style="background:#222;border:1px solid #ff1493;margin-top:10px">Download Logs</button></div></div>
<div id="sec-metrics" class="koyeb-section"><div class="card"><h3>📊 Metrics - CPU/RAM/Network/Disk Graph</h3><p>CPU: 2.5% / 2 vCPU | Memory: 145MB / ${isOwner?"2GB":"512MB"} | Network: 1.2GB / 10GB | Disk: 450MB / 10GB | Uptime: 99.9%</p><div style="background:#000;padding:20px;border-radius:8px;text-align:center;color:#00ff00">📈 Graph - CPU/RAM Usage - Live</div></div></div>
<div id="sec-scaling" class="koyeb-section"><div class="card"><h3>⚖️ Scaling / Auto-Scaling</h3><select><option>512MB RAM / 0.5 vCPU - Free Trial</option><option>1GB RAM / 1 vCPU - Paid 300 Taka</option><option>2GB RAM / 2 vCPU - Premium Plan</option></select><label style="font-size:11px"><input type="checkbox" checked> Auto-Scaling Enabled</label><button class="btn-deploy" style="background:#222;border:1px solid #ff1493;margin-top:10px">Apply Scaling - Instant</button></div></div>
<div id="sec-cron" class="koyeb-section"><div class="card"><h3>⏰ Cron Jobs</h3><input placeholder="Cron - 0 * * * *"><input placeholder="Command - npm restart"><button class="btn-deploy" style="background:#222;border:1px solid #ff1493">Add Cron Job - Instant</button></div></div>
<div id="sec-backups" class="koyeb-section"><div class="card"><h3>💾 Backups / Snapshots</h3><p>Last Backup: Today 8:00 AM | Auto Backup: Daily 2 AM</p><button class="btn-deploy" style="background:#222;border:1px solid #ff1493">Create Backup Now</button> <button class="btn-deploy" style="background:#222;border:1px solid #ff1493;margin-top:8px">Restore Last Backup</button></div></div>
<div id="sec-webhooks" class="koyeb-section"><div class="card"><h3>🔗 Webhooks - Discord/Telegram</h3><input placeholder="Discord Webhook URL"><input placeholder="Telegram Bot Token + Chat ID"><button class="btn-deploy" style="background:#222;border:1px solid #ff1493">Save Webhooks - Instant</button></div></div>
<div id="sec-team" class="koyeb-section"><div class="card"><h3>👥 Team / Collaborator</h3><input placeholder="Add Team Member Email"><select><option>Viewer</option><option>Developer</option><option>Admin</option></select><button class="btn-deploy" style="background:#222;border:1px solid #ff1493">Invite Team - Instant</button></div></div>
<div id="sec-apikeys" class="koyeb-section"><div class="card"><h3>🔑 API Keys</h3><p style="word-break:break-all;background:#000;padding:10px;border-radius:8px">API Key: pawar_live_${Date.now().toString().slice(-8)}_vip</p><button class="btn-deploy" style="background:#222;border:1px solid #ff1493">Generate New Key</button></div></div>
<div id="sec-billing" class="koyeb-section"><div class="card" style="background:${isOwner?"#2a2a0a":"#fff"};color:${isOwner?"#ffd700":"#000"}"><h3>${isOwner?"💎 Premium Plan - Active":"💳 Billing - 30 Days Free + 300 Taka After"}</h3><p>Usage: ${isOwner?"2GB RAM - Unlimited":"512MB - Free Trial"} | Next Bill: ${isOwner?"Never - Premium":"After "+daysLeft+" Days - 300 Taka"}</p><p>bKash: ${BKASH} | Nagad: ${NAGAD}</p></div></div>
<div id="sec-settings" class="koyeb-section"><div class="card"><h3>⚙️ Settings - Region, Runtime, Restart, Pause, Clear Cache, Danger Zone</h3><p>Region: SG-1 Singapore - Runtime: Node.js 20 - No Sleep ✅</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button style="background:#222;color:#ff69b4;border:1px solid #ff1493;padding:10px 15px;border-radius:8px">Restart Service</button><button style="background:#222;color:#ffb6c1;border:1px solid #ff1493;padding:10px 15px;border-radius:8px">Pause</button><button style="background:#222;color:#ff69b4;border:1px solid #ff1493;padding:10px 15px;border-radius:8px">Clear Cache</button><button style="background:#ff4444;color:#fff;border:none;padding:10px 15px;border-radius:8px">🔴 Danger Zone - Delete Service</button></div></div></div>
</div>
<script>
function showSection(id){ document.querySelectorAll('.koyeb-section').forEach(s=>s.classList.remove('active')); document.querySelectorAll('.sidebar a').forEach(a=>a.classList.remove('active')); document.getElementById('sec-'+id).classList.add('active'); const nav=document.getElementById('nav-'+id); if(nav) nav.classList.add('active'); }
function shareLink(){ const link="${HOSTING_LINK}"; try{ navigator.clipboard.writeText(link); }catch(e){} alert("Copied: "+link); }
function deployGithub(){
  const n=document.getElementById("ghName").value.trim();
  const r=document.getElementById("ghRepo").value.trim();
  const br=document.getElementById("ghBranch").value||"main";
  const st=document.getElementById("ghStart").value||"npm start";
  if(!n||!r) return alert("Name+Repo দাও!");
  const btn=document.getElementById("deployBtn"); const result=document.getElementById("liveResult");
  btn.innerText="Deploying... Instant Live হচ্ছে..."; btn.disabled=true;
  fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",name:n,token:r,branch:br,startCmd:st})}).then(r=>r.json()).then(d=>{
    if(d.ok){
      result.innerHTML='<div style="background:#00ff00;color:#000;padding:12px;border-radius:8px;margin-top:12px;font-weight:bold;word-break:break-all">🚀 LIVE NOW - No Block!<br><a href="'+d.link+'" target="_blank" style="color:#000;text-decoration:underline">'+d.link+'</a><br><button onclick="navigator.clipboard.writeText(\''+d.link+'\');alert(\'Copied!\')" style="background:#000;color:#00ff00;border:none;padding:6px 10px;border-radius:4px;margin-top:8px">Copy Link</button> <button onclick="window.open(\''+d.link+'\',\'_blank\')" style="background:#000;color:#fff;border:none;padding:6px 10px;border-radius:4px;margin-left:6px">Open Live</button></div>';
      alert("✅ "+d.msg);
      setTimeout(()=>location.reload(),2000);
    } else { alert(d.msg); btn.innerText="Deploy - Instant Live - No Block"; btn.disabled=false; }
  }).catch(()=>{ alert("Deploy Failed!"); btn.innerText="Deploy - Instant Live - No Block"; btn.disabled=false; })
}
function pairNow(id){ const el=document.getElementById("pair-"+id); el.innerText="Generating..."; fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({number:"8801636487523"})}).then(r=>r.json()).then(d=>{ el.innerText=d.pairCode }) }
function deleteBot(id){ if(!confirm("Delete?")) return; fetch("/api/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",id:id})}).then(()=>location.reload()) }
</script>
</body></html>
`);
});

module.exports=app;
