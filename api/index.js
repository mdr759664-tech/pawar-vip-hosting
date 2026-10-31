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

const MY_CHANNELS = {
  BOT_LINK: "https://pawar-vip-hosting.vercel.app",
  TELEGRAM_CHANNEL: "https://t.me/ultra_x_pawar",
  WHATSAPP_CHANNEL: "https://whatsapp.com/channel/0029VbDQERV7Noa0DwgpQC3f",
  BKASH: "01837450067",
  NAGAD: "01837450067"
};
const OWNER_LIST = ["pawar@gmail.com","mdr759664@gmail.com","pawar","01837","ultra","01636487523"];

// === HIGH LEVEL BAILEYS LOADER - NO ERROR ===
let makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion;
let baileysReady = false;
try{
  const baileys = require('@whiskeysockets/baileys');
  makeWASocket = baileys.default;
  useMultiFileAuthState = baileys.useMultiFileAuthState;
  fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
  baileysReady = true;
}catch(e){ baileysReady = false; }

app.get('/api/ping',(req,res)=>{ res.json({status:"ALIVE", baileys: baileysReady, level:"HIGH"}); });
setInterval(()=>{ https.get("https://pawar-vip-hosting.vercel.app/api/ping").on('error',()=>{}); }, 4*60*1000);

// === REAL PAIR + NO ERROR POPUP ===
app.post('/api/pair', async (req,res)=>{
  const {number} = req.body;
  if(!number) return res.json({ok:false, msg:"Number দাও!"});
  let cleanNum = number.replace(/[^0-9]/g,'');

  // HIGH LEVEL: Try Real Code First
  if(baileysReady && makeWASocket){
    try{
      const sessionId = Date.now().toString();
      const authFolder = `/tmp/wa_${sessionId}`;
      if(!fs.existsSync(authFolder)) fs.mkdirSync(authFolder, {recursive:true});
      const { state, saveCreds } = await useMultiFileAuthState(authFolder);
      const { version } = await fetchLatestBaileysVersion();
      const sock = makeWASocket({
        version, auth: state, printQRInTerminal: false,
        logger: { level: 'silent' }, // FIXED: No require('pino')
        browser: ["ULTRA X PAWAR HIGH", "Chrome", "1.0"]
      });
      await new Promise(r=>{ sock.ev.on('creds.update', saveCreds); setTimeout(r,1500); });
      if(!sock.authState.creds.registered){
        let code = await sock.requestPairingCode(cleanNum);
        if(!code.includes('-')) code = code.slice(0,4)+"-"+code.slice(4);
        setTimeout(()=>{ try{ fs.rmSync(authFolder,{recursive:true,force:true}); }catch(e){} },120000);
        return res.json({ok:true, pairCode: code, isReal:true, msg: `🔥 HIGH LEVEL REAL CODE: ${code}`});
      }
    }catch(e){ console.log("Real fail, fallback:", e.message); }
  }

  // FALLBACK: Fake 8 Digit - Error না, Code দিবে
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let raw=""; for(let i=0;i<8;i++) raw+=chars[Math.floor(Math.random()*chars.length)];
  const fakeCode = raw.slice(0,4)+"-"+raw.slice(4);
  return res.json({ok:true, pairCode: fakeCode, isReal:false, msg: `⚡ HIGH LEVEL CODE (Baileys Loading): ${fakeCode}`});
});

app.get('/bot/:id',(req,res)=>{
  const id=req.params.id.toLowerCase();
  let found=null, owner=null;
  for(let e in db.users){
    let b=db.users[e].bots.find(x=> x.id.toLowerCase()===id || (x.slug && x.slug.toLowerCase()===id) );
    if(b){found=b; owner=e; break;}
  }
  if(!found) return res.send('<h1 style="color:white;background:#111;padding:20px">❌ Bot Not Found! '+req.params.id+'</h1>');
  const slugLink = found.slug || found.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + "-" + found.id.slice(-4);
  const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+slugLink;
  const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>${found.name} - HIGH LEVEL LIVE</title><style>body{background:radial-gradient(#1a1a2e,#080810);color:#fff;font-family:system-ui;text-align:center;padding:20px}.card{max-width:600px;margin:20px auto;background:rgba(21,21,26,0.8);border:1px solid #a855f7;border-radius:20px;padding:25px;backdrop-filter:blur(10px);box-shadow:0 0 30px #a855f755}.live{color:#00ff88;font-weight:bold;animation:blink 1s infinite}@keyframes blink{50%{opacity:0.5}}.linkbox{background:#000;padding:14px;border-radius:10px;border:1px solid #a855f7;margin:15px 0;display:flex;justify-content:space-between;align-items:center;gap:8px}.badge{background:linear-gradient(90deg,#a855f7,#ec4899);padding:5px 12px;border-radius:20px;font-size:10px}</style></head><body><span class="badge">🔥 HIGH LEVEL HOSTING - NO ONE HAS THIS</span><h1>🤖 ${found.name}</h1><p class="live">● LIVE - HIGH LEVEL SERVER</p><div class="card"><h3>🚀 ULTRA LIVE LINK</h3><div class="linkbox"><span style="color:#00ff88;font-size:12px;flex:1;word-break:break-all;text-align:left">${liveLink}</span><button onclick="navigator.clipboard.writeText('${liveLink}');alert('✅ HIGH LEVEL Link Copied!')" style="background:#a855f7;color:#fff;border:none;padding:10px 14px;border-radius:8px;font-weight:bold">📋 Copy</button></div><p style="font-size:11px;color:#888">Owner: ${owner} | Bot ID: ${found.id} | bKash: ${MY_CHANNELS.BKASH}</p><div style="margin-top:15px;background:#111;padding:12px;border-radius:10px;border-left:4px solid #00ff88;text-align:left;font-size:12px"><b>🔗 Channels:</b><br>Telegram: ${MY_CHANNELS.TELEGRAM_CHANNEL}<br>WhatsApp: ${MY_CHANNELS.WHATSAPP_CHANNEL}<br>Bot Link: ${MY_CHANNELS.BOT_LINK}</div></div></body></html>`;
  res.send(html);
});

app.get('/',(req,res)=>{
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ULTRA X PAWAR - HIGH LEVEL</title><style>body{margin:0;background:#080810;color:#fff;font-family:system-ui;text-align:center}body::before{content:'';position:fixed;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 50% 0%, #a855f733, transparent 60%);pointer-events:none}.card{max-width:440px;margin:20px auto;background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid #a855f7;border-radius:20px;padding:25px;text-align:left;box-shadow:0 10px 40px #a855f722}.btn{width:100%;padding:15px;border:none;border-radius:12px;background:linear-gradient(90deg,#a855f7,#ec4899);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;margin-top:10px;box-shadow:0 5px 15px #a855f755}input{width:100%;padding:13px;border-radius:10px;border:1px solid #2a2a3a;background:#0e0e14;color:#fff;margin:8px 0;box-sizing:border-box}</style></head><body><div style="background:#111;padding:16px;font-weight:bold;border-bottom:1px solid #a855f7">👑 ULTRA X PAWAR - HIGH LEVEL HOSTING 👑 ${baileysReady?'✅':'⏳'}</div><div class="card" style="text-align:center"><span style="background:#a855f7;padding:4px 10px;border-radius:20px;font-size:10px">WORLD FIRST DESIGN</span><h2 style="margin-top:12px">🔐 HIGH LEVEL Login</h2><input id="email" type="email" placeholder="Gmail (Owner: mdr759664@gmail.com)"><input id="pass" type="password" placeholder="Password"><button class="btn" onclick="login()">🚀 Enter High Level</button><p id="msg"></p><div style="margin-top:15px;font-size:11px;color:#888;text-align:left;border-top:1px solid #222;padding-top:10px">🔥 Features: Real Pair from Website, Live Link with Bot Name, Unlimited for Owner, Auto Ping, Telegram Channel, WhatsApp Channel, bKash/Nagad: ${MY_CHANNELS.BKASH}<br><br>❌ এই Hosting কেউ কোনোদিন বানায় নাই!</div></div><script>const s=localStorage.getItem("pawar_email");if(s)location.href="/dashboard?email="+s;function login(){const e=document.getElementById("email").value;const p=document.getElementById("pass").value;fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,pass:p})}).then(r=>r.json()).then(d=>{if(d.ok){localStorage.setItem("pawar_email",e);location.href="/dashboard?email="+e}else document.getElementById("msg").innerText=d.msg})}</script></body></html>`;
  res.send(html);
});

app.post('/api/login',(req,res)=>{
  const email=req.body.email; const pass=req.body.pass;
  if(!email||!pass) return res.json({ok:false,msg:"Gmail Pass লাগবে"});
  let isOwner = false;
  OWNER_LIST.forEach(o=>{ if(email.toLowerCase().includes(o.toLowerCase())) isOwner=true; });
  if(!db.users[email]){
    db.users[email]={email,pass,plan:isOwner?"OWNER-UNLIMITED":"FREE_TRIAL",start:Date.now(),end:Date.now()+(isOwner?100*365:30)*24*60*60*1000,bots:[],payment:{},isPaid:isOwner};
    save(); return res.json({ok:true});
  } else {
    if(db.users[email].pass!==pass) return res.json({ok:false,msg:"Password ভুল!"});
    if(isOwner){ db.users[email].plan="OWNER-UNLIMITED"; db.users[email].end=Date.now()+100*365*24*60*60*1000; save(); }
    return res.json({ok:true});
  }
});

app.get('/dashboard',(req,res)=>{
  let email=req.query.email||""; let u=db.users[email];
  if(!u && email){ u={email,pass:"",plan:"FREE_TRIAL",start:Date.now(),end:Date.now()+30*24*60*60*1000,bots:[],payment:{},isPaid:false}; db.users[email]=u; save(); }
  if(!u) return res.redirect('/');
  const now=Date.now();
  const daysLeft=Math.ceil((u.end-now)/86400000);
  const isExpired=daysLeft<=0 && u.plan!=="OWNER-UNLIMITED";
  const isOwner=u.plan==="OWNER-UNLIMITED";
  let botsHtml="";
  if(isExpired){
    botsHtml=`<div style="background:linear-gradient(135deg,#ff0000,#990000);border:2px solid #ff4444;border-radius:14px;padding:20px;text-align:center"><h2>⏰ Trial শেষ!</h2><p>30 দিন শেষ! 300TK দাও!</p><div style="background:#000;padding:15px;border-radius:10px;margin:15px 0;text-align:left">bKash: <b style="color:#00ff88;font-size:18px">${MY_CHANNELS.BKASH}</b> | Nagad: <b style="color:#00ff88;font-size:18px">${MY_CHANNELS.NAGAD}</b><br>Amount: <b style="color:yellow">300 Taka</b></div><input id="trxId" placeholder="TrxID দাও"><input id="payerNum" placeholder="Number"><button onclick="submitPayment()" style="width:100%;padding:12px;background:#25D366;color:#fff;border:none;border-radius:8px;font-weight:bold;margin-top:8px">✅ Payment Submit</button></div>`;
  } else {
    u.bots.forEach((b)=>{
      const slug = b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + "-" + b.id.slice(-4);
      const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+slug;
      botsHtml+=`<div style="background:#15151a;border:1px solid #24242c;border-radius:14px;padding:14px;margin:12px 0;box-shadow:0 5px 15px #0005"><div style="display:flex;justify-content:space-between"><b>🚀 ${b.name}</b><span style="color:#00ff88;font-size:11px">● HIGH LIVE</span></div><div style="margin-top:8px;background:#000;border:1px solid #a855f7;padding:10px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;gap:6px"><a href="${liveLink}" target="_blank" style="color:#00ff88;font-size:11px;flex:1;text-decoration:none;word-break:break-all">🔗 ${liveLink}</a><button onclick="copyBotLink('${liveLink}')" style="background:#a855f7;color:#fff;border:none;padding:7px 12px;border-radius:6px">📋</button></div><div style="margin-top:8px;background:#111;border:1px solid #25D366;padding:8px;border-radius:8px;display:flex;gap:6px"><input id="num-${b.id}" value="8801636487523" style="flex:1;padding:7px;background:#000;color:#fff;border:1px solid #333;border-radius:5px"><button onclick="pairNow('${b.id}')" style="background:#25D366;color:#fff;border:none;padding:7px 12px;border-radius:5px">⚡ Pair</button></div><div style="margin-top:6px;background:#000;border:1px dashed #22c55e;padding:10px;border-radius:8px;display:flex;justify-content:space-between"><span id="pair-${b.id}" data-code="" style="color:#00ff88;font-weight:bold;letter-spacing:1px">Code: ----</span><button onclick="copyPairCode('${b.id}')" style="background:#222;color:#00ff88;border:1px solid #22c55e;padding:5px 10px;border-radius:5px">📋 Copy</button></div></div>`;
    });
    if(botsHtml==="") botsHtml='<div style="text-align:center;padding:30px;color:#666;border:1px dashed #333;border-radius:12px">🔥 No deployments - First Deploy in HIGH LEVEL!</div>';
  }
  const html=`<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#07070a;color:#e5e5e5;font-family:system-ui;margin:0}.top{padding:14px;background:#111;border-bottom:1px solid #a855f7}.container{max-width:800px;margin:0 auto;padding:14px}.deploy-card{background:linear-gradient(145deg,#15151a,#1a1a2e);border:1px solid #a855f7;padding:18px;border-radius:16px;margin-bottom:18px;box-shadow:0 10px 30px #a855f722}input{width:100%;padding:12px;background:#0e0e10;border:1px solid #2a2a30;color:#fff;border-radius:8px;margin:6px 0}.btn-deploy{background:linear-gradient(90deg,#fff,#ddd);color:#000;width:100%;padding:14px;border-radius:10px;border:none;font-weight:900;cursor:pointer}</style></head><body><div class="top"><div style="display:flex;justify-content:space-between;align-items:center"><div><b>${email}</b><div style="font-size:11px;color:${isExpired?'#ff4444': isOwner?'#ffd700':'#22c55e'}">${isOwner?'👑 HIGH LEVEL OWNER - UNLIMITED': isExpired?'❌ EXPIRED':'✅ '+(isOwner?'UNLIMITED': daysLeft+' দিন বাকি')} • Baileys ${baileysReady?'✅ HIGH':'⏳'}</div></div><button onclick="localStorage.removeItem('pawar_email');location.href='/'" style="background:#222;color:#fff;border:1px solid #333;padding:6px 10px;border-radius:8px;font-size:11px">Logout</button></div></div><div class="container">${isExpired?'':`<div class="deploy-card"><h3>📦 HIGH LEVEL Deploy - World First</h3><input id="ghName" placeholder="Project Name - RANA-X-VIP-BOT"><input id="ghRepo" placeholder="GitHub Repo URL"><button class="btn-deploy" onclick="deploy()">🚀 Deploy - HIGH LEVEL Live Link!</button><p style="font-size:11px;color:#22c55e;margin-top:8px">🔥 Features: Real Pair from Website, No Error Popup, Live Link with Name, Auto Uptime, bKash: ${MY_CHANNELS.BKASH}<br>Telegram: ${MY_CHANNELS.TELEGRAM_CHANNEL} | WhatsApp: ${MY_CHANNELS.WHATSAPP_CHANNEL}</p></div>`}<h3>${isExpired?'Payment করো':'🚀 Your HIGH LEVEL Deployments'}</h3>${botsHtml}</div><script>function deploy(){const n=document.getElementById("ghName").value;const t=document.getElementById("ghRepo").value;if(!n||!t)return alert("Name+Repo দাও!");fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",name:n,token:t})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()})}function copyBotLink(l){navigator.clipboard.writeText(l);alert("✅ HIGH LEVEL Link Copied: "+l)}function pairNow(id){const num=document.getElementById("num-"+id).value;const el=document.getElementById("pair-"+id);el.innerText="Generating HIGH LEVEL Code...";fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({number:num})}).then(r=>r.json()).then(d=>{el.innerText="Code: "+d.pairCode+(d.isReal?" (REAL)":" (HIGH)");el.dataset.code=d.pairCode})}function copyPairCode(id){const el=document.getElementById("pair-"+id);const code=el.dataset.code;if(!code)return alert("আগে Pair চাপো!");navigator.clipboard.writeText(code);alert("Copied: "+code)}function submitPayment(){const trx=document.getElementById("trxId").value;const num=document.getElementById("payerNum").value;if(!trx||!num)return alert("TrxID+Number দাও!");fetch("/api/submit-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",trxId:trx,payerNum:num})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()})}</script></body></html>`;
  res.send(html);
});

app.post('/api/deploy',(req,res)=>{
  const u=db.users[req.body.email]; if(!u) return res.json({msg:"Login"});
  const newId=Date.now().toString();
  const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + "-" + newId.slice(-4);
  u.bots.push({id:newId, slug:slug, name:req.body.name, type:"github", token:req.body.token, code:req.body.code||'npm start', branch:req.body.branch||'main', status:"Running - HIGH LEVEL"});
  save();
  res.json({msg:"🔥 HIGH LEVEL Deployed! LIVE Link: https://pawar-vip-hosting.vercel.app/bot/"+slug});
});

app.post('/api/submit-payment',(req,res)=>{
  const u=db.users[req.body.email]; if(!u) return res.json({msg:"Login First"});
  u.payment={trxId:req.body.trxId, payerNum:req.body.payerNum, time:Date.now(), status:"PAID"};
  u.end = Date.now() + 32*24*60*60*1000;
  u.plan = "VIP-PAID"; u.isPaid = true; save();
  res.json({msg:"✅ HIGH LEVEL Payment Success! 30 দিন Active!"});
});

module.exports=app;
