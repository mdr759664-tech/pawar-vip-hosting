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

// SEO FOR GOOGLE - Sitemap + Robots + Google Rank
app.get('/sitemap.xml',(req,res)=>{
  res.header('Content-Type','application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${HOSTING_LINK}/</loc><priority>1.0</priority></url><url><loc>${HOSTING_LINK}/dashboard</loc><priority>0.8</priority></url></urlset>`);
});
app.get('/robots.txt',(req,res)=>{
  res.header('Content-Type','text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${HOSTING_LINK}/sitemap.xml`);
});

app.get('/api/ping',(req,res)=>{ res.json({status:"ALIVE", users: Object.keys(db.users).length}); });
app.post('/api/pair',(req,res)=>{ 
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let raw=""; 
  for(let i=0;i<8;i++) raw+=chars[Math.floor(Math.random()*chars.length)]; 
  res.json({ok:true, pairCode: raw.slice(0,4)+"-"+raw.slice(4)}); 
});

app.get('/',(req,res)=>{
  res.send(`
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">
<title>ULTRA X PAWAR - Best Free Bot Hosting - 30 Days Free Trial</title>
<meta name="description" content="World's Most Powerful Free Hosting - WhatsApp Bot, Telegram Bot, GitHub Deploy - 30 Days Free Trial - No Sleep SG-1 PRO - ULTRA X PAWAR">
<meta name="google-site-verification" content="${GOOGLE_VERIFICATION}">
<meta name="keywords" content="pawar hosting, ultra x pawar, bot hosting, free hosting, whatsapp bot hosting">
<style>body{margin:0;background:#1a0a1a;color:#fff;font-family:system-ui;text-align:center;min-height:100vh}.card{max-width:420px;margin:20px auto;background:#2a0a2a;border:1px solid #ff1493;border-radius:16px;padding:20px}input{width:100%;padding:12px;border-radius:8px;border:1px solid #ff1493;background:#000;color:#fff;margin:8px 0;box-sizing:border-box}.btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(90deg,#ff1493,#ff69b4);color:#fff;font-weight:bold;cursor:pointer}</style></head>
<body><div style="background:linear-gradient(90deg,#ff1493,#c3005a);padding:15px;font-weight:bold">ULTRA X PAWAR - Real Hosting - 30 Days Free</div>
<div class="card"><h2 style="color:#ff69b4">Login</h2><input id="email" type="email" placeholder="Gmail" value="mdr759664@gmail.com"><input id="pass" type="password" placeholder="Password"><button class="btn" onclick="doAuth()">Login / Signup</button><p id="msg"></p></div>
<script>
const s=localStorage.getItem("pawar_email"); if(s) location.href="/dashboard?email="+s;
function doAuth(){ const e=document.getElementById("email").value.trim().toLowerCase(); const p=document.getElementById("pass").value.trim(); if(!e||!p) return document.getElementById("msg").innerText="Email+Pass দাও!"; fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,pass:p})}).then(r=>r.json()).then(d=>{ if(d.ok){ localStorage.setItem("pawar_email",e); location.href="/dashboard?email="+e } }) }
</script></body></html>`);
});

app.post('/api/login',(req,res)=>{
  let email=(req.body.email||"").toLowerCase().trim();
  let isOwner=isOwnerEmail(email);
  if(!db.users[email]){
    db.users[email]={email,plan:isOwner?"OWNER-LIFETIME":"FREE_30_DAYS",start:Date.now(),end:Date.now()+(isOwner?100*365:30)*24*60*60*1000,bots:[],payment:{},isPaid:isOwner};
  } else {
    if(isOwner){ db.users[email].plan="OWNER-LIFETIME"; db.users[email].end=Date.now()+100*365*24*60*60*1000; db.users[email].isPaid=true; }
  }
  save(); res.json({ok:true});
});

app.post('/api/submit-payment',(req,res)=>{
  let email=(req.body.email||"").toLowerCase();
  if(isOwnerEmail(email)) return res.json({msg:"👑 Owner Lifetime Free! Payment লাগবে না!"});
  let u=db.users[email]; if(!u) return res.json({msg:"User Not Found"});
  u.payment={trxId:req.body.trxId,payerNum:req.body.payerNum,method:req.body.method||'bKash',time:Date.now(),status:"PENDING"};
  save(); res.json({msg:"Payment Pending! Owner Approve করবে!"});
});

app.post('/api/deploy',(req,res)=>{
  let email=(req.body.email||"").toLowerCase();
  let u=db.users[email]; if(!u){ let isO=isOwnerEmail(email); u={email,plan:isO?"OWNER-LIFETIME":"FREE_30_DAYS",start:Date.now(),end:Date.now()+(isO?100*365:30)*24*60*60*1000,bots:[],payment:{},isPaid:isO}; db.users[email]=u; }
  const newId=Date.now().toString();
  const slug=req.body.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+"-"+newId.slice(-4);
  u.bots.push({id:newId,slug:slug,name:req.body.name,token:req.body.token,branch:req.body.branch||"main",startCmd:req.body.startCmd||"npm start"});
  save(); res.json({msg:"Deployed! LIVE: "+HOSTING_LINK+"/bot/"+slug});
});

app.post('/api/delete',(req,res)=>{
  let u=db.users[(req.body.email||"").toLowerCase()]; if(u){ u.bots=u.bots.filter(b=> b.id!==req.body.id); save(); } res.json({ok:true});
});

app.get('/admin',(req,res)=>{
  let email=(req.query.email||"").toLowerCase(); if(!isOwnerEmail(email)) return res.send("Only Owner");
  let html="<html><body style='background:#1a0a1a;color:#fff;font-family:system-ui;padding:20px'><h2>👑 Owner Admin - Payment Manage - Google SEO Ready</h2>";
  for(let e in db.users){
    let u=db.users[e]; let isO=isOwnerEmail(e);
    html+="<div style='border:1px solid #ff1493;padding:10px;margin:10px;border-radius:8px'>"+(isO?"👑 OWNER LIFETIME FREE - ":"")+e+" - Bots:"+u.bots.length+" - Days:"+ (isO?"∞":Math.ceil((u.end-Date.now())/86400000)) +" - Status:"+(u.payment.status||'FREE')+" - Trx:"+(u.payment.trxId||'No')+" Method:"+(u.payment.method||'')+" "+(isO?"":"<button onclick=\"fetch('/api/admin/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({adminEmail:'"+email+"',targetEmail:'"+e+"'})}).then(()=>location.reload())\">✅ Approve 30 Days (300 Taka)</button>")+"</div>";
  }
  html+="<a href='/dashboard?email="+email+"' style='color:#ff69b4'>Dashboard</a> | <a href='/sitemap.xml' style='color:#ff69b4'>Sitemap</a> | <a href='/robots.txt' style='color:#ff69b4'>Robots</a></body></html>";
  res.send(html);
});
app.post('/api/admin/approve',(req,res)=>{
  if(!isOwnerEmail(req.body.adminEmail)) return res.json({msg:"Not Owner"});
  let u=db.users[req.body.targetEmail.toLowerCase()]; if(!u) return res.json({msg:"Not Found"});
  if(isOwnerEmail(req.body.targetEmail)) return res.json({msg:"Owner Lifetime Free Already!"});
  u.end=Date.now()+30*24*60*60*1000; u.plan="VIP-PAID-30-DAYS"; u.isPaid=true; u.payment.status="PAID"; save();
  res.json({msg:"Approved 30 Days! 300 Taka Received!"});
});

app.get('/dashboard',(req,res)=>{
  let email=(req.query.email||"").toLowerCase();
  let u=db.users[email];
  if(!u){ let isO=isOwnerEmail(email); u={email,plan:isO?"OWNER-LIFETIME":"FREE_30_DAYS",start:Date.now(),end:Date.now()+(isO?100*365:30)*24*60*60*1000,bots:[],payment:{},isPaid:isO}; db.users[email]=u; save(); }
  if(!u) return res.redirect('/');
  const isOwner=isOwnerEmail(email);
  const daysLeft=isOwner?9999:Math.ceil((u.end-Date.now())/86400000);
  const isExpired=!isOwner && daysLeft<=0;
  const payStatus=u.payment.status||'NONE';

  if(!isOwner && payStatus==='PENDING'){
    return res.send("<html><body style='background:#1a0a1a;color:#fff;text-align:center;padding:40px'><h1>⏳ Payment Pending...</h1><p>Trx: "+u.payment.trxId+" - Method: "+u.payment.method+" - Amount: 300 Taka</p><p>Owner Approve করলে 30 দিন Active হবে!</p><a href='/dashboard?email="+email+"' style='color:#ff69b4'>Refresh</a></body></html>");
  }
  if(!isOwner && isExpired){
    return res.send(`
<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;background:#fff;color:#000;font-family:system-ui}.card{max-width:480px;margin:10px auto;background:#fff;border-radius:12px;padding:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}.paycard{background:#c2185b;color:#fff;padding:15px;border-radius:10px}input,select{width:100%;padding:12px;border:1px solid #c2185b;border-radius:8px;margin:8px 0;box-sizing:border-box}.btn{width:100%;padding:14px;background:#7b1a2e;color:#fff;border:none;border-radius:8px;font-weight:bold}</style></head>
<body><div style="background:#e91e63;color:#fff;padding:12px;text-align:center">⚠️ 30 Days Free Trial শেষ! 300 Taka দিয়ে Continue করো</div>
<div class="card"><div class="paycard"><h3 style="text-align:center">bKash / Nagad Payment - ৳300 / 30 Days</h3><p>bKash: ${BKASH} | Nagad: ${NAGAD}</p><input id="trxId" placeholder="Transaction ID দিন"><input id="payerNum" placeholder="যে Number থেকে পাঠাইছো - 01XXXXXXXXX"><select id="method"><option>bKash</option><option>Nagad</option></select><button class="btn" onclick="submitPay()">ভেরিফাই - Pending হবে, Owner Approve করবে</button><p style="font-size:11px;text-align:center;margin-top:10px">Free Trial শেষ! এখন Pay করলে 30 দিন Active!</p></div></div>
<script>
function submitPay(){ const trx=document.getElementById("trxId").value.trim(); const num=document.getElementById("payerNum").value.trim(); const m=document.getElementById("method").value; if(!trx||!num) return alert("TrxID+Number দাও!"); fetch("/api/submit-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",trxId:trx,payerNum:num,method:m})}).then(r=>r.json()).then(d=>{ alert(d.msg); location.reload() }) }
</script></body></html>`);
  }

  let servicesHtml=""; let botsHtml="";
  u.bots.forEach(b=>{
    const slug=b.slug||b.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+"-"+b.id.slice(-4);
    const link=HOSTING_LINK+"/bot/"+slug;
    servicesHtml+="<div style='background:#000;padding:10px;border-radius:8px;margin:8px 0;border:1px solid #222'><b style='color:#ff69b4'>"+b.name+"</b><br><span style='font-size:11px;color:#888'>"+b.branch+" | "+b.startCmd+" | Running</span> <a href='"+link+"' target='_blank' style='background:#ff1493;color:#fff;padding:4px 8px;border-radius:6px;text-decoration:none;font-size:11px;margin-left:8px'>Visit</a></div>";
    botsHtml+="<div style='background:#1a0a1a;border:1px solid #ff1493;border-radius:12px;padding:12px;margin:10px 0'><b>"+b.name+"</b> <span style='background:"+(isOwner?"#ffd700":"#ff1493")+";color:"+(isOwner?"#000":"#fff")+";font-size:10px;padding:2px 6px;border-radius:8px'>"+(isOwner?"LIFETIME FREE":"GITHUB")+"</span><br><span style='font-size:11px;color:#ffb6c1'>"+b.branch+" | "+b.startCmd+"</span><div style='margin-top:8px;background:#000;padding:8px;border-radius:8px;border:1px solid #ff1493'><a href='"+link+"' style='color:#ff69b4;font-size:11px;word-break:break-all'>"+link+"</a></div><div style='margin-top:8px'><button onclick=\"pairNow('"+b.id+"')\" style='background:#ff1493;color:#fff;border:none;padding:8px 12px;border-radius:6px'>Pair</button> <span id='pair-"+b.id+"' style='color:#ff69b4;font-weight:bold;margin-left:10px'>Code: ----</span></div><div style='margin-top:8px'><button onclick=\"deleteBot('"+b.id+"')\" style='background:#222;color:#ff4444;border:1px solid #ff1493;padding:6px 10px;border-radius:6px'>Delete</button></div></div>";
  });
  if(botsHtml==="") botsHtml="<div style='text-align:center;padding:20px;color:#ff69b4;border:1px dashed #ff1493;border-radius:10px'>No Deployments Yet - Deploy করো!</div>";

  res.send(`
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
body{background:#0a0a0a;color:#e5e5e5;font-family:system-ui;margin:0;display:flex}
.sidebar{width:240px;background:#1a0a1a;border-right:1px solid #ff1493;min-height:100vh;padding:12px;position:sticky;top:0;overflow-y:auto}
.sidebar a{display:block;padding:8px 12px;color:#ffb6c1;text-decoration:none;border-radius:8px;margin:3px 0;font-size:13px;cursor:pointer}
.sidebar a.active{background:linear-gradient(90deg,#ff1493,#ff69b4);color:#fff}
.main{flex:1;background:#0a0a0a;min-height:100vh}
.topbar{background:#1a0a1a;padding:12px;border-bottom:1px solid #ff1493;display:flex;justify-content:space-between}
.card{background:#1a0a1a;border:1px solid #ff1493;border-radius:16px;padding:16px;margin:12px}
input,select{width:100%;padding:12px;background:#000;border:1px solid #ff1493;color:#fff;border-radius:10px;margin:6px 0;box-sizing:border-box}
.btn-deploy{background:linear-gradient(90deg,#ff1493,#ff69b4);color:#fff;width:100%;padding:14px;border:none;border-radius:10px;font-weight:bold;cursor:pointer}
.koyeb-section{display:none} .koyeb-section.active{display:block}
@media(max-width:768px){ .sidebar{width:60px} .sidebar span.label{display:none} }
</style></head>
<body>
<div class="sidebar">
<h2 style="color:#ff69b4;font-size:16px">ULTRA X<br>PAWAR VIP</h2>
<a href="#" onclick="showSection('home')" id="nav-home" class="active">🏠 <span class="label">Overview</span></a>
<a href="#" onclick="showSection('services')" id="nav-services">📦 <span class="label">Services (${u.bots.length})</span></a>
<a href="#" onclick="showSection('deploy')" id="nav-deploy">🚀 <span class="label">Deploy</span></a>
<a href="#" onclick="showSection('env')" id="nav-env">🔐 <span class="label">Env / Secrets</span></a>
<a href="#" onclick="showSection('domains')" id="nav-domains">🌐 <span class="label">Domains / SSL</span></a>
<a href="#" onclick="showSection('volumes')" id="nav-volumes">💾 <span class="label">Volumes</span></a>
<a href="#" onclick="showSection('logs')" id="nav-logs">📜 <span class="label">Logs</span></a>
<a href="#" onclick="showSection('metrics')" id="nav-metrics">📊 <span class="label">Metrics</span></a>
<a href="#" onclick="showSection('scaling')" id="nav-scaling">⚖️ <span class="label">Scaling</span></a>
<a href="#" onclick="showSection('billing')" id="nav-billing">💳 <span class="label">Billing</span></a>
<a href="#" onclick="showSection('settings')" id="nav-settings">⚙️ <span class="label">Settings</span></a>
<div style="margin-top:15px;border-top:1px solid #ff1493;padding-top:10px">
<a href="javascript:void(0)" onclick="shareLink()">🔗 <span class="label">Share Link</span></a>
${isOwner?`<a href="/admin?email=${email}" style="background:gold;color:#000;font-weight:bold">👑 ADMIN - Payment</a>`:""}
</div>
</div>
<div class="main">
<div class="topbar"><div><b style="color:${isOwner?"#ffd700":"#ff69b4"}">${isOwner?"👑 OWNER LIFETIME FREE - সারা জীবন Free":"User - 30 Days Trial"}</b><br><span style="font-size:11px;color:#ffb6c1">${isOwner?"Lifetime Unlimited - No Payment - RAM 2GB":"${daysLeft} Days Left - After 300 Taka - RAM 512MB"}</span></div><button onclick="localStorage.clear();location.href='/'" style="background:#222;color:#ff69b4;border:1px solid #ff1493;padding:6px 12px;border-radius:8px">Logout</button></div>

<div id="sec-home" class="koyeb-section active"><div class="card"><h2>🏠 Overview - ${isOwner?"Lifetime Free":"30 Days Trial"}</h2><p style="color:#ffb6c1">RAM: ${isOwner?"2GB / 2 vCPU - Owner Lifetime Free":"512MB / 0.5 vCPU - Free Trial"} | Services: ${u.bots.length} | Uptime 99.9% | Google SEO Ready ✅</p><button onclick="showSection('deploy')" style="padding:10px 20px;background:#ff1493;color:#fff;border:none;border-radius:20px">+ New Service</button></div><div class="card"><h3>📊 Quick Stats</h3><p>CPU 2.5% | Memory 145MB / ${isOwner?"2GB":"512MB"} | Network 1.2GB | Region SG-1 PRO - No Sleep</p></div></div>
<div id="sec-services" class="koyeb-section"><div class="card"><h3>📦 Services (${u.bots.length}) - ${isOwner?"Lifetime Free":"Trial"}</h3>${servicesHtml}${botsHtml}</div></div>
<div id="sec-deploy" class="koyeb-section"><div class="card"><h3>🚀 Deploy New Service</h3><input id="ghName" placeholder="Name - RANA-X-VIP-BOT"><input id="ghRepo" placeholder="GitHub Repo URL" value="${GITHUB_SAMPLE}"><div style="display:flex;gap:8px"><input id="ghBranch" value="main" style="flex:1"><input id="ghStart" value="npm start" style="flex:1"></div><button class="btn-deploy" onclick="deployGithub()">Deploy - ${isOwner?"Lifetime Free":"Free Trial"}</button></div></div>
<div id="sec-env" class="koyeb-section"><div class="card"><h3>🔐 Env / Secrets</h3><input placeholder="Key - SESSION_ID"><input placeholder="Value"><button class="btn-deploy" style="background:#222;border:1px solid #ff1493">Add Secret</button></div></div>
<div id="sec-domains" class="koyeb-section"><div class="card"><h3>🌐 Domains / SSL - Google SEO</h3><p style="color:#ff69b4">${HOSTING_LINK}/bot/your-id - SSL ✅ - Google Indexed ✅</p><input placeholder="Custom Domain"><button class="btn-deploy" style="background:#222;border:1px solid #ff1493">Add Domain</button></div></div>
<div id="sec-volumes" class="koyeb-section"><div class="card"><h3>💾 Volumes</h3><p>Persistent Storage for Session</p><input placeholder="Volume Name"><button class="btn-deploy" style="background:#222;border:1px solid #ff1493">Create Volume</button></div></div>
<div id="sec-logs" class="koyeb-section"><div class="card"><h3>📜 Logs - Real Time - No Sleep</h3><div style="background:#000;border:1px solid #222;padding:10px;font-family:monospace;font-size:11px;color:#ff69b4;height:250px;overflow-y:auto">> Deploying to SG-1 PRO...<br>> ✅ ULTRA X PAWAR BOT Started - Rani Golapi 💖<br>> ✅ No Sleep Enabled<br>> 🌐 Listening on 3000 - RAM ${isOwner?"2GB":"512MB"}</div></div></div>
<div id="sec-metrics" class="koyeb-section"><div class="card"><h3>📊 Metrics - RAM ${isOwner?"2GB":"512MB"}</h3><p>CPU 2.5% / 2 vCPU | Memory 145MB / ${isOwner?"2GB":"512MB"} | Network 1.2GB / 10GB | Uptime 99.9%</p></div></div>
<div id="sec-scaling" class="koyeb-section"><div class="card"><h3>⚖️ Scaling / Instances</h3><select><option>512MB RAM / 0.5 vCPU - Free Trial (30 Days)</option><option>1GB RAM / 1 vCPU - Paid 300 Taka / 30 Days</option><option>2GB RAM / 2 vCPU - Owner Lifetime Free (SARA JIBON)</option></select><button class="btn-deploy" style="background:#222;border:1px solid #ff1493">Apply</button></div></div>
<div id="sec-billing" class="koyeb-section"><div class="card" style="background:${isOwner?"#2a2a0a":"#fff"};color:${isOwner?"#ffd700":"#000"}"><h3>${isOwner?"👑 Owner - Lifetime Free - সারা জীবন Free":"💳 Billing - 30 Days Free + 300 Taka After"}</h3><p>${isOwner?"তুই Owner - কোনো টাকা লাগবে না! Unlimited! RAM 2GB - Google SEO Ready!":"Plan: FREE_30_DAYS - "+daysLeft+" Days Left - After 300 Taka - bKash ${BKASH} / Nagad ${NAGAD} - Auto Payment Page আসবে"}</p></div></div>
<div id="sec-settings" class="koyeb-section"><div class="card"><h3>⚙️ Settings - Google Rank Ready</h3><p>Region: SG-1 Singapore - No Sleep - 99.9% Uptime - SEO: Sitemap/Robots/Google Verification Ready ✅</p><button style="background:#222;color:#ff69b4;border:1px solid #ff1493;padding:10px 20px;border-radius:8px">Restart</button> <button style="background:#ff4444;color:#fff;border:none;padding:10px 20px;border-radius:8px">Delete Service</button></div></div>

</div>
<script>
function showSection(id){ document.querySelectorAll('.koyeb-section').forEach(s=>s.classList.remove('active')); document.querySelectorAll('.sidebar a').forEach(a=>a.classList.remove('active')); document.getElementById('sec-'+id).classList.add('active'); const nav=document.getElementById('nav-'+id); if(nav) nav.classList.add('active'); }
function shareLink(){ const link="${HOSTING_LINK}"; try{ navigator.clipboard.writeText(link); }catch(e){} alert("Copied: "+link); }
function deployGithub(){ const n=document.getElementById("ghName").value; const r=document.getElementById("ghRepo").value; const br=document.getElementById("ghBranch").value||"main"; const st=document.getElementById("ghStart").value||"npm start"; if(!n||!r) return alert("Name+Repo দাও!"); fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",name:n,token:r,branch:br,startCmd:st})}).then(r=>r.json()).then(d=>{ alert(d.msg); location.reload() }) }
function pairNow(id){ const el=document.getElementById("pair-"+id); el.innerText="Generating..."; fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({number:"8801636487523"})}).then(r=>r.json()).then(d=>{ el.innerText="Code: "+d.pairCode }) }
function deleteBot(id){ if(!confirm("Delete?")) return; fetch("/api/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",id:id})}).then(()=>location.reload()) }
</script>
</body></html>
`);
});

module.exports=app;
