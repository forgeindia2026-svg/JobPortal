const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://JobPortal:vmjpDTY7R3TPSmPA@cluster0.wkptyao.mongodb.net/recruitment_db?retryWrites=true&w=majority&appName=Cluster0';

async function seedAdmin() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('recruitment_db');
    const users = db.collection('users');
    
    const existing = await users.findOne({ email: 'admin@forgeindiaconnect.in' });
    if (!existing) {
      await users.insertOne({
        id: 'admin_fixed',
        name: 'Super Admin',
        email: 'admin@forgeindiaconnect.in',
        passwordHash: 'dummy_hash_Admin@123',
        role: 'admin',
        mobile: '',
        location: '',
        qualification: '',
        experience: '',
        skills: [],
        referralCode: 'ADMIN',
        createdAt: new Date().toISOString()
      });
      console.log('Admin user created successfully in MongoDB Atlas.');
    } else {
      await users.updateOne({ email: 'admin@forgeindiaconnect.in' }, { $set: { passwordHash: 'dummy_hash_Admin@123', role: 'admin' } });
      console.log('Admin user already exists. Updated password hash and role.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
seedAdmin();
