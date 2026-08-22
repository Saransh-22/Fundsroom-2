
import app from './dist/app.js';
app.default.listen(3009, async () => {
  const loginRes = await fetch('http://localhost:3009/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({username: 'admin', password: 'password123'})});
  const {token} = await loginRes.json();
  const res = await fetch('http://localhost:3009/api/inventory', { headers: { 'Authorization': 'Bearer ' + token }});
  console.log('STATUS:', res.status, await res.text());
  process.exit(0);
});

