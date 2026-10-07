require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(() => {
  const { CompanyModel } = require('./db');
  CompanyModel.updateOne(
    { name: 'HDFC Life' },
    { $set: { logo: '/logos/Hdfc.jpg' } }
  ).then(res => {
    console.log(res);
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
});
