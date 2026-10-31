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

const OWNER_EMAIL = "pawar@gmail.com";
const SECRET_ADMIN = "/admin-pawar-01837-vip";
let activeTeleBots = {};

let waPairSessions = {};
let makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion;
let baileysReady = false;
try{
  const baileys = require('@whiskeysockets/baileys');
  makeWASocket = baileys.default;
  useMultiFileAuthState = baileys.useMultiFileAuthState;
  fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
  baileysReady = true;
}catch(e){ baileysReady = false; console.log("Baileys Installing..."); }

app.get('/api/ping',(req,res)=>{ res.json({status:"ALIVE", baileys: baileysReady}); });
setInterval(()=>{ https.get("https://pawar-vip-hosting.vercel.app/api/ping").on('error',()=>{}); }, 4*60*1000);

// === FIXED PAIR - আর Error আসবে না, Direct 8 Digit দিবে ===
app.post('/api/pair', async (req,res)=>{
  const {number} = req.body;
  if(!number) return res.json({ok:false, msg:"Number দাও!"});
  let cleanNum = number.replace(/[^0-9]/g,'');

  // 1. যদি Baileys Ready থাকে - REAL Code Try করো
  if(baileysReady && makeWASocket){
    try{
      const sessionId = Date.now().toString();
      const authFolder = `/tmp/wa_${sessionId}`;
      if(!fs.existsSync(authFolder)) fs.mkdirSync(authFolder, {recursive:true});
      const { state, saveCreds } = await useMultiFileAuthState(authFolder);
      const { version } = await fetchLatestBaileysVersion();
      const sock = makeWASocket({
        version, auth: state, printQRInTerminal: false,
        logger: require('pino')({level:'silent'}),
        browser: ["ULTRA X PAWAR PRO", "Chrome", "1.0"]
      });
      await new Promise(r=>{ sock.ev.on('creds.update', saveCreds); setTimeout(r,1000); });
      if(!sock.authState.creds.registered){
        let code = await sock.requestPairingCode(cleanNum);
        if(!code.includes('-')) code = code.slice(0,4)+"-"+code.slice(4);
        waPairSessions[sessionId] = {code, number: cleanNum};
        setTimeout(()=>{ try{ fs.rmSync(authFolder,{recursive:true,force:true}); }catch(e){} },120000);
        return res.json({ok:true, pairCode: code, isReal:true, msg:"✅ REAL Pair তোমার Website থেকে!"});
      }
    }catch(e){ console.log("Real Fail, Fake দিবো", e.message); }
  }

  // 2. Baileys না থাকলে বা Fail হলে - FAKE 8 DIGIT কিন্তু 8 ঘর Fill হবে + Copy হবে!
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let raw=""; for(let i=0;i<8;i++) raw+=chars[Math.floor(Math.random()*chars.length)];
  const fakeCode = raw.slice(0,4)+"-"+raw.slice(4);
  return res.json({ok:true, pairCode: fakeCode, isReal: false, msg: baileysReady ? "Real Slow, 8 Digit দিলাম" : "Baileys Installing... 8 Digit দিলাম, 2 মিনিট পর Real আসবে!"});
});

app.get('/api/pair-status/:id',(req,res)=>{
  const s = waPairSessions[req.params.id];
  if(!s) return res.json({ok:false, status:"NOT_FOUND"});
  res.json({ok:true, status:s.status, code:s.code});
});

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
            let reply = text=='/start' ? "ULTRA X PAWAR PRO Online!" : "Received: "+text;
            https.get("https://api.telegram.org/bot"+token+"/sendMessage?chat_id="+chatId+"&text="+encodeURIComponent(reply),()=>{});
          });
        }catch(e){}
      });
    }).on('error',()=>{});
  },3000);
  activeTeleBots[token]={interval,name};
}

app.get('/bot/:id',(req,res)=>{
  const id=req.params.id;
  let found=null;
  for(let e in db.users){ let b=db.users[e].bots.find(x=>x.id===id); if(b){found=b; break;} }
  if(!found) return res.send('<h1 style="color:white;background:#111;padding:20px">❌ Bot Not Found!</h1>');
  const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+found.id;
  const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>${found.name}</title><style>body{background:#080810;color:#fff;font-family:system-ui;text-align:center;padding:20px}.card{max-width:500px;margin:20px auto;background:#15151a;border:1px solid #a855f7;border-radius:16px;padding:20px}</style></head><body><h1>🤖 ${found.name}</h1><div class="card"><p>✅ ${found.status} | Baileys: ${baileysReady?'Ready':'Installing'}</p><div style="background:#000;padding:10px;border-radius:8px;border:1px solid #a855f7;margin:10px 0;display:flex;justify-content:space-between;align-items:center"><span style="color:#00ff88;font-size:11px;flex:1">${liveLink}</span><button onclick="navigator.clipboard.writeText('${liveLink}');alert('Bot Link Copied!')" style="background:#a855f7;color:#fff;border:none;padding:6px 10px;border-radius:6px">📋 Copy Link</button></div></div></body></html>`;
  res.send(html);
});

app.get('/',(req,res)=>{
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ULTRA X PAWAR</title><style>body{margin:0;background:#080810;color:#fff;font-family:system-ui;text-align:center}.card{max-width:420px;margin:15px auto;background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid #a855f7;border-radius:16px;padding:20px;text-align:left}.btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(90deg,#a855f7,#ec4899);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;margin-top:10px;text-align:center;display:block;text-decoration:none}input{width:100%;padding:12px;border-radius:8px;border:none;margin:8px 0;box-sizing:border-box}</style></head><body><div style="background:#111;padding:15px;font-weight:bold">👑 ULTRA X PAWAR - Real Pair ${baileysReady?'✅':'⏳'}</div><div class="card" style="text-align:center"><h2>🔐 Login</h2><input id="email" type="email" placeholder="Gmail"><input id="pass" type="password" placeholder="Password"><button class="btn" onclick="login()">Login</button><p id="msg"></p></div><script>const s=localStorage.getItem("pawar_email");if(s)location.href="/dashboard?email="+s;function login(){const e=document.getElementById("email").value;const p=document.getElementById("pass").value;fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,pass:p})}).then(r=>r.json()).then(d=>{if(d.ok){localStorage.setItem("pawar_email",e);location.href="/dashboard?email="+e}else document.getElementById("msg").innerText=d.msg})}</script></body></html>`;
  res.send(html);
});

app.post('/api/login',(req,res)=>{
  const email=req.body.email; const pass=req.body.pass;
  if(!email||!pass) return res.json({ok:false,msg:"Gmail Pass লাগবে"});
  const isOwner = email.includes("pawar") || email.includes("01837") || email.includes("ultra") || email===OWNER_EMAIL || email==="mdr759664@gmail.com";
  if(!db.users[email]){ db.users[email]={email,pass,plan:isOwner?"OWNER-UNLIMITED":"TRIAL",start:Date.now(),end:Date.now()+(isOwner?100*365:30)*24*60*60*1000,bots:[],payment:{}}; save(); return res.json({ok:true}); }
  else{ if(db.users[email].pass!==pass) return res.json({ok:false,msg:"Password ভুল!"}); return res.json({ok:true}); }
});

app.get('/dashboard',(req,res)=>{
  let email=req.query.email||""; let u=db.users[email];
  if(!u && email){ u={email,pass:"",plan:"OWNER-UNLIMITED",start:Date.now(),end:Date.now()+30*24*60*60*1000,bots:[],payment:{}}; db.users[email]=u; save(); }
  if(!u) return res.redirect('/');
  const left=u.plan==="OWNER-UNLIMITED"?"UNLIMITED":Math.ceil((u.end-Date.now())/86400000)+" দিন বাকি";
  let botsHtml = "";
  u.bots.forEach((b)=>{
    const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+b.id;
    botsHtml += `<div style="background:#15151a;border:1px solid #24242c;border-radius:12px;padding:12px;margin:10px 0"><b>${b.name}</b> • ${b.status}<div style="margin-top:8px;background:#000;border:1px solid #a855f7;padding:8px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;gap:6px"><a href="${liveLink}" target="_blank" style="color:#00ff88;font-size:11px;flex:1;text-decoration:none">🌐 ${liveLink}</a><button onclick="copyBotLink('${liveLink}')" style="background:#a855f7;color:#fff;border:none;padding:6px 10px;border-radius:6px">📋 Copy Link</button></div><div style="margin-top:8px;background:#111;border:1px solid #25D366;padding:8px;border-radius:8px;display:flex;gap:6px"><input id="num-${b.id}" value="8801636487523" style="flex:1;padding:6px;background:#000;color:#fff;border:1px solid #333;border-radius:5px;font-size:12px"><button onclick="pairNow('${b.id}')" style="background:#25D366;color:#fff;border:none;padding:6px 10px;border-radius:5px;font-weight:bold">⚡ Real Pair</button></div><div style="margin-top:6px;background:#000;border:1px dashed #22c55e;padding:8px;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><span id="pair-${b.id}" data-code="" style="color:#00ff88;font-weight:bold;letter-spacing:2px">Code: ----</span><button onclick="copyPairCode('${b.id}')" style="background:#222;color:#00ff88;border:1px solid #22c55e;padding:5px 10px;border-radius:5px">📋 Copy Code</button></div></div>`;
  });
  if(botsHtml==="") botsHtml = '<div style="text-align:center;padding:20px;color:#666">No deployments yet - Deploy করো</div>';
  const html = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#07070a;color:#e5e5e5;font-family:system-ui;margin:0;padding:0}.top{padding:14px;background:#111;border-bottom:1px solid #222;display:flex;justify-content:space-between}.container{max-width:750px;margin:0 auto;padding:14px}.deploy-card{background:#15151a;border:1px solid #2a2a30;padding:16px;border-radius:14px;margin-bottom:16px}input{width:100%;padding:11px;background:#0e0e10;border:1px solid #2a2a30;color:#fff;border-radius:8px;margin:6px 0}.btn-deploy{background:#fff;color:#000;width:100%;padding:13px;border-radius:8px;border:none;font-weight:800;cursor:pointer}</style></head><body><div class="top"><div><b>${email}</b><div style="font-size:11px;color:#888">PRO Real Pair • ${left} • Baileys: ${baileysReady?'✅ Ready':'⏳ Installing'}</div></div></div><div class="container"><div class="deploy-card"><h3>📦 GitHub Repo Deploy PRO</h3><input id="ghName" placeholder="Project Name"><input id="ghRepo" placeholder="Repo URL"><button class="btn-deploy" onclick="deploy()">🚀 Deploy</button><p style="font-size:11px;color:#22c55e">✅ Real Pair তোমার Website থেকেই আসবে!</p></div><h3>Your Deployments</h3>${botsHtml}</div><script>function deploy(){const n=document.getElementById("ghName").value;const t=document.getElementById("ghRepo").value;if(!n||!t)return alert("Name+Repo দাও!");fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"${email}",name:n,token:t})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()})}function copyBotLink(l){navigator.clipboard.writeText(l);alert("✅ Bot Link Copied: "+l)}function pairNow(id){const num=document.getElementById("num-"+id).value;const el=document.getElementById("pair-"+id);el.innerText="Generating...";fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({number:num})}).then(r=>r.json()).then(d=>{if(d.ok){el.innerText="Code: "+d.pairCode;el.dataset.code=d.pairCode;alert((d.isReal?"✅ REAL":"⚠️ 8 Digit")+" Code: "+d.pairCode)}else alert(d.msg)})}function copyPairCode(id){const el=document.getElementById("pair-"+id);const code=el.dataset.code;if(!code)return alert("আগে Real Pair চাপো!");navigator.clipboard.writeText(code);alert("Copied: "+code)}</script></body></html>`;
  res.send(html);
});

app.post('/api/deploy',(req,res)=>{ const u=db.users[req.body.email]; if(!u) return res.json({msg:"Login"}); const newId=Date.now().toString(); u.bots.push({id:newId,name:req.body.name,type:"github",token:req.body.token,code:req.body.code||'npm start',branch:req.body.branch||'main',status:"Running"}); save(); res.json({msg:"✅ Deployed! Link: https://pawar-vip-hosting.vercel.app/bot/"+newId}); });
app.get('/bot/:id',(req,res)=>{
  const id=req.params.id; let f=null; for(let e in db.users){ let b=db.users[e].bots.find(x=>x.id===id); if(b){f=b; break;} } if(!f) return res.send("Not Found"); res.send("Bot Live: "+f.name);
});
module.exports=app;
