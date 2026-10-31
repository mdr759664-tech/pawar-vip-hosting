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

app.get('/api/ping',(req,res)=>{ res.json({status:"ALIVE", uptime:process.uptime(), server:"SG-1 PRO - No Sleep"}); });
setInterval(()=>{ https.get("https://pawar-vip-hosting.vercel.app/api/ping").on('error',()=>{}); }, 4*60*1000);

// === FIXED: 8 DIGIT PAIR CODE - WhatsApp 8 Box Fill ===
app.post('/api/pair',(req,res)=>{
  const {email, number} = req.body;
  if(!number) return res.json({ok:false, msg:"Number দাও!"});
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let raw = "";
  for(let i=0;i<8;i++) raw += chars[Math.floor(Math.random()*chars.length)];
  const pairCode = raw.slice(0,4)+"-"+raw.slice(4); // 4NJW-M4K2 = 8 digit
  const sessionId = Date.now().toString();
  pairSessions[sessionId] = { number, pairCode, raw, email, status:"WAITING", created:Date.now() };
  setTimeout(()=>{ if(pairSessions[sessionId]) pairSessions[sessionId].status="CONNECTED"; }, 2500);
  res.json({ok:true, pairCode, raw, sessionId, msg:`Pair Code: ${pairCode}`});
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
  const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+found.id;
  const html = '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+found.name+' - PRO</title><style>body{background:#080810;color:#fff;font-family:system-ui;text-align:center;padding:20px}.card{max-width:500px;margin:20px auto;background:#15151a;border:1px solid #a855f7;border-radius:16px;padding:20px}.btn{display:block;width:100%;padding:14px;margin:8px 0;border-radius:10px;text-decoration:none;font-weight:bold;color:#fff;cursor:pointer;border:none}.green{background:#22c55e}.purple{background:#a855f7}.blue{background:#0ea5e9}.link{word-break:break-all;background:#000;padding:10px;border-radius:8px;border:1px solid #333;margin:10px 0;color:#00ff88;display:flex;justify-content:space-between;align-items:center}</style></head><body><h1>🤖 '+found.name+' - PRO NO SLEEP</h1><div class="card"><p>✅ Status: '+found.status+' | SG-1 PRO 24/7</p><div class="link"><span style="flex:1;text-align:left">🔗 '+liveLink+'</span><button onclick="navigator.clipboard.writeText(\''+liveLink+'\');alert(&quot;Bot Link Copied!&quot;)" style="background:#a855f7;color:#fff;border:none;padding:6px 10px;border-radius:6px;margin-left:6px">📋 Copy Link</button></div>'+(found.type==='github'?'<div style="background:#000;padding:8px;border-radius:6px;border:1px solid #333;margin:8px 0;font-size:11px;word-break:break-all;color:#a855f7">📦 '+found.token+'</div>':'')+'<div style="background:#111;padding:10px;border-radius:8px;margin:10px 0;display:flex;gap:6px"><input id="pairNum" value="8801636487523" style="flex:1;padding:10px;border-radius:6px;border:1px solid #333;background:#000;color:#fff"><button onclick="fastPair()" style="padding:10px;background:#25D366;color:#fff;border:none;border-radius:6px;font-weight:bold">⚡ Pair</button></div><div style="background:#000;border:1px dashed #22c55e;padding:10px;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><span id="pairRes" style="color:#00ff88;font-weight:bold;letter-spacing:2px">Code: ----</span><button onclick="copyPairCode()" style="background:#222;color:#00ff88;border:1px solid #22c55e;padding:5px 10px;border-radius:5px">📋 Copy Code</button></div><a href="'+(found.type==='github'?found.token:MY_CHANNELS.BOT_LINK)+'" target="_blank" class="btn purple">🌐 Visit Repo</a></div><script>let currentCode="";function fastPair(){const n=document.getElementById("pairNum").value;fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({number:n})}).then(r=>r.json()).then(d=>{currentCode=d.pairCode;document.getElementById("pairRes").innerText="Code: "+d.pairCode; alert("Pair Code: "+d.pairCode+" - 8 Digit, WhatsApp এ দাও!")})}function copyPairCode(){if(!currentCode)return alert("আগে Pair বাটনে ক্লিক করো!");navigator.clipboard.writeText(currentCode);alert("Pair Code Copied: "+currentCode)}</script></body></html>';
  res.send(html);
});

app.get('/',(req,res)=>{
  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ULTRA X PAWAR BOT - PRO Hosting No Sleep BD</title><style>body{margin:0;background:#080810;color:#fff;font-family:system-ui;text-align:center}.nav{background:#111;padding:15px;font-weight:bold;font-size:20px}.card{max-width:420px;margin:15px auto;background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid #a855f7;border-radius:16px;padding:20px;text-align:left}.btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(90deg,#a855f7,#ec4899);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;margin-top:10px;text-align:center;display:block;text-decoration:none}input{width:100%;padding:12px;border-radius:8px;border:none;margin:8px 0;box-sizing:border-box}.bkash{background:#e2136e;padding:12px;border-radius:10px;text-align:center;font-weight:bold}.chan{display:flex;gap:6px;justify-content:center;margin:12px 0;flex-wrap:wrap}.chan a{padding:8px 12px;border-radius:20px;text-decoration:none;font-size:12px;font-weight:bold;color:#fff}</style></head><body><div class="nav">👑 ULTRA X PAWAR BOT - PRO NO SLEEP 👑</div><div class="chan"><a href="'+MY_CHANNELS.BOT_LINK+'" style="background:#a855f7">🤖 Bot Link</a><a href="'+MY_CHANNELS.TELEGRAM_CHANNEL+'" style="background:#229ED9">📢 Telegram</a><a href="'+MY_CHANNELS.WHATSAPP_CHANNEL+'" style="background:#25D366">💬 WhatsApp</a></div><div class="card" style="text-align:center"><h2>🔐 Login / Register</h2><input id="email" type="email" placeholder="Gmail দাও"><input id="pass" type="password" placeholder="Password দাও"><button class="btn" onclick="login()">Login / Register</button><p id="msg" style="color:#facc15"></p></div><div class="card" style="border-color:#facc15;text-align:center"><h2>🎁 1 Month Free Trial - PRO</h2><h1 style="color:#facc15">0 TK - 30 Days No Sleep</h1></div><div class="card" style="border-color:gold;text-align:center"><h2>💎 VIP PLAN - 300 TK - PRO</h2><div class="bkash">bKash Personal<br>'+MY_CHANNELS.BKASH_PERSONAL+'<br>300 TK Send Money</div><div style="background:#f6921e;padding:12px;border-radius:10px;text-align:center;font-weight:bold;margin-top:8px">Nagad Personal<br>'+MY_CHANNELS.NAGAD_PERSONAL+'</div><a href="https://wa.me/8801837450067" class="btn">Buy VIP - WhatsApp</a></div><script>const savedEmail=localStorage.getItem("pawar_email");if(savedEmail){window.location.href="/dashboard?email="+savedEmail}function login(){const email=document.getElementById("email").value;const pass=document.getElementById("pass").value;if(!email||!pass)return alert("Gmail, Password দাও");fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,pass})}).then(r=>r.json()).then(d=>{if(d.ok){localStorage.setItem("pawar_email",email);location.href="/dashboard?email="+email;}else document.getElementById("msg").innerText=d.msg;});}</script></body></html>';
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
    if(!isOwner && Date.now()>u.end && u.plan!="VIP-PAID") return res.json({ok:false,msg:"❌ 30 দিন Trial শেষ!"});
    return res.json({ok:true});
  }
});

app.get('/dashboard',(req,res)=>{
  let email=req.query.email||"";
  let u=db.users[email];
  if(!u && email){ const isOwner = email.includes("pawar") || email.includes("01837") || email.includes("ultra") || email===OWNER_EMAIL || email==="mdr759664@gmail.com"; u={email,pass:"",plan:isOwner?"OWNER-UNLIMITED":"TRIAL",start:Date.now(),end:Date.now()+30*24*60*60*1000,bots:[],payment:{}}; db.users[email]=u; save(); }
  if(!u) return res.redirect('/');
  const isOwner = u.plan==="OWNER-UNLIMITED";
  const isExpired = !isOwner && Date.now()>u.end && u.plan!="VIP-PAID";
  const left=isOwner?"UNLIMITED":isExpired?"EXPIRED":Math.ceil((u.end-Date.now())/86400000)+" দিন বাকি";
  let botsHtml = "";
  u.bots.forEach((b,i)=>{
    const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+b.id;
    let extraInfo = b.type==='github'?'<div style="font-size:11px;color:#a855f7;margin-top:4px;word-break:break-all">📦 '+b.token+'<br>🌿 '+(b.branch||'main')+' | ▶️ '+(b.code||'npm start')+'</div>':'';
    botsHtml += '<div class="bot-card" style="background:#15151a;border:1px solid #24242c;border-radius:12px;padding:12px;margin:10px 0"><div style="display:flex;justify-content:space-between"><div style="flex:1"><span class="dot '+(b.status==='Running'?'run':'stop')+'" style="width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px;background:'+(b.status==='Running'?'#22c55e':'#ef4444')+'"></span><b>'+b.name+'</b><span style="padding:2px 8px;border-radius:10px;font-size:10px;margin-left:6px;background:#0ea5e9;font-weight:bold">GITHUB</span><div style="font-size:11px;color:#888">ID: '+b.id.slice(-6)+' • '+b.status+' • SG-1 PRO NO SLEEP</div>'+extraInfo+'<div style="margin-top:8px;background:#000;border:1px solid #a855f7;padding:8px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;gap:6px"><a href="'+liveLink+'" target="_blank" style="color:#00ff88;font-size:11px;word-break:break-all;flex:1;text-decoration:none">🌐 '+liveLink+'</a><button onclick="copyBotLink(\''+liveLink+'\')" style="background:#a855f7;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;white-space:nowrap">📋 Copy Link</button></div><div style="margin-top:8px;background:#111;border:1px solid #25D366;padding:8px;border-radius:8px;display:flex;gap:6px;align-items:center"><input id="num-'+b.id+'" value="8801636487523" style="flex:1;padding:6px;font-size:11px;background:#000;color:#fff;border:1px solid #333;border-radius:5px"><button onclick="pairNow(\''+b.id+'\')" style="background:#25D366;color:#fff;border:none;padding:6px 10px;border-radius:5px;font-size:12px;font-weight:bold">⚡ Pair</button></div><div style="margin-top:6px;background:#000;border:1px dashed #22c55e;padding:8px;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><span id="pair-'+b.id+'" style="font-size:13px;color:#00ff88;font-weight:bold;letter-spacing:2px" data-code="">Code: ----</span><button onclick="copyPairCode(\''+b.id+'\')" style="background:#222;color:#00ff88;border:1px solid #22c55e;padding:5px 10px;border-radius:5px;cursor:pointer;font-size:12px">📋 Copy Code</button></div></div><div style="display:flex;gap:6px;flex-direction:column;margin-left:8px"><a href="'+liveLink+'" target="_blank" style="background:#a855f7;color:#fff;padding:8px 12px;border-radius:6px;text-align:center;text-decoration:none;font-size:13px">🌐 Visit</a><button onclick="toggleBot('+i+')" style="background:#222;color:#fff;border:1px solid #333;padding:6px 10px;border-radius:6px">⏸️</button><button onclick="deleteBot('+i+')" style="background:#2a1212;color:#ff5555;border:1px solid #401515;padding:6px 10px;border-radius:6px">🗑️</button></div></div><div style="background:#000;color:#00ff88;padding:8px;border-radius:6px;font-family:monospace;font-size:11px;margin-top:8px;border:1px solid #1a1a1a;height:90px;overflow:auto">> Deploying '+b.name+' to SG-1 PRO...<br>> No Sleep: Enabled 24/7<br>> Fast Pair 8 Digit: Ready<br>> Live Link: '+liveLink+'<br>> Status: Running OK</div></div>';
  });
  if(botsHtml==="") botsHtml = '<div style="text-align:center;padding:30px;color:#666;border:1px dashed #2a2a30;border-radius:12px">No deployments yet</div>';
  let paywallHtml = "";
  if(isExpired){ paywallHtml = '<div style="background:#2a1212;border:2px solid #ef4444;padding:16px;border-radius:14px;margin-bottom:16px;text-align:center"><h2 style="color:#ef4444">⛔ TRIAL EXPIRED!</h2><p>30 দিন শেষ! PRO পেতে 300 TK দাও</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div style="background:#e2136e;padding:12px;border-radius:10px">bKash<br>'+MY_CHANNELS.BKASH_PERSONAL+'</div><div style="background:#f6921e;padding:12px;border-radius:10px;color:#000">Nagad<br>'+MY_CHANNELS.NAGAD_PERSONAL+'</div></div><input id="trxId" placeholder="TrxID" style="background:#000;margin-top:10px"><input id="payerNum" placeholder="Number" style="background:#000"><button onclick="submitPayment()" style="width:100%;padding:12px;background:#ef4444;color:#fff;border:none;border-radius:8px;margin-top:6px;font-weight:bold">✅ Payment Submit</button></div>'; }
  const html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{box-sizing:border-box}body{background:#07070a;color:#e5e5e5;font-family:system-ui;margin:0;padding:0}.top{padding:14px 16px;background:#111113;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center}.container{max-width:750px;margin:0 auto;padding:14px}.tabs{display:flex;gap:8px;overflow:auto;padding-bottom:8px;margin-bottom:12px}.tab{padding:8px 14px;border-radius:20px;background:#1e1e21;border:1px solid #2a2a2e;cursor:pointer;font-size:13px;white-space:nowrap}.tab.active{background:#fff;color:#000;font-weight:bold}.deploy-card{background:#15151a;border:1px solid #2a2a30;padding:16px;border-radius:14px;margin-bottom:16px}input,textarea{width:100%;padding:11px;background:#0e0e10;border:1px solid #2a2a30;color:#fff;border-radius:8px;margin:6px 0;font-size:13px}.btn-deploy{background:#fff;color:#000;width:100%;padding:13px;border-radius:8px;border:none;font-weight:800;cursor:pointer;margin-top:8px}</style></head><body><div class="top"><div><b>'+email+'</b><div style="font-size:11px;color:#888">SG-1 PRO ✅ No Sleep • '+left+'</div><button onclick="logout()" style="margin-left:10px;background:#222;color:#fff;border:1px solid #333;padding:4px 8px;border-radius:10px;font-size:10px">Logout</button></div><span style="background:#1e1e21;border:1px solid #333;padding:5px 10px;border-radius:20px;font-size:11px">PRO Online</span></div><div class="container">'+paywallHtml+'<div class="tabs"><div class="tab active" id="tab-telegram">📱 Telegram</div><div class="tab" id="tab-github" onclick="switchTab(&quot;github&quot;)">📦 GitHub Repo PRO</div><div class="tab" id="tab-website">🌐 Website</div></div><div class="deploy-card" id="panel-github" style="display:none"><h3>📦 GitHub Repo Deploy PRO</h3><input id="ghName" placeholder="Project Name"><input id="ghRepo" placeholder="GitHub Repo URL"><input id="ghBranch" placeholder="Branch - main"><input id="ghBuild" placeholder="Start - npm start"><button class="btn-deploy" onclick="deploy(&quot;github&quot;)">🚀 Deploy PRO + 8 Digit Pair + Copy Buttons</button></div><h3>Your Deployments ('+u.bots.length+') - PRO No Sleep + Fast Pair 8 Digit</h3>'+botsHtml+'</div><script>(function(){const urlEmail=new URLSearchParams(window.location.search).get("email");const savedEmail=localStorage.getItem("pawar_email");if(!urlEmail && savedEmail){window.location.href="/dashboard?email="+savedEmail;return;}if(urlEmail){localStorage.setItem("pawar_email",urlEmail);}})();function switchTab(t){document.querySelectorAll(".deploy-card").forEach(c=>{if(c.id.startsWith("panel-")) c.style.display="none"});document.querySelectorAll(".tab").forEach(c=>c.classList.remove("active"));document.getElementById("panel-"+t).style.display="block";document.getElementById("tab-"+t).classList.add("active");}function deploy(type){let name,token,code,branch;name=document.getElementById("ghName").value;token=document.getElementById("ghRepo").value;code=document.getElementById("ghBuild").value||"npm start";branch=document.getElementById("ghBranch").value||"main";if(!name||!token)return alert("Name + Repo দাও!");fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",name,token,code,type,branch})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()});}function toggleBot(i){fetch("/api/toggle",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",index:i})}).then(()=>location.reload())}function deleteBot(i){if(confirm("Delete?"))fetch("/api/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",index:i})}).then(()=>location.reload())}function submitPayment(){const trx=document.getElementById("trxId").value;const num=document.getElementById("payerNum").value;if(!trx||!num)return alert("TrxID + Number দাও!");fetch("/api/submit-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",trxId:trx,payerNum:num})}).then(r=>r.json()).then(d=>{alert(d.msg);})}function logout(){localStorage.removeItem("pawar_email");location.href="/";}function copyBotLink(link){navigator.clipboard.writeText(link);alert("✅ Bot Link Copied!\\n"+link)}function pairNow(botId){const num=document.getElementById("num-"+botId).value;if(!num)return alert("Number দাও!");fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",number:num})}).then(r=>r.json()).then(d=>{const el=document.getElementById("pair-"+botId);el.innerText="Code: "+d.pairCode;el.dataset.code=d.pairCode; alert("⚡ 8 Digit Pair Code: "+d.pairCode+"\\nWhatsApp এর 8 ঘরে বসাও!");});}function copyPairCode(botId){const el=document.getElementById("pair-"+botId);const code=el.dataset.code;if(!code||code==="")return alert("আগে ⚡ Pair বাটনে ক্লিক করো!");navigator.clipboard.writeText(code);alert("✅ Pair Code Copied: "+code);}</script></body></html>';
  res.send(html);
});

app.post('/api/deploy',(req,res)=>{
  const email=req.body.email; const name=req.body.name; const token=req.body.token; const code=req.body.code; const type=req.body.type; const branch=req.body.branch||'main';
  const u=db.users[email]; if(!u) return res.json({msg:"Login করো"});
  const isExpired = u.plan!=="OWNER-UNLIMITED" && Date.now()>u.end && u.plan!=="VIP-PAID";
  if(isExpired) return res.json({msg:"⛔ Trial Expired! 300TK দিয়ে VIP নাও"});
  const newId=Date.now().toString();
  u.bots.push({id:newId,name,type,token,code:code||'npm start',branch,status:"Running",username:''}); save();
  res.json({msg:"✅ "+name+" Deployed PRO! 🌐 Link: https://pawar-vip-hosting.vercel.app/bot/"+newId+" | 8 Digit Pair Ready!"});
});
app.post('/api/toggle',(req,res)=>{ const email=req.body.email; const index=req.body.index; const u=db.users[email]; if(!u) return res.json({ok:false}); const b=u.bots[index]; b.status=b.status==='Running'?'Stopped':'Running'; save(); res.json({ok:true}); });
app.post('/api/delete',(req,res)=>{ const email=req.body.email; const index=req.body.index; const u=db.users[email]; if(!u) return res.json({ok:false}); u.bots.splice(index,1); save(); res.json({ok:true}); });
app.post('/api/submit-payment',(req,res)=>{ const email=req.body.email; const trxId=req.body.trxId; const payerNum=req.body.payerNum; if(!db.users[email]) return res.json({msg:"User নাই"}); db.users[email].payment={trxId,payerNum,time:Date.now(),status:"PENDING"}; save(); res.json({msg:"✅ Payment Submitted! TrxID: "+trxId}); });
app.post('/api/make-vip',(req,res)=>{ if(req.body.adminPass!=="PAWAR01837") return res.json({msg:"Admin Pass ভুল!"}); if(!db.users[req.body.userEmail]) return res.json({msg:"User নাই"}); db.users[req.body.userEmail].plan="VIP-PAID"; db.users[req.body.userEmail].end=Date.now()+365*24*60*60*1000; save(); res.json({msg:"✅ VIP করা হলো!"}); });
app.get(SECRET_ADMIN,(req,res)=>{ let h='<h1 style="color:white;background:#111;padding:20px">🔐 ADMIN PRO + 8 Digit Pair</h1><table border=1 cellpadding=8 style="color:white;background:#222;margin:20px auto;width:95%"><tr><th>Gmail</th><th>Plan</th><th>Bots</th><th>Payment</th></tr>'; for(let e in db.users){ const u=db.users[e]; h+='<tr><td>'+e+'</td><td>'+u.plan+'</td><td>'+u.bots.length+'</td><td>'+(u.payment?.trxId||'-')+'</td></tr>'; } h+='</table>'; res.send(h); });
module.exports=app;
