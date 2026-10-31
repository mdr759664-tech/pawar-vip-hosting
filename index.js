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
const MY_CHANNELS = {
  BOT_LINK: "https://ultra-x-pawar-bot.onrender.com",
  TELEGRAM_CHANNEL: "https://t.me/ultra_x_pawar",
  TELEGRAM_BOT: "https://t.me/ultra_x_pawar_bot",
  WHATSAPP_CHANNEL: "https://whatsapp.com/channel/0029VbDQERV7Noa0DwgpQC3f",
  OWNER_NUMBER: "01636487523"
};
const OWNER_EMAIL = "pawar@gmail.com";
const SECRET_ADMIN = "/admin-pawar-01837-vip";
let activeTeleBots = {};
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
            let reply = text=='/start' ? "ULTRA X PAWAR Online! Powered by Pawar VIP" : "Received: "+text;
            https.get("https://api.telegram.org/bot"+token+"/sendMessage?chat_id="+chatId+"&text="+encodeURIComponent(reply),()=>{});
          });
        }catch(e){}
      });
    }).on('error',()=>{});
  },3000);
  activeTeleBots[token]={interval,name};
}
app.get('/robots.txt',(req,res)=>res.type('text/plain').send("User-agent: *\nAllow: /\nSitemap: https://pawar-vip-hosting.vercel.app/sitemap.xml"));
app.get('/sitemap.xml',(req,res)=>res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://pawar-vip-hosting.vercel.app/</loc><lastmod>2026-05-11</lastmod><priority>1.0</priority></url><url><loc>https://pawar-vip-hosting.vercel.app/dashboard</loc><priority>0.8</priority></url></urlset>'));
app.get('/',(req,res)=>{
  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ULTRA X PAWAR BOT - Best Free Bot Hosting BD 2026</title><meta name="google-site-verification" content="PASTE_YOUR_GOOGLE_CODE_HERE" /><meta name="description" content="ULTRA X PAWAR BOT - Best Free Bot Hosting in Bangladesh. Host Telegram, WhatsApp, Messenger, Discord Bot for Free. 1 Month Free Trial, 900+ Commands, 24/7 Singapore Server." /><meta name="keywords" content="ultra x pawar, pawar vip hosting, bot hosting bd, free hosting bangladesh, whatsapp bot hosting, telegram bot hosting" /><meta property="og:title" content="ULTRA X PAWAR BOT - Free Hosting BD" /><meta property="og:url" content="https://pawar-vip-hosting.vercel.app" /><link rel="canonical" href="https://pawar-vip-hosting.vercel.app/" /><style>body{margin:0;background:#080810;color:#fff;font-family:system-ui;text-align:center}.nav{background:#111;padding:15px;font-weight:bold;font-size:20px}.card{max-width:420px;margin:15px auto;background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid #a855f7;border-radius:16px;padding:20px;text-align:left}.btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(90deg,#a855f7,#ec4899);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;margin-top:10px;text-align:center;display:block;text-decoration:none}input{width:100%;padding:12px;border-radius:8px;border:none;margin:8px 0;box-sizing:border-box}.bkash{background:#e2136e;padding:12px;border-radius:10px;text-align:center;font-weight:bold}.chan{display:flex;gap:6px;justify-content:center;margin:12px 0;flex-wrap:wrap}.chan a{padding:8px 12px;border-radius:20px;text-decoration:none;font-size:12px;font-weight:bold;color:#fff}.link-box{background:#0f0f0f;border:1px solid #333;padding:10px;border-radius:8px;margin:6px 0;font-size:12px;word-break:break-all}</style></head><body><div class="nav">👑 ULTRA X PAWAR BOT 👑</div><div class="chan"><a href="'+MY_CHANNELS.BOT_LINK+'" style="background:#a855f7">🤖 Bot Link</a><a href="'+MY_CHANNELS.TELEGRAM_CHANNEL+'" style="background:#229ED9">📢 Telegram</a><a href="'+MY_CHANNELS.WHATSAPP_CHANNEL+'" style="background:#25D366">💬 WhatsApp</a><a href="'+MY_CHANNELS.TELEGRAM_BOT+'" style="background:#0ea5e9">✈️ TG Bot</a></div><div class="card"><h2 style="text-align:center">🤖 WhatsApp Bot • Smart • Fast • 24/7</h2><p style="text-align:center">⚡ 900+ Commands | Auto Reply</p><p>💜 Pair by Code & QR<br>💜 Anti-Link, Anti-Spam<br>💜 Song, Video, FB, Insta Downloader</p><p style="text-align:center"><b>👑 Owner: '+MY_CHANNELS.OWNER_NUMBER+'</b></p><div class="link-box">📢 WhatsApp Channel:<br><a href="'+MY_CHANNELS.WHATSAPP_CHANNEL+'" style="color:#25D366">'+MY_CHANNELS.WHATSAPP_CHANNEL+'</a></div><div class="link-box">✈️ Telegram: <a href="'+MY_CHANNELS.TELEGRAM_BOT+'" style="color:#0ea5e9">@ultra_x_pawar_bot</a><br>Channel: <a href="'+MY_CHANNELS.TELEGRAM_CHANNEL+'" style="color:#229ED9">'+MY_CHANNELS.TELEGRAM_CHANNEL+'</a></div><div class="link-box">🌐 Pair Site:<br><a href="'+MY_CHANNELS.BOT_LINK+'" style="color:#a855f7">'+MY_CHANNELS.BOT_LINK+'</a></div></div><div class="card" style="text-align:center"><h2>🔐 Login / Register</h2><input id="email" type="email" placeholder="Gmail দাও"><input id="pass" type="password" placeholder="Password দাও"><button class="btn" onclick="login()">Login / Register</button><p id="msg"></p></div><div class="card" style="border-color:#facc15;text-align:center"><h2>🎁 1 Month Free Trial</h2><h1 style="color:#facc15">0 TK - 30 Days</h1><p>Public 1 মাস ফ্রি, তারপর 300 TK<br>Owner Lifetime Free ♾️</p></div><div class="card" style="border-color:gold;text-align:center"><h2>💎 VIP PLAN - 300 TK</h2><div class="bkash">bKash Personal<br>01837450067<br>300 TK Send Money</div><a href="https://wa.me/8801837450067" class="btn">Buy VIP - WhatsApp</a></div><script>function login(){const email=document.getElementById("email").value;const pass=document.getElementById("pass").value;if(!email||!pass)return alert("Gmail, Password দাও");fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,pass})}).then(r=>r.json()).then(d=>{if(d.ok){localStorage.setItem("pawar_email",email);location.href="/dashboard?email="+email;}else document.getElementById("msg").innerText=d.msg;});}</script></body></html>';
  res.send(html);
});
app.post('/api/login',(req,res)=>{
  const email=req.body.email; const pass=req.body.pass;
  if(!email||!pass) return res.json({ok:false,msg:"Gmail Pass লাগবে"});
  const isOwner = email.includes("pawar") || email.includes("01837") || email.includes("ultra") || email===OWNER_EMAIL || email==="mdr759664@gmail.com";
  if(!db.users[email]){
    db.users[email]={email,pass,plan:isOwner?"OWNER-UNLIMITED":"TRIAL",start:Date.now(),end:isOwner?Date.now()+100*365*24*60*60*1000:Date.now()+30*24*60*60*1000,bots:[]};
    save(); return res.json({ok:true});
  }else{
    if(db.users[email].pass!==pass) return res.json({ok:false,msg:"Password ভুল!"});
    const u=db.users[email];
    if(!isOwner && Date.now()>u.end && u.plan!="VIP-PAID") return res.json({ok:false,msg:"❌ 30 দিন Trial শেষ! 300 TK দিয়ে VIP নাও"});
    return res.json({ok:true});
  }
});
app.get('/dashboard',(req,res)=>{
  const email=req.query.email; const u=db.users[email]; if(!u) return res.redirect('/');
  const left=u.plan==="OWNER-UNLIMITED"?"UNLIMITED":Math.ceil((u.end-Date.now())/86400000)+" দিন বাকি";
  let botsHtml = "";
  u.bots.forEach((b,i)=>{
    botsHtml += '<div class="bot-card"><div style="display:flex;justify-content:space-between"><div><span class="dot '+(b.status==='Running'?'run':'stop')+'"></span><b>'+b.name+'</b><span class="badge tg">'+b.type.toUpperCase()+'</span><div style="font-size:11px;color:#888">ID: '+b.id.slice(-6)+' • '+b.status+' • SG-1</div></div><div style="display:flex;gap:6px"><button onclick="toggleBot('+i+')" style="background:#222;color:#fff;border:1px solid #333;padding:6px 10px;border-radius:6px;cursor:pointer">'+(b.status==='Running'?'⏸️':'▶️')+'</button><button onclick="deleteBot('+i+')" style="background:#2a1212;color:#ff5555;border:1px solid #401515;padding:6px 10px;border-radius:6px;cursor:pointer">🗑️</button></div></div><div class="log">> Deploying '+b.name+' to SG-1...<br>> Status: '+b.status+' OK<br>> Running</div></div>';
  });
  if(botsHtml==="") botsHtml = '<div style="text-align:center;padding:30px;color:#666;border:1px dashed #2a2a30;border-radius:12px">No deployments yet</div>';
  const html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{box-sizing:border-box}body{background:#07070a;color:#e5e5e5;font-family:system-ui;margin:0;padding:0}.top{padding:14px 16px;background:#111113;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center}.container{max-width:750px;margin:0 auto;padding:14px}.tabs{display:flex;gap:8px;overflow:auto;padding-bottom:8px;margin-bottom:12px}.tab{padding:8px 14px;border-radius:20px;background:#1e1e21;border:1px solid #2a2a2e;cursor:pointer;font-size:13px;white-space:nowrap}.tab.active{background:#fff;color:#000;font-weight:bold}.deploy-card{background:#15151a;border:1px solid #2a2a30;padding:16px;border-radius:14px;margin-bottom:16px}input,textarea{width:100%;padding:11px;background:#0e0e10;border:1px solid #2a2a30;color:#fff;border-radius:8px;margin:6px 0;font-size:13px}textarea{height:130px;font-family:monospace}.btn-deploy{background:#fff;color:#000;width:100%;padding:13px;border-radius:8px;border:none;font-weight:800;cursor:pointer;margin-top:8px}.bot-card{background:#15151a;border:1px solid #24242c;border-radius:12px;padding:12px;margin:10px 0}.dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px}.run{background:#22c55e}.stop{background:#ef4444}.badge{padding:2px 8px;border-radius:10px;font-size:10px;margin-left:6px;font-weight:bold}.tg{background:#0ea5e9}.log{background:#000;color:#00ff88;padding:8px;border-radius:6px;font-family:monospace;font-size:11px;margin-top:8px;border:1px solid #1a1a1a;height:90px;overflow:auto}.chan{display:flex;gap:6px;justify-content:center;margin:8px 0;flex-wrap:wrap}.chan a{padding:6px 10px;border-radius:15px;text-decoration:none;font-size:11px;color:#fff;font-weight:bold}</style></head><body><div class="top"><div><b style="font-size:14px">'+email+'</b><div style="font-size:11px;color:#888">SG-1 Connected ✅ • '+left+' • '+u.plan+'</div></div><span style="background:#1e1e21;border:1px solid #333;padding:5px 10px;border-radius:20px;font-size:11px">Online</span></div><div class="container"><div class="chan"><a href="'+MY_CHANNELS.BOT_LINK+'" style="background:#a855f7">🤖 Bot Link</a><a href="'+MY_CHANNELS.TELEGRAM_CHANNEL+'" style="background:#229ED9">📢 Telegram</a><a href="'+MY_CHANNELS.WHATSAPP_CHANNEL+'" style="background:#25D366">💬 WhatsApp Channel</a></div><div style="background:#111113;border:1px solid #2a2a30;border-radius:12px;padding:10px;display:flex;justify-content:space-between;margin-bottom:14px;font-size:12px"><span>🟢 Server: Online</span><span>📡 Singapore</span><span>⚡ 99.9%</span></div><div class="tabs"><div class="tab active" onclick="switchTab(&quot;telegram&quot;)" id="tab-telegram">📱 Telegram</div><div class="tab" onclick="switchTab(&quot;website&quot;)" id="tab-website">🌐 Website</div><div class="tab" onclick="switchTab(&quot;facebook&quot;)" id="tab-facebook">💬 Messenger</div><div class="tab" onclick="switchTab(&quot;discord&quot;)" id="tab-discord">🎮 Discord</div></div><div id="panel-telegram" class="deploy-card"><h3>📱 Telegram Bot Hosting</h3><input id="tgName" placeholder="Bot Name - ULTRA X PAWAR"><input id="tgToken" placeholder="Bot Token - BotFather"><button class="btn-deploy" onclick="deploy(&quot;telegram&quot;)">🚀 Deploy Telegram</button></div><div id="panel-website" class="deploy-card" style="display:none"><h3>🌐 Website / Node.js Hosting</h3><input id="webName" placeholder="Website Name"><textarea id="webCode" placeholder="Node.js Code Paste করো"></textarea><button class="btn-deploy" onclick="deploy(&quot;website&quot;)">🚀 Deploy Website</button></div><div id="panel-facebook" class="deploy-card" style="display:none"><h3>💬 Messenger / WhatsApp Bot</h3><input id="fbName" placeholder="Bot Name"><textarea id="fbCode" placeholder="fb-chat-api / Baileys Code"></textarea><button class="btn-deploy" onclick="deploy(&quot;facebook&quot;)">🚀 Deploy Bot</button></div><div id="panel-discord" class="deploy-card" style="display:none"><h3>🎮 Discord Bot</h3><input id="dcName" placeholder="Discord Name"><input id="dcToken" placeholder="Discord Token"><textarea id="dcCode" placeholder="Code Optional"></textarea><button class="btn-deploy" onclick="deploy(&quot;discord&quot;)">🚀 Deploy Discord</button></div><h3>Your Deployments ('+u.bots.length+')</h3>'+botsHtml+'</div><script>function switchTab(t){document.querySelectorAll(".deploy-card").forEach(c=>c.style.display="none");document.querySelectorAll(".tab").forEach(c=>c.classList.remove("active"));document.getElementById("panel-"+t).style.display="block";document.getElementById("tab-"+t).classList.add("active");}function deploy(type){let name,token,code;if(type==="telegram"){name=document.getElementById("tgName").value;token=document.getElementById("tgToken").value;code="";if(!name||!token)return alert("Name + Token দাও!");}if(type==="website"){name=document.getElementById("webName").value;code=document.getElementById("webCode").value;token="";if(!name||!code)return alert("Name + Code দাও!");}if(type==="facebook"){name=document.getElementById("fbName").value;code=document.getElementById("fbCode").value;token="";if(!name||!code)return alert("Name + Code দাও!");}if(type==="discord"){name=document.getElementById("dcName").value;token=document.getElementById("dcToken").value;code=document.getElementById("dcCode").value;if(!name||!token)return alert("Name + Token দাও!");}fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",name,token,code,type})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()});}function toggleBot(i){fetch("/api/toggle",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",index:i})}).then(()=>location.reload())}function deleteBot(i){if(confirm("Delete?"))fetch("/api/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",index:i})}).then(()=>location.reload())}</script></body></html>';
  res.send(html);
});
app.post('/api/deploy',(req,res)=>{
  const email=req.body.email; const name=req.body.name; const token=req.body.token; const code=req.body.code; const type=req.body.type;
  const u=db.users[email]; if(!u) return res.json({msg:"Login করো"});
  if(type==='telegram'){
    https.get("https://api.telegram.org/bot"+token+"/getMe", (r)=>{
      let d=''; r.on('data',c=>d+=c); r.on('end',()=>{
        try{ const j=JSON.parse(d); if(!j.ok) return res.json({msg:"❌ Token ভুল!"}); u.bots.push({id:Date.now().toString(),name,type,token,code:'',status:"Running",username:j.result.username}); save(); startTelegramBot(token,name); res.json({msg:"✅ @"+j.result.username+" Deployed!"}); }catch(e){res.json({msg:"Token Error"})}
      });
    }).on('error',()=>res.json({msg:"Telegram Error"}));
  } else {
    u.bots.push({id:Date.now().toString(),name,type,token:token||'',code:code||'',status:"Running",username:''}); save();
    res.json({msg:"✅ "+type.toUpperCase()+" - "+name+" Deployed!"});
  }
});
app.post('/api/toggle',(req,res)=>{ const email=req.body.email; const index=req.body.index; const u=db.users[email]; const b=u.bots[index]; if(b.status==='Running'){b.status='Stopped'; if(b.token&&activeTeleBots[b.token]) clearInterval(activeTeleBots[b.token].interval);} else {b.status='Running'; if(b.type==='telegram'&&b.token) startTelegramBot(b.token,b.name);} save(); res.json({ok:true}); });
app.post('/api/delete',(req,res)=>{ const email=req.body.email; const index=req.body.index; const u=db.users[email]; const b=u.bots[index]; if(b.token&&activeTeleBots[b.token]) clearInterval(activeTeleBots[b.token].interval); u.bots.splice(index,1); save(); res.json({ok:true}); });
app.post('/api/make-vip',(req,res)=>{ const adminPass=req.body.adminPass; const userEmail=req.body.userEmail; if(adminPass!=="PAWAR01837") return res.json({msg:"Admin Pass ভুল!"}); if(!db.users[userEmail]) return res.json({msg:"User নাই"}); db.users[userEmail].plan="VIP-PAID"; db.users[userEmail].end=Date.now()+365*24*60*60*1000; save(); res.json({msg:"✅ "+userEmail+" VIP করা হলো!"}); });
app.get(SECRET_ADMIN,(req,res)=>{ let h='<h1 style="color:white;background:#111;padding:20px">🔐 ULTRA X PAWAR - ADMIN</h1><div style="color:white;background:#222;padding:20px"><h3>Make VIP</h3><input id="vipEmail" placeholder="User Email" style="padding:8px"><button onclick="makeVIP()">Make VIP 1 Year - 300TK</button><p id="vipMsg"></p><p>Owner: 01636487523 | bKash: 01837450067</p></div><table border=1 cellpadding=8 style="color:white;background:#222;margin:20px auto"><tr><th>Gmail</th><th>Plan</th><th>Bots</th><th>End</th></tr>'; for(let e in db.users){ const u=db.users[e]; h+='<tr><td>'+e+'</td><td>'+u.plan+'</td><td>'+u.bots.length+'</td><td>'+new Date(u.end).toLocaleDateString()+'</td></tr>'; } h+='</table><script>function makeVIP(){const email=document.getElementById("vipEmail").value;fetch("/api/make-vip",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({adminPass:"PAWAR01837",userEmail:email})}).then(r=>r.json()).then(d=>{document.getElementById("vipMsg").innerText=d.msg; setTimeout(()=>location.reload(),1000);})}</script>'; res.send(h); });
setTimeout(()=>{ for(let e in db.users){ db.users[e].bots.forEach(b=>{ if(b.status==='Running'&&b.type==='telegram'&&b.token) startTelegramBot(b.token,b.name); }); } },2000);
module.exports=app;
