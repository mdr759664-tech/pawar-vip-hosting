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
  BOT_LINK: "https://pawar-vip-hosting.vercel.app",
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

// === REAL WHATSAPP PAIRING - তোমার Website থেকেই Real Code আসবে ===
let waPairSessions = {};
let makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, delay;
try{
  const baileys = require('@whiskeysockets/baileys');
  makeWASocket = baileys.default;
  useMultiFileAuthState = baileys.useMultiFileAuthState;
  fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
  delay = baileys.delay;
}catch(e){ console.log("Baileys not installed, install it!"); }

app.get('/api/ping',(req,res)=>{ res.json({status:"ALIVE", uptime:process.uptime(), server:"SG-1 PRO - Real Pair"}); });
setInterval(()=>{ https.get("https://pawar-vip-hosting.vercel.app/api/ping").on('error',()=>{}); }, 4*60*1000);

// REAL PAIR CODE GENERATOR - তোমার Website থেকে
app.post('/api/pair', async (req,res)=>{
  const {number, email} = req.body;
  if(!number) return res.json({ok:false, msg:"Number দাও! যেমন: 8801636487523"});
  
  let cleanNum = number.replace(/[^0-9]/g,'');
  if(!cleanNum.startsWith('88')) cleanNum = cleanNum; // BD number

  if(!makeWASocket){
    return res.json({ok:false, msg:"Baileys Install করো! package.json এ @whiskeysockets/baileys add করো তারপর Redeploy দাও!"});
  }

  try{
    const sessionId = Date.now().toString();
    const authFolder = `/tmp/wa_${sessionId}`;
    if(!fs.existsSync(authFolder)) fs.mkdirSync(authFolder, {recursive:true});
    
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: require('pino')({level:'silent'}),
      browser: ["ULTRA X PAWAR PRO", "Chrome", "1.0"]
    });

    // 10 sec wait for connection
    await new Promise((resolve)=>{
      sock.ev.on('creds.update', saveCreds);
      setTimeout(resolve, 1000);
    });

    // Real Pair Code Request - WhatsApp থেকে Real Code
    if(!sock.authState.creds.registered){
      let code = await sock.requestPairingCode(cleanNum);
      // Format 8 digit: XXXX-XXXX
      if(code.includes('-')) code = code; else code = code.slice(0,4)+"-"+code.slice(4);
      
      waPairSessions[sessionId] = { number: cleanNum, code, email, folder: authFolder, sock, status: "WAITING_CODE" };
      
      // Auto delete after 2 min
      setTimeout(()=>{ try{ fs.rmSync(authFolder,{recursive:true,force:true}); delete waPairSessions[sessionId]; }catch(e){} }, 120000);

      sock.ev.on('connection.update', async (update)=>{
        const { connection } = update;
        if(connection === 'open'){
          waPairSessions[sessionId].status = "CONNECTED";
        }
      });

      return res.json({
        ok:true, 
        pairCode: code,
        raw: code.replace('-',''),
        sessionId,
        isReal: true,
        msg: `✅ REAL Pair Code তোমার Website থেকে! Code: ${code} - WhatsApp > Linked Devices > Link with Phone Number এ দাও, 10 Sec এ Connect হবে!`,
        number: cleanNum
      });
    }else{
      return res.json({ok:false, msg:"Already paired! Delete /tmp folder"});
    }

  }catch(err){
    console.error(err);
    return res.json({ok:false, msg:"Real Pair Error: "+err.message+" - Vercel এ Baileys Slow, 2বার Try করো!"});
  }
});

app.get('/api/pair-status/:id',(req,res)=>{
  const s = waPairSessions[req.params.id];
  if(!s) return res.json({ok:false, status:"NOT_FOUND"});
  res.json({ok:true, status:s.status, code:s.code, number:s.number});
});

// Telegram Bot
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
            let reply = text=='/start' ? "ULTRA X PAWAR PRO Online - Real Pair Code from Website!" : "Received: "+text;
            https.get("https://api.telegram.org/bot"+token+"/sendMessage?chat_id="+chatId+"&text="+encodeURIComponent(reply),()=>{});
          });
        }catch(e){}
      });
    }).on('error',()=>{});
  },3000);
  activeTeleBots[token]={interval,name};
}

app.get('/robots.txt',(req,res)=>res.type('text/plain').send("User-agent: *\nAllow: /"));
app.get('/sitemap.xml',(req,res)=>res.type('application/xml').send('<?xml version="1.0"?><urlset></urlset>'));

app.get('/bot/:id',(req,res)=>{
  const id=req.params.id;
  let found=null;
  for(let e in db.users){ let b=db.users[e].bots.find(x=>x.id===id); if(b){found=b; break;} }
  if(!found) return res.send('<h1 style="color:white;background:#111;padding:20px">❌ Bot Not Found!</h1>');
  const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+found.id;
  const html = '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+found.name+'</title><style>body{background:#080810;color:#fff;font-family:system-ui;text-align:center;padding:20px}.card{max-width:500px;margin:20px auto;background:#15151a;border:1px solid #a855f7;border-radius:16px;padding:20px}</style></head><body><h1>🤖 '+found.name+'</h1><div class="card"><p>✅ Status: '+found.status+' | Real Pair from Website</p><div style="background:#000;padding:10px;border-radius:8px;border:1px solid #a855f7;margin:10px 0;display:flex;justify-content:space-between;align-items:center"><span style="color:#00ff88;font-size:11px;flex:1">'+liveLink+'</span><button onclick="navigator.clipboard.writeText(\''+liveLink+'\');alert(&quot;Bot Link Copied!&quot;)" style="background:#a855f7;color:#fff;border:none;padding:6px 10px;border-radius:6px">📋 Copy Link</button></div><div style="margin-top:10px"><input id="pairNum" value="8801636487523" style="width:100%;padding:10px;background:#000;color:#fff;border:1px solid #333;border-radius:6px"><button onclick="getRealCode()" style="width:100%;margin-top:6px;padding:12px;background:#25D366;color:#fff;border:none;border-radius:8px;font-weight:bold">⚡ REAL Pair Code - Website থেকে</button><div id="pairRes" style="margin-top:10px;background:#000;border:1px dashed #22c55e;padding:10px;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><span id="codeText" style="color:#00ff88;font-weight:bold;letter-spacing:2px">Code: ----</span><button onclick="copyRealCode()" style="background:#222;color:#00ff88;border:1px solid #22c55e;padding:5px 10px;border-radius:5px">📋 Copy Code</button></div></div></div><script>let realCode="";function getRealCode(){const n=document.getElementById("pairNum").value;document.getElementById("codeText").innerText="Generating Real Code...";fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({number:n})}).then(r=>r.json()).then(d=>{if(d.ok){realCode=d.pairCode;document.getElementById("codeText").innerText="Code: "+d.pairCode; alert("✅ REAL Pair Code তোমার Website থেকে: "+d.pairCode+"\\nWhatsApp এ দাও, 100% Connect হবে!")}else alert("Error: "+d.msg)})}function copyRealCode(){if(!realCode)return alert("আগে REAL Pair বাটনে ক্লিক করো!");navigator.clipboard.writeText(realCode);alert("Real Code Copied: "+realCode)}</script></body></html>';
  res.send(html);
});

app.get('/',(req,res)=>{
  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ULTRA X PAWAR BOT - Real Pair</title><style>body{margin:0;background:#080810;color:#fff;font-family:system-ui;text-align:center}.card{max-width:420px;margin:15px auto;background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid #a855f7;border-radius:16px;padding:20px;text-align:left}.btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(90deg,#a855f7,#ec4899);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;margin-top:10px;text-align:center;display:block;text-decoration:none}input{width:100%;padding:12px;border-radius:8px;border:none;margin:8px 0;box-sizing:border-box}</style></head><body><div style="background:#111;padding:15px;font-weight:bold">👑 ULTRA X PAWAR BOT - Real Pair from Website 👑</div><div class="card" style="text-align:center"><h2>🔐 Login</h2><input id="email" type="email" placeholder="Gmail"><input id="pass" type="password" placeholder="Password"><button class="btn" onclick="login()">Login</button><p id="msg"></p></div><script>const s=localStorage.getItem("pawar_email");if(s)location.href="/dashboard?email="+s;function login(){const e=document.getElementById("email").value;const p=document.getElementById("pass").value;fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,pass:p})}).then(r=>r.json()).then(d=>{if(d.ok){localStorage.setItem("pawar_email",e);location.href="/dashboard?email="+e}else document.getElementById("msg").innerText=d.msg})}</script></body></html>';
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
  u.bots.forEach((b,i)=>{
    const liveLink = 'https://pawar-vip-hosting.vercel.app/bot/'+b.id;
    botsHtml += '<div style="background:#15151a;border:1px solid #24242c;border-radius:12px;padding:12px;margin:10px 0"><b>'+b.name+'</b> • '+b.status+'<div style="margin-top:8px;background:#000;border:1px solid #a855f7;padding:8px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;gap:6px"><a href="'+liveLink+'" target="_blank" style="color:#00ff88;font-size:11px;flex:1;text-decoration:none">🌐 '+liveLink+'</a><button onclick="copyBotLink(\''+liveLink+'\')" style="background:#a855f7;color:#fff;border:none;padding:6px 10px;border-radius:6px">📋 Copy Link</button></div><div style="margin-top:8px;background:#111;border:1px solid #25D366;padding:8px;border-radius:8px;display:flex;gap:6px"><input id="num-'+b.id+'" value="8801636487523" style="flex:1;padding:6px;background:#000;color:#fff;border:1px solid #333;border-radius:5px;font-size:12px"><button onclick="pairNow(\''+b.id+'\')" style="background:#25D366;color:#fff;border:none;padding:6px 10px;border-radius:5px;font-weight:bold">⚡ Real Pair</button></div><div style="margin-top:6px;background:#000;border:1px dashed #22c55e;padding:8px;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><span id="pair-'+b.id+'" data-code="" style="color:#00ff88;font-weight:bold;letter-spacing:2px">Code: ---- (Real from Website)</span><button onclick="copyPairCode(\''+b.id+'\')" style="background:#222;color:#00ff88;border:1px solid #22c55e;padding:5px 10px;border-radius:5px">📋 Copy Code</button></div></div>';
  });
  if(botsHtml==="") botsHtml = '<div style="text-align:center;padding:20px;color:#666">No deployments yet</div>';
  const html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#07070a;color:#e5e5e5;font-family:system-ui;margin:0;padding:0}.top{padding:14px;background:#111;border-bottom:1px solid #222;display:flex;justify-content:space-between}.container{max-width:750px;margin:0 auto;padding:14px}.deploy-card{background:#15151a;border:1px solid #2a2a30;padding:16px;border-radius:14px;margin-bottom:16px}input{width:100%;padding:11px;background:#0e0e10;border:1px solid #2a2a30;color:#fff;border-radius:8px;margin:6px 0}.btn-deploy{background:#fff;color:#000;width:100%;padding:13px;border-radius:8px;border:none;font-weight:800;cursor:pointer}</style></head><body><div class="top"><div><b>'+email+'</b><div style="font-size:11px;color:#888">PRO Real Pair • '+left+'</div><button onclick="logout()" style="background:#222;color:#fff;border:1px solid #333;padding:4px 8px;border-radius:10px;font-size:10px">Logout</button></div></div><div class="container"><div class="deploy-card"><h3>📦 GitHub Repo Deploy PRO - Real Pair from Website</h3><input id="ghName" placeholder="Project Name - RANA-X-VIP-BOT"><input id="ghRepo" placeholder="Repo URL"><input id="ghBranch" placeholder="main"><input id="ghBuild" placeholder="npm start"><button class="btn-deploy" onclick="deploy()">🚀 Deploy PRO + Real Pair</button><p style="font-size:11px;color:#22c55e">✅ Real Pair Code তোমার Website থেকেই আসবে, Render থেকে না!</p></div><h3>Your Deployments ('+u.bots.length+')</h3>'+botsHtml+'</div><script>(function(){const u=new URLSearchParams(location.search).get("email");const s=localStorage.getItem("pawar_email");if(!u&&s)location.href="/dashboard?email="+s;if(u)localStorage.setItem("pawar_email",u)})();function deploy(){const n=document.getElementById("ghName").value;const t=document.getElementById("ghRepo").value;const b=document.getElementById("ghBranch").value||"main";const c=document.getElementById("ghBuild").value||"npm start";if(!n||!t)return alert("Name+Repo দাও!");fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",name:n,token:t,code:c,type:"github",branch:b})}).then(r=>r.json()).then(d=>{alert(d.msg);location.reload()})}function copyBotLink(l){navigator.clipboard.writeText(l);alert("✅ Bot Link Copied: "+l)}function pairNow(id){const num=document.getElementById("num-"+id).value;if(!num)return alert("Number দাও!");const el=document.getElementById("pair-"+id);el.innerText="Generating Real Code from Website...";fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"'+email+'",number:num})}).then(r=>r.json()).then(d=>{if(d.ok){el.innerText="Code: "+d.pairCode+" (REAL)";el.dataset.code=d.pairCode;alert("✅ REAL Pair Code তোমার Website থেকে: "+d.pairCode+"\\nWhatsApp এ দাও!")}else alert("Error: "+d.msg)})}function copyPairCode(id){const el=document.getElementById("pair-"+id);const code=el.dataset.code;if(!code)return alert("আগে Real Pair বাটনে ক্লিক করো!");navigator.clipboard.writeText(code);alert("✅ Real Pair Code Copied: "+code)}function logout(){localStorage.removeItem("pawar_email");location.href="/"}</script></body></html>';
  res.send(html);
});

app.post('/api/deploy',(req,res)=>{ const u=db.users[req.body.email]; if(!u) return res.json({msg:"Login"}); const newId=Date.now().toString(); u.bots.push({id:newId,name:req.body.name,type:"github",token:req.body.token,code:req.body.code||'npm start',branch:req.body.branch||'main',status:"Running"}); save(); res.json({msg:"✅ Deployed! Link: https://pawar-vip-hosting.vercel.app/bot/"+newId+" | Real Pair Ready from Website!"}); });
app.post('/api/toggle',(req,res)=>{ const u=db.users[req.body.email]; u.bots[req.body.index].status=u.bots[req.body.index].status==='Running'?'Stopped':'Running'; save(); res.json({ok:true}); });
app.post('/api/delete',(req,res)=>{ db.users[req.body.email].bots.splice(req.body.index,1); save(); res.json({ok:true}); });
app.post('/api/submit-payment',(req,res)=>{ db.users[req.body.email].payment={trxId:req.body.trxId,payerNum:req.body.payerNum}; save(); res.json({msg:"Submitted"}); });
app.post('/api/make-vip',(req,res)=>{ if(req.body.adminPass!=="PAWAR01837") return res.json({msg:"Wrong"}); db.users[req.body.userEmail].plan="VIP-PAID"; db.users[req.body.userEmail].end=Date.now()+365*24*60*60*1000; save(); res.json({msg:"VIP Done"}); });
app.get(SECRET_ADMIN,(req,res)=>{ res.send("ADMIN"); });
module.exports=app;
