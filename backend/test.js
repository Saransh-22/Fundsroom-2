
const express = require('express');
const app = require('./dist/app.js').default;
app.listen(3007, async () => {
  const loginRes = await fetch('http://localhost:3007/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({username: 'admin', password: 'password123'})});
  const {token} = await loginRes.json();
  const res = await fetch('http://localhost:3007/api/inventory', { headers: { 'Authorization': 'Bearer ' + token }});
  console.log('STATUS:', res.status, await res.text());
  process.exit(0);
});

