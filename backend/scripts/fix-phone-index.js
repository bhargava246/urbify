const { MongoClient } = require('mongodb');
require('dotenv').config();
const url = process.env.DATABASE_URL;
(async () => {
  const client = new MongoClient(url);
  await client.connect();
  console.log('Connected');
  const col = client.db('urbify').collection('users');
  try { await col.dropIndex('users_phone_key'); console.log('dropped users_phone_key'); } catch(e){ console.log('drop:', e.message); }
  try { const n = await col.createIndex({phone:1},{unique:true,sparse:true,name:'users_phone_sparse'}); console.log('created sparse:', n); } catch(e){ console.log('create:', e.message); }
  const idx = await col.indexes();
  console.log('Indexes:', idx.map(i=>i.name).join(', '));
  await client.close();
})().catch(e=>{ console.error(e.message); process.exit(1); });
