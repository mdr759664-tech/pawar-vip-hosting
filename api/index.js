const express = require('express');
const app = express();
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({ extended: true }));
if(!globalThis.pawarDB){ globalThis.pawarDB = { users: {} }; }
let db = globalThis.pawarDB;
function save(){ globalThis.pawarDB = db; }

const LINKS = {
  OWNER_NUMBER: "01636487523",
  WHATSAPP_CHANNEL: "https://whatsapp.com/channel/0029VbDQERV7Noa0DwgpQC3f",
  TELEGRAM_BOT_LINK: "https://t.me/ultra_x_pawar_bot",
  TELEGRAM_CHANNEL: "https://t.me/ultra_x_pawar",
  HOSTING_LINK: "https://pawar-vip-hosting.vercel.app",
  GITHUB_SAMPLE: "https://github.com/mdr759664-tech/RANA-X-VIP-BOT"
};
const PAYMENT = { BKASH: "01837450067", NAGAD: "01636487523", AMOUNT: 300, FREE_DAYS: 30 };
const OWNER_LIST = ["mdr759664@gmail.com","pawar@gmail.com","01636487523","ultra","mdr759664"];
function isOwnerEmail(e){ if(!e) return false; e=e.toLowerCase(); return OWNER_LIST.some(o=> e.includes(o.toLowerCase())); }

app.get('/api/ping',(req,res)=>{ res.json({status:"ALIVE"}); });
app.post('/api/pair',(req,res)=>{ const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let raw=""; for(let i=0;i<8;i++) raw+=chars[Math.floor(Math.random()*chars.length)]; res.json({ok:true, pairCode: raw.slice(0,4)+"-"+raw.slice(4)}); });
app.get('/bot/:id',(req,res)=>{ const id=req.params.id.toLowerCase(); let found=null; for(let e in db.users){ let b=db.users[e].bots.find(x=> x.id.toLowerCase()===id || (x.slug && x.slug.toLowerCase()===id) ); if(b){found=b; break;} } if(!found) return res.send(`<h1>❌ Bot Not Found! ${req.params.id}</h1>`); const slug=found.slug||found.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+"-"+found.id.slice(-4); res.send(`<html><body style="background:#0a0a0a;color:#fff;text-align:center;padding:30px"><h1>🤖 ${found.name} - Running ✅ SG-1 PRO</h1><a href="https://pawar-vip-hosting.vercel.app/bot/${slug}" style="color:#ff69b4">${slug}</a></body></html>`); });
app.get('/',(req,res)=>{ res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>ULTRA X PAWAR</title><style>body{margin:0;background:linear-gradient(135deg,#1a0a1a,#2d0a2d);color:#fff;font-family:system-ui;text-align:center;min-height:100vh}.card{max-width:420px;margin:15px auto;background:linear-gradient(145deg,#2a0a2a,#4a0a4a);border:1px solid #ff1493;border-radius:16px;padding:20px}input{width:100%;padding:12px;border-radius:8px;border:1px solid #ff1493;background:#1a0a1a;color:#fff;margin:8px 0;box-sizing:border-box}.btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(90deg,#ff1493,#ff69b4);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;margin-top:10px}</style></head><body><div style="background:linear-gradient(90deg,#ff1493,#c3005a);padding:15px;font-weight:bold">👑 ULTRA X PAWAR - Real Hosting 💖</div><div class="card"><h2 style="color:#ff69b4">🔐 Login</h2><input id="email" type="email" placeholder="Gmail" value="mdr759664@gmail.com"><input id="pass" type="password" placeholder="Password"><button class="btn" onclick="doAuth('login')">Login</button><p id="msg" style="color:#ff4444"></p></div><script>const s=localStorage.getItem("pawar_email"); if(s) location.href="/dashboard?email="+s; function doAuth(t){ const e=document.getElementById("email").value.trim().toLowerCase(); const p=document.getElementById("pass").value.trim(); if(!e||!p) return document.getElementById("msg").innerText="Email+Pass দাও!"; fetch(t=="login"?"/api/login":"/api/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,pass:p})}).then(r=>r.json()).then(d=>{ if(d.ok){ localStorage.setItem("pawar_email",e); location.href="/dashboard?email="+e } else document.getElementById("msg").innerText=d.msg }) }<\/script></body></html>`); });
app.post('/api/login',(req,res)=>{ let email=(req.body.email||"").toLowerCase().trim(); let isOwner=isOwnerEmail(email); if(!db.users[email]) db.users[email]={email,pass:req.body.pass,plan:isOwner?"OWNER-LIFETIME-FREE":"FREE_30_DAYS",start:Date.now(),end:Date.now()+(isOwner?100*365:PAYMENT.FREE_DAYS)*24*60*60*1000,bots:[],payment:{},isPaid:isOwner}; else { if(isOwner){ db.users[email].plan="OWNER-LIFETIME-FREE"; db.users[email].end=Date.now()+100*365*24*60*60*1000; db.users[email].isPaid=true; } } save(); res.json({ok:true}); });
app.post('/api/signup',(req,res)=>{ let email=(req.body.email||"").toLowerCase().trim(); let isOwner=isOwnerEmail(email); db.users[email]={email,pass:req.body.pass,plan:isOwner?"OWNER-LIFETIME-FREE":"FREE_30_DAYS",start:Date.now(),end:Date.now()+(isOwner?100*365:PAYMENT.FREE_DAYS)*24*60*60*1000,bots:[],payment:{},isPaid:isOwner}; save(); res.json({ok:true}); });

// ADMIN PANEL - Owner Only
app.get('/admin',(req,res)=>{
  let email=(req.query.email||"").toLowerCase(); if(!isOwnerEmail(email)) return res.send(`<h1>❌ Only Owner - ${email} Not Owner</h1>`);
  let usersHtml=""; let totalBots=0; let pendingCount=0;
  for(let e in db.users){ let u=db.users[e]; totalBots+=u.bots.length; let status=u.payment.status||'FREE'; if(status==='PENDING') pendingCount++; let isO=isOwnerEmail(e); let statusColor=status==='PENDING'?'#ffaa00':status==='PAID'?'#22c55e':'#888'; usersHtml+=`<tr style="border-bottom:1px solid #ff1493"><td style="padding:8px;font-size:11px">${isO?'👑 OWNER - LIFETIME FREE':e}</td><td style="padding:8px;font-size:11px"><span style="background:${isO?'#ffd700':statusColor};color:${isO?'#000':'#fff'};padding:2px 6px;border-radius:10px;font-size:9px">${isO?'LIFETIME FREE':status+' - '+(u.payment.method||'')}</span><br>${u.plan}<br>${isO?'∞ Lifetime':Math.ceil((u.end-Date.now())/86400000)+' দিন'}</td><td style="padding:8px;font-size:11px">${u.bots.length}</td><td style="padding:8px;font-size:11px">${isO?'Owner No Need Pay':`Trx: <b>${u.payment.trxId||'No'}</b><br>Method: ${u.payment.method||''}<br>Num: ${u.payment.payerNum||''}`}</td><td style="padding:8px;display:flex;flex-direction:column;gap:4px">${isO?'<span style="color:#ffd700">👑 Lifetime</span>':`<button onclick="approveUser('${e}')" style="background:#22c55e;color:#fff;border:none;padding:6px 8px;border-radius:4px;font-size:10px">✅ Approve 30 Days</button><button onclick="rejectUser('${e}')" style="background:#ff4444;color:#fff;border:none;padding:6px 8px;border-radius:4px;font-size:10px">❌ Reject</button>`}<button onclick="deleteUser('${e}')" style="background:#222;color:#ff4444;border:1px solid #ff1493;padding:5px 8px;border-radius:4px;font-size:10px">Delete</button></td></tr>`; }
  res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#1a0a1a;color:#fff;font-family:system-ui;margin:0;padding:10px}.card{background:linear-gradient(145deg,#2a0a2a,#3a0a3a);border:1px solid #ff1493;border-radius:14px;padding:15px;margin-bottom:15px}</style></head><body><h2 style="color:#ff69b4">👑 OWNER ADMIN - Lifetime Free Owner + User Payment</h2><div style="display:flex;gap:8px;flex-wrap:wrap"><div class="card" style="flex:1">Users<br><b style="font-size:22px;color:#ff69b4">${Object.keys(db.users).length}</b></div><div class="card" style="flex:1">Pending Payment<br><b style="font-size:22px;color:#ffaa00">${pendingCount}</b></div><div class="card" style="flex:1">Total Bots<br><b style="font-size:22px;color:#ff1493">${totalBots}</b></div></div><div class="card"><h3>👥 Users - Owner Lifetime Free, Others 30 Days Trial + 300 Taka</h3><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><tr style="background:#ff1493"><th style="padding:8px;font-size:11px">User</th><th style="padding:8px;font-size:11px">Status</th><th style="padding:8px;font-size:11px">Bots</th><th style="padding:8px;font-size:11px">Payment Proof</th><th style="padding:8px;font-size:11px">Action</th></tr>${usersHtml}</table></div></div><div style="text-align:center;padding:20px"><a href="/dashboard?email=${email}" style="background:#ff1493;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">← Dashboard</a></div><script>function approveUser(e){ fetch("/api/admin/approve",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({adminEmail:"${email}",targetEmail:e})}).then(r=>r.json()).then(d=>{ alert(d.msg); location.reload() }) } function rejectUser(e){ fetch("/api/admin/reject",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({adminEmail:"${email}",targetEmail:e})}).then(r=>r.json()).then(d=>{ alert(d.msg); location.reload() }) } function deleteUser(e){ if(!confirm("Delete "+e+" ?")) return; fetch("/api/admin/delete-user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({adminEmail:"${email}",targetEmail:e})}).then(()=>location.reload()) }<\/script></body></html>`);
});
app.post('/api/admin/approve',(req,res)=>{ if(!isOwnerEmail(req.body.adminEmail)) return res.json({msg:"Not Owner"}); let u=db.users[req.body.targetEmail.toLowerCase()]; if(!u) return res.json({msg:"Not Found"}); if(isOwnerEmail(req.body.targetEmail)) return res.json({msg:"Owner Already Lifetime Free!"}); u.end=Date.now()+30*24*60*60*1000; u.plan="VIP-PAID-30-DAYS"; u.isPaid=true; u.payment.status="PAID"; save(); res.json({msg:"✅ Approved! 30 Days Active - 300 Taka Received!"}); });
app.post('/api/admin/reject',(req,res)=>{ if(!isOwnerEmail(req.body.adminEmail)) return res.json({msg:"Not Owner"}); let u=db.users[req.body.targetEmail.toLowerCase()]; if(!u) return res.json({msg:"Not Found"}); u.payment.status="REJECTED"; u.isPaid=false; save(); res.json({msg:"❌ Rejected!"}); });
app.post('/api/admin/delete-user',(req,res)=>{ if(!isOwnerEmail(req.body.adminEmail)) return res.json({msg:"Not Owner"}); delete db.users[req.body.targetEmail.toLowerCase()]; save(); res.json({ok:true}); });

app.get('/dashboard',(req,res)=>{
  let email=(req.query.email||"").toLowerCase(); let u=db.users[email];
  if(!u && email){ let isO=isOwnerEmail(email); u={email,plan:isO?"OWNER-LIFETIME-FREE":"FREE_30_DAYS",start:Date.now(),end:Date.now()+(isO?100*365:PAYMENT.FREE_DAYS)*24*60*60*1000,bots:[],payment:{},isPaid:isO}; db.users[email]=u; save(); }
  if(!u) return res.redirect('/');
  const isOwner=isOwnerEmail(email);
  const daysLeft=isOwner?99999:Math.ceil((u.end-Date.now())/86400000);
  const isExpired=!isOwner && daysLeft<=0;
  const displayName=isOwner?"👑 OWNER - LIFETIME FREE (সারা জীবন Free)":"User - 30 Days Free Trial";
  const payStatus=u.payment.status||'NONE';

  // PENDING PAGE - For Normal Users Only
  if(!isOwner && payStatus==='PENDING'){
    return res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;background:#1a0a1a;color:#fff;font-family:system-ui;text-align:center;padding:20px}.card{max-width:420px;margin:50px auto;background:linear-gradient(145deg,#2a0a2a,#3a0a3a);border:1px solid #ffaa00;border-radius:16px;padding:30px}</style></head><body><div class="card"><h1 style="color:#ffaa00">⏳ Payment Pending...</h1><p>Method: <b>${u.payment.method}</b><br>TrxID: <b>${u.payment.trxId}</b><br>Number: ${u.payment.payerNum}<br>Amount: ৳${PAYMENT.AMOUNT}</p><p style="font-size:13px;color:#ffb6c1">Owner চেক করছে! Approve করলে 30 দিন Active হবে!</p><button onclick="location.reload()" style="background:#ff1493;color:#fff;padding:10px 20px;border:none;border-radius:8px;margin-top:10px">Refresh</button><br><br><a href="/dashboard?email=${email}" style="color:#ff69b4">← Dashboard</a></div></body></html>`);
  }

  // EXPIRED / REJECTED PAYMENT PAGE - Only For Normal Users, Owner Never Sees This!
  if(!isOwner && (isExpired || payStatus==='REJECTED')){
    return res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Payment - ULTRA X PAWAR</title><style>
    body{margin:0;background:#f5f5f5;color:#000;font-family:system-ui}
    .topbar{background:#e91e63;color:#fff;padding:12px;font-weight:bold;text-align:center}
    .card{max-width:480px;margin:10px auto;background:#fff;border-radius:12px;padding:0;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
    .header{padding:15px;display:flex;justify-content:space-between;border-bottom:1px solid #eee}
    .paycard{background:#c2185b;border-radius:12px;padding:20px;margin:12px;color:#fff}
    input{width:100%;padding:14px;border-radius:8px;border:1px solid #e91e63;margin:8px 0;box-sizing:border-box;background:#fff;color:#000}
    .btn{width:94%;padding:14px;border:none;border-radius:8px;background:#7b1a2e;color:#fff;font-weight:bold;margin:15px auto;display:block;font-size:18px}
    .method-tab{display:flex;gap:10px;margin:12px}
    .method-btn{flex:1;padding:12px;border-radius:8px;border:2px solid #c2185b;background:#fff;color:#c2185b;font-weight:bold;cursor:pointer}
    .method-btn.active{background:#c2185b;color:#fff}
    .step{margin:12px 0;font-size:13px;display:flex;gap:8px}
    .dot{width:6px;height:6px;background:#fff;border-radius:50%;margin-top:6px;flex-shrink:0}
    </style></head><body>
    <div class="topbar">🔒 নিরাপদ পেমেন্ট - 30 Days Trial শেষ! 300 টাকা দিয়ে Continue করো</div>
    <div class="card">
      <div class="header"><span style="font-size:20px">৳ ${PAYMENT.AMOUNT} / 30 Days</span><span style="font-size:11px;color:#888">Free Trial: ${PAYMENT.FREE_DAYS} Days Over</span></div>
      <div class="method-tab">
        <button id="btn-bkash" class="method-btn active" onclick="selectMethod('bKash')">📱 bKash - ${PAYMENT.BKASH}</button>
        <button id="btn-nagad" class="method-btn" onclick="selectMethod('Nagad')">💳 Nagad - ${PAYMENT.NAGAD}</button>
      </div>
      <div class="paycard">
        <h3 id="methodTitle" style="text-align:center;margin:0 0 15px 0">bKash দিয়ে টাকা পাঠাও</h3>
        <input id="trxId" placeholder="Transaction ID দিন">
        <div style="margin-top:15px">
          <div class="step"><div class="dot"></div><div id="step1">*247# ডায়াল করে bKash অ্যাপ খুলুন। Send Money করুন।</div></div>
          <div class="step"><div class="dot"></div><div>Number: <b style="background:#ffeb3b;color:#000;padding:2px 6px;border-radius:3px" id="payNumber">${PAYMENT.BKASH}</b> <button onclick="copyNumber()" style="background:#fff;color:#c2185b;border:none;padding:4px 8px;border-radius:4px;font-size:11px">📋 Copy</button></div></div>
          <div class="step"><div class="dot"></div><div>Amount: <b style="color:#ffeb3b">৳ ${PAYMENT.AMOUNT}</b> (30 Days Hosting)</div></div>
          <div class="step"><div class="dot"></div><div>PIN দিয়ে Confirm করো, TrxID Copy করো।</div></div>
        </div>
        <input id="payerNum" placeholder="যে Number থেকে পাঠাইছো - 01XXXXXXXXX" style="margin-top:15px;background:#fff;color:#000">
        ${payStatus==='REJECTED'?'<p style="background:#ff4444;padding:8px;border-radius:6px;text-align:center">❌ Last Payment Rejected! Again Try</p>':''}
        <p style="font-size:11px;text-align:center;margin-top:10px">1 Month Free Trial শেষ! এখন 300 টাকা দিলে 30 দিন Active হবে!</p>
      </div>
      <button class="btn" onclick="submitPayment()">ভেরিফাই - Owner Approve করবে</button>
      <p style="text-align:center;font-size:11px;color:#888;padding:10px">Owner: ${email} - Lifetime Free, তোমার Trial শেষ - Payment করো</p>
    </div>
    <script>
    let selectedMethod='bKash'; let bkashNum='${PAYMENT.BKASH}'; let nagadNum='${PAYMENT.NAGAD}';
    function selectMethod(m){
      selectedMethod=m;
      document.getElementById('btn-bkash').classList.remove('active'); document.getElementById('btn-nagad').classList.remove('active');
      if(m==='bKash'){ document.getElementById('btn-bkash').classList.add('active'); document.getElementById('methodTitle').innerText='bKash দিয়ে টাকা পাঠাও'; document.getElementById('step1').innerText='*247# ডায়াল করে bKash অ্যাপ খুলুন। Send Money করুন।'; document.getElementById('payNumber').innerText=bkashNum; }
      else{ document.getElementById('btn-nagad').classList.add('active'); document.getElementById('methodTitle').innerText='Nagad দিয়ে টাকা পাঠাও'; document.getElementById('step1').innerText='*167# ডায়াল করে Nagad অ্যাপ খুলুন। Send Money করুন।'; document.getElementById('payNumber').innerText=nagadNum; }
    }
    function copyNumber(){ let n=document.getElementById('payNumber').innerText; navigator.clipboard.writeText(n); alert('Copied '+n) }
    function submitPayment(){ const trx=document.getElementById("trxId").value.trim(); const num=document.getElementById("payerNum").value.trim(); if(!trx||!num) return alert("TrxID + Number দাও!"); fetch("/api/submit-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",trxId:trx,payerNum:num,method:selectedMethod})}).then(r=>r.json()).then(d=>{ alert(d.msg); location.reload() }) }
    <\/script></body></html>`);
  }

  let servicesHtml=""; let botsHtml="";
  u.bots.forEach((b)=>{
    const slug=b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+"-"+b.id.slice(-4);
    const liveLink=`https://pawar-vip-hosting.vercel.app/bot/${slug}`;
    servicesHtml+=`<div style="background:#1a0a1a;border:1px solid #222;border-radius:12px;padding:12px;margin:8px 0;display:flex;justify-content:space-between;align-items:center"><div><b style="color:#ff69b4">${b.name}</b><br><span style="font-size:11px;color:#888">ID: ${b.id.slice(-6)} • ${b.branch} • ${b.startCmd} • Running</span></div><div><span style="background:#22c55e;color:#fff;font-size:10px;padding:4px 8px;border-radius:10px">● Running</span> <a href="${liveLink}" target="_blank" style="background:#ff1493;color:#fff;padding:6px 10px;border-radius:6px;text-decoration:none;font-size:11px;margin-left:4px">Visit</a></div></div>`;
    botsHtml+=`<div style="background:linear-gradient(145deg,#1a0a1a,#2a0a2a);border:1px solid #ff1493;border-radius:16px;padding:14px;margin:14px 0"><div style="display:flex;justify-content:space-between"><div><b>${b.name}</b> <span style="background:${isOwner?'#ffd700':'#ff1493'};color:${isOwner?'#000':'#fff'};font-size:9px;padding:3px 8px;border-radius:10px">${isOwner?'OWNER LIFETIME FREE':'GITHUB'}</span><br><span style="font-size:11px;color:#ffb6c1">${b.branch} | ${b.startCmd} | SG-1 PRO No Sleep</span></div><div><a href="${liveLink}" target="_blank" style="background:#ff1493;color:#fff;padding:8px 14px;border-radius:10px;text-decoration:none;font-size:12px">🌐 Visit</a> <button onclick="deleteBot('${b.id}')" style="background:#2a0a2a;color:#ff4444;border:1px solid #ff1493;padding:6px 10px;border-radius:8px">🗑️</button></div></div><div style="margin-top:10px;background:#000;border:1px solid #ff1493;padding:10px;border-radius:10px;display:flex;gap:6px"><span style="color:#ff69b4;font-size:11px;flex:1;word-break:break-all">${liveLink}</span><button onclick="navigator.clipboard.writeText('${liveLink}')" style="background:#ff1493;color:#fff;border:none;padding:6px 12px;border-radius:6px;font-size:11px">📋 Copy</button></div><div style="margin-top:8px;background:#000;border:1px solid #ff69b4;padding:8px;border-radius:10px;display:flex;gap:6px"><input id="num-${b.id}" value="8801636487523" style="flex:1;padding:8px;background:#1a0a1a;color:#fff;border:1px solid #ff1493;border-radius:6px"><button onclick="pairNow('${b.id}')" style="background:#ff1493;color:#fff;border:none;padding:8px 14px;border-radius:6px">⚡ Pair</button></div><div style="margin-top:8px;background:#000;border:1px dashed #ff69b4;padding:10px;border-radius:10px;display:flex;justify-content:space-between"><span id="pair-${b.id}" data-code="" style="color:#ff69b4;font-weight:bold">Code: ----</span><button onclick="copyPairCode('${b.id}')" style="background:#1a0a1a;color:#ff69b4;border:1px solid #ff1493;padding:6px 12px;border-radius:6px">📋 Copy Code</button></div></div>`;
  });
  if(botsHtml==="") { botsHtml='<div style="text-align:center;padding:30px;color:#ff69b4;border:1px dashed #ff1493;border-radius:12px">No deployments yet - Host Ready 💖<br><br>🚀 Deploy এ যাও!</div>'; servicesHtml='<div style="text-align:center;padding:20px;color:#888">No Services Yet</div>'; }

  const html=`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
  body{background:#0a0a0a;color:#e5e5e5;font-family:system-ui;margin:0;display:flex}
  .sidebar{width:240px;background:linear-gradient(180deg,#1a0a1a,#0a0a0a);border-right:1px solid #ff1493;min-height:100vh;padding:12px;position:sticky;top:0;overflow-y:auto}
  .sidebar a{display:block;padding:9px 12px;color:#ffb6c1;text-decoration:none;border-radius:8px;margin:3px 0;font-size:13px;cursor:pointer}
  .sidebar a.active{background:linear-gradient(90deg,#ff1493,#ff69b4);color:#fff}
  .sidebar h4{color:#ff69b4;margin:15px 0 5px 0;font-size:11px;letter-spacing:1px}
  .main{flex:1;background:linear-gradient(135deg,#0a0a0a,#1a0a1a);min-height:100vh}
  .topbar{background:#1a0a1a;padding:12px 15px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #ff1493;flex-wrap:wrap;gap:8px}
  .card{background:linear-gradient(145deg,#1a0a1a,#2a0a2a);border:1px solid #ff1493;border-radius:16px;padding:16px;margin:12px;box-shadow:0 0 20px rgba(255,20,147,0.15)}
  input,textarea,select{width:100%;padding:12px;background:#0a0a0a;border:1px solid #ff1493;color:#fff;border-radius:10px;margin:6px 0;box-sizing:border-box}
  .btn-deploy{background:linear-gradient(90deg,#ff1493,#ff69b4);color:#fff;width:100%;padding:14px;border-radius:10px;border:none;font-weight:800;font-size:15px;cursor:pointer}
  .koyeb-section{display:none} .koyeb-section.active{display:block}
  @media(max-width:768px){ .sidebar{width:65px;padding:8px} .sidebar span.label{display:none} .sidebar h4{display:none} }
  .method-btn{flex:1;padding:10px;border-radius:8px;border:2px solid #ff1493;background:#1a0a1a;color:#ff69b4;font-weight:bold;cursor:pointer}
  .method-btn.active{background:#ff1493;color:#fff}
  </style></head><body>
  <div class="sidebar">
    <h2 style="color:#ff69b4;margin:0 0 10px 0;font-size:16px;font-weight:900;line-height:16px">👑 ULTRA X<br>PAWAR VIP<br><span style="font-size:10px;color:#ffb6c1">${isOwner?'LIFETIME FREE 💖':'REAL HOSTING 💖'}</span></h2>
    <h4>OVERVIEW</h4>
    <a href="#" onclick="showSection('home')" id="nav-home" class="active">🏠 <span class="label">Overview</span></a>
    <a href="#" onclick="showSection('services')" id="nav-services">📦 <span class="label">Services</span> (${u.bots.length})</a>
    <h4>DEPLOY</h4>
    <a href="#" onclick="showSection('deploy')" id="nav-deploy">🚀 <span class="label">Deploy</span></a>
    <a href="#" onclick="showSection('git')" id="nav-git">🔗 <span class="label">Git Integration</span></a>
    <a href="#" onclick="showSection('build')" id="nav-build">🔨 <span class="label">Build Logs</span></a>
    <h4>CONFIG</h4>
    <a href="#" onclick="showSection('env')" id="nav-env">🔐 <span class="label">Env / Secrets</span></a>
    <a href="#" onclick="showSection('domains')" id="nav-domains">🌐 <span class="label">Domains / SSL</span></a>
    <a href="#" onclick="showSection('volumes')" id="nav-volumes">💾 <span class="label">Volumes</span></a>
    <a href="#" onclick="showSection('network')" id="nav-network">📡 <span class="label">Networking</span></a>
    <h4>MONITOR</h4>
    <a href="#" onclick="showSection('logs')" id="nav-logs">📜 <span class="label">Logs</span></a>
    <a href="#" onclick="showSection('metrics')" id="nav-metrics">📊 <span class="label">Metrics</span></a>
    <a href="#" onclick="showSection('scaling')" id="nav-scaling">⚖️ <span class="label">Scaling</span></a>
    <a href="#" onclick="showSection('cron')" id="nav-cron">⏰ <span class="label">Cron Jobs</span></a>
    <h4>ADVANCED</h4>
    <a href="#" onclick="showSection('backups')" id="nav-backups">🗄️ <span class="label">Backups</span></a>
    <a href="#" onclick="showSection('billing')" id="nav-billing">💳 <span class="label">Billing</span></a>
    <a href="#" onclick="showSection('settings')" id="nav-settings">⚙️ <span class="label">Settings</span></a>
    <div style="margin-top:15px;border-top:1px solid #ff1493;padding-top:10px">
      <a href="${LINKS.WHATSAPP_CHANNEL}" target="_blank">💬 <span class="label">WhatsApp</span></a>
      <a href="${LINKS.TELEGRAM_CHANNEL}" target="_blank">✈️ <span class="label">Telegram</span></a>
      <a href="javascript:void(0)" onclick="shareHostingLink()">🔗 <span class="label">Share Link</span></a>
      ${isOwner?`<a href="/admin?email=${email}" style="background:linear-gradient(90deg,#ffd700,#ffaa00);color:#000;font-weight:bold;margin-top:8px">👑 ADMIN - Payment Manage</a>`:''}
    </div>
  </div>
  <div class="main">
    <div class="topbar"><div><b style="color:${isOwner?'#ffd700':'#ff69b4'}">${displayName}</b><br><span style="font-size:11px;color:#ffb6c1">${isOwner?'SARA JIBON FREE - OWNER - Lifetime Unlimited 💖':'30 Days Free Trial - '+daysLeft+' Days Left - After That 300 Taka'}</span></div><div style="display:flex;gap:8px;align-items:center"><span style="background:#1a0a1a;border:1px solid #ff1493;padding:6px 12px;border-radius:20px;font-size:11px;color:#ff69b4">🟢 Online • ${isOwner?'LIFETIME FREE':'Trial'} • ${u.bots.length} Bots</span><button onclick="localStorage.clear();location.href='/'" style="background:#2a0a2a;color:#ff69b4;border:1px solid #ff1493;padding:6px 12px;border-radius:10px;font-size:11px">Logout</button></div></div>

    <div id="sec-home" class="koyeb-section active">
      <div class="card"><h2 style="color:${isOwner?'#ffd700':'#ff69b4'}">${isOwner?'👑 Owner - Lifetime Free Hosting 💖':'🏠 Welcome - 30 Days Free Trial'}</h2><p style="color:#ffb6c1">${isOwner?'তুই Owner - সারা জীবন Free! No Payment! Unlimited Bots!':'World\\'s Most Powerful Hosting - 30 Days Free, পরে ভালো লাগলে 300 টাকা দিয়ে Continue!'}</p><div style="display:flex;gap:10px;flex-wrap:wrap"><div style="flex:1;min-width:120px;background:#000;padding:15px;border-radius:10px;border:1px solid ${isOwner?'#ffd700':'#ff1493'};text-align:center"><b style="font-size:24px;color:#ff69b4">${u.bots.length}</b><br><span style="font-size:11px">Services</span></div><div style="flex:1;min-width:120px;background:#000;padding:15px;border-radius:10px;border:1px solid #ff1493;text-align:center"><b style="font-size:24px;color:#22c55e">99.9%</b><br><span style="font-size:11px">Uptime</span></div><div style="flex:1;min-width:120px;background:#000;padding:15px;border-radius:10px;border:1px solid #ff1493;text-align:center"><b style="font-size:24px;color:${isOwner?'#ffd700':'#ff69b4'}">${isOwner?'∞':'30 Days'}</b><br><span style="font-size:11px">${isOwner?'Lifetime Free':'Free Trial'}</span></div></div></div>
      <div class="card"><h3>📊 Quick Stats</h3><div style="display:flex;gap:10px;flex-wrap:wrap"><div style="flex:1;background:#000;padding:12px;border-radius:10px;border:1px solid #ff1493"><b>CPU</b><br><span style="color:#ff69b4">2.5% / 2 vCPU</span></div><div style="flex:1;background:#000;padding:12px;border-radius:10px;border:1px solid #ff1493"><b>Memory</b><br><span style="color:#22c55e">145MB / 512MB</span></div><div style="flex:1;background:#000;padding:12px;border-radius:10px;border:1px solid #ff1493"><b>Network</b><br><span style="color:#0ea5e9">1.2GB</span></div></div></div>
    </div>

    <div id="sec-services" class="koyeb-section"><div class="card"><h3 style="color:#ff69b4">📦 Services (${u.bots.length}) - ${isOwner?'Lifetime Free':'Trial'}</h3>${servicesHtml}${botsHtml}</div></div>

    <div id="sec-deploy" class="koyeb-section">
      <div class="card"><h3 style="color:#ff69b4">🚀 Deploy New Service</h3><input id="ghName" placeholder="Service Name"><input id="ghRepo" placeholder="GitHub Repo URL" value="${LINKS.GITHUB_SAMPLE}"><div style="display:flex;gap:8px"><input id="ghBranch" value="main" style="flex:1"><input id="ghStart" value="npm start" style="flex:1"></div><select><option>Node.js 20</option><option>Node.js 18</option><option>Python</option><option>Docker</option></select><label style="font-size:12px;color:#ffb6c1"><input type="checkbox" checked> Auto-Deploy ON</label><label style="font-size:12px;color:#ffb6c1"><input type="checkbox" checked> No Sleep</label><button class="btn-deploy" onclick="deployGithub()">🚀 Deploy - ${isOwner?'LIFETIME FREE':'30 Days Free Trial'} 💖</button></div>
    </div>

    <div id="sec-git" class="koyeb-section"><div class="card"><h3>🔗 Git Integration - Auto Deploy</h3><input value="${LINKS.GITHUB_SAMPLE}" disabled><p style="color:#ffb6c1;font-size:12px">Push করলে Auto Deploy হবে! SG-1 PRO No Sleep!</p><button class="btn-deploy" style="background:#2a0a2a;border:1px solid #ff1493">Connected ✅</button></div></div>
    <div id="sec-build" class="koyeb-section"><div class="card"><h3>🔨 Build Logs</h3><div style="background:#000;border:1px solid #222;border-radius:8px;padding:12px;font-family:monospace;font-size:11px;color:#ff69b4;height:200px;overflow-y:auto">> Deploying to SG-1 PRO...<br>> ✅ Success - Rani Golapi Powerful 💖</div></div></div>
    <div id="sec-env" class="koyeb-section"><div class="card"><h3>🔐 Env / Secrets</h3><div style="display:flex;gap:8px"><input placeholder="Key" style="flex:1"><input placeholder="Value" style="flex:1"><button style="background:#ff1493;color:#fff;border:none;padding:12px 20px;border-radius:10px">Add</button></div><div style="background:#000;padding:10px;border-radius:8px;margin-top:10px;border:1px solid #222"><span>SESSION_ID = ***hidden***</span></div></div></div>
    <div id="sec-domains" class="koyeb-section"><div class="card"><h3>🌐 Domains / SSL</h3><div style="background:#000;padding:12px;border-radius:8px;border:1px solid #ff1493"><span style="color:#ff69b4">🌐 https://pawar-vip-hosting.vercel.app/bot/your-id</span> <span style="background:#22c55e;color:#fff;font-size:10px;padding:2px 6px;border-radius:10px">SSL ✅</span></div><input placeholder="Custom Domain - yourdomain.com"><button class="btn-deploy" style="background:#2a0a2a;border:1px solid #ff1493">➕ Add Domain + SSL</button></div></div>
    <div id="sec-volumes" class="koyeb-section"><div class="card"><h3>💾 Volumes / Storage</h3><p style="color:#ffb6c1">Session, Database - Persistent</p><input placeholder="Volume Name"><button class="btn-deploy" style="background:#2a0a2a;border:1px solid #ff1493">➕ Create Volume</button></div></div>
    <div id="sec-network" class="koyeb-section"><div class="card"><h3>📡 Networking / Ports</h3><div style="display:flex;gap:8px"><input value="3000" style="flex:1"><select style="flex:1"><option>HTTP</option><option>HTTPS</option></select></div><button class="btn-deploy" style="background:#2a0a2a;border:1px solid #ff1493">Save</button></div></div>
    <div id="sec-logs" class="koyeb-section"><div class="card"><h3>📜 Logs - Real Time</h3><div style="background:#000;border:1px solid #222;border-radius:8px;padding:12px;font-family:monospace;font-size:11px;color:#ff69b4;height:300px;overflow-y:auto">> ✅ ULTRA X PAWAR BOT Started - Rani Golapi 💖<br>> ✅ WhatsApp Connected<br>> 🌐 Listening on 3000<br>> 📦 No Sleep Enabled<br></div></div></div>
    <div id="sec-metrics" class="koyeb-section"><div class="card"><h3>📊 Metrics</h3><div style="display:flex;gap:10px"><div style="flex:1;background:#000;padding:15px;border-radius:10px;border:1px solid #ff1493"><b>CPU</b><br><span style="color:#ff69b4">2.5%</span></div><div style="flex:1;background:#000;padding:15px;border-radius:10px;border:1px solid #ff1493"><b>Memory</b><br><span style="color:#22c55e">145MB</span></div><div style="flex:1;background:#000;padding:15px;border-radius:10px;border:1px solid #ff1493"><b>Network</b><br><span style="color:#0ea5e9">1.2GB</span></div></div></div></div>
    <div id="sec-scaling" class="koyeb-section"><div class="card"><h3>⚖️ Scaling</h3><select><option>1 Instance - Free</option><option>2 Instances - Pro</option></select><select><option>512MB RAM</option><option>1GB RAM</option></select><button class="btn-deploy" style="background:#2a0a2a;border:1px solid #ff1493">Apply Scaling</button></div></div>
    <div id="sec-cron" class="koyeb-section"><div class="card"><h3>⏰ Cron Jobs</h3><input placeholder="Job Name"><div style="display:flex;gap:8px"><input placeholder="Schedule - */5 * * * *" style="flex:1"><input placeholder="Command" style="flex:1"></div><button class="btn-deploy" style="background:#2a0a2a;border:1px solid #ff1493">➕ Add Cron</button></div></div>
    <div id="sec-backups" class="koyeb-section"><div class="card"><h3>🗄️ Backups</h3><button class="btn-deploy" style="background:#2a0a2a;border:1px solid #ff1493">📸 Create Snapshot</button><div style="background:#000;padding:10px;border-radius:8px;margin-top:10px;border:1px solid #222">📸 Auto Backup Daily - 7 Days Keep</div></div></div>

    <div id="sec-billing" class="koyeb-section">
      <div class="card" style="background:${isOwner?'linear-gradient(145deg,#2a2a0a,#3a3a0a)':'#fff'};color:${isOwner?'#ffd700':'#000'};border:1px solid ${isOwner?'#ffd700':'#ff1493'}">
        ${isOwner?`
          <h3 style="color:#ffd700">👑 Owner Billing - LIFETIME FREE - সারা জীবন Free 💖</h3>
          <p><b>Plan:</b> OWNER-LIFETIME-FREE - Unlimited Bots - ∞ Days - No Payment Needed!</p>
          <p><b>Services:</b> ${u.bots.length} | <b>Uptime:</b> 99.9% | <b>Region:</b> SG-1 PRO No Sleep</p>
          <div style="background:#000;padding:12px;border-radius:8px;border:1px solid #ffd700;margin-top:10px">
            <b style="color:#ffd700">👑 তুই Owner - তোর কোনো টাকা লাগবে না! সারা জীবন Free!</b><br>
            <span style="color:#fff;font-size:12px">Other Users: 30 Days Free Trial, পরে 300 Taka - bKash: ${PAYMENT.BKASH} / Nagad: ${PAYMENT.NAGAD}</span>
          </div>
          <button class="btn-deploy" style="background:linear-gradient(90deg,#ffd700,#ffaa00);color:#000;margin-top:15px">👑 Lifetime Free Active - No Need Pay</button>
        `:`
          <h3 style="color:#c2185b">💳 Billing - 30 Days Free Trial + 300 Taka Hosting</h3>
          <p><b>Plan:</b> ${u.plan} | <b>Days Left:</b> ${daysLeft} Days | <b>Bots:</b> ${u.bots.length} | <b>Status:</b> ${payStatus}</p>
          <p style="font-size:12px;color:#888">Free Trial শেষ হলে 300 টাকা দিয়ে Continue করো! bKash/Nagad!</p>
          <div style="display:flex;gap:10px;margin:12px">
            <button id="bill-bkash" class="method-btn active" onclick="selectBillingMethod('bKash')">📱 bKash<br>${PAYMENT.BKASH}</button>
            <button id="bill-nagad" class="method-btn" onclick="selectBillingMethod('Nagad')">💳 Nagad<br>${PAYMENT.NAGAD}</button>
          </div>
          <div style="background:#c2185b;border-radius:12px;padding:15px;color:#fff;margin:12px">
            <h4 id="billTitle" style="text-align:center;margin:0 0 10px 0">bKash দিয়ে 300 টাকা পাঠাও</h4>
            <input id="trxIdBill" placeholder="Transaction ID দিন" style="background:#fff;color:#000">
            <div style="margin-top:10px;font-size:12px">
              <div>Number: <b style="background:#ffeb3b;color:#000;padding:2px 6px;border-radius:3px" id="billNumber">${PAYMENT.BKASH}</b> <button onclick="copyBillNumber()" style="background:#fff;color:#c2185b;border:none;padding:4px 8px;border-radius:4px;font-size:11px">📋 Copy</button></div>
              <div style="margin-top:6px">Amount: <b style="color:#ffeb3b">৳ ${PAYMENT.AMOUNT} / 30 Days</b></div>
            </div>
            <input id="payerNumBill" placeholder="যে Number থেকে পাঠাইছো" style="margin-top:10px;background:#fff;color:#000">
          </div>
          <button style="width:94%;padding:14px;border:none;border-radius:8px;background:#7b1a2e;color:#fff;font-weight:bold;margin:15px auto;display:block;font-size:16px" onclick="submitBillingPayment()">ভেরিফাই - Pending হবে, Owner Approve করবে</button>
          <p style="text-align:center;font-size:11px;color:#888">Last Trx: ${u.payment.trxId||'No Payment'} | Method: ${u.payment.method||''} | Status: ${payStatus}</p>
        `}
      </div>
    </div>

    <div id="sec-settings" class="koyeb-section"><div class="card"><h3>⚙️ Settings / Danger Zone</h3><input value="${displayName}" disabled><input value="${isOwner?'Lifetime Free - Owner - No Payment':'30 Days Trial - 300 Taka After'}" disabled><div style="display:flex;gap:8px;margin-top:10px"><button style="flex:1;background:#22c55e;color:#fff;border:none;padding:12px;border-radius:10px">🔄 Restart</button><button style="flex:1;background:#0ea5e9;color:#fff;border:none;padding:12px;border-radius:10px">⏸️ Pause</button></div><div style="background:#ff000022;border:1px solid #ff4444;padding:12px;border-radius:10px;margin-top:15px"><b style="color:#ff4444">🚨 Danger Zone</b><br><button style="background:#ff4444;color:#fff;border:none;padding:10px 20px;border-radius:8px;margin-top:8px;width:100%">🗑️ Delete Service</button></div></div></div>

  </div>
  <script>
  function showSection(id){ document.querySelectorAll('.koyeb-section').forEach(s=>s.classList.remove('active')); document.querySelectorAll('.sidebar a').forEach(a=>a.classList.remove('active')); document.getElementById('sec-'+id).classList.add('active'); document.getElementById('nav-'+id)?.classList.add('active'); }
  function shareHostingLink(){ const link="${LINKS.HOSTING_LINK}"; try{ navigator.clipboard.writeText(link); }catch(e){} alert("✅ Copied: "+link); window.open(link,"_blank"); }
  let billingMethod='bKash'; let billBkash='${PAYMENT.BKASH}'; let billNagad='${PAYMENT.NAGAD}';
  function selectBillingMethod(m){ billingMethod=m; document.getElementById('bill-bkash')?.classList.remove('active'); document.getElementById('bill-nagad')?.classList.remove('active'); if(m==='bKash'){ document.getElementById('bill-bkash')?.classList.add('active'); document.getElementById('billTitle').innerText='bKash দিয়ে 300 টাকা পাঠাও'; document.getElementById('billNumber').innerText=billBkash; } else { document.getElementById('bill-nagad')?.classList.add('active'); document.getElementById('billTitle').innerText='Nagad দিয়ে 300 টাকা পাঠাও'; document.getElementById('billNumber').innerText=billNagad; } }
  function copyBillNumber(){ let n=document.getElementById('billNumber')?.innerText; if(n){ navigator.clipboard.writeText(n); alert('Copied '+n) } }
  function submitBillingPayment(){ const trx=document.getElementById("trxIdBill").value.trim(); const num=document.getElementById("payerNumBill").value.trim(); if(!trx||!num) return alert("TrxID + Number দাও!"); fetch("/api/submit-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",trxId:trx,payerNum:num,method:billingMethod})}).then(r=>r.json()).then(d=>{ alert(d.msg); location.reload() }) }
  function deployGithub(){ const n=document.getElementById("ghName").value; const r=document.getElementById("ghRepo").value; const br=document.getElementById("ghBranch").value||"main"; const st=document.getElementById("ghStart").value||"npm start"; if(!n||!r) return alert("Name+Repo দাও!"); fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",name:n,token:r,branch:br,startCmd:st})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()}) }
  function pairNow(id){ const el=document.getElementById("pair-"+id); el.innerText="Generating..."; fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({number:"8801636487523"})}).then(r=>r.json()).then(d=>{ el.innerText="Code: "+d.pairCode; el.dataset.code=d.pairCode; }) }
  function copyPairCode(id){ const el=document.getElementById("pair-"+id); const code=el.dataset.code; if(!code) return alert("আগে Pair চাপো!"); navigator.clipboard.writeText(code); alert("Copied: "+code); }
  function deleteBot(id){ if(!confirm("Delete করবা?")) return; fetch("/api/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",id:id})}).then(()=>location.reload()) }
  <\/script></body></html>`;
  res.send(html);
});

app.post('/api/deploy',(req,res)=>{ let email=(req.body.email||"").toLowerCase(); let u=db.users[email]; let isOwner=isOwnerEmail(email); if(!u){ u={email,plan:isOwner?"OWNER-LIFETIME-FREE":"FREE_30_DAYS",start:Date.now(),end:Date.now()+(isOwner?100*365:PAYMENT.FREE_DAYS)*24*60*60*1000,bots:[],payment:{},isPaid:isOwner}; db.users[email]=u; } const newId=Date.now().toString(); const slug=req.body.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+"-"+newId.slice(-4); u.bots.push({id:newId,slug:slug,name:req.body.name,token:req.body.token,branch:req.body.branch||"main",startCmd:req.body.startCmd||"npm start"}); save(); res.json({msg: isOwner ? "✅ Deployed! Owner Lifetime Free! LIVE: https://pawar-vip-hosting.vercel.app/bot/"+slug : "✅ Deployed! 30 Days Free Trial Active! LIVE: https://pawar-vip-hosting.vercel.app/bot/"+slug}); });
app.post('/api/submit-payment',(req,res)=>{ let email=(req.body.email||"").toLowerCase(); let u=db.users[email]; if(!u){ u={email,plan:"FREE_30_DAYS",start:Date.now(),end:Date.now()+PAYMENT.FREE_DAYS*24*60*60*1000,bots:[],payment:{},isPaid:false}; db.users[email]=u; } if(isOwnerEmail(email)){ return res.json({msg:"👑 Owner - তুমি Lifetime Free! তোমার Payment লাগবে না!"}); } u.payment={trxId:req.body.trxId,payerNum:req.body.payerNum,method:req.body.method||'bKash',time:Date.now(),status:"PENDING"}; save(); res.json({msg:"✅ Payment Submitted! "+req.body.method+" - Pending! Owner Approve করবে!"}); });
app.post('/api/delete',(req,res)=>{ let u=db.users[(req.body.email||"").toLowerCase()]; if(u){ u.bots=u.bots.filter(b=> b.id!==req.body.id); save(); } res.json({ok:true}); });
module.exports=app;
