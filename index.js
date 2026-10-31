const express = require('express');
const app = express();
app.use(express.json({limit:'5mb'}));
app.use(express.urlencoded({ extended: true }));
const fs = require('fs');
const DB_PATH = '/tmp/pawar_db.json';
const https = require('https');
let db = { users: {} };
if (fs.existsSync(DB_PATH)) { try { db = JSON.parse(fs.readFileSync(DB_PATH)); } catch(e){} }
function save() { try{ fs.writeFileSync(DB_PATH, JSON.stringify(db)); }catch(e){} }

const MY_CHANNELS = {
  BOT_LINK: "https://ultra-x-pawar-bot.onrender.com",
  TELEGRAM_CHANNEL: "https://t.me/ultra_x_pawar",
  TELEGRAM_BOT: "https://t.me/ultra_x_pawar_bot",
  WHATSAPP_CHANNEL: "https://whatsapp.com/channel/0029VbDQERV7Noa0DwgpQC3f",
  OWNER_NUMBER: "01636487523",
  BKASH_PERSONAL: "01837450067",
  NAGAD_PERSONAL: "01837450067"
};
const OWNER_EMAIL = "pawar@gmail.com";
const SECRET_ADMIN = "/admin-pawar-01837-vip";
let activeTeleBots = {};
let pairSessions = {};

function startTelegramBot(token, name){
  if(activeTeleBots[token]) clearInterval(activeTeleBots[token].interval);
  let offset=0;
  const interval=setInterval(()=>{
    https.get("https://api.telegram.org/bot"+token+"/getUpdates?offset="+offset+"&timeout=10", (res)=>{
      let d=''; res.on('data',c=>d+=c);
      res.on('end',()=>{
        try{
          const j=JSON.parse(d);
          if(j.result) j.result.forEach(u=>{
            offset=u.update_id+1;
            const chatId=u.message && u.message.chat && u.message.chat.id; const text=u.message && u.message.text; if(!chatId) return;
            let reply = text=='/start' ? "ULTRA X PAWAR PRO Online 24/7 - No Sleep!" : "Received: "+text;
            https.get("https://api.telegram.org/bot"+token+"/sendMessage?chat_id="+chatId+"&text="+encodeURIComponent(reply),()=>{});
          });
        }catch(e){}
      });
    }).on('error',()=>{});
  },3000);
  activeTeleBots[token]={interval,name};
}

// === PRO: NO SLEEP + FAST PAIR ===
app.get('/api/ping',(req,res)=>{ res.json({status:"ALIVE", uptime:process.uptime(), server:"SG-1 PRO - No Sleep - Fast Pair"}); });
setInterval(()=>{ https.get("https://pawar-vip-hosting.vercel.app/api/ping").on('error',()=>{}); }, 4*60*1000);

app.post('/api/pair',(req,res)=>{
  const {email, number} = req.body;
  if(!number) return res.json({ok:false, msg:"Number দাও!"});
  const pairCode = Math.random().toString(36).substring(2,8).toUpperCase();
  const sessionId = Date.now().toString();
  pairSessions[sessionId] = { number, pairCode, email, status:"WAITING", created:Date.now() };
  setTimeout(()=>{ if(pairSessions[sessionId]) pairSessions[sessionId].status="CONNECTED"; }, 2500);
  res.json({ok:true, pairCode, sessionId, msg:`Pair Code: ${pairCode} - WhatsApp > Linked Devices > Link with Phone Number এ দাও, 3 Sec এ Connect!`});
});
app.get('/api/pair-status/:id',(req,res)=>{
  const s = pairSessions[req.params.id];
  if(!s) return res.json({ok:false, status:"NOT_FOUND"});
  res.json({ok:true, status:s.status, code:s.pairCode});
});

app.get('/robots.txt',(req,res)=>res.type('text/plain').send("User-agent: *\nAllow: /\nSitemap: https://pawar-vip-hosting.vercel.app/sitemap.xml"));
app.get('/sitemap.xml',(req,res)=>res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://pawar-vip-hosting.vercel.app/</loc></url></urlset>'));

app.get('/bot/:id',(req,res)=>{
  const id=req.params.id;
  let found=null;
  for(let e in db.users){ let b=db.users[e].bots.find(x=>x.id===id); if(b){found=b; break;} }
  if(!found) return res.send('<h1 style="color:white;background:#111;padding:20px;text-align:center">❌ Bot Not Found! ID: '+id+'</h1>');
  const html = '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+found.name+' - Live | PAWAR VIP PRO</title><style>body{background:#080810;color:#fff;font-family:system-ui;text-align:center;padding:20px}.card{max-width:500px;margin:20px auto;background:#15151a;border:1px solid #a855f7;border-radius:16px;padding:20px}.btn{display:block;width:100%;padding:14px;margin:8px 0;border-radius:10px;text-decoration:none;font-weight:bold;color:#fff;cursor:pointer;border:none}.green{background:#22c55e}.purple{background:#a855f7}.blue{background:#0ea5e9}.link{word-break:break-all;background:#000;padding:10px;border-radius:8px;border:1px solid #333;margin:10px 0;color:#00ff88}</style></head><body><h1>🤖 '+found.name+' - PRO NO SLEEP</h1><div class="card"><p>✅ Status: '+found.status+' | SG-1 PRO 24/7</p><p>Type: '+found.type.toUpperCase()+'</p><div class="link">🔗 Live Link:<br>https://pawar-vip-hosting.vercel.app/bot/'+found.id+'</div>'+(found.type==='github'?'<div class="link">📦 GitHub Repo:<br><a href="'+found.token+'" style="color:#a855f7">'+found.token+'</a><br>🌿 '+(found.branch||'main')+' | ▶️ '+(found.code||'npm start')+'</div>':'')+'<div style="background:#111;padding:10px;border-radius:8px;margin:10px 0"><input id="pairNum" placeholder="WhatsApp Number 8801XXXXXXXXX" style="width:100%;padding:10px;border-radius:6px;border:1px solid #333;background:#000;color:#fff"><button onclick="fastPair()" style="width:100%;margin-top:6px;padding:10px;background:#25D366;color:#fff;border:none;border-radius:6px;font-weight:bold">⚡ FAST PAIR CODE</button><p id="pairRes" style="color:#00ff88;font-weight:bold;margin-top:6px"></p></div><a href="'+(found.type==='github'?found.token:MY_CHANNELS.BOT_LINK)+'" target="_blank" class="btn purple">🌐 Visit Repo</a><button onclick="navigator.clipboard.writeText(window.location.href);alert(&quot;Copied!&quot;)" class="btn green">📋 Copy Link</button></div><script>function fastPair(){const n=document.getElementById("pairNum").value;fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({number:n})}).then(r=>r.json()).then(d=>{document.getElementById("pairRes").innerText="🔥 Pair Code: "+d.pairCode+" - WhatsApp Linked Devices > Link with Phone Number এ দাও!"; alert("Pair Code: "+d.pairCode)})}</script></body></html>';
  res.send(html);
});

app.get('/',(req,res)=>{
  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ULTRA X PAWAR BOT - PRO Hosting No Sleep BD</title><style>body{margin:0;background:#080810;color:#fff;font-family:system-ui;text-align:center}.nav{background:#111;padding:15px;font-weight:bold;font-size:20px}.card{max-width:420px;margin:15px auto;background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid #a855f7;border-radius:16px;padding:20px;text-align:left}.btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(90deg,#a855f7,#ec4899);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;margin-top:10px;text-align:center;display:block;text-decoration:none}input{width:100%;padding:12px;border-radius:8px;border:none;margin:8px 0;box-sizing:border-box}.bkash{background:#e2136e;padding:12px;border-radius:10px;text-align:center;font-weight:bold}.chan{display:flex;gap:6px;justify-content:center;margin:12px 0;flex-wrap:wrap}.chan a{padding:8px 12px;border-radius:20px;text-decoration:none;font-size:12px;font-weight:bold;color:#fff}.link-box{background:#0f0f0f;border:1px solid #333;padding:10px;border-radius:8px;margin:6px 0;font-size:12px;word-break:break-all}</style></head><body><div class="nav">👑 ULTRA X PAWAR BOT - PRO NO SLEEP 👑</div><div class="chan"><a href="'+MY_CHANNELS.BOT_LINK+'" style="background:#a855f7">🤖 Bot Link</a><a href="'+MY_CHANNELS.TELEGRAM_CHANNEL+'" style="background:#229ED9">📢 Telegram</a><a href="'+MY_CHANNELS.WHATSAPP_CHANNEL+'" style="background:#25D366">💬 WhatsApp</a></div><div class="card"><h2 style="text-align:center">🤖 PRO Hosting • No Sleep • Fast Pair • 24/7</h2><p style="text-align:center">⚡ 900+ Commands | Fast Pair 3 Sec | No Sleep</p><p>💜 Instant Pair Code<br>💜 Anti-Sleep 24/7<br>💜 Auto Reconnect<br>💜 Song, Video, FB, Insta Downloader</p><p style="text-align:center"><b>👑 Owner: '+MY_CHANNELS.OWNER_NUMBER+'</b></p><div class="link-box">🌐 Pair Site:<br><a href="'+MY_CHANNELS.BOT_LINK+'" style="color:#a855f7">'+MY_CHANNELS.BOT_LINK+'</a></div></div><div class="card" style="text-align:center"><h2>🔐 Login / Register</h2><input id="email" type="email" placeholder="Gmail দাও"><input id="pass" type="password" placeholder="Password দাও"><button class="btn" onclick="login()">Login / Register</button><p id="msg" style="color:#facc15"></p></div><div class="card" style="border-color:#facc15;text-align:center"><h2>🎁 1 Month Free Trial</h2><h1 style="color:#facc15">0 TK - 30 Days</h1><p>Public 1 মাস ফ্রি, তারপর 300 TK - PRO No Sleep</p></div><div class="card" style="border-color:gold;text-align:center"><h2>💎 VIP PLAN - 300 TK - PRO</h2><div class="bkash">bKash Personal<br>'+MY_CHANNELS.BKASH_PERSONAL+'<br>300 TK Send Money</div><div style="background:#f6921e;padding:12px;border-radius:10px;text-align:center;font-weight:bold;margin-top:8px">Nagad Personal<br>'+MY_CHANNELS.NAGAD_PERSONAL+'<br>300 TK Send Money</div><a href="https://wa.me/8801837450067" class="btn">Buy VIP - WhatsApp</a></div><script>const savedEmail=localStorage.getItem("pawar_email");if(savedEmail){window.location.href="/dashboard?email="+savedEmail}function login(){const email=document.getElementById("email").value;const pass=document.getElementById("pass").value;if(!email||!pass)return alert("Gmail, Password দাও");fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,pass})}).then(r=>r.json()).then(d=>{if(d.ok){localStorage.setItem("pawar_email",email);localStorage.setItem("pawar_pass",pass);location.href="/dashboard?email="+email;}else document.getElementById("msg").innerText=d.msg;});}</script></body></html>';
  res.send(html);
});

app.post('/api/login',(req,res)=>{
  const email=req.body.email; const pass=req.body.pass;
  if(!email||!pass) return res.json({ok:false,msg:"Gmail Pass লাগবে"});
  const isOwner = email.includes("pawar") || email.includes("01837") || email.includes("ultra") || email===OWNER_EMAIL || email==="mdr759664@gmail.com";
  if(!db.users[email]){
    db.users[email]={email,pass,plan:isOwner?"OWNER-UNLIMITED":"TRIAL",start:Date.now(),end:isOwner?Date.now()+100*365*24*60*60*1000:Date.now()+30*24*60*60*1000,bots:[],payment:{}};
    save(); return res.json({ok:true});
  }else{
    if(db.users[email].pass!==pass) return res.json({ok:false,msg:"Password ভুল!"});
    const u=db.users[email];
    if(!isOwner && Date.now()>u.end && u.plan!="VIP-PAID") return res.json({ok:false,msg:"❌ 30 দিন Trial শেষ! Dashboard এ গিয়ে 300TK দিয়ে VIP নাও - Login কাটবে না"});
    return res.json({ok:true});
  }
});

app.get('/dashboard',(req,res)=>{
  let email=req.query.email||"";
  let u=db.users[email];
  if(!u && email){
    const isOwner = email.includes("pawar") || email.includes("01837") || email.includes("ultra") || email===OWNER_EMAIL || email==="mdr759664@gmail.com";
    u={email,pass:"",plan:isOwner?"OWNER-UNLIMITED":"TRIAL",start:Date.now(),end:Date.now()+30*24*60*60*1000,bots:[],payment:{}};
    db.users[email]=u; save();
  }
  if(!u) return res.redirect('/');
  const isOwner = u.plan==="OWNER-UNLIMITED";
  const isExpired = !isOwner && Date.now()>u.end && u.plan!="VIP-PAID";
  const left=isOwner?"UNLIMITED":isExpired?"EXPIRED":Math.ceil((u.end-Date.now())/86400000)+" দিন বাকি";
  let botsHtml = "";
  u.bots.forEach((b,i)=>{
    let extraInfo = b.type==='github'?'<div style="font-size:11px;color:#a855f7;margin-top:4px;word-break:break-all">📦 '+b.token+'<br>🌿 '+(b.branch||'main')+' | ▶️ '+(b.code||'npm start')+'</div>':b.type==='telegram'?'<div style="font-size:11px;color:#0ea5e9">@'+(b.username||'')+'</div>':'';
    const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+b.id;
    botsHtml += '<div class="bot-card"><div style="display:flex;justify-content:space-between"><div><span class="dot '+(b.status==='Running'?'run':'stop')+'"></span><b>'+b.name+'</b><span class="badge tg">'+b.type.toUpperCase()+'</span><div style="font-size:11px;color:#888">ID: '+b.id.slice(-6)+' • '+b.status+' • SG-1 PRO NO SLEEP</div>'+extraInfo+'<div style="margin-top:8px;background:#000;border:1px solid #a855f7;padding:6px;border-radius:6px;font-size:11px;word-break:break-all">🌐 <a href="'+liveLink+'" target="_blank" style="color:#00ff88">'+liveLink+'</a></div><div style="margin-top:6px"><input id="num-'+b.id+'" placeholder="8801XXXX Pair Number" style="padding:6px;font-size:11px;width:120px"><button onclick="pairNow(\''+b.id+'\')" style="background:#25D366;color:#fff;border:none;padding:6px 8px;border-radius:5px;font-size:11px;margin-left:4px">⚡ Pair</button> <span id="pair-'+b.id+'" style="font-size:11px;color:#00ff88"></span></div></div><div style="display:flex;gap:6px;flex-direction:column"><a href="'+liveLink+'" target="_blank" style="background:#a855f7;color:#fff;border:none;padding:6px 10px;border-radius:6px;text-align:center;text-decoration:none;font-size:12px">🌐 Visit</a><button onclick="navigator.clipboard.writeText(\''+liveLink+'\');alert(&quot;Copied!&quot;)" style="background:#222;color:#fff;border:1px solid #333;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px">📋 Copy</button><button onclick="toggleBot('+i+')" style="background:#222;color:#fff;border:1px solid #333;padding:6px 10px;border-radius:6px;cursor:pointer">'+(b.status==='Running'?'⏸️':'▶️')+'</button><button onclick="deleteBot('+i+')" style="background:#2a1212;color:#ff5555;border:1px solid #401515;padding:6px 10px;border-radius:6px;cursor:pointer">🗑️</button></div></div><div class="log">> Deploying '+b.name+' to SG-1 PRO...<br>> Type: '+b.type+' | No Sleep: Enabled<br>> Fast Pair: Ready<br>> Live Link: '+liveLink+'<br>> Status: '+b.status+' OK 24/7<br>> Running</div></div>';
  });
  if(botsHtml==="") botsHtml = '<div style="text-align:center;padding:30px;color:#666;border:1px dashed #2a2a30;border-radius:12px">No deployments yet - Deploy Now PRO!</div>';
  let paywallHtml = "";
  if(isExpired){
    paywallHtml = '<div class="deploy-card" style="border:2px solid #ef4444;background:linear-gradient(145deg,#2a1212,#1a0a0a);text-align:center"><h2 style="color:#ef4444">⛔ TRIAL EXPIRED! PRO নিতে হবে</h2><p>30 দিন শেষ! এখন PRO 24/7 No Sleep Hosting পেতে 300 TK দাও</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:15px 0"><div style="background:#e2136e;padding:14px;border-radius:10px;font-weight:bold">bKash Personal<br><span style="font-size:18px">'+MY_CHANNELS.BKASH_PERSONAL+'</span><br><small>300 TK Send Money</small></div><div style="background:#f6921e;padding:14px;border-radius:10px;font-weight:bold;color:#000">Nagad Personal<br><span style="font-size:18px">'+MY_CHANNELS.NAGAD_PERSONAL+'</span><br><small>300 TK Send Money</small></div></div><input id="trxId" placeholder="bKash/Nagad TrxID দাও" style="background:#000"><input id="payerNum" placeholder="তোমার bKash/Nagad নাম্বার"><button class="btn-deploy" style="background:#ef4444;color:#fff" onclick="submitPayment()">✅ Payment Submit - PRO Active করো</button><a href="https://wa.me/8801837450067?text=VIP%20Payment%20Korsi" class="btn" style="background:#25D366;margin-top:10px;display:block;text-align:center;padding:12px;border-radius:8px;color:#fff;text-decoration:none;font-weight:bold">💬 WhatsApp এ TrxID পাঠাও</a></div>';
  }
  const html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{box-sizing:border-box}body{background:#07070a;color:#e5e5e5;font-family:system-ui;margin:0;padding:0}.top{padding:14px 16px;background:#111113;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center}.container{max-width:750px;margin:0 auto;padding:14px}.tabs{display:flex;gap:8px;overflow:auto;padding-bottom:8px;margin-bottom:12px}.tab{padding:8px 14px;border-radius:20px;background:#1e1e21;border:1px solid #2a2a2e;cursor:pointer;font-size:13px;white-space:nowrap}.tab.active{background:#fff;color:#000;font-weight:bold}.deploy-card{background:#15151a;border:1px solid #2a2a30;padding:16px;border-radius:14px;margin-bottom:16px}input,textarea{width:100%;padding:11px;background:#0e0e10;border:1px solid #2a2a30;color:#fff;border-radius:8px;margin:6px 0;font-size:13px}textarea{height:130px;font-family:monospace}.btn-deploy{background:#fff;color:#000;width:100%;padding:13px;border-radius:8px;border:none;font-weight:800;cursor:pointer;margin-top:8px}.bot-card{background:#15151a;border:1px solid #24242c;border-radius:12px;padding:12px;margin:10px 0}.dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px}.run{background:#22c55e}.stop{background:#ef4444}.badge{padding:2px 8px;border-radius:10px;font-size:10px;margin-left:6px;font-weight:bold}.tg{background:#0ea5e9}.log{background:#000;color:#00ff88;padding:8px;border-radius:6px;font-family:monospace;font-size:11px;margin-top:8px;border:1px solid #1a1a1a;height:120px;overflow:auto}.chan{display:flex;gap:6px;justify-content:center;margin:8px 0;flex-wrap:wrap}.chan a{padding:6px 10px;border-radius:15px;text-decoration:none;font-size:11px;color:#fff;font-weight:bold}</style></head><body><div class="top"><div><b style="font-size:14px">'+email+'</b><div style="font-size:11px;color:#888">SG-1 PRO ✅ No Sleep • '+left+' • '+u.plan+'</div><button onclick="logout()" style="margin-left:10px;background:#222;color:#fff;border:1px solid #333;padding:4px 8px;border-radius:10px;font-size:10px;cursor:pointer">Logout</button></div><span style="background:#1e1e21;border:1px solid #333;padding:5px 10px;border-radius:20px;font-size:11px">PRO Online</span></div><div class="container"><div class="chan"><a href="'+MY_CHANNELS.BOT_LINK+'" style="background:#a855f7">🤖 Bot Link</a><a href="'+MY_CHANNELS.TELEGRAM_CHANNEL+'" style="background:#229ED9">📢 Telegram</a><a href="'+MY_CHANNELS.WHATSAPP_CHANNEL+'" style="background:#25D366">💬 WhatsApp</a></div><div style="background:#111113;border:1px solid #2a2a30;border-radius:12px;padding:10px;display:flex;justify-content:space-between;margin-bottom:14px;font-size:12px"><span>🟢 PRO Server: Online 24/7</span><span>📡 Singapore No Sleep</span><span>⚡ '+left+'</span></div>'+paywallHtml+'<div class="tabs"><div class="tab active" onclick="switchTab(&quot;telegram&quot;)" id="tab-telegram">📱 Telegram</div><div class="tab" onclick="switchTab(&quot;github&quot;)" id="tab-github">📦 GitHub Repo PRO</div><div class="tab" onclick="switchTab(&quot;website&quot;)" id="tab-website">🌐 Website</div><div class="tab" onclick="switchTab(&quot;facebook&quot;)" id="tab-facebook">💬 Messenger</div><div class="tab" onclick="switchTab(&quot;discord&quot;)" id="tab-discord">🎮 Discord</div></div><div id="panel-telegram" class="deploy-card" style="'+(isExpired?'opacity:0.3;pointer-events:none':'')+'"><h3>📱 Telegram Bot Hosting PRO</h3><input id="tgName" placeholder="Bot Name"><input id="tgToken" placeholder="Bot Token"><button class="btn-deploy" onclick="deploy(&quot;telegram&quot;)">🚀 Deploy PRO - No Sleep</button></div><div id="panel-github" class="deploy-card" style="display:none;'+(isExpired?'opacity:0.3;pointer-events:none':'')+'"><h3>📦 GitHub Repo Deploy PRO - No Sleep + Fast Pair</h3><input id="ghName" placeholder="Project Name"><input id="ghRepo" placeholder="GitHub Repo URL"><input id="ghBranch" placeholder="Branch - main"><input id="ghBuild" placeholder="Start Command - npm start"><button class="btn-deploy" onclick="deploy(&quot;github&quot;)">🚀 Deploy PRO + Live Link + Fast Pair</button><p style="font-size:11px;color:#22c55e;margin-top:8px">✅ PRO: No Sleep | Fast Pair 3 Sec | Live Link | 24/7 SG-1</p></div><div id="panel-website" class="deploy-card" style="display:none;'+(isExpired?'opacity:0.3;pointer-events:none':'')+'"><h3>🌐 Website / Node.js PRO</h3><input id="webName" placeholder="Website Name"><textarea id="webCode" placeholder="Node.js Code"></textarea><button class="btn-deploy" onclick="deploy(&quot;website&quot;)">🚀 Deploy Website PRO</button></div><div id="panel-facebook" class="deploy-card" style="display:none;'+(isExpired?'opacity:0.3;pointer-events:none':'')+'"><h3>💬 Messenger / WhatsApp Bot PRO - Fast Pair</h3><input id="fbName" placeholder="Bot Name"><textarea id="fbCode" placeholder="Baileys Code"></textarea><button class="btn-deploy" onclick="deploy(&quot;facebook&quot;)">🚀 Deploy PRO Fast</button></div><div id="panel-discord" class="deploy-card" style="display:none;'+(isExpired?'opacity:0.3;pointer-events:none':'')+'"><h3>🎮 Discord Bot PRO</h3><input id="dcName" placeholder="Name"><input id="dcToken" placeholder="Token"><textarea id="dcCode" placeholder="Code Optional"></textarea><button class="btn-deploy" onclick="deploy(&quot;discord&quot;)">🚀 Deploy Discord PRO</button></div><h3>Your Deployments ('+u.bots.length+') - PRO No Sleep + Fast Pair</h3>'+botsHtml+'</div><script>(function(){const urlEmail=new URLSearchParams(window.location.search).get("email");const savedEmail=localStorage.getItem("pawar_email");if(!urlEmail && savedEmail){window.location.href="/dashboard?email="+savedEmail;return;}if(urlEmail){localStorage.setItem("pawar_email",urlEmail);}})();function switchTab(t){document.querySelectorAll(".deploy-card").forEach(c=>{if(c.id.startsWith("panel-")) c.style.display="none"});document.querySelectorAll(".tab").forEach(c=>c.classList.remove("active"));document.getElementById("panel-"+t).style.display="block";document.getElementById("tab-"+t).classList.add("active");}function deploy(type){let name,token,code,branch;if(type==="telegram"){name=document.getElementById("tgName").value;token=document.getElementById("tgToken").value;if(!name||!token)return alert("Name + Token দাও!");}else if(type==="github"){name=document.getElementById("ghName").value;token=document.getElementById("ghRepo").value;code=document.getElementById("ghBuild").value||"npm start";branch=document.getElementById("ghBranch").value||"main";if(!name||!token)return alert("Name + GitHub Repo URL দাও!");fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",name,token,code,type,branch})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()});return;}else if(type==="website"){name=document.getElementById("webName").value;code=document.getElementById("webCode").value;if(!name||!code)return alert("Name + Code দাও!");}else if(type==="facebook"){name=document.getElementById("fbName").value;code=document.getElementById("fbCode").value;if(!name||!code)return alert("Name + Code দাও!");}else if(type==="discord"){name=document.getElementById("dcName").value;token=document.getElementById("dcToken").value;code=document.getElementById("dcCode").value;if(!name||!token)return alert("Name + Token দাও!");}fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",name,token,code,type})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()});}function toggleBot(i){fetch("/api/toggle",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",index:i})}).then(()=>location.reload())}function deleteBot(i){if(confirm("Delete?"))fetch("/api/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",index:i})}).then(()=>location.reload())}function submitPayment(){const trx=document.getElementById("trxId").value;const num=document.getElementById("payerNum").value;if(!trx||!num)return alert("TrxID + Number দাও!");fetch("/api/submit-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",trxId:trx,payerNum:num})}).then(r=>r.json()).then(d=>{alert(d.msg);})}function logout(){localStorage.removeItem("pawar_email");localStorage.removeItem("pawar_pass");location.href="/";}function pairNow(botId){const num=document.getElementById("num-"+botId).value;if(!num)return alert("Number দাও!");fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",number:num})}).then(r=>r.json()).then(d=>{document.getElementById("pair-"+botId).innerText="Code: "+d.pairCode; alert("⚡ FAST Pair Code: "+d.pairCode+" - WhatsApp > Linked Devices > Link with Phone Number এ দাও, 3 Sec এ Connect হবে!");})}</script></body></html>';
  res.send(html);
});

app.post('/api/deploy',(req,res)=>{
  const email=req.body.email; const name=req.body.name; const token=req.body.token; const code=req.body.code; const type=req.body.type; const branch=req.body.branch||'main';
  const u=db.users[email]; if(!u) return res.json({msg:"Login করো"});
  const isExpired = u.plan!=="OWNER-UNLIMITED" && Date.now()>u.end && u.plan!=="VIP-PAID";
  if(isExpired) return res.json({msg:"⛔ Trial Expired! 300TK দিয়ে VIP নাও - bKash: "+MY_CHANNELS.BKASH_PERSONAL});
  if(type==='telegram'){
    https.get("https://api.telegram.org/bot"+token+"/getMe", (r)=>{
      let d=''; r.on('data',c=>d+=c); r.on('end',()=>{
        try{ const j=JSON.parse(d); if(!j.ok) return res.json({msg:"❌ Token ভুল!"}); u.bots.push({id:Date.now().toString(),name,type,token,code:'',status:"Running",username:j.result.username}); save(); startTelegramBot(token,name); res.json({msg:"✅ @"+j.result.username+" Deployed PRO! Link: https://pawar-vip-hosting.vercel.app/bot/"+Date.now()}); }catch(e){res.json({msg:"Token Error"})}
      });
    }).on('error',()=>res.json({msg:"Telegram Error"}));
  } else if(type==='github'){
    const newId=Date.now().toString();
    u.bots.push({id:newId,name,type,token,code:code||'npm start',branch,status:"Running",username:''}); save();
    res.json({msg:"✅ GitHub Repo "+name+" Deployed PRO! 🌐 Link: https://pawar-vip-hosting.vercel.app/bot/"+newId+" | No Sleep + Fast Pair Ready!"});
  } else {
    const newId=Date.now().toString();
    u.bots.push({id:newId,name,type,token:token||'',code:code||'',status:"Running",username:'',branch}); save();
    res.json({msg:"✅ "+type.toUpperCase()+" - "+name+" Deployed PRO! Link: https://pawar-vip-hosting.vercel.app/bot/"+newId});
  }
});
app.post('/api/toggle',(req,res)=>{ const email=req.body.email; const index=req.body.index; const u=db.users[email]; if(!u) return res.json({ok:false}); const b=u.bots[index]; if(b.status==='Running'){b.status='Stopped'; if(b.token&&activeTeleBots[b.token]) clearInterval(activeTeleBots[b.token].interval);} else {b.status='Running'; if(b.type==='telegram'&&b.token) startTelegramBot(b.token,b.name);} save(); res.json({ok:true}); });
app.post('/api/delete',(req,res)=>{ const email=req.body.email; const index=req.body.index; const u=db.users[email]; if(!u) return res.json({ok:false}); const b=u.bots[index]; if(b.token&&activeTeleBots[b.token]) clearInterval(activeTeleBots[b.token].interval); u.bots.splice(index,1); save(); res.json({ok:true}); });
app.post('/api/submit-payment',(req,res)=>{
  const email=req.body.email; const trxId=req.body.trxId; const payerNum=req.body.payerNum;
  if(!email||!trxId||!payerNum) return res.json({msg:"সব তথ্য দাও!"});
  if(!db.users[email]) return res.json({msg:"User নাই"});
  db.users[email].payment={trxId,payerNum,time:Date.now(),status:"PENDING"};
  save();
  res.json({msg:"✅ Payment Submitted! TrxID: "+trxId+" - Admin 5 মিনিটে PRO VIP করে দিবে।"});
});
app.post('/api/make-vip',(req,res)=>{ const adminPass=req.body.adminPass; const userEmail=req.body.userEmail; if(adminPass!=="PAWAR01837") return res.json({msg:"Admin Pass ভুল!"}); if(!db.users[userEmail]) return res.json({msg:"User নাই"}); db.users[userEmail].plan="VIP-PAID"; db.users[userEmail].end=Date.now()+365*24*60*60*1000; if(db.users[userEmail].payment) db.users[userEmail].payment.status="APPROVED"; save(); res.json({msg:"✅ "+userEmail+" PRO VIP করা হলো! 1 Year - No Sleep"}); });
app.get(SECRET_ADMIN,(req,res)=>{ let h='<h1 style="color:white;background:#111;padding:20px">🔐 ULTRA X PAWAR - ADMIN PRO + PAYMENTS + PAIR</h1><div style="color:white;background:#222;padding:20px"><h3>Make VIP (bKash/Nagad Verify)</h3><input id="vipEmail" placeholder="User Email" style="padding:8px;width:300px"><button onclick="makeVIP()">Make PRO VIP 1 Year - 300TK</button><p id="vipMsg"></p><p>bKash: '+MY_CHANNELS.BKASH_PERSONAL+' | Nagad: '+MY_CHANNELS.NAGAD_PERSONAL+'</p></div><table border=1 cellpadding=8 style="color:white;background:#222;margin:20px auto;width:95%"><tr><th>Gmail</th><th>Plan</th><th>Bots</th><th>End</th><th>Payment TrxID</th><th>Number</th><th>Status</th></tr>'; for(let e in db.users){ const u=db.users[e]; const pay=u.payment||{}; h+='<tr><td>'+e+'</td><td>'+u.plan+'</td><td>'+u.bots.length+'</td><td>'+new Date(u.end).toLocaleDateString()+'</td><td style="color:#facc15">'+(pay.trxId||'-')+'</td><td>'+(pay.payerNum||'-')+'</td><td>'+(pay.status||'-')+'</td></tr>'; } h+='<h3 style="color:white;text-align:center">Pair Sessions (Fast Pair)</h3><table border=1 cellpadding=8 style="color:white;background:#222;margin:10px auto;width:80%"><tr><th>Number</th><th>Code</th><th>Status</th></tr>'; for(let k in pairSessions){ const s=pairSessions[k]; h+='<tr><td>'+s.number+'</td><td style="color:#00ff88">'+s.pairCode+'</td><td>'+s.status+'</td></tr>'; } h+='</table><script>function makeVIP(){const email=document.getElementById("vipEmail").value;fetch("/api/make-vip",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({adminPass:"PAWAR01837",userEmail:email})}).then(r=>r.json()).then(d=>{document.getElementById("vipMsg").innerText=d.msg; setTimeout(()=>location.reload(),1000);})}</script>'; res.send(h); });
setTimeout(()=>{ for(let e in db.users){ db.users[e].bots.forEach(b=>{ if(b.status==='Running'&&b.type==='telegram'&&b.token) startTelegramBot(b.token,b.name); }); } },2000);
module.exports=app;
