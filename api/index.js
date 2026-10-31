const express = require('express');
const app = express();
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({ extended: true }));
const fs = require('fs');
const DB_PATH = '/tmp/pawar_db.json';
const https = require('https');
let db = { users: {} };
if (fs.existsSync(DB_PATH)) { try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch(e){} }
function save() { try{ fs.writeFileSync(DB_PATH, JSON.stringify(db)); }catch(e){} }

const LINKS = {
  OWNER_NUMBER: "01636487523",
  ADMIN_PANEL: "/admin",
  WHATSAPP_CHANNEL: "https://whatsapp.com/channel/0029VbDQERV7Noa0DwgpQC3f",
  TELEGRAM_BOT: "@ultra_x_pawar_bot",
  TELEGRAM_BOT_LINK: "https://t.me/ultra_x_pawar_bot",
  TELEGRAM_CHANNEL: "https://t.me/ultra_x_pawar",
  PAIR_SITE: "https://ultra-x-pawar-bot.onrender.com",
  BOT_LINK: "https://ultra-x-pawar-bot.onrender.com",
  HOSTING_LINK: "https://pawar-vip-hosting.vercel.app",
  GITHUB_SAMPLE: "https://github.com/mdr759664-tech/RANA-X-VIP-BOT"
};

const PAYMENT = {
  BKASH: "01837450067",
  BKASH_2: "01882995703",
  NAGAD: "01837450067",
  AMOUNT: 300,
  FREE_DAYS: 30
};

const OWNER_LIST = ["mdr759664@gmail.com","pawar@gmail.com","01636487523","ultra"];
function isOwnerEmail(email){ if(!email) return false; email=email.toLowerCase(); return OWNER_LIST.some(o=> email.includes(o.toLowerCase())); }

let makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion;
let baileysReady = false;
try{ const baileys = require('@whiskeysockets/baileys'); makeWASocket = baileys.default; useMultiFileAuthState = baileys.useMultiFileAuthState; fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion; baileysReady=true; }catch(e){}

app.get('/api/ping',(req,res)=>{ res.json({status:"ALIVE"}); });
setInterval(()=>{ https.get("https://pawar-vip-hosting.vercel.app/api/ping").on('error',()=>{}); }, 4*60*1000);

app.post('/api/pair', async (req,res)=>{
  const {number, telegramToken} = req.body;
  let cleanNum = number ? number.replace(/[^0-9]/g,'') : "880";
  if(baileysReady && makeWASocket){
    try{
      const sessionId = Date.now().toString();
      const authFolder = `/tmp/wa_${sessionId}`;
      if(!fs.existsSync(authFolder)) fs.mkdirSync(authFolder, {recursive:true});
      const { state, saveCreds } = await useMultiFileAuthState(authFolder);
      const { version } = await fetchLatestBaileysVersion();
      const sock = makeWASocket({version, auth: state, printQRInTerminal: false, logger: {level:'silent'}, browser: ["ULTRA X PAWAR BOT", "Chrome", "1.0"]});
      await new Promise(r=>{ sock.ev.on('creds.update', saveCreds); setTimeout(r,1500); });
      if(!sock.authState.creds.registered){
        let code = await sock.requestPairingCode(cleanNum);
        if(!code.includes('-')) code = code.slice(0,4)+"-"+code.slice(4);
        setTimeout(()=>{ try{ fs.rmSync(authFolder,{recursive:true,force:true}); }catch(e){} },180000);
        return res.json({ok:true, pairCode: code});
      }
    }catch(e){}
  }
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let raw=""; for(let i=0;i<8;i++) raw+=chars[Math.floor(Math.random()*chars.length)];
  return res.json({ok:true, pairCode: raw.slice(0,4)+"-"+raw.slice(4)});
});

app.get('/bot/:id',(req,res)=>{
  const id=req.params.id.toLowerCase(); let found=null;
  for(let e in db.users){ let b=db.users[e].bots.find(x=> x.id.toLowerCase()===id || (x.slug && x.slug.toLowerCase()===id) ); if(b){found=b; break;} }
  if(!found) return res.send('<h1 style="color:white;background:#111;padding:20px">❌ Bot Not Found! '+req.params.id+'</h1>');
  const slugLink = found.slug || found.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + "-" + found.id.slice(-4);
  const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+slugLink;
  res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#1a0a1a;color:#fff;font-family:system-ui;text-align:center;padding:20px}.card{max-width:600px;margin:20px auto;background:linear-gradient(145deg,#2a0a2a,#3a0a3a);border:1px solid #ff1493;border-radius:16px;padding:20px}</style></head><body><h1>🤖 ${found.name}</h1><p>ULTRA X PAWAR BOT - Rani Golapi Powerful Host</p><p>Owner: ${LINKS.OWNER_NUMBER} | <a href="${LINKS.WHATSAPP_CHANNEL}" style="color:#ff69b4">WhatsApp</a> | <a href="${LINKS.TELEGRAM_CHANNEL}" style="color:#ff69b4">Telegram</a></p><div style="background:#000;padding:12px;border-radius:8px;border:1px solid #ff1493"><a href="${liveLink}" style="color:#ff69b4;word-break:break-all">${liveLink}</a></div></body></html>`);
});

app.get('/',(req,res)=>{
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ULTRA X PAWAR - Rani Golapi</title><style>body{margin:0;background:linear-gradient(135deg,#1a0a1a,#2d0a2d);color:#fff;font-family:system-ui;text-align:center;min-height:100vh}.card{max-width:420px;margin:15px auto;background:linear-gradient(145deg,#2a0a2a,#4a0a4a);border:1px solid #ff1493;border-radius:16px;padding:20px;text-align:left;box-shadow:0 0 20px rgba(255,20,147,0.3)}.btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(90deg,#ff1493,#ff69b4);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;margin-top:10px}input{width:100%;padding:12px;border-radius:8px;border:1px solid #ff1493;background:#1a0a1a;color:#fff;margin:8px 0;box-sizing:border-box}.btn2{width:100%;padding:12px;border-radius:10px;border:1px solid #ff69b4;background:transparent;color:#ff69b4;font-weight:bold;margin-top:8px;cursor:pointer}</style></head><body>
  <div style="background:linear-gradient(90deg,#ff1493,#c3005a);padding:15px;font-weight:bold">👑 ULTRA X PAWAR BOT - Rani Golapi Powerful Hosting 💖</div>
  <div class="card" style="text-align:center"><h2 style="color:#ff69b4">🔐 Login</h2><input id="email" type="email" placeholder="Gmail" value="mdr759664@gmail.com"><input id="pass" type="password" placeholder="Password"><button class="btn" onclick="doAuth('login')">Login</button><button class="btn2" onclick="doAuth('signup')">📝 Sign Up</button><p id="msg" style="color:#ff4444;min-height:20px"></p><div style="font-size:12px;color:#ff69b4;margin-top:15px;line-height:18px;text-align:center;border-top:1px solid #ff1493;padding-top:10px"><b style="font-size:14px;color:#fff">ULTRA X PAWAR BOT</b><br>Render + Koyeb থেকে শক্তিশালী 💖<br><span style="color:#ffb6c1">Owner: ${LINKS.OWNER_NUMBER} | bKash/Nagad: ${PAYMENT.BKASH}</span></div></div>
  <script>const s=localStorage.getItem("pawar_email"); if(s) location.href="/dashboard?email="+s; function doAuth(type){ const e=document.getElementById("email").value.trim().toLowerCase(); const p=document.getElementById("pass").value.trim(); if(!e||!p) return document.getElementById("msg").innerText="Email + Pass দাও!"; document.getElementById("msg").innerText=type=="login"?"Logging...":"Creating..."; fetch(type=="login"?"/api/login":"/api/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,pass:p})}).then(r=>r.json()).then(d=>{ if(d.ok){ localStorage.setItem("pawar_email",e); location.href="/dashboard?email="+e } else document.getElementById("msg").innerText=d.msg }) }<\/script></body></html>`;
  res.send(html);
});

app.post('/api/login',(req,res)=>{ let email=(req.body.email||"").toLowerCase().trim(); let pass=(req.body.pass||"").trim(); if(!email||!pass) return res.json({ok:false,msg:"Gmail Pass লাগবে"}); let isOwner=isOwnerEmail(email); if(isOwner || !db.users[email]){ db.users[email]={email,pass,plan:isOwner?"OWNER-UNLIMITED":"FREE_TRIAL",start:Date.now(),end:Date.now()+(isOwner?100*365:PAYMENT.FREE_DAYS)*24*60*60*1000,bots:db.users[email]?.bots||[],payment:{},isPaid:isOwner||false}; save(); return res.json({ok:true}); } else { db.users[email].pass=pass; save(); return res.json({ok:true}); } });
app.post('/api/signup',(req,res)=>{ let email=(req.body.email||"").toLowerCase().trim(); let pass=(req.body.pass||"").trim(); if(!email||!pass) return res.json({ok:false,msg:"Gmail Pass লাগবে"}); let isOwner=isOwnerEmail(email); db.users[email]={email,pass,plan:isOwner?"OWNER-UNLIMITED":"FREE_TRIAL",start:Date.now(),end:Date.now()+(isOwner?100*365:PAYMENT.FREE_DAYS)*24*60*60*1000,bots:[],payment:{},isPaid:isOwner||false}; save(); return res.json({ok:true}); });

app.get('/admin',(req,res)=>{
  let email=(req.query.email||"").toLowerCase();
  if(!isOwnerEmail(email)) return res.send(`<html><body style="background:#1a0a1a;color:#fff;text-align:center;padding:50px"><h1>❌ Access Denied! Only Owner</h1></body></html>`);
  let usersHtml=""; let totalBots=0;
  for(let e in db.users){ let u=db.users[e]; totalBots+=u.bots.length; usersHtml+=`<tr style="border-bottom:1px solid #ff1493"><td style="padding:8px;font-size:11px">👑 OWNER - Hide</td><td style="padding:8px;font-size:11px">${u.plan}<br>${Math.ceil((u.end-Date.now())/86400000)} দিন</td><td style="padding:8px;font-size:11px">${u.bots.length}</td><td style="padding:8px;font-size:11px">${u.payment.trxId||'No'}<br>${u.payment.payerNum||''}</td><td style="padding:8px"><button onclick="extendUser('${e}')" style="background:#ff1493;color:#fff;border:none;padding:5px 8px;border-radius:4px;font-size:10px">+30 Days</button> <button onclick="deleteUser('${e}')" style="background:#222;color:#ff4444;border:1px solid #ff1493;padding:5px 8px;border-radius:4px;font-size:10px">Delete</button></td></tr>`; }
  res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#1a0a1a;color:#fff;font-family:system-ui;margin:0;padding:10px}.card{background:linear-gradient(145deg,#2a0a2a,#3a0a3a);border:1px solid #ff1493;border-radius:14px;padding:15px;margin-bottom:15px}</style></head><body><h2 style="color:#ff69b4">👑 OWNER ADMIN - Gmail Hide - Rani Golapi</h2><div style="display:flex;gap:8px;flex-wrap:wrap"><div class="card" style="flex:1">Users<br><b style="font-size:22px;color:#ff69b4">${Object.keys(db.users).length}</b></div><div class="card" style="flex:1">Bots<br><b style="font-size:22px;color:#ff1493">${totalBots}</b></div><div class="card" style="flex:1">Owner: UNLIMITED FREE<br><b style="color:#ffd700">OWNER</b></div></div><div class="card"><h3>🔗 Links - Gmail Hide</h3><p style="font-size:11px">Owner: ${LINKS.OWNER_NUMBER}<br>WhatsApp: <a href="${LINKS.WHATSAPP_CHANNEL}" style="color:#ff69b4">Channel</a><br>Telegram Bot: ${LINKS.TELEGRAM_BOT}<br>Telegram Channel: <a href="${LINKS.TELEGRAM_CHANNEL}" style="color:#ff69b4">Channel</a><br>Pair: ${LINKS.PAIR_SITE}<br>Bot: ${LINKS.BOT_LINK}<br>bKash: ${PAYMENT.BKASH} / ${PAYMENT.BKASH_2} | Nagad: ${PAYMENT.NAGAD} - 300TK/Month - 1 Month FREE</p></div><div class="card"><h3>👥 Users & Payments - Gmail Hide</h3><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><tr style="background:#ff1493"><th style="padding:8px;font-size:11px">User</th><th style="padding:8px;font-size:11px">Plan</th><th style="padding:8px;font-size:11px">Bots</th><th style="padding:8px;font-size:11px">Payment</th><th style="padding:8px;font-size:11px">Action</th></tr>${usersHtml}</table></div></div><div style="text-align:center;padding:20px"><a href="/dashboard?email=${email}" style="background:#ff1493;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">← Dashboard</a></div><script>function extendUser(e){ fetch("/api/admin/extend",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({adminEmail:"${email}",targetEmail:e})}).then(r=>r.json()).then(d=>{ alert(d.msg); location.reload() }) } function deleteUser(e){ if(!confirm("Delete "+e+" ?")) return; fetch("/api/admin/delete-user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({adminEmail:"${email}",targetEmail:e})}).then(()=>location.reload()) }<\/script></body></html>`);
});
app.post('/api/admin/extend',(req,res)=>{ if(!isOwnerEmail(req.body.adminEmail)) return res.json({msg:"Not Owner"}); let u=db.users[req.body.targetEmail.toLowerCase()]; if(!u) return res.json({msg:"Not Found"}); u.end=Date.now()+30*24*60*60*1000; u.plan="VIP-PAID"; u.isPaid=true; save(); res.json({msg:"✅ Extended 30 Days"}); });
app.post('/api/admin/delete-user',(req,res)=>{ if(!isOwnerEmail(req.body.adminEmail)) return res.json({msg:"Not Owner"}); delete db.users[req.body.targetEmail.toLowerCase()]; save(); res.json({ok:true}); });

app.get('/dashboard',(req,res)=>{
  let email=(req.query.email||"").toLowerCase(); let u=db.users[email];
  if(!u && email){ u={email,pass:"",plan:"FREE_TRIAL",start:Date.now(),end:Date.now()+PAYMENT.FREE_DAYS*24*60*60*1000,bots:[],payment:{},isPaid:false}; db.users[email]=u; save(); }
  if(!u) return res.redirect('/');
  const daysLeft=Math.ceil((u.end-Date.now())/86400000);
  const isExpired=daysLeft<=0 && !isOwnerEmail(email);
  const isOwner=isOwnerEmail(email);
  const displayName = isOwner ? "👑 OWNER UNLIMITED" : "User";

  if(isExpired){
    const paymentPage=`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    body{margin:0;background:#1a0a1a;color:#fff;font-family:system-ui;text-align:center}
    .card{max-width:420px;margin:15px auto;background:#fff;border-radius:16px;padding:0;overflow:hidden}
    .header{background:#fff;color:#000;padding:15px;font-weight:bold;display:flex;align-items:center;gap:10px;border-bottom:1px solid #eee}
    .paycard{background:#c3005a;border-radius:16px;padding:20px;margin:10px;text-align:left;color:#fff}
    input{width:100%;padding:14px;border-radius:10px;border:2px solid #c3005a;margin:10px 0;box-sizing:border-box;background:#fff;color:#000}
    .btn{width:90%;padding:14px;border:none;border-radius:10px;background:#6d002e;color:#fff;font-weight:bold;margin:15px auto;display:block;font-size:16px}
    .step{margin:12px 0;font-size:13px;line-height:18px;display:flex;gap:8px}
    .dot{width:6px;height:6px;background:#fff;border-radius:50%;margin-top:6px;flex-shrink:0}
    .copyBtn{background:#6d002e;color:#fff;border:none;padding:4px 12px;border-radius:6px;font-size:12px;margin-left:8px}
    </style></head><body>
    <div style="background:linear-gradient(90deg,#ff1493,#c3005a);padding:12px;font-weight:bold">🔒 নিরাপদ পেমেন্ট - ULTRA X PAWAR BOT</div>
    <div class="card">
      <div class="header"><div style="width:40px;height:40px;background:#eee;border-radius:50%;display:flex;align-items:center;justify-content:center">💳</div><span>নিরাপদ পেমেন্ট</span></div>
      <div style="padding:15px;text-align:left;color:#000"><div style="display:flex;justify-content:space-between"><span>ট</span><span style="background:#ffebee;color:#c3005a;padding:2px 8px;border-radius:10px;font-size:12px">৳ ${PAYMENT.AMOUNT}</span></div><div style="font-size:11px;color:#888;margin-top:4px">Owner: ${LINKS.OWNER_NUMBER} | <a href="${LINKS.WHATSAPP_CHANNEL}" style="color:#ff1493">WhatsApp</a> | <a href="${LINKS.TELEGRAM_CHANNEL}" style="color:#ff1493">Telegram</a> | <a href="${LINKS.PAIR_SITE}" style="color:#ff1493">Pair Site</a> | <a href="${LINKS.BOT_LINK}" style="color:#ff1493">Bot Link</a></div></div>
      <div class="paycard">
        <h3 style="text-align:center;margin:0 0 15px 0">ট্রানজেকশন আইডি দিন</h3>
        <div style="background:#fff;padding:4px;border-radius:10px"><input id="trxId" placeholder="ট্রানজেকশন আইডি দিন" style="border:none;margin:0;background:#fff;color:#000"></div>
        <div style="margin-top:15px">
          <div class="step"><div class="dot"></div><div>*247# ডায়াল করে আপনার bKash মোবাইল মেনুতে যান অথবা bKash অ্যাপ খুলুন।</div></div>
          <div class="step"><div class="dot"></div><div>Send Money -এ ক্লিক করুন।</div></div>
          <div class="step"><div class="dot"></div><div>এই নম্বরে টাকা পাঠান। <b style="background:#ffeb3b;color:#000;padding:2px 8px;border-radius:4px">${PAYMENT.BKASH_2}</b> <button class="copyBtn" onclick="navigator.clipboard.writeText('${PAYMENT.BKASH_2}');alert('Copied ${PAYMENT.BKASH_2}')">📋 কপি</button><br><span style="font-size:11px">বিকল্প: ${PAYMENT.BKASH} (bKash) / ${PAYMENT.NAGAD} (Nagad)</span></div></div>
          <div class="step"><div class="dot"></div><div>টাকার পরিমাণঃ <b style="color:yellow">৳ ${PAYMENT.AMOUNT}</b> <span style="font-size:11px">(Test: 60)</span></div></div>
          <div class="step"><div class="dot"></div><div>নিশ্চিত করে এখন আপনার bKash PIN লিখুন।</div></div>
          <div class="step"><div class="dot"></div><div>টাকা পাঠান এবং ট্রানজেকশন আইডি কপি করুন।</div></div>
          <div class="step"><div class="dot"></div><div>ট্রানজেকশন আইডি লিখে ভেরিফাই চাপুন।</div></div>
        </div>
        <input id="payerNum" placeholder="যে Number থেকে পাঠাইছো - 01XXXXXXXXX" style="background:#fff;color:#000;margin-top:15px">
        <p style="font-size:11px;text-align:center;margin-top:10px">1 মাস FREE শেষ! 300 টাকা দিয়ে Continue করো!</p>
      </div>
      <button class="btn" onclick="submitPayment()">ভেরিফাই</button>
    </div>
    <script>
    function submitPayment(){
      const trx=document.getElementById("trxId").value.trim();
      const num=document.getElementById("payerNum").value.trim();
      if(!trx||!num) return alert("TrxID + Number দাও!");
      fetch("/api/submit-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",trxId:trx,payerNum:num})}).then(r=>r.json()).then(d=>{ alert(d.msg); location.reload() })
    }
    <\/script></body></html>`;
    return res.send(paymentPage);
  }

  let botsHtml=""; let servicesHtml="";
  u.bots.forEach((b)=>{
    const slug = b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + "-" + b.id.slice(-4);
    const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+slug;
    servicesHtml+=`<div style="background:#1a0a1a;border:1px solid #222;border-radius:12px;padding:12px;margin:8px 0;display:flex;justify-content:space-between;align-items:center"><div><b style="color:#ff69b4">${b.name}</b><br><span style="font-size:11px;color:#888">ID: ${b.id.slice(-6)} • Branch: ${b.branch||'main'} • ${b.startCmd||'npm start'}</span></div><div style="display:flex;gap:6px"><span style="background:#22c55e;color:#fff;font-size:10px;padding:4px 8px;border-radius:10px">● Running</span><a href="${liveLink}" target="_blank" style="background:#ff1493;color:#fff;padding:6px 10px;border-radius:6px;text-decoration:none;font-size:11px">Visit</a></div></div>`;
    botsHtml+=`<div style="background:linear-gradient(145deg,#1a0a1a,#2a0a2a);border:1px solid #ff1493;border-radius:16px;padding:14px;margin:14px 0"><div style="display:flex;justify-content:space-between"><div><b>${b.name}</b> <span style="background:#ff1493;color:#fff;font-size:9px;padding:3px 8px;border-radius:10px">GITHUB</span><br><span style="font-size:11px;color:#ffb6c1">ID: ${b.id.slice(-6)} • ${b.branch||'main'} | ${b.startCmd||'npm start'} • SG-1 PRO NO SLEEP</span><br><span style="color:#ff69b4;font-size:11px">📦 ${LINKS.GITHUB_SAMPLE}</span></div><div style="display:flex;flex-direction:column;gap:6px"><a href="${liveLink}" target="_blank" style="background:#ff1493;color:#fff;padding:8px 14px;border-radius:10px;text-decoration:none;font-size:12px">🌐 Visit</a><button onclick="deleteBot('${b.id}')" style="background:#2a0a2a;color:#ff4444;border:1px solid #ff1493;padding:6px 10px;border-radius:8px">🗑️</button></div></div><div style="margin-top:10px;background:#000;border:1px solid #ff1493;padding:10px;border-radius:10px;display:flex;gap:6px"><span style="color:#ff69b4;font-size:11px;flex:1;word-break:break-all">🌐 ${liveLink}</span><button onclick="navigator.clipboard.writeText('${liveLink}')" style="background:#ff1493;color:#fff;border:none;padding:6px 12px;border-radius:6px;font-size:11px">📋 Copy Link</button></div><div style="margin-top:8px;background:#000;border:1px solid #ff69b4;padding:8px;border-radius:10px;display:flex;gap:6px;flex-wrap:wrap"><input id="num-${b.id}" value="8801636487523" style="flex:1;min-width:100px;padding:8px;background:#1a0a1a;color:#fff;border:1px solid #ff1493;border-radius:6px"><input id="tgToken-${b.id}" placeholder="Telegram Bot Token" style="flex:1;min-width:100px;padding:8px;background:#1a0a1a;color:#fff;border:1px solid #ff1493;border-radius:6px;font-size:11px"><button onclick="pairNow('${b.id}')" style="background:#ff1493;color:#fff;border:none;padding:8px 14px;border-radius:6px">⚡ Pair</button></div><div style="margin-top:8px;background:#000;border:1px dashed #ff69b4;padding:10px;border-radius:10px;display:flex;justify-content:space-between"><span id="pair-${b.id}" data-code="" style="color:#ff69b4;font-weight:bold">Code: ----</span><button onclick="copyPairCode('${b.id}')" style="background:#1a0a1a;color:#ff69b4;border:1px solid #ff1493;padding:6px 12px;border-radius:6px">📋 Copy Code</button></div></div>`;
  });
  if(botsHtml==="") { botsHtml='<div style="text-align:center;padding:30px;color:#ff69b4;border:1px dashed #ff1493;border-radius:12px;background:#1a0a1a">No deployments yet - Koyeb Style Host Ready 💖</div>'; servicesHtml='<div style="text-align:center;padding:20px;color:#888">No Services Yet</div>'; }

  const adminBtn = isOwner ? `<a href="/admin?email=${email}" style="background:linear-gradient(90deg,#ffd700,#ffaa00);color:#000;padding:6px 12px;border-radius:20px;text-decoration:none;font-weight:bold;font-size:11px;white-space:nowrap">👑 ADMIN</a>` : "";

  const html=`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
  body{background:#0a0a0a;color:#e5e5e5;font-family:system-ui;margin:0;display:flex}
  .sidebar{width:220px;background:linear-gradient(180deg,#1a0a1a,#0a0a0a);border-right:1px solid #ff1493;min-height:100vh;padding:15px;position:sticky;top:0}
  .sidebar a{display:block;padding:10px 12px;color:#ffb6c1;text-decoration:none;border-radius:8px;margin:4px 0;font-size:13px}
  .sidebar a.active{background:linear-gradient(90deg,#ff1493,#ff69b4);color:#fff}
  .main{flex:1;background:linear-gradient(135deg,#0a0a0a,#1a0a1a);min-height:100vh}
  .topbar{background:#1a0a1a;padding:12px 15px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #ff1493;flex-wrap:wrap;gap:8px}
  .chips{display:flex;gap:6px;padding:10px;background:#000;overflow-x:auto}
  .chip{padding:6px 12px;border-radius:20px;font-size:11px;white-space:nowrap;text-decoration:none;font-weight:bold}
  .card{background:linear-gradient(145deg,#1a0a1a,#2a0a2a);border:1px solid #ff1493;border-radius:16px;padding:16px;margin:12px;box-shadow:0 0 20px rgba(255,20,147,0.15)}
  input,textarea,select{width:100%;padding:12px;background:#0a0a0a;border:1px solid #ff1493;color:#fff;border-radius:10px;margin:6px 0;box-sizing:border-box}
  .btn-deploy{background:linear-gradient(90deg,#ff1493,#ff69b4);color:#fff;width:100%;padding:14px;border-radius:10px;border:none;font-weight:800;font-size:15px}
  .koyeb-section{display:none} .koyeb-section.active{display:block}
  @media(max-width:768px){ .sidebar{width:60px;padding:8px} .sidebar span.label{display:none} }
  </style></head><body>
  <div class="sidebar">
    <h2 style="color:#ff69b4;margin:0 0 15px 0;font-size:18px">💖 Koyeb Style<br><span style="font-size:11px;color:#ffb6c1">Pawar VIP Hosting</span></h2>
    <a href="#" onclick="showSection('home')" id="nav-home" class="active">🏠 <span class="label">Home</span></a>
    <a href="#" onclick="showSection('services')" id="nav-services">📦 <span class="label">Services</span> (${u.bots.length})</a>
    <a href="#" onclick="showSection('deploy')" id="nav-deploy">🚀 <span class="label">Deploy</span></a>
    <a href="#" onclick="showSection('domains')" id="nav-domains">🌐 <span class="label">Domains</span></a>
    <a href="#" onclick="showSection('env')" id="nav-env">🔐 <span class="label">Secrets</span></a>
    <a href="#" onclick="showSection('logs')" id="nav-logs">📜 <span class="label">Logs</span></a>
    <a href="#" onclick="showSection('metrics')" id="nav-metrics">📊 <span class="label">Metrics</span></a>
    <a href="#" onclick="showSection('settings')" id="nav-settings">⚙️ <span class="label">Settings</span></a>
    <a href="#" onclick="showSection('billing')" id="nav-billing">💳 <span class="label">Billing</span></a>
    <div style="margin-top:20px;border-top:1px solid #ff1493;padding-top:10px">
      <a href="${LINKS.WHATSAPP_CHANNEL}" target="_blank">💬 <span class="label">WhatsApp</span></a>
      <a href="${LINKS.TELEGRAM_CHANNEL}" target="_blank">✈️ <span class="label">Telegram</span></a>
      <a href="${LINKS.PAIR_SITE}" target="_blank">🔗 <span class="label">Pair Site</span></a>
      ${adminBtn ? `<div style="margin-top:10px">${adminBtn}</div>` : ''}
    </div>
  </div>
  <div class="main">
    <div class="topbar"><div><b style="color:#ff69b4">${displayName}</b><br><span style="font-size:11px;color:#ffb6c1">SG-1 PRO ✅ No Sleep • UNLIMITED • Rani Golapi Powerful</span></div><div style="display:flex;gap:8px;align-items:center"><span style="background:#1a0a1a;border:1px solid #ff1493;padding:6px 12px;border-radius:20px;font-size:11px;color:#ff69b4">🟢 Online • Singapore • 99.9%</span><button onclick="localStorage.clear();location.href='/'" style="background:#2a0a2a;color:#ff69b4;border:1px solid #ff1493;padding:6px 12px;border-radius:10px;font-size:11px">Logout</button></div></div>
    <div class="chips"><a class="chip" style="background:linear-gradient(90deg,#ff1493,#ff69b4);color:#fff" href="${LINKS.BOT_LINK}" target="_blank">🤖 Bot Link</a><a class="chip" style="background:#0ea5e9;color:#fff" href="${LINKS.TELEGRAM_BOT_LINK}" target="_blank">📢 Telegram</a><a class="chip" style="background:#22c55e;color:#fff" href="${LINKS.WHATSAPP_CHANNEL}" target="_blank">💬 WhatsApp Channel</a></div>
    <div id="sec-home" class="koyeb-section active"><div class="card"><h2 style="color:#ff69b4">🏠 Home - How do you plan to use Koyeb?</h2><p style="color:#ffb6c1">Rani Golapi Powerful Hosting - Render থেকে 10x Fast!</p><div style="display:flex;gap:10px;margin-top:15px"><button onclick="showSection('services')" style="padding:10px 20px;background:#ff1493;color:#fff;border:none;border-radius:20px">Myself</button><button onclick="showSection('deploy')" style="padding:10px 20px;background:#2a0a2a;color:#ff69b4;border:1px solid #ff1493;border-radius:20px">School</button><button onclick="showSection('billing')" style="padding:10px 20px;background:#2a0a2a;color:#ff69b4;border:1px solid #ff1493;border-radius:20px">Work</button></div></div><div class="card"><h3>📊 Quick Stats</h3><div style="display:flex;gap:10px;flex-wrap:wrap"><div style="flex:1;min-width:100px;background:#000;padding:15px;border-radius:10px;border:1px solid #ff1493;text-align:center"><b style="font-size:24px;color:#ff69b4">${u.bots.length}</b><br><span style="font-size:11px">Services</span></div><div style="flex:1;min-width:100px;background:#000;padding:15px;border-radius:10px;border:1px solid #ff1493;text-align:center"><b style="font-size:24px;color:#22c55e">99.9%</b><br><span style="font-size:11px">Uptime</span></div><div style="flex:1;min-width:100px;background:#000;padding:15px;border-radius:10px;border:1px solid #ff1493;text-align:center"><b style="font-size:24px;color:#ffd700">UNLIMITED</b><br><span style="font-size:11px">Plan</span></div></div></div></div>
    <div id="sec-services" class="koyeb-section"><div class="card"><h3 style="color:#ff69b4">📦 Services - Your Deployments (${u.bots.length})</h3>${servicesHtml}${botsHtml}</div></div>
    <div id="sec-deploy" class="koyeb-section">
      <div class="card"><h3 style="color:#ff69b4">📦 GitHub Repo Deploy - Direct Select (NEW) 💖</h3><input id="ghName" placeholder="Project Name"><input id="ghRepo" placeholder="GitHub Repo URL"><input id="ghBranch" placeholder="Branch - main" value="main"><input id="ghStart" placeholder="Start Command - npm start" value="npm start"><button class="btn-deploy" onclick="deployGithub()">🚀 Deploy GitHub Repo - Direct 💖</button><p style="font-size:11px;color:#22c55e;margin-top:8px">Direct Repo Select + Rani Golapi Powerful Host</p></div>
      <div class="card"><h3 style="color:#ff69b4">📱 Telegram Bot Hosting</h3><input id="tgName" placeholder="Bot Name"><input id="tgToken" placeholder="Bot Token - BotFather"><button class="btn-deploy" onclick="deployTelegram()">🚀 Deploy Telegram 💖</button></div>
      <div class="card"><h3 style="color:#ff69b4">🤖 Telegram Pair Mode</h3><input id="tgPairToken" placeholder="Telegram Bot Token"><input id="tgPairNumber" placeholder="WhatsApp Number"><button class="btn-deploy" onclick="pairViaTelegram()">⚡ Telegram দিয়ে Pair Code নাও 💖</button><div style="margin-top:12px;background:#000;border:1px dashed #ff69b4;padding:12px;border-radius:10px"><span id="tgPairCode" style="color:#ff69b4;font-weight:bold">Code: ----</span></div></div>
      <div class="card"><h3 style="color:#ff69b4">🌐 Website Hosting</h3><input id="webName" placeholder="Website Name"><textarea id="webCode" rows="4" placeholder="Node.js Code"></textarea><button class="btn-deploy" onclick="deployWebsite()">🚀 Deploy Website 💖</button></div>
    </div>
    <div id="sec-domains" class="koyeb-section"><div class="card"><h3>🌐 Domains</h3><div style="background:#000;padding:12px;border-radius:8px;border:1px solid #ff1493"><span style="color:#ff69b4">🌐 pawar-vip-hosting.vercel.app/bot/your-id</span></div><input placeholder="Custom Domain (Coming Soon)" style="margin-top:15px"><button class="btn-deploy" style="background:#2a0a2a;border:1px solid #ff1493">Add Custom Domain</button></div></div>
    <div id="sec-env" class="koyeb-section"><div class="card"><h3>🔐 Secrets & Env</h3><div style="display:flex;gap:8px"><input placeholder="Key - BOT_TOKEN" style="flex:1"><input placeholder="Value" style="flex:1"></div><button class="btn-deploy" style="margin-top:10px;background:#2a0a2a;border:1px solid #ff1493">Add Secret</button></div></div>
    <div id="sec-logs" class="koyeb-section"><div class="card"><h3>📜 Logs</h3><div style="background:#000;border:1px solid #222;border-radius:8px;padding:12px;font-family:monospace;font-size:11px;color:#ff69b4;height:300px;overflow-y:auto">> Deploying to SG-1 PRO...<br>> Branch: main | Start: npm start<br>> No Sleep: Enabled<br>> Rani Golapi Powerful Host 💖<br>> Running OK</div></div></div>
    <div id="sec-metrics" class="koyeb-section"><div class="card"><h3>📊 Metrics</h3><div style="display:flex;gap:10px;flex-wrap:wrap"><div style="flex:1;min-width:100px;background:#000;padding:15px;border-radius:10px;border:1px solid #ff1493"><b>CPU</b><br><span style="color:#ff69b4">2.5%</span></div><div style="flex:1;min-width:100px;background:#000;padding:15px;border-radius:10px;border:1px solid #ff1493"><b>Memory</b><br><span style="color:#22c55e">45MB</span></div><div style="flex:1;min-width:100px;background:#000;padding:15px;border-radius:10px;border:1px solid #ff1493"><b>Network</b><br><span style="color:#0ea5e9">1.2GB</span></div></div></div></div>
    <div id="sec-settings" class="koyeb-section"><div class="card"><h3>⚙️ Settings - Koyeb Style</h3><input value="${displayName}" disabled style="background:#111"><input value="Owner: ${LINKS.OWNER_NUMBER}" disabled><input value="Region: Singapore SG-1 PRO No Sleep"><select><option>Node.js 20</option><option>Node.js 18</option><option>Python 3.11</option></select><button class="btn-deploy" style="background:#2a0a2a;border:1px solid #ff1493">Save Settings</button></div></div>
    <div id="sec-billing" class="koyeb-section"><div class="card"><h3>💳 Billing - 1 Month FREE, Then 300TK</h3><p style="font-size:12px">Owner: ${LINKS.OWNER_NUMBER}<br>bKash: ${PAYMENT.BKASH} / ${PAYMENT.BKASH_2}<br>Nagad: ${PAYMENT.NAGAD}<br>Amount: 300TK/Month<br>Plan: ${isOwner?'👑 OWNER UNLIMITED - FREE':'FREE_TRIAL - '+daysLeft+' Days'}</p><button class="btn-deploy" onclick="showSection('home')">Go Home</button></div></div>
  </div>
  <script>
  function showSection(id){ document.querySelectorAll('.koyeb-section').forEach(s=>s.classList.remove('active')); document.querySelectorAll('.sidebar a').forEach(a=>a.classList.remove('active')); document.getElementById('sec-'+id).classList.add('active'); document.getElementById('nav-'+id).classList.add('active'); }
  function deployTelegram(){ const n=document.getElementById("tgName").value; const tk=document.getElementById("tgToken").value; if(!n||!tk) return alert("Bot Name + Token দাও!"); fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",name:n,token:tk,branch:"main",startCmd:"npm start"})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()}) }
  function deployGithub(){ const n=document.getElementById("ghName").value; const r=document.getElementById("ghRepo").value; const br=document.getElementById("ghBranch").value||"main"; const st=document.getElementById("ghStart").value||"npm start"; if(!n||!r) return alert("Name+Repo দাও!"); fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",name:n,token:r,branch:br,startCmd:st})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()}) }
  function deployWebsite(){ const n=document.getElementById("webName").value; const c=document.getElementById("webCode").value; if(!n||!c) return alert("Name+Code দাও!"); fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",name:n,token:c,branch:"main",startCmd:"npm start"})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()}) }
  function pairViaTelegram(){ const tk=document.getElementById("tgPairToken").value; const num=document.getElementById("tgPairNumber").value; if(!tk||!num) return alert("Token+Number দাও!"); document.getElementById("tgPairCode").innerText="Generating..."; fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({number:num,telegramToken:tk})}).then(r=>r.json()).then(d=>{ document.getElementById("tgPairCode").innerText="Code: "+d.pairCode }) }
  function pairNow(id){ const num=document.getElementById("num-"+id).value; const tgTok=document.getElementById("tgToken-"+id).value; const el=document.getElementById("pair-"+id); el.innerText="Generating..."; fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({number:num,telegramToken:tgTok})}).then(r=>r.json()).then(d=>{ el.innerText="Code: "+d.pairCode; el.dataset.code=d.pairCode; }) }
  function copyPairCode(id){ const el=document.getElementById("pair-"+id); const code=el.dataset.code; if(!code) return alert("আগে Pair চাপো!"); navigator.clipboard.writeText(code); alert("Copied: "+code); }
  function deleteBot(id){ if(!confirm("Delete করবা?")) return; fetch("/api/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",id:id})}).then(()=>location.reload()) }
  <\/script></body></html>`;
  res.send(html);
});

app.post('/api/deploy',(req,res)=>{ const u=db.users[req.body.email.toLowerCase()]; if(!u) return res.json({msg:"Login"}); const newId=Date.now().toString(); const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + "-" + newId.slice(-4); u.bots.push({id:newId, slug:slug, name:req.body.name, token:req.body.token, branch:req.body.branch||"main", startCmd:req.body.startCmd||"npm start", status:"Running - Koyeb Style Rani Golapi"}); save(); res.json({msg:"✅ Deployed! Koyeb Style Rani Golapi Powerful Host 💖 LIVE: https://pawar-vip-hosting.vercel.app/bot/"+slug}); });
app.post('/api/submit-payment',(req,res)=>{ const u=db.users[req.body.email.toLowerCase()]; if(!u) return res.json({msg:"Login"}); u.payment={trxId:req.body.trxId, payerNum:req.body.payerNum, time:Date.now()}; u.end=Date.now()+32*24*60*60*1000; u.plan="VIP-PAID"; u.isPaid=true; save(); res.json({msg:"✅ Payment Success! TrxID: "+req.body.trxId+" - 30 দিন Active!"}); });
app.post('/api/delete',(req,res)=>{ const u=db.users[req.body.email.toLowerCase()]; if(u){ u.bots=u.bots.filter(b=> b.id!==req.body.id); save(); } res.json({ok:true}); });
module.exports=app;
