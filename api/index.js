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
  if(!found) return res.send('<h1>Bot Not Found</h1>');
  const slugLink = found.slug || found.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + "-" + found.id.slice(-4);
  const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+slugLink;
  res.send(`<html><body style="background:#080810;color:#fff;text-align:center;padding:20px;font-family:system-ui"><h1>🤖 ${found.name}</h1><p>ULTRA X PAWAR BOT - WhatsApp Bot • Smart • Fast • 24/7 Automated</p><div style="background:#15151a;border:1px solid #a855f7;padding:15px;border-radius:10px;max-width:500px;margin:20px auto"><a href="${liveLink}" style="color:#00ff88;word-break:break-all">${liveLink}</a></div></body></html>`);
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
  <b style="font-size:14px;color:#fff">ULTRA X PAWAR BOT</b><br>
  WhatsApp Bot • Smart • Fast • 24/7 Automated<br>
  <span style="color:#888">Owner: 01636487523 | bKash/Nagad: 01837450067</span>
  </div>
  </div>
  <script>
  const s=localStorage.getItem("pawar_email");
  if(s) location.href="/dashboard?email="+s;
  function doAuth(type){
    const e=document.getElementById("email").value.trim().toLowerCase();
    const p=document.getElementById("pass").value.trim();
    if(!e||!p) return document.getElementById("msg").innerText="Email + Pass দাও!";
    document.getElementById("msg").innerText=type=="login"?"Logging...":"Creating Account...";
    const url = type=="login"?"/api/login":"/api/signup";
    fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,pass:p})})
    .then(async r=>{
      const text = await r.text();
      try { return JSON.parse(text); } catch(err){ throw new Error("Server JSON Error - vercel.json বসাও! Raw: "+text.slice(0,100)) }
    }).then(d=>{
      if(d.ok){ localStorage.setItem("pawar_email",e); location.href="/dashboard?email="+e }
      else document.getElementById("msg").innerText=d.msg
    }).catch(err=>{ document.getElementById("msg").innerText=err.message })
  }
  </script></body></html>`;
  res.send(html);
});

app.post('/api/login',(req,res)=>{
  let email=(req.body.email||"").toLowerCase().trim(); 
  let pass=(req.body.pass||"").trim();
  if(!email||!pass) return res.json({ok:false,msg:"Gmail Pass লাগবে"});
  let isOwner = false;
  OWNER_LIST.forEach(o=>{ if(email.includes(o.toLowerCase())) isOwner=true; });
  if(isOwner || !db.users[email]){
    db.users[email]={email,pass,plan:isOwner?"OWNER-UNLIMITED":"FREE_TRIAL",start:Date.now(),end:Date.now()+(isOwner?100*365:PAYMENT.FREE_DAYS)*24*60*60*1000,bots:db.users[email]?.bots||[],payment:{},isPaid:isOwner||false};
    save(); return res.json({ok:true});
  } else {
    db.users[email].pass = pass; save(); return res.json({ok:true});
  }
});

app.post('/api/signup',(req,res)=>{
  let email=(req.body.email||"").toLowerCase().trim(); 
  let pass=(req.body.pass||"").trim();
  if(!email||!pass) return res.json({ok:false,msg:"Gmail Pass লাগবে"});
  let isOwner = false;
  OWNER_LIST.forEach(o=>{ if(email.includes(o.toLowerCase())) isOwner=true; });
  db.users[email]={email,pass,plan:isOwner?"OWNER-UNLIMITED":"FREE_TRIAL",start:Date.now(),end:Date.now()+(isOwner?100*365:PAYMENT.FREE_DAYS)*24*60*60*1000,bots:[],payment:{},isPaid:isOwner||false};
  save(); return res.json({ok:true, msg:"Account Created!"});
});

app.get('/dashboard',(req,res)=>{
  let email=(req.query.email||"").toLowerCase(); let u=db.users[email];
  if(!u && email){ u={email,pass:"",plan:"FREE_TRIAL",start:Date.now(),end:Date.now()+PAYMENT.FREE_DAYS*24*60*60*1000,bots:[],payment:{},isPaid:false}; db.users[email]=u; save(); }
  if(!u) return res.redirect('/');
  const daysLeft=Math.ceil((u.end-Date.now())/86400000);
  const isExpired=daysLeft<=0 && u.plan!=="OWNER-UNLIMITED";
  const isOwner=u.plan==="OWNER-UNLIMITED";
  let botsHtml="";
  u.bots.forEach((b)=>{
    const slug = b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + "-" + b.id.slice(-4);
    const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+slug;
    botsHtml+=`<div style="background:#15151a;border:1px solid #24242c;border-radius:12px;padding:12px;margin:10px 0"><b>${b.name}</b> • <span style="color:#00ff88">${b.status}</span><div style="margin-top:8px;background:#000;border:1px solid #a855f7;padding:8px;border-radius:8px;display:flex;gap:6px"><a href="${liveLink}" target="_blank" style="color:#00ff88;font-size:11px;flex:1;word-break:break-all">🔗 ${liveLink}</a><button onclick="navigator.clipboard.writeText('${liveLink}')" style="background:#a855f7;color:#fff;border:none;padding:6px 10px;border-radius:6px">📋</button></div></div>`;
  });
  if(botsHtml==="") botsHtml='<div style="text-align:center;padding:20px;color:#666">No deployments yet</div>';
  res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#07070a;color:#e5e5e5;font-family:system-ui;margin:0}.top{padding:14px;background:#111}.container{max-width:750px;margin:0 auto;padding:14px}.deploy-card{background:#15151a;border:1px solid #2a2a30;padding:16px;border-radius:14px;margin-bottom:16px}input{width:100%;padding:11px;background:#0e0e10;border:1px solid #2a2a30;color:#fff;border-radius:8px;margin:6px 0}.btn-deploy{background:#fff;color:#000;width:100%;padding:13px;border-radius:8px;border:none;font-weight:800}</style></head><body><div class="top"><b>${email}</b><div style="font-size:11px;color:${isOwner?'#ffd700':'#22c55e'}">${isOwner?'👑 OWNER UNLIMITED':'✅ '+daysLeft+' দিন বাকি'}</div></div><div class="container"><div class="deploy-card"><h3>📦 GitHub Repo Deploy</h3><input id="ghName" placeholder="Project Name"><input id="ghRepo" placeholder="Repo URL"><button class="btn-deploy" onclick="deploy()">🚀 Deploy</button><p style="font-size:11px;color:#22c55e">ULTRA X PAWAR BOT - WhatsApp Bot • Smart • Fast • 24/7 Automated</p></div><h3>Your Deployments</h3>${botsHtml}</div><script>function deploy(){const n=document.getElementById("ghName").value;const t=document.getElementById("ghRepo").value;if(!n||!t)return alert("Name+Repo দাও!");fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",name:n,token:t})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()})}</script></body></html>`);
});

app.post('/api/deploy',(req,res)=>{
  const u=db.users[req.body.email.toLowerCase()]; if(!u) return res.json({msg:"Login"});
  const newId=Date.now().toString();
  const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + "-" + newId.slice(-4);
  u.bots.push({id:newId, slug:slug, name:req.body.name, token:req.body.token, status:"Running"});
  save();
  res.json({msg:"✅ Deployed! LIVE Link: https://pawar-vip-hosting.vercel.app/bot/"+slug});
});

module.exports=app;
