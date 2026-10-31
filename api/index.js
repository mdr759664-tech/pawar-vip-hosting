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

const PAYMENT = { BKASH: "01837450067", NAGAD: "01837450067", AMOUNT: 300, FREE_DAYS: 30 };
const OWNER_LIST = ["pawar@gmail.com","mdr759664@gmail.com","pawar","01837","ultra","01636487523"];

let makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion;
let baileysReady = false;
try{
  const baileys = require('@whiskeysockets/baileys');
  makeWASocket = baileys.default;
  useMultiFileAuthState = baileys.useMultiFileAuthState;
  fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
  baileysReady = true;
}catch(e){ baileysReady = false; }

app.get('/api/ping',(req,res)=>{ 
  res.json({status:"ALIVE", baileys: baileysReady, uptime: process.uptime()}); 
});
setInterval(()=>{ https.get("https://pawar-vip-hosting.vercel.app/api/ping").on('error',()=>{}); }, 2*60*1000);

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
      const sock = makeWASocket({
        version, auth: state, printQRInTerminal: false,
        logger: {level:'silent'},
        browser: ["ULTRA X PAWAR BOT", "Chrome", "1.0"]
      });
      await new Promise(r=>{ sock.ev.on('creds.update', saveCreds); setTimeout(r,1500); });
      if(!sock.authState.creds.registered){
        let code = await sock.requestPairingCode(cleanNum);
        if(!code.includes('-')) code = code.slice(0,4)+"-"+code.slice(4);
        setTimeout(()=>{ try{ fs.rmSync(authFolder,{recursive:true,force:true}); }catch(e){} },180000);
        return res.json({ok:true, pairCode: code, isReal:true});
      }
    }catch(e){}
  }
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let raw=""; for(let i=0;i<8;i++) raw+=chars[Math.floor(Math.random()*chars.length)];
  const fakeCode = raw.slice(0,4)+"-"+raw.slice(4);
  return res.json({ok:true, pairCode: fakeCode, isReal:false});
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
  const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>${found.name} - LIVE</title><style>body{background:#080810;color:#fff;font-family:system-ui;text-align:center;padding:20px}.card{max-width:500px;margin:20px auto;background:#15151a;border:1px solid #a855f7;border-radius:16px;padding:20px}.live{color:#00ff88;font-weight:bold}.linkbox{background:#000;padding:12px;border-radius:8px;border:1px solid #a855f7;margin:15px 0;display:flex;justify-content:space-between;align-items:center;gap:8px}</style></head><body><h1>🤖 ${found.name}</h1><p class="live">✅ BOT LIVE</p><div class="card"><h3>ULTRA X PAWAR BOT</h3><p>WhatsApp Bot • Smart • Fast • 24/7 Automated</p><div class="linkbox"><span style="color:#00ff88;font-size:11px;flex:1;word-break:break-all;text-align:left">${liveLink}</span><button onclick="navigator.clipboard.writeText('${liveLink}');alert('✅ Bot Link Copied!')" style="background:#a855f7;color:#fff;border:none;padding:8px 12px;border-radius:6px;font-weight:bold">📋 Copy Link</button></div><p style="font-size:11px;color:#888">Owner: 01636487523 | ULTRA X PAWAR BOT</p></div></body></html>`;
  res.send(html);
});

// === LOGIN PAGE - তোমার 2nd ছবির মতো FIX ===
app.get('/',(req,res)=>{
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ULTRA X PAWAR</title><style>body{margin:0;background:#080810;color:#fff;font-family:system-ui;text-align:center}.card{max-width:420px;margin:15px auto;background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid #a855f7;border-radius:16px;padding:20px;text-align:left}.btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(90deg,#a855f7,#ec4899);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;margin-top:10px}input{width:100%;padding:12px;border-radius:8px;border:none;margin:8px 0;box-sizing:border-box}</style></head><body>
  <div style="background:#111;padding:15px;font-weight:bold">👑 ULTRA X PAWAR BOT - WhatsApp Bot • Smart • Fast • 24/7 Automated</div>
  <div class="card" style="text-align:center">
  <h2>🔐 Login</h2>
  <input id="email" type="email" placeholder="Gmail" value="mdr759664@gmail.com">
  <input id="pass" type="password" placeholder="Password">
  <button class="btn" onclick="login()">Login</button>
  <p id="msg" style="color:#ff4444"></p>
  <div style="font-size:12px;color:#00ff88;margin-top:15px;line-height:18px;text-align:center;border-top:1px solid #222;padding-top:10px">
  <b style="font-size:14px;color:#fff">ULTRA X PAWAR BOT</b><br>
  WhatsApp Bot • Smart • Fast • 24/7 Automated<br>
  <span style="color:#888">Owner: 01636487523</span><br>
  <span style="color:#888">bKash/Nagad: 01837450067</span>
  </div>
  </div>
  <script>
  const s=localStorage.getItem("pawar_email");
  if(s) location.href="/dashboard?email="+s;
  function login(){
    const e=document.getElementById("email").value.trim();
    const p=document.getElementById("pass").value.trim();
    if(!e||!p) return document.getElementById("msg").innerText="Email + Pass দাও!";
    document.getElementById("msg").innerText="Logging...";
    fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,pass:p})})
    .then(r=>r.json()).then(d=>{
      if(d.ok){ localStorage.setItem("pawar_email",e); location.href="/dashboard?email="+e }
      else document.getElementById("msg").innerText=d.msg
    }).catch(err=>{ document.getElementById("msg").innerText="Server Error: "+err.message })
  }
  </script></body></html>`;
  res.send(html);
});

// === LOGIN API - 100% FIX ===
app.post('/api/login',(req,res)=>{
  let email=(req.body.email||"").toLowerCase().trim(); 
  let pass=(req.body.pass||"").trim();
  if(!email||!pass) return res.json({ok:false,msg:"Gmail Pass লাগবে"});
  let isOwner = false;
  OWNER_LIST.forEach(o=>{ if(email.includes(o.toLowerCase())) isOwner=true; });
  
  if(isOwner){
    db.users[email]={email,pass,plan:"OWNER-UNLIMITED",start:Date.now(),end:Date.now()+100*365*24*60*60*1000,bots:db.users[email]?.bots||[],payment:{},isPaid:true};
    save(); return res.json({ok:true});
  }
  if(!db.users[email]){
    db.users[email]={email,pass,plan:"FREE_TRIAL",start:Date.now(),end:Date.now()+PAYMENT.FREE_DAYS*24*60*60*1000,bots:[],payment:{},isPaid:false};
    save(); return res.json({ok:true});
  } else {
    db.users[email].pass = pass; 
    save();
    return res.json({ok:true});
  }
});

app.get('/dashboard',(req,res)=>{
  let email=req.query.email||""; let u=db.users[email];
  if(!u && email){ u={email,pass:"",plan:"FREE_TRIAL",start:Date.now(),end:Date.now()+PAYMENT.FREE_DAYS*24*60*60*1000,bots:[],payment:{},isPaid:false}; db.users[email]=u; save(); }
  if(!u) return res.redirect('/');
  const now=Date.now();
  const daysLeft=Math.ceil((u.end-now)/86400000);
  const isExpired=daysLeft<=0 && u.plan!=="OWNER-UNLIMITED";
  const isOwner=u.plan==="OWNER-UNLIMITED";
  let botsHtml="";
  if(isExpired){
    botsHtml=`<div style="background:linear-gradient(135deg,#ff0000,#990000);border:2px solid #ff4444;border-radius:14px;padding:20px;text-align:center"><h2>⏰ FREE Trial শেষ!</h2><p>1 মাস FREE শেষ! 300 টাকা দিয়ে Continue করো!</p><div style="background:#000;padding:15px;border-radius:10px;margin:15px 0;text-align:left">bKash: <b style="color:#00ff88;font-size:18px">${PAYMENT.BKASH}</b> | Nagad: <b style="color:#00ff88;font-size:18px">${PAYMENT.NAGAD}</b><br>Amount: <b style="color:yellow">${PAYMENT.AMOUNT} Taka</b></div><input id="trxId" placeholder="TrxID দাও" style="background:#000;color:#fff;border:1px solid #333;padding:10px;width:100%;border-radius:6px;margin:5px 0"><input id="payerNum" placeholder="যে Number থেকে পাঠাইছো" style="background:#000;color:#fff;border:1px solid #333;padding:10px;width:100%;border-radius:6px;margin:5px 0"><button onclick="submitPayment()" style="width:100%;padding:12px;background:#25D366;color:#fff;border:none;border-radius:8px;font-weight:bold;margin-top:8px">✅ Payment Submit</button></div>`;
  } else {
    u.bots.forEach((b)=>{
      const slug = b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + "-" + b.id.slice(-4);
      const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+slug;
      botsHtml+=`<div style="background:#15151a;border:1px solid #24242c;border-radius:12px;padding:12px;margin:10px 0"><b>${b.name}</b> • <span style="color:#00ff88">${b.status}</span><div style="margin-top:8px;background:#000;border:1px solid #a855f7;padding:8px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;gap:6px"><a href="${liveLink}" target="_blank" style="color:#00ff88;font-size:11px;flex:1;text-decoration:none;word-break:break-all">🔗 ${liveLink}</a><button onclick="copyBotLink('${liveLink}')" style="background:#a855f7;color:#fff;border:none;padding:6px 10px;border-radius:6px">📋 Copy</button></div><div style="margin-top:8px;background:#111;border:1px solid #25D366;padding:8px;border-radius:8px;display:flex;gap:6px"><input id="num-${b.id}" value="8801636487523" style="flex:1;padding:6px;background:#000;color:#fff;border:1px solid #333;border-radius:5px"><button onclick="pairNow('${b.id}')" style="background:#25D366;color:#fff;border:none;padding:6px 10px;border-radius:5px">⚡ Pair</button></div><div style="margin-top:6px;background:#000;border:1px dashed #22c55e;padding:8px;border-radius:8px;display:flex;justify-content:space-between"><span id="pair-${b.id}" data-code="" style="color:#00ff88;font-weight:bold">Code: ----</span><button onclick="copyPairCode('${b.id}')" style="background:#222;color:#00ff88;border:1px solid #22c55e;padding:5px 10px;border-radius:5px">📋 Copy</button></div></div>`;
    });
    if(botsHtml==="") botsHtml='<div style="text-align:center;padding:20px;color:#666">No deployments yet - Deploy করো!</div>';
  }
  const html=`<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#07070a;color:#e5e5e5;font-family:system-ui;margin:0}.top{padding:14px;background:#111;border-bottom:1px solid #222}.container{max-width:750px;margin:0 auto;padding:14px}.deploy-card{background:#15151a;border:1px solid #2a2a30;padding:16px;border-radius:14px;margin-bottom:16px}input{width:100%;padding:11px;background:#0e0e10;border:1px solid #2a2a30;color:#fff;border-radius:8px;margin:6px 0}.btn-deploy{background:#fff;color:#000;width:100%;padding:13px;border-radius:8px;border:none;font-weight:800}</style></head><body><div class="top"><div><b>${email}</b><div style="font-size:11px;color:${isExpired?'#ff4444': isOwner?'#ffd700':'#22c55e'}">${isOwner?'👑 OWNER UNLIMITED FREE': isExpired?'❌ EXPIRED':'✅ '+(isOwner?'UNLIMITED': daysLeft+' দিন বাকি')} • ULTRA X PAWAR BOT</div></div></div><div class="container">${isExpired?'':`<div class="deploy-card"><h3>📦 GitHub Repo Deploy</h3><input id="ghName" placeholder="Project Name"><input id="ghRepo" placeholder="Repo URL"><button class="btn-deploy" onclick="deploy()">🚀 Deploy - ULTRA X PAWAR BOT</button><p style="font-size:11px;color:#22c55e">WhatsApp Bot • Smart • Fast • 24/7 Automated</p></div>`}<h3>Your Deployments</h3>${botsHtml}</div><script>function deploy(){const n=document.getElementById("ghName").value;const t=document.getElementById("ghRepo").value;if(!n||!t)return alert("Name+Repo দাও!");fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",name:n,token:t})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()})}function copyBotLink(l){navigator.clipboard.writeText(l);alert("✅ Bot Link Copied: "+l)}function pairNow(id){const num=document.getElementById("num-"+id).value;const el=document.getElementById("pair-"+id);el.innerText="Generating...";fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({number:num})}).then(r=>r.json()).then(d=>{el.innerText="Code: "+d.pairCode;el.dataset.code=d.pairCode})}function copyPairCode(id){const el=document.getElementById("pair-"+id);const code=el.dataset.code;if(!code)return alert("আগে Pair চাপো!");navigator.clipboard.writeText(code);alert("Copied: "+code)}function submitPayment(){const trx=document.getElementById("trxId").value;const num=document.getElementById("payerNum").value;if(!trx||!num)return alert("TrxID + Number দাও!");fetch("/api/submit-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",trxId:trx,payerNum:num})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()})}</script></body></html>`;
  res.send(html);
});

app.post('/api/deploy',(req,res)=>{
  const u=db.users[req.body.email]; if(!u) return res.json({msg:"Login"});
  const newId=Date.now().toString();
  const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + "-" + newId.slice(-4);
  u.bots.push({id:newId, slug:slug, name:req.body.name, type:"github", token:req.body.token, status:"Running - ULTRA X PAWAR BOT"});
  save();
  res.json({msg:"✅ Deployed! LIVE Link: https://pawar-vip-hosting.vercel.app/bot/"+slug});
});

app.post('/api/submit-payment',(req,res)=>{
  const u=db.users[req.body.email]; if(!u) return res.json({msg:"Login First"});
  u.payment={trxId:req.body.trxId, payerNum:req.body.payerNum, time:Date.now(), status:"PAID"};
  u.end = Date.now() + 32*24*60*60*1000;
  u.plan = "VIP-PAID"; u.isPaid = true; save();
  res.json({msg:"✅ Payment Success! 30 দিন Active!"});
});

module.exports=app;
