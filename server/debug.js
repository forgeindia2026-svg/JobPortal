const mongoose = require('mongoose');
const { ApplicationModel, JobModel, PartnerIncentiveModel } = require('./db');

async function debug() {
  await mongoose.connect('mongodb+srv://JobPortal:vmjpDTY7R3TPSmPA@cluster0.wkptyao.mongodb.net/recruitment_db?retryWrites=true&w=majority&appName=Cluster0');
  
  const jobs = await JobModel.find({ title: /Manager/i }).lean();
  console.log('Jobs:', jobs.map(j => ({ id: j.id, title: j.title, hrIncentiveFree: j.hrIncentiveFree, hrIncentivePaid: j.hrIncentivePaid })));
  
  const apps = await ApplicationModel.find({ candidateName: /Srimathi/i }).lean(); console.log(apps.map(a => ({ id: a.id, candidateName: a.candidateName, incentiveAmount: a.incentiveAmount })));
  console.log('PartnerIncentives:', incentives);
  
  process.exit(0);
}
debug();
