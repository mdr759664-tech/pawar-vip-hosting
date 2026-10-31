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

function isOwnerEmail(email){
  if(!email) return false;
  email=email.toLowerCase();
  return OWNER_LIST.some(o=> email.includes(o.toLowerCase()));
}

let makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion;
let baileysReady = false;
try{
  const baileys = require('@whiskeysockets/baileys');
  makeWASocket = baileys.default;
  useMultiFileAuthState = baileys.useMultiFileAuthState;
  fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
  baileysReady = true;
}catch(e){ baileysReady = false; }

app.get('/api/ping',(req,res)=>{ res.json({status:"ALIVE"}); });
setInterval(()=>{ https.get("https://pawar-vip-hosting.vercel.app/api/ping").on('error',()=>{}); }, 4*60*1000);

app.post('/api/pair', async (req,res)=>{
  const {number} = req.body;
  if(!number) return res.json({ok:false, msg:"Number দাও!"});
  let cleanNum = number.replace(/[^0-9]/g,'');
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
  const id=req.params.id.toLowerCase();
  let found=null;
  for(let e in db.users){
    let b=db.users[e].bots.find(x=> x.id.toLowerCase()===id || (x.slug && x.slug.toLowerCase()===id) );
    if(b){found=b; break;}
  }
  if(!found) return res.send('<h1 style="color:white;background:#111;padding:20px">❌ Bot Not Found! '+req.params.id+'</h1>');
  const slugLink = found.slug || found.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + "-" + found.id.slice(-4);
  const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+slugLink;
  res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>${found.name} - LIVE</title><style>body{background:#080810;color:#fff;font-family:system-ui;text-align:center;padding:20px}.card{max-width:600px;margin:20px auto;background:#15151a;border:1px solid #a855f7;border-radius:16px;padding:20px}</style></head><body><h1>🤖 ${found.name}</h1><p>ULTRA X PAWAR BOT - WhatsApp Bot • Smart • Fast • 24/7 Automated</p><p>Owner: ${LINKS.OWNER_NUMBER} | <a href="${LINKS.WHATSAPP_CHANNEL}" style="color:#00ff88">WhatsApp Channel</a> | <a href="${LINKS.TELEGRAM_CHANNEL}" style="color:#00ff88">Telegram</a> | <a href="${LINKS.PAIR_SITE}" style="color:#00ff88">Pair Site</a></p><div style="background:#000;padding:12px;border-radius:8px;border:1px solid #a855f7;margin-top:15px"><a href="${liveLink}" style="color:#00ff88;word-break:break-all">${liveLink}</a></div></body></html>`);
});

app.get('/',(req,res)=>{
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ULTRA X PAWAR</title><style>body{margin:0;background:#080810;color:#fff;font-family:system-ui;text-align:center}.card{max-width:420px;margin:15px auto;background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid #a855f7;border-radius:16px;padding:20px;text-align:left}.btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(90deg,#a855f7,#ec4899);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;margin-top:10px}input{width:100%;padding:12px;border-radius:8px;border:none;margin:8px 0;box-sizing:border-box}.btn2{width:100%;padding:12px;border-radius:10px;border:1px solid #a855f7;background:transparent;color:#fff;font-weight:bold;margin-top:8px;cursor:pointer}</style></head><body>
  <div style="background:#111;padding:15px;font-weight:bold">👑 ULTRA X PAWAR BOT - WhatsApp Bot • Smart • Fast • 24/7 Automated</div>
  <div class="card" style="text-align:center">
  <h2>🔐 Login</h2>
  <input id="email" type="email" placeholder="Gmail" value="mdr759664@gmail.com">
  <input id="pass" type="password" placeholder="Password">
  <button class="btn" onclick="doAuth('login')">Login</button>
  <button class="btn2" onclick="doAuth('signup')">📝 Sign Up - New Account</button>
  <p id="msg" style="color:#ff4444;min-height:20px"></p>
  <div style="font-size:12px;color:#00ff88;margin-top:15px;line-height:18px;text-align:center;border-top:1px solid #222;padding-top:10px">
  <b style="font-size:14px;color:#fff">ULTRA X PAWAR BOT</b><br>WhatsApp Bot • Smart • Fast • 24/7 Automated<br><span style="color:#888">Owner: ${LINKS.OWNER_NUMBER} | bKash/Nagad: ${PAYMENT.BKASH}</span>
  </div>
  </div>
  <script>
  const s=localStorage.getItem("pawar_email"); if(s) location.href="/dashboard?email="+s;
  function doAuth(type){
    const e=document.getElementById("email").value.trim().toLowerCase();
    const p=document.getElementById("pass").value.trim();
    if(!e||!p) return document.getElementById("msg").innerText="Email + Pass দাও!";
    document.getElementById("msg").innerText=type=="login"?"Logging...":"Creating...";
    fetch(type=="login"?"/api/login":"/api/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,pass:p})}).then(r=>r.json()).then(d=>{ if(d.ok){ localStorage.setItem("pawar_email",e); location.href="/dashboard?email="+e } else document.getElementById("msg").innerText=d.msg }).catch(err=>{ document.getElementById("msg").innerText=err.message })
  }
  </script></body></html>`;
  res.send(html);
});

app.post('/api/login',(req,res)=>{
  let email=(req.body.email||"").toLowerCase().trim(); let pass=(req.body.pass||"").trim();
  if(!email||!pass) return res.json({ok:false,msg:"Gmail Pass লাগবে"});
  let isOwner=isOwnerEmail(email);
  if(isOwner || !db.users[email]){
    db.users[email]={email,pass,plan:isOwner?"OWNER-UNLIMITED":"FREE_TRIAL",start:Date.now(),end:Date.now()+(isOwner?100*365:PAYMENT.FREE_DAYS)*24*60*60*1000,bots:db.users[email]?.bots||[],payment:{},isPaid:isOwner||false};
    save(); return res.json({ok:true});
  } else { db.users[email].pass=pass; save(); return res.json({ok:true}); }
});

app.post('/api/signup',(req,res)=>{
  let email=(req.body.email||"").toLowerCase().trim(); let pass=(req.body.pass||"").trim();
  if(!email||!pass) return res.json({ok:false,msg:"Gmail Pass লাগবে"});
  let isOwner=isOwnerEmail(email);
  db.users[email]={email,pass,plan:isOwner?"OWNER-UNLIMITED":"FREE_TRIAL",start:Date.now(),end:Date.now()+(isOwner?100*365:PAYMENT.FREE_DAYS)*24*60*60*1000,bots:[],payment:{},isPaid:isOwner||false};
  save(); return res.json({ok:true});
});

app.get('/admin',(req,res)=>{
  let email=(req.query.email||"").toLowerCase();
  if(!isOwnerEmail(email)) return res.send(`<html><body style="background:#000;color:#fff;text-align:center;padding:50px"><h1>❌ Access Denied! Only Owner</h1><p>${email} is not owner</p><a href="/" style="color:#00ff88">Home</a></body></html>`);
  let usersHtml=""; let totalBots=0;
  for(let e in db.users){ let u=db.users[e]; totalBots+=u.bots.length; usersHtml+=`<tr style="border-bottom:1px solid #222"><td style="padding:8px;font-size:11px">${e}<br><span style="color:${isOwnerEmail(e)?'#ffd700':'#888'}">${isOwnerEmail(e)?'👑 OWNER':'User'}</span></td><td style="padding:8px;font-size:11px">${u.plan}<br>${Math.ceil((u.end-Date.now())/86400000)} দিন</td><td style="padding:8px;font-size:11px">${u.bots.length}</td><td style="padding:8px;font-size:11px">${u.payment.trxId?u.payment.trxId+'<br>'+u.payment.payerNum:'No'}</td><td style="padding:8px"><button onclick="extendUser('${e}')" style="background:#22c55e;color:#fff;border:none;padding:5px 8px;border-radius:4px;font-size:10px">+30 Days</button> <button onclick="deleteUser('${e}')" style="background:#ff4444;color:#fff;border:none;padding:5px 8px;border-radius:4px;font-size:10px">Delete</button></td></tr>`; }
  res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#07070a;color:#fff;font-family:system-ui;margin:0;padding:10px}.card{background:#15151a;border:1px solid #222;border-radius:14px;padding:15px;margin-bottom:15px}</style></head><body><h2>👑 OWNER ADMIN PANEL - ULTRA X PAWAR BOT</h2><div style="display:flex;gap:8px;flex-wrap:wrap"><div class="card" style="flex:1">Total Users<br><b style="font-size:22px;color:#00ff88">${Object.keys(db.users).length}</b></div><div class="card" style="flex:1">Total Bots<br><b style="font-size:22px;color:#a855f7">${totalBots}</b></div><div class="card" style="flex:1">Owner: UNLIMITED FREE<br><b style="color:#ffd700">OWNER</b></div></div><div class="card"><h3>🔗 All Links</h3><p style="font-size:11px;line-height:20px">Owner: ${LINKS.OWNER_NUMBER}<br>Hosting: ${LINKS.HOSTING_LINK}<br>Bot Link: ${LINKS.BOT_LINK}<br>Pair Site: ${LINKS.PAIR_SITE}<br>WhatsApp: <a href="${LINKS.WHATSAPP_CHANNEL}" style="color:#00ff88">Channel</a><br>Telegram Bot: <a href="${LINKS.TELEGRAM_BOT_LINK}" style="color:#00ff88">${LINKS.TELEGRAM_BOT}</a><br>Telegram Channel: <a href="${LINKS.TELEGRAM_CHANNEL}" style="color:#00ff88">Channel</a><br>bKash: ${PAYMENT.BKASH} / ${PAYMENT.BKASH_2} | Nagad: ${PAYMENT.NAGAD} - 300TK</p></div><div class="card"><h3>👥 Users & Payments</h3><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><tr style="background:#222"><th style="padding:8px;font-size:11px;text-align:left">Email</th><th style="padding:8px;font-size:11px">Plan</th><th style="padding:8px;font-size:11px">Bots</th><th style="padding:8px;font-size:11px">Payment</th><th style="padding:8px;font-size:11px">Action</th></tr>${usersHtml}</table></div></div><div style="text-align:center;padding:20px"><a href="/dashboard?email=${email}" style="background:#a855f7;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">← Back to Dashboard</a></div><script>function extendUser(e){ fetch("/api/admin/extend",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({adminEmail:"${email}",targetEmail:e})}).then(r=>r.json()).then(d=>{ alert(d.msg); location.reload() }) } function deleteUser(e){ if(!confirm("Delete "+e+" ?")) return; fetch("/api/admin/delete-user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({adminEmail:"${email}",targetEmail:e})}).then(()=>location.reload()) }<\/script></body></html>`);
});

app.post('/api/admin/extend',(req,res)=>{
  if(!isOwnerEmail(req.body.adminEmail)) return res.json({msg:"Not Owner"});
  let u=db.users[req.body.targetEmail.toLowerCase()]; if(!u) return res.json({msg:"Not Found"});
  u.end=Date.now()+30*24*60*60*1000; u.plan="VIP-PAID"; u.isPaid=true; save(); res.json({msg:"✅ Extended 30 Days"});
});

app.post('/api/admin/delete-user',(req,res)=>{
  if(!isOwnerEmail(req.body.adminEmail)) return res.json({msg:"Not Owner"});
  delete db.users[req.body.targetEmail.toLowerCase()]; save(); res.json({ok:true});
});

app.get('/dashboard',(req,res)=>{
  let email=(req.query.email||"").toLowerCase(); let u=db.users[email];
  if(!u && email){ u={email,pass:"",plan:"FREE_TRIAL",start:Date.now(),end:Date.now()+PAYMENT.FREE_DAYS*24*60*60*1000,bots:[],payment:{},isPaid:false}; db.users[email]=u; save(); }
  if(!u) return res.redirect('/');
  const daysLeft=Math.ceil((u.end-Date.now())/86400000);
  const isExpired=daysLeft<=0 && !isOwnerEmail(email);
  const isOwner=isOwnerEmail(email);
  const displayName = isOwner ? "👑 OWNER UNLIMITED" : "User"; // GMAIL HIDE

  if(isExpired){
    const html=`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;background:#080810;color:#fff;font-family:system-ui;text-align:center}.card{max-width:420px;margin:20px auto;background:#111;border-radius:16px;padding:20px;text-align:left}.paycard{background:#c3005a;border-radius:16px;padding:20px;margin-top:15px}input{width:100%;padding:14px;border-radius:10px;border:none;margin:10px 0;box-sizing:border-box}.btn{width:100%;padding:14px;border:none;border-radius:10px;background:#6d002e;color:#fff;font-weight:bold;margin-top:10px}</style></head><body>
    <div style="background:#111;padding:12px">🔒 Payment Required - ULTRA X PAWAR BOT</div>
    <div class="card"><h3 style="text-align:center">⏰ FREE Trial শেষ!</h3><p style="text-align:center;font-size:13px;color:#888">1 মাস FREE শেষ! 300 টাকা দিয়ে Continue করো!</p>
    <div class="paycard"><h3 style="text-align:center;margin:0">নিরাপদ পেমেন্ট</h3><p style="text-align:center;font-size:13px">টাকার পরিমাণ: <b style="color:yellow">৳ ${PAYMENT.AMOUNT}</b> / মাস</p>
    <div style="background:#fff;color:#000;padding:12px;border-radius:10px"><input id="trxId" placeholder="ট্রানজেকশন আইডি দিন" style="background:#f0f0f0;border:2px solid #c3005a;color:#000"></div>
    <div style="font-size:12px;margin-top:12px;line-height:20px">
    - *247# ডায়াল করে bKash মেনুতে যান।<br>
    - Send Money ক্লিক করুন।<br>
    - এই নম্বরে পাঠান। <b style="background:#fff;color:#c3005a;padding:2px 8px;border-radius:5px">${PAYMENT.BKASH} 📋 কপি</b><br>
    - বিকল্প: <b>${PAYMENT.BKASH_2}</b><br>
    - Nagad: <b>${PAYMENT.NAGAD}</b><br>
    - Amount: <b style="color:yellow">${PAYMENT.AMOUNT}</b><br>
    - PIN দিন, টাকা পাঠান, TrxID কপি করুন।
    </div>
    <input id="payerNum" placeholder="যে Number থেকে পাঠাইছো - 01XXXXXXXXX" style="background:#fff;color:#000;margin-top:12px">
    <button class="btn" onclick="submitPayment()">ভেরিফাই</button>
    </div></div>
    <script>function submitPayment(){ const trx=document.getElementById("trxId").value.trim(); const num=document.getElementById("payerNum").value.trim(); if(!trx||!num) return alert("TrxID + Number দাও!"); fetch("/api/submit-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",trxId:trx,payerNum:num})}).then(r=>r.json()).then(d=>{ alert(d.msg); location.reload() }) }<\/script></body></html>`;
    return res.send(html);
  }

  let botsHtml="";
  u.bots.forEach((b)=>{
    const slug = b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + "-" + b.id.slice(-4);
    const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+slug;
    botsHtml+=`<div style="background:#121212;border:1px solid #222;border-radius:16px;padding:14px;margin:14px 0">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:6px"><span style="background:#00ff88;width:10px;height:10px;display:inline-block;border-radius:50%"></span><b>${b.name}</b> <span style="background:#3b82f6;color:#fff;font-size:9px;padding:3px 8px;border-radius:10px">GITHUB</span></div>
          <div style="font-size:11px;color:#666;margin-top:4px">ID: ${b.id.slice(-6)} • Running • SG-1 ${isOwner?'PRO NO SLEEP':'PRO'}<br><span style="color:#a855f7">📦 ${LINKS.GITHUB_SAMPLE}</span><br><span style="color:#22c55e">🌿 main | ▶️ npm start</span></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-left:10px">
          <a href="${liveLink}" target="_blank" style="background:#a855f7;color:#fff;padding:8px 14px;border-radius:10px;text-decoration:none;font-size:12px;text-align:center">🌐 Visit</a>
          <button style="background:#222;color:#ffaa00;border:1px solid #333;padding:6px 10px;border-radius:8px">⏸️</button>
          <button onclick="deleteBot('${b.id}')" style="background:#222;color:#ff4444;border:1px solid #333;padding:6px 10px;border-radius:8px">🗑️</button>
        </div>
      </div>
      <div style="margin-top:10px;background:#000;border:1px solid #a855f7;padding:10px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;gap:8px"><span style="color:#00ff88;font-size:11px;word-break:break-all;flex:1">🌐 ${liveLink}</span><button onclick="navigator.clipboard.writeText('${liveLink}');alert('Copied')" style="background:#a855f7;color:#fff;border:none;padding:6px 12px;border-radius:6px;font-size:11px">📋 Copy Link</button></div>
      <div style="margin-top:8px;background:#000;border:1px solid #22c55e;padding:8px;border-radius:10px;display:flex;gap:6px"><input id="num-${b.id}" value="8801636487523" style="flex:1;padding:8px;background:#111;color:#fff;border:1px solid #333;border-radius:6px;font-size:12px"><button onclick="pairNow('${b.id}')" style="background:#22c55e;color:#fff;border:none;padding:8px 14px;border-radius:6px;font-weight:bold">⚡ Pair</button></div>
      <div style="margin-top:8px;background:#000;border:1px dashed #22c55e;padding:10px;border-radius:10px;display:flex;justify-content:space-between;align-items:center"><span id="pair-${b.id}" data-code="" style="color:#00ff88;font-weight:bold;font-size:14px">Code: ----</span><button onclick="copyPairCode('${b.id}')" style="background:#111;color:#00ff88;border:1px solid #22c55e;padding:6px 12px;border-radius:6px;font-size:12px">📋 Copy Code</button></div>
      <div style="margin-top:10px;background:#000;border:1px solid #222;padding:10px;border-radius:10px;font-family:monospace;font-size:11px;color:#00ff88;line-height:18px">
      > Deploying ${b.name} to SG-1 ${isOwner?'PRO...':''}<br>> ${isOwner?'No Sleep: Enabled 24/7<br>> ':''}Fast Pair: 8 Digit: Ready<br>> Live Link: ${liveLink}<br>> Status: Running OK<br>> Running
      </div>
    </div>`;
  });
  if(botsHtml==="") botsHtml='<div style="text-align:center;padding:30px;color:#666;border:1px dashed #222;border-radius:12px;margin-top:10px">No deployments yet</div>';

  const adminBtn = isOwner ? `<a href="/admin?email=${email}" style="background:linear-gradient(90deg,#ffd700,#ffaa00);color:#000;padding:6px 12px;border-radius:20px;text-decoration:none;font-weight:bold;font-size:11px;margin-left:8px">👑 ADMIN PANEL</a>` : "";

  const html=`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#07070a;color:#e5e5e5;font-family:system-ui;margin:0}.topbar{background:#111;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;font-size:12px;border-bottom:1px solid #222}.chips{display:flex;gap:6px;padding:10px;background:#000;overflow-x:auto}.chip{padding:6px 12px;border-radius:20px;font-size:11px;white-space:nowrap;text-decoration:none;font-weight:bold}.serverbar{display:flex;justify-content:space-between;padding:8px 12px;background:#111;border-radius:20px;margin:8px 12px;font-size:12px;border:1px solid #222}.tabbar{display:flex;gap:8px;padding:10px;overflow-x:auto}.tab{padding:8px 16px;border-radius:20px;background:#222;color:#fff;font-size:13px;border:none;white-space:nowrap}.tab.active{background:#fff;color:#000;font-weight:bold}.container{max-width:800px;margin:0 auto;padding:12px}.card{background:#15151a;border:1px solid #222;border-radius:16px;padding:16px;margin-bottom:12px}input,textarea{width:100%;padding:12px;background:#0e0e10;border:1px solid #333;color:#fff;border-radius:10px;margin:8px 0;box-sizing:border-box}.btn-deploy{background:#fff;color:#000;width:100%;padding:14px;border-radius:10px;border:none;font-weight:800;font-size:15px}</style></head><body>
  <div class="topbar"><div><b>${displayName}</b><br><span style="font-size:11px;color:#888">SG-1 ${isOwner?'PRO ✅ No Sleep • UNLIMITED':'Connected ✅ • UNLIMITED'} ${adminBtn}</span><br><button onclick="localStorage.clear();location.href='/'" style="background:#222;color:#fff;border:1px solid #333;padding:3px 10px;border-radius:10px;font-size:10px;margin-top:4px">Logout</button></div><div><span style="background:#111;border:1px solid #333;padding:6px 12px;border-radius:20px;font-size:11px">${isOwner?'PRO Online':'Online'}</span></div></div>
  <div class="chips">
    <a class="chip" style="background:#a855f7;color:#fff" href="${LINKS.BOT_LINK}" target="_blank">🤖 Bot Link</a>
    <a class="chip" style="background:#0ea5e9;color:#fff" href="${LINKS.TELEGRAM_BOT_LINK}" target="_blank">📢 Telegram</a>
    <a class="chip" style="background:#22c55e;color:#fff" href="${LINKS.WHATSAPP_CHANNEL}" target="_blank">💬 WhatsApp Channel</a>
  </div>
  <div class="serverbar"><span>🟢 Server: Online</span><span>📡 Singapore</span><span>⚡ 99.9%</span></div>
  <div class="tabbar">
    <button class="tab active" onclick="switchTab('telegram')">📱 Telegram</button>
    <button class="tab" onclick="switchTab('github')">📦 GitHub Repo ${isOwner?'PRO':''}</button>
    <button class="tab" onclick="switchTab('website')">🌐 Website</button>
    <button class="tab" onclick="switchTab('messenger')">💬 Messenger</button>
  </div>
  <div class="container">
    <div id="tab-telegram" class="card">
      <h3>📱 Telegram Bot Hosting</h3>
      <input id="tgName" placeholder="Bot Name - ULTRA X PAWAR">
      <input id="tgToken" placeholder="Bot Token - BotFather">
      <button class="btn-deploy" onclick="deployTelegram()">🚀 Deploy Telegram</button>
    </div>
    <div id="tab-github" class="card" style="display:none">
      <h3>📦 GitHub Repo Deploy ${isOwner?'PRO':''}</h3>
      <input id="ghName" placeholder="Project Name - RANA-X-VIP-BOT">
      <input id="ghRepo" placeholder="Repo URL - https://github.com/...">
      <button class="btn-deploy" onclick="deployGithub()">🚀 Deploy GitHub ${isOwner?'PRO':''}</button>
      <p style="font-size:10px;color:#22c55e;margin-top:8px">ULTRA X PAWAR BOT - WhatsApp Bot • Smart • Fast • 24/7 | Owner: ${LINKS.OWNER_NUMBER} | All Links Inside</p>
    </div>
    <div id="tab-website" class="card" style="display:none">
      <h3>🌐 Website / Node.js Hosting</h3>
      <input id="webName" placeholder="Website Name">
      <textarea id="webCode" rows="6" placeholder="Node.js Code Paste করো"></textarea>
      <button class="btn-deploy" onclick="deployWebsite()">🚀 Deploy Website</button>
    </div>
    <div id="tab-messenger" class="card" style="display:none">
      <h3>💬 Messenger Bot Hosting</h3>
      <input placeholder="Messenger Bot - Coming Soon">
      <button class="btn-deploy">🚀 Deploy Messenger</button>
    </div>
    <h3>Your Deployments (${u.bots.length}) - ${isOwner?'PRO No Sleep + Fast Pair 8 Digit':'All Repos + Live Links'}</h3>
    ${botsHtml}
  </div>
  <script>
  function switchTab(t){
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.getElementById('tab-telegram').style.display='none';
    document.getElementById('tab-github').style.display='none';
    document.getElementById('tab-website').style.display='none';
    document.getElementById('tab-messenger').style.display='none';
    document.getElementById('tab-'+t).style.display='block';
    event.target.classList.add('active');
  }
  function deployTelegram(){
    const n=document.getElementById("tgName").value; const tk=document.getElementById("tgToken").value;
    if(!n||!tk) return alert("Bot Name + Token দাও!");
    fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",name:n,token:tk})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()})
  }
  function deployGithub(){
    const n=document.getElementById("ghName").value; const r=document.getElementById("ghRepo").value;
    if(!n||!r) return alert("Name+Repo দাও!");
    fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",name:n,token:r})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()})
  }
  function deployWebsite(){
    const n=document.getElementById("webName").value; const c=document.getElementById("webCode").value;
    if(!n||!c) return alert("Website Name + Code দাও!");
    fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",name:n,token:c})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()})
  }
  function pairNow(id){
    const num=document.getElementById("num-"+id).value;
    const el=document.getElementById("pair-"+id);
    el.innerText="Generating...";
    fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({number:num})}).then(r=>r.json()).then(d=>{ el.innerText="Code: "+d.pairCode; el.dataset.code=d.pairCode; })
  }
  function copyPairCode(id){
    const el=document.getElementById("pair-"+id);
    const code=el.dataset.code;
    if(!code||code==="----") return alert("আগে Pair চাপো!");
    navigator.clipboard.writeText(code);
    alert("Copied: "+code);
  }
  function deleteBot(id){
    if(!confirm("Delete করবা?")) return;
    fetch("/api/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",id:id})}).then(()=>location.reload())
  }
  <\/script></body></html>`;
  res.send(html);
});

app.post('/api/deploy',(req,res)=>{
  const u=db.users[req.body.email.toLowerCase()]; if(!u) return res.json({msg:"Login"});
  const newId=Date.now().toString();
  const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + "-" + newId.slice(-4);
  u.bots.push({id:newId, slug:slug, name:req.body.name, token:req.body.token, status:"Running - PRO NO SLEEP"});
  save();
  res.json({msg:"✅ Deployed! LIVE Link: https://pawar-vip-hosting.vercel.app/bot/"+slug});
});

app.post('/api/submit-payment',(req,res)=>{
  const u=db.users[req.body.email.toLowerCase()]; if(!u) return res.json({msg:"Login First"});
  u.payment={trxId:req.body.trxId, payerNum:req.body.payerNum, time:Date.now(), status:"PENDING"};
  u.end = Date.now() + 32*24*60*60*1000; u.plan = "VIP-PAID"; u.isPaid = true; save();
  res.json({msg:"✅ Payment Success! TrxID: "+req.body.trxId+" - 30 দিন Active! Owner: "+LINKS.OWNER_NUMBER});
});

app.post('/api/delete',(req,res)=>{
  const u=db.users[req.body.email.toLowerCase()];
  if(u){ u.bots = u.bots.filter(b=> b.id!==req.body.id); save(); }
  res.json({ok:true});
});

module.exports=app;
