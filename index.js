const express = require('express');
const app = express();
const fs = require('fs');
const path = '/tmp/users.json';

let users = {};
if (fs.existsSync(path)) {
  users = JSON.parse(fs.readFileSync(path));
}
function saveUsers() {
  fs.writeFileSync(path, JSON.stringify(users));
}

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pawar VIP Hosting - Best Free Bot Hosting BD 2026 | 1 Month Free</title>
<meta name="description" content="Pawar VIP Hosting - Bangladesh er No.1 Free Bot Hosting. 1 Month Full Free Trial, Tarpor 300 TK VIP. bKash 01837450067">
<meta name="keywords" content="Pawar VIP Hosting, free bot hosting bd, bot hosting bangladesh, pawar hosting, free hosting bd">
<meta name="robots" content="index, follow">
<style>
body{background:#0a0a0a;color:white;font-family:sans-serif;text-align:center;padding:15px}
.card{background:linear-gradient(145deg,#1a1a2e,#16213e);border:2px solid #a855f7;border-radius:20px;padding:20px;margin:15px auto;max-width:380px}
.btn{background:linear-gradient(90deg,#a855f7,#ec4899);border:none;padding:15px;border-radius:12px;color:white;font-weight:bold;width:100%;font-size:18px;margin-top:10px;cursor:pointer}
.price{font-size:36px;color:#facc15;font-weight:bold}
.bkash{background:#e2136e;padding:10px;border-radius:10px;margin-top:10px;font-weight:bold}
</style>
</head>
<body>
<h1>👑 PAWAR VIP HOSTING</h1>
<p>Render এর মতো Fast & Powerful - Google Searchable!</p>

<div class="card">
<h2>🎁 1 MONTH FREE TRIAL</h2>
<div class="price">0 TK</div>
<p>✅ 30 দিন Unlimited Free</p>
<p>✅ 24/7 Online</p>
<button class="btn" onclick="start('trial')">FREE TRIAL START করো</button>
</div>

<div class="card" style="border-color:#facc15">
<h2>💎 VIP PLAN</h2>
<div class="price">300 TK / Month</div>
<p>✅ Unlimited Bot Hosting</p>
<p>✅ Super Fast • No Sleep</p>
<div class="bkash">
bKash / Nagad Personal<br>
01837450067<br>
300 TK Send Money করে নিচে Number দাও
</div>
<button class="btn" onclick="start('vip')">VIP BUY - 300 TK</button>
</div>

<div class="card">
<h3>Admin Check</h3>
<input id="num" placeholder="তোমার Number দাও 8801..." style="padding:12px;width:90%;border-radius:10px;border:none;margin-top:10px">
<button class="btn" onclick="checkTrial()">আমার Trial কতদিন আছে?</button>
<p id="result"></p>
</div>

<script>
function start(plan){
  const n = prompt("তোমার WhatsApp Number দাও (880...):");
  if(!n) return;
  fetch('/api/start?number='+n+'&plan='+plan).then(r=>r.text()).then(d=>alert(d));
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

app.get('/api/start', (req, res) => {
  const { number, plan } = req.query;
  if (!users[number]) {
    users[number] = { number, plan: 'trial', start: Date.now(), end: Date.now() + 30*24*60*60*1000, isPaid: false };
    saveUsers();
    res.send(`✅ ${number} এর Trial Start হলো! 30 দিন Free পাবে!`);
  } else {
    const left = Math.ceil((users[number].end - Date.now()) / (1000*60*60*24));
    if (left > 0) res.send(`✅ তোমার Trial আছে আরো ${left} দিন!`);
    else res.send(`❌ Trial শেষ! 300 TK Pay করো: bKash 01837450067`);
  }
});

app.get('/api/check', (req, res) => {
  const u = users[req.query.number];
  if (!u) return res.send("❌ তুমি এখনো Trial Start করো নাই!");
  const left = Math.ceil((u.end - Date.now()) / (1000*60*60*24));
  if (left > 0) return res.send(`✅ তোমার Trial আছে আরো ${left} দিন!`);
  return res.send(`❌ Trial শেষ! এখন 300 TK দিতে হবে! bKash: <b>01837450067</b>`);
});

// Vercel এর জন্য এই লাইনটা MUST
module.exports = app;
app.listen(process.env.PORT || 3000, () => console.log("PAWAR HOSTING LIVE"));
