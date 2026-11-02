const fs = require('fs');
const file = 'c:/Users/Admin/Desktop/Jobs/admin/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = "{activeTab === 'employees' && (\n          <div>\n            {selectedHrForCandidates ? (";
const target1CRLF = "{activeTab === 'employees' && (\r\n          <div>\r\n            {selectedHrForCandidates ? (";

const replace1 = "{(activeTab === 'employees' || (activeTab === 'partners_admin' && selectedHrForCandidates)) && (\n          <div>\n            {selectedHrForCandidates ? (";
const replace1CRLF = "{(activeTab === 'employees' || (activeTab === 'partners_admin' && selectedHrForCandidates)) && (\r\n          <div>\r\n            {selectedHrForCandidates ? (";

if (content.includes(target1CRLF)) {
  content = content.replace(target1CRLF, replace1CRLF);
} else if (content.includes(target1)) {
  content = content.replace(target1, replace1);
}

const target2 = "{activeTab === 'partners_admin' && (";
const replace2 = "{activeTab === 'partners_admin' && !selectedHrForCandidates && (";

content = content.replace(target2, replace2);

const oldAllHrsBtn = "All HRs List\r\n                  </button>";
const oldAllHrsBtnLF = "All HRs List\n                  </button>";
if (content.includes(oldAllHrsBtn)) {
  content = content.replace(oldAllHrsBtn, "{activeTab === 'partners_admin' || selectedHrForCandidates.role === 'agent' ? 'All Partners List' : 'All HRs List'}\r\n                  </button>");
} else if (content.includes(oldAllHrsBtnLF)) {
  content = content.replace(oldAllHrsBtnLF, "{activeTab === 'partners_admin' || selectedHrForCandidates.role === 'agent' ? 'All Partners List' : 'All HRs List'}\n                  </button>");
}

const oldRefCodeLabel = "Referral Code: {selectedHrForCandidates.referralCode}";
if (content.includes(oldRefCodeLabel)) {
  content = content.replace(oldRefCodeLabel, "{selectedHrForCandidates.role === 'agent' ? 'Partner Referral: ' : 'Referral Code: '}{selectedHrForCandidates.referralCode}");
}

fs.writeFileSync(file, content, 'utf8');
console.log('SUCCESSFULLY_PATCHED_ADMIN_DASHBOARD');
