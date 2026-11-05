const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  for (const c of collections) {
    const col = mongoose.connection.db.collection(c.name);
    const docs = await col.find({
      $or: [
        { name: /Manyashree/i },
        { candidateName: /Manyashree/i },
        { 'candidate.name': /Manyashree/i },
        { adminNotes: /cloudinary/i },
        { offerLetterUrl: { $exists: true, $ne: '' } }
      ]
    }).limit(10).toArray();
    if (docs.length > 0) {
      console.log('--- Collection ' + c.name + ' matches: ' + docs.length + ' ---');
      docs.forEach(d => {
        console.log({
          _id: d._id,
          id: d.id,
          name: d.name || d.candidateName,
          status: d.status,
          offerLetterUrl: d.offerLetterUrl,
          adminNotes: d.adminNotes,
          documents: d.documents,
          notes: d.notes
        });
      });
    }
  }
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

