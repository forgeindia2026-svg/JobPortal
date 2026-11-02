const fs = require('fs');
const file = 'c:/Users/Admin/Desktop/Jobs/admin/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = "const [hrError, setHrError] = useState('');";
const addition = `const [hrError, setHrError] = useState('');

  // Partner Modal & Form State (Matches HR modal for Partner Management)
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerToEdit, setPartnerToEdit] = useState(null);
  const [partnerForm, setPartnerForm] = useState({ name: '', email: '', password: '', mobile: '', parentHrId: '', profilePhoto: '' });
  const [partnerSaving, setPartnerSaving] = useState(false);
  const [partnerPhotoUploading, setPartnerPhotoUploading] = useState(false);
  const [partnerError, setPartnerError] = useState('');`;

if (content.includes(target)) {
  content = content.replace(target, addition);
  fs.writeFileSync(file, content, 'utf8');
  console.log('SUCCESS');
} else {
  console.error('Target not found');
}
