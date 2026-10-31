const express = require('express');
const app = express();
const fs = require('fs');
const path = '/tmp/users.json';

let users = {};
if (fs.existsSync(path)) {
  try { users = JSON.parse(fs.readFileSync(path)); } catch(e){ users={} }
}
function saveUsers() { fs.writeFileSync(path, JSON.stringify(users)); }

const ADMIN_NUMBER = "01837450067";
const SECRET_ADMIN_LINK = "/admin-pawar-01837-vip"; // এটা গোপন লিংক, কাউকে দিও না!

// --- 1. পাবলিক ওয়েবসাইট (এখানে Admin Check থাকবে না) ---
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pawar VIP Hosting - Best Free Bot Hosting BD 2026</title>
<style>
body{background:#0a0a0a;color:white;font-family:sans-serif;text-align:center;padding:15px}
.card{background:linear-gradient(145deg,#1a1a2e,#16213e);border:2px solid #a855f7;border-radius:20px;padding:20px;margin:15px auto;max-width:380px}
.btn{background:linear-gradient(90deg,#a855f7,#ec4899);border:none;padding:15px;border-radius:12px;color:white;font-weight:bold;width:100%;font-size:18px;margin-top:10px;cursor:pointer}
.price{font-size:36px;color:#facc15;font-weight:bold}
.bkash{background:#e2136e;padding:10px;border-radius:10px;margin-top:10px;font-weight:bold}
input{padding:12px;width:90%;border-radius:10px;border:none;margin-top:10px}
</style>
</head>
<body>
<h1>👑 PAWAR VIP HOSTING</h1>
<div class="card">
<h2>🎁 1 MONTH FREE TRIAL</h2>
<div class="price">0 TK</div>
<p>✅ 30 দিন Unlimited Free</p>
<button class="btn" onclick="startTrial()">FREE TRIAL START করো</button>
<p id="msg"></p>
</div>

<div class="card" style="border-color:#facc15">
<h2>💎 VIP PLAN</h2>
<div class="price">300 TK / Month</div>
<div class="bkash">bKash Personal<br>01837450067<br>300 TK Send Money</div>
<button class="btn" onclick="location.href='https://wa.me/8801837450067'">VIP BUY - WhatsApp</button>
</div>

<div class="card">
<h3>আমার Trial Check</h3>
<input id="num" placeholder="তোমার Number দাও">
<button class="btn" onclick="checkTrial()">Check করো</button>
<p id="result"></p>
</div>

<script>
function startTrial(){
  const n = prompt("তোমার WhatsApp Number দাও (880...):");
  if(!n) return;
  fetch('/api/start?number='+n).then(r=>r.text()).then(d=>{document.getElementById('msg').innerHTML=d; alert(d);});
}
function checkTrial(){
  const n = document.getElementById('num').value;
  fetch('/api/check?number='+n).then(r=>r.text()).then(d=>document.getElementById('result').innerHTML=d);
}
</script>
</body>
</html>
  `);
});

// --- 2. গোপন Admin Panel (শুধু তুমি ঢুকতে পারবে) ---
app.get(SECRET_ADMIN_LINK, (req, res) => {
  let html = `<h1>🔐 PAWAR ADMIN PANEL (Secret)</h1><p>Owner: ${ADMIN_NUMBER} = Unlimited</p><table border=1 cellpadding=10 style="margin:auto;color:white;background:#222"><tr><th>Number</th><th>Plan</th><th>বাকি দিন</th><th>Action</th></tr>`;
  for (let num in users) {
    const u = users[num];
    const isOwner = num.includes("1837450067");
    const left = isOwner ? "UNLIMITED ♾️" : Math.ceil((u.end - Date.now())/(1000*60*60*24)) + " দিন";
    html += `<tr><td>${num}</td><td>${u.plan}</td><td>${left}</td><td><a href="/admin/make-vip?number=${num}&key=01837" style="color:yellow">VIP করো</a> | <a href="/admin/delete?number=${num}&key=01837" style="color:red">Delete</a></td></tr>`;
  }
  html += `</table><br><a href="/">Back to Home</a>`;
  res.send(html);
});

app.get('/api/start', (req, res) => {
  const number = req.query.number;
  if (users[number]) {
     const left = Math.ceil((users[number].end - Date.now())/(1000*60*60*24));
     if (left > 0) return res.send(`✅ তোমার Trial আছে আরো ${left} দিন!`);
  }
  // Owner unlimited
  if (number.includes("1837450067")) {
    users[number] = { number, plan: 'OWNER-UNLIMITED', start: Date.now(), end: Date.now() + 100*365*24*60*60*1000 };
  } else {
    users[number] = { number, plan: 'trial', start: Date.now(), end: Date.now() + 30*24*60*60*1000 };
  }
  saveUsers();
  res.send(`✅ ${number} এর Trial Start হলো! Owner হলে Unlimited, বাকিদের 30 দিন!`);
});

app.get('/api/check', (req, res) => {
  const u = users[req.query.number];
  if (!u) return res.send("❌ Trial Start করো নাই!");
  if (req.query.number.includes("1837450067")) return res.send("♾️ তুমি OWNER! তোমার Unlimited Hosting!");
  const left = Math.ceil((u.end - Date.now())/(1000*60*60*24));
  if (left > 0) return res.send(`✅ তোমার Trial আছে আরো ${left} দিন!`);
  return res.send(`❌ Trial শেষ! 300 TK দাও: bKash 01837450067`);
});

app.get('/admin/make-vip', (req, res) => {
  if (req.query.key !== "01837") return res.send("Hacker?");
  if (users[req.query.number]) { users[req.query.number].plan = "VIP"; users[req.query.number].end = Date.now() + 365*24*60*60*1000; saveUsers(); }
  res.redirect(SECRET_ADMIN_LINK);
});
app.get('/admin/delete', (req, res) => {
  if (req.query.key !== "01837") return res.send("Hacker?");
  delete users[req.query.number]; saveUsers();
  res.redirect(SECRET_ADMIN_LINK);
});

module.exports = app;
app.listen(process.env.PORT || 3000, () => console.log("PAWAR HOSTING LIVE"));
