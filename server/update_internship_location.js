const mongoose = require('mongoose');
const { ItTrainingProcessModel } = require('./db');

mongoose.connect('mongodb+srv://JobPortal:vmjpDTY7R3TPSmPA@cluster0.wkptyao.mongodb.net/recruitment_db?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    const result = await ItTrainingProcessModel.updateMany(
      { itCategory: 'Internship' },
      { $set: { location: 'Krishnagiri / Bangalore' } }
    );
    console.log('Updated:', result.modifiedCount, 'internship records');
    process.exit(0);
  })
  .catch(err => { console.error(err); process.exit(1); });
