const express = require('express');
const fs = require('fs');
const app = express();

let users = {};
if (fs.existsSync('./users.json')) {
  users = JSON.parse(fs.readFileSync('./users.json'));
}

function saveUsers() {
  fs.writeFileSync('./users.json', JSON.stringify(users));
}

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{background:#0a0a0a;color:#fff;font-family:Arial;text-align:center;padding:15px}
.card{background:#1a1a2e;border:2px solid #a855f7;border-radius:20px;padding:20px;margin:15px auto;max-width:380px}
.btn{background:#a855f7;border:none;padding:14px;border-radius:10px;color:#fff;font-weight:bold;width:100%;font-size:16px;margin-top:10px}
.price{font-size:32px;color:#facc15;font-weight:bold}
.bkash{background:#e2136e;padding:10px;border-radius:10px;margin-top:10px;font-weight:bold}
</style>
</head>
<body>
<h1>PAWAR VIP HOSTING</h1>

<div class="card">
<h2>1 MONTH FREE TRIAL</h2>
<div class="price">0 TK</div>
<p>30 Days Free Hosting</p>
<button class="btn" onclick="startTrial()">START FREE TRIAL</button>
</div>

<div class="card" style="border-color:#facc15">
<h2>VIP PLAN</h2>
<div class="price">300 TK / Month</div>
<p>Unlimited Bot Hosting</p>
<div class="bkash">
bKash / Nagad Personal<br>
01837450067<br>
Send 300 TK
</div>
<button class="btn" onclick="startVip()">BUY VIP 300 TK</button>
</div>

<div class="card">
<h3>Check Trial</h3>
<input id="num" placeholder="8801xxxxxxxxx" style="padding:12px;width:90%;border-radius:8px;border:none;margin-top:10px">
<button class="btn" onclick="check()">CHECK DAYS</button>
<p id="result"></p>
</div>

<script>
function startTrial(){
  const n = prompt("Enter WhatsApp Number:");
  if(!n) return;
  fetch('/api/start?number='+n).then(r=>r.text()).then(d=>alert(d));
}
function startVip(){
  const n = prompt("Enter WhatsApp Number after payment:");
  if(!n) return;
  alert("Payment bKash 01837450067 - Send Screenshot to Admin");
}
function check(){
  const n = document.getElementById('num').value;
  fetch('/api/check?number='+n).then(r=>r.text()).then(d=>document.getElementById('result').innerHTML=d);
}
</script>
</body>
</html>
`);
});

app.get('/api/start', (req, res) => {
  const number = req.query.number;
  if (!users[number]) {
    users[number] = {
      start: Date.now(),
      end: Date.now() + 30*24*60*60*1000
    };
    saveUsers();
    res.send(number + " Trial Started. 30 Days Free. After 30 days pay 300 TK to 01837450067");
  } else {
    const left = Math.ceil((users[number].end - Date.now()) / (1000*60*60*24));
    if (left > 0) res.send("Trial Left: " + left + " Days");
    else res.send("Trial Expired. Pay 300 TK to bKash 01837450067");
  }
});

app.get('/api/check', (req, res) => {
  const u = users[req.query.number];
  if (!u) return res.send("Not Found");
  const left = Math.ceil((u.end - Date.now()) / (1000*60*60*24));
  if (left > 0) return res.send("Trial Left: " + left + " Days");
  return res.send("Trial Expired. Pay 300 TK to 01837450067");
});

app.listen(3000, () => console.log("Running"));
