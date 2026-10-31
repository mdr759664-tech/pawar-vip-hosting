const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send("<h1>👑 PAWAR VIP HOSTING LIVE 👑<br>1 Month Free Trial | 300 TK VIP</h1>");
});
app.listen(3000, ()=>console.log("Live"));
