const fs = require('fs');
const file = 'C:/Jobsapps/admin_mobile/src/screens/Admin/AdminHrScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add selectedHrForCandidates state
const targetState = "const [selectedHrIncentives, setSelectedHrIncentives] = useState(null);";
const newState = `const [selectedHrIncentives, setSelectedHrIncentives] = useState(null);
  const [selectedHrForCandidates, setSelectedHrForCandidates] = useState(null);
  const [candidateFilter, setCandidateFilter] = useState('all');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [statusModalApp, setStatusModalApp] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);`;

content = content.replace(targetState, newState);

// 2. Add candidates calculations before return
const targetBeforeReturn = "return (\r\n    <View style={styles.container}>";
const targetBeforeReturnLF = "return (\n    <View style={styles.container}>";

const hrCalcCode = `  const hrCandidates = useMemo(() => {
    if (!selectedHrForCandidates) return [];
    const code = String(selectedHrForCandidates.referralCode || '').toLowerCase();
    return applications.filter((app) => String(app.referredBy || '').toLowerCase() === code);
  }, [selectedHrForCandidates, applications]);

  const hrStats = useMemo(() => {
    const total = hrCandidates.length;
    const isDoc = (a) => String(a.status || '').toLowerCase().includes('document');
    const isSel = (a) => {
      const s = String(a.status || '').toLowerCase();
      return (s.includes('select') || s.includes('hired')) && !['closed', 'joined', 'converted'].some(c => s.includes(c));
    };
    const isClo = (a) => ['closed', 'joined', 'converted', 'hired'].some(c => String(a.status || '').toLowerCase().includes(c));
    const isRej = (a) => {
      const s = String(a.status || '').toLowerCase();
      return s.includes('reject') || s.includes('not interested');
    };

    const documentSubmitted = hrCandidates.filter((a) => isDoc(a) && !isSel(a) && !isClo(a) && !isRej(a)).length;
    const selected = hrCandidates.filter((a) => isSel(a)).length;
    const closed = hrCandidates.filter((a) => isClo(a)).length;
    const rejected = hrCandidates.filter((a) => isRej(a)).length;
    const processing = hrCandidates.filter((a) => !isDoc(a) && !isSel(a) && !isClo(a) && !isRej(a)).length;
    const incentives = Number(selectedHrForCandidates?.incentives) || 0;
    const upcomingAmount = hrCandidates.reduce((sum, a) => {
      if (isSel(a) || isClo(a)) return sum;
      return sum + (Number(a.incentiveAmount) || 500);
    }, 0);

    return { total, documentSubmitted, selected, closed, rejected, processing, incentives, upcomingAmount };
  }, [hrCandidates, selectedHrForCandidates]);

  const filteredHrCandidates = useMemo(() => {
    return hrCandidates.filter((app) => {
      if (candidateFilter !== 'all') {
        const s = String(app.status || '').toLowerCase();
        if (candidateFilter === 'document' && !s.includes('document')) return false;
        if (candidateFilter === 'processing' && (s.includes('document') || s.includes('select') || s.includes('reject') || s.includes('closed') || s.includes('joined'))) return false;
        if (candidateFilter === 'selected' && (!s.includes('select') || s.includes('closed') || s.includes('joined'))) return false;
        if (candidateFilter === 'closed' && !s.includes('closed') && !s.includes('joined')) return false;
        if (candidateFilter === 'rejected' && !s.includes('reject')) return false;
      }
      if (candidateSearch.trim()) {
        const q = candidateSearch.toLowerCase();
        const mName = String(app.candidateName || '').toLowerCase().includes(q);
        const mEmail = String(app.candidateEmail || '').toLowerCase().includes(q);
        const mMobile = String(app.candidateMobile || '').toLowerCase().includes(q);
        const mAppNo = String(app.applicationNumber || '').toLowerCase().includes(q);
        const mJob = String(app.jobTitle || '').toLowerCase().includes(q);
        if (!mName && !mEmail && !mMobile && !mAppNo && !mJob) return false;
      }
      return true;
    });
  }, [hrCandidates, candidateFilter, candidateSearch]);

  const handleUpdateCandidateStatus = async () => {
    if (!statusModalApp || !newStatus) return;
    setStatusUpdating(true);
    try {
      await applicationService.updateApplicationStatus(statusModalApp.id || statusModalApp._id, {
        status: newStatus,
      });
      setStatusModalApp(null);
      loadData();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update candidate status');
    } finally {
      setStatusUpdating(false);
    }
  };

`;

if (content.includes(targetBeforeReturn)) {
  content = content.replace(targetBeforeReturn, hrCalcCode + targetBeforeReturn);
} else if (content.includes(targetBeforeReturnLF)) {
  content = content.replace(targetBeforeReturnLF, hrCalcCode + targetBeforeReturnLF);
}

// 3. Make candidates cell clickable in table
const targetTableCand = `<View style={[styles.cell, styles.colCandidates]}>
                        <Text style={styles.candidatesCountText}>{metrics.count}</Text>
                        <Text style={styles.candidatesClosedText}>
                          {metrics.closed} closed
                        </Text>
                      </View>`;
const newTableCand = `<TouchableOpacity
                        style={[styles.cell, styles.colCandidates]}
                        onPress={() => {
                          setSelectedHrForCandidates(hr);
                          setCandidateFilter('all');
                          setCandidateSearch('');
                        }}
                      >
                        <Text style={styles.candidatesCountText}>{metrics.count}</Text>
                        <Text style={styles.candidatesClosedText}>
                          {metrics.closed} closed →
                        </Text>
                      </TouchableOpacity>`;
content = content.replace(targetTableCand, newTableCand);

// 4. Make candidates stat in card clickable
const targetCardCand = `<View style={styles.statCol}>
                    <Text style={styles.statLabel}>Candidates</Text>
                    <Text style={styles.statValGreen}>{metrics.count}</Text>
                    <Text style={styles.statSubText}>{metrics.closed} closed</Text>
                  </View>`;
const newCardCand = `<TouchableOpacity
                    style={styles.statCol}
                    onPress={() => {
                      setSelectedHrForCandidates(hr);
                      setCandidateFilter('all');
                      setCandidateSearch('');
                    }}
                  >
                    <Text style={styles.statLabel}>Candidates</Text>
                    <Text style={styles.statValGreen}>{metrics.count}</Text>
                    <Text style={styles.statSubText}>{metrics.closed} closed ›</Text>
                  </TouchableOpacity>`;
content = content.replace(targetCardCand, newCardCand);

// 5. Wrap main body with selectedHrForCandidates condition
const returnStartStr = "<View style={styles.container}>\r\n      {/* Top Header matching Admin Website */}";
const returnStartStrLF = "<View style={styles.container}>\n      {/* Top Header matching Admin Website */}";

const drillDownJSX = `{selectedHrForCandidates ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ padding: 14 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setSelectedHrForCandidates(null)}
            activeOpacity={0.8}
          >
            <Text style={styles.backBtnText}>← Back to HR List</Text>
          </TouchableOpacity>

          <View style={styles.detailBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.detailAvatar}>
                <Text style={styles.detailAvatarText}>
                  {(selectedHrForCandidates.name || 'H').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Text style={styles.detailName}>{selectedHrForCandidates.name}</Text>
                  <View style={styles.detailRefBadge}>
                    <Text style={styles.detailRefText}>Referral: {selectedHrForCandidates.referralCode}</Text>
                  </View>
                </View>
                <Text style={styles.detailContactText}>{selectedHrForCandidates.email}</Text>
                {selectedHrForCandidates.mobile ? (
                  <Text style={styles.detailContactText}>📱 {selectedHrForCandidates.mobile}</Text>
                ) : null}
                <Text style={styles.detailClicksText}>🔗 {selectedHrForCandidates.linkClicks || 0} link clicks</Text>
              </View>
            </View>
            <View style={styles.detailEarnedBox}>
              <Text style={styles.detailEarnedLabel}>EARNED INCENTIVES</Text>
              <Text style={styles.detailEarnedVal}>₹{(selectedHrForCandidates.incentives || 0).toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, { borderColor: '#99f6e4' }]}>
              <Text style={[styles.kpiLabel, { color: '#0d9488' }]}>UPCOMING INCENTIVE</Text>
              <Text style={[styles.kpiVal, { color: '#0f766e' }]}>₹{hrStats.upcomingAmount.toLocaleString()}</Text>
            </View>

            <TouchableOpacity
              style={[styles.kpiCard, candidateFilter === 'all' && styles.kpiCardActive]}
              onPress={() => setCandidateFilter('all')}
              activeOpacity={0.7}
            >
              <Text style={styles.kpiLabel}>TOTAL CANDIDATES</Text>
              <Text style={styles.kpiVal}>{hrStats.total}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.kpiCard, candidateFilter === 'document' && styles.kpiCardActive]}
              onPress={() => setCandidateFilter('document')}
              activeOpacity={0.7}
            >
              <Text style={[styles.kpiLabel, { color: '#0891b2' }]}>DOCUMENT SUBMITTED</Text>
              <Text style={[styles.kpiVal, { color: '#0e7490' }]}>{hrStats.documentSubmitted}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.kpiCard, candidateFilter === 'processing' && styles.kpiCardActive]}
              onPress={() => setCandidateFilter('processing')}
              activeOpacity={0.7}
            >
              <Text style={[styles.kpiLabel, { color: '#ea580c' }]}>IN PROGRESS / REVIEW</Text>
              <Text style={[styles.kpiVal, { color: '#c2410c' }]}>{hrStats.processing}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.kpiCard, candidateFilter === 'selected' && styles.kpiCardActive]}
              onPress={() => setCandidateFilter('selected')}
              activeOpacity={0.7}
            >
              <Text style={[styles.kpiLabel, { color: '#059669' }]}>SELECTED</Text>
              <Text style={[styles.kpiVal, { color: '#047857' }]}>{hrStats.selected}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.kpiCard, candidateFilter === 'closed' && styles.kpiCardActive]}
              onPress={() => setCandidateFilter('closed')}
              activeOpacity={0.7}
            >
              <Text style={[styles.kpiLabel, { color: '#4f46e5' }]}>CLOSED</Text>
              <Text style={[styles.kpiVal, { color: '#4338ca' }]}>{hrStats.closed}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.kpiCard, candidateFilter === 'rejected' && styles.kpiCardActive]}
              onPress={() => setCandidateFilter('rejected')}
              activeOpacity={0.7}
            >
              <Text style={[styles.kpiLabel, { color: '#dc2626' }]}>REJECTED</Text>
              <Text style={[styles.kpiVal, { color: '#b91c1c' }]}>{hrStats.rejected}</Text>
            </TouchableOpacity>

            <View style={[styles.kpiCard, { borderColor: '#bbf7d0' }]}>
              <Text style={[styles.kpiLabel, { color: '#16a34a' }]}>TOTAL INCENTIVES</Text>
              <Text style={[styles.kpiVal, { color: '#15803d' }]}>₹{hrStats.incentives.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search candidate name, mobile, email, app ID..."
              placeholderTextColor="#94a3b8"
              value={candidateSearch}
              onChangeText={setCandidateSearch}
            />
          </View>

          <Text style={styles.showingText}>
            Showing {filteredHrCandidates.length} of {hrStats.total} candidates
          </Text>

          {filteredHrCandidates.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No candidates found</Text>
            </View>
          ) : (
            filteredHrCandidates.map((app, idx) => {
              const bgGradient =
                idx % 3 === 0
                  ? ['#1e3a8a', '#172554']
                  : idx % 3 === 1
                  ? ['#701a75', '#4a044e']
                  : ['#134e4a', '#042f2e'];
              return (
                <View
                  key={String(app.id || app._id || idx)}
                  style={[styles.candidateBankCard, { backgroundColor: bgGradient[0] }]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.candName}>{app.candidateName || 'Candidate'}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                        <Text style={styles.candJobTitle}>{app.jobTitle || 'Job'}</Text>
                        {app.companyName ? (
                          <View style={styles.bankPill}>
                            <Text style={styles.bankPillText}>🏦 {app.companyName}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>{app.status || 'Applied'}</Text>
                    </View>
                  </View>

                  <View style={styles.candSubMeta}>
                    <Text style={styles.candAppNo}>#{app.applicationNumber || 'N/A'}</Text>
                    <Text style={styles.candDate}>
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-GB') : '-'}
                    </Text>
                  </View>

                  <View style={styles.candBadgeWrap}>
                    {app.candidateMobile ? (
                      <View style={styles.metaBadge}>
                        <Text style={styles.metaBadgeText}>📱 {app.candidateMobile}</Text>
                      </View>
                    ) : null}
                    {app.candidateEmail ? (
                      <View style={styles.metaBadge}>
                        <Text style={styles.metaBadgeText}>✉️ {app.candidateEmail}</Text>
                      </View>
                    ) : null}
                    <View style={styles.metaBadge}>
                      <Text style={styles.metaBadgeText}>💼 {app.candidateExperience || 'Fresher'}</Text>
                    </View>
                    {app.candidateLocation ? (
                      <View style={styles.metaBadge}>
                        <Text style={styles.metaBadgeText}>📍 {app.candidateLocation}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.candBottomRow}>
                    <Text style={styles.partnerRefTag}>
                      HR: <Text style={{ fontWeight: '800' }}>{selectedHrForCandidates.name}</Text>
                    </Text>
                    <Text style={styles.candFeeText}>
                      Fee: ₹{app.paymentAmount || 49} (Inc: ₹{app.incentiveAmount || 500})
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity
                      style={styles.updateStatusBtn}
                      onPress={() => {
                        setStatusModalApp(app);
                        setNewStatus(app.status || 'Applied');
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.updateStatusBtnText}>Update Status</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <>
        {/* Top Header matching Admin Website */}`;

if (content.includes(returnStartStr)) {
  content = content.replace(returnStartStr, "<View style={styles.container}>\r\n      " + drillDownJSX);
} else if (content.includes(returnStartStrLF)) {
  content = content.replace(returnStartStrLF, "<View style={styles.container}>\n      " + drillDownJSX);
}

// Close the fragment before Add HR Modal
const targetModal = "{/* Add HR Modal */}";
content = content.replace(targetModal, "</>)}\r\n\r\n      " + targetModal);

// Add extra styles to stylesheet
const extraStyles = `
  backBtn: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 8, marginBottom: 12 },
  backBtnText: { color: '#2563eb', fontWeight: '700', fontSize: 13 },
  detailBanner: { backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#c7d2fe', padding: 14, marginBottom: 14 },
  detailAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center' },
  detailAvatarText: { fontSize: 20, fontWeight: '800', color: '#4f46e5' },
  detailName: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  detailRefBadge: { backgroundColor: '#dbeafe', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10, borderWidth: 1, borderColor: '#bfdbfe' },
  detailRefText: { fontSize: 11, fontWeight: '700', color: '#1d4ed8' },
  detailContactText: { fontSize: 12, color: '#64748b', marginTop: 2 },
  detailClicksText: { fontSize: 12, color: '#2563eb', fontWeight: '700', marginTop: 2 },
  detailEarnedBox: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', alignItems: 'flex-end' },
  detailEarnedLabel: { fontSize: 10, fontWeight: '700', color: '#059669' },
  detailEarnedVal: { fontSize: 18, fontWeight: '800', color: '#059669' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  kpiCard: { flex: 1, minWidth: '45%', backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', padding: 10 },
  kpiCardActive: { borderColor: '#2563eb', borderWidth: 2 },
  kpiLabel: { fontSize: 10, fontWeight: '700', color: '#64748b' },
  kpiVal: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginTop: 4 },
  showingText: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 10 },
  candidateBankCard: { borderRadius: 16, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 3 },
  candName: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
  candJobTitle: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  bankPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6 },
  bankPillText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },
  statusPill: { backgroundColor: '#ffffff', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 12 },
  statusPillText: { fontSize: 11, fontWeight: '800', color: '#0f172a' },
  candSubMeta: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.15)', paddingVertical: 6, marginTop: 4 },
  candAppNo: { fontSize: 11, fontWeight: '700', color: '#ffffff' },
  candDate: { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  candBadgeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  metaBadge: { backgroundColor: 'rgba(255,255,255,0.18)', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  metaBadgeText: { fontSize: 11, fontWeight: '600', color: '#ffffff' },
  candBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 8, marginTop: 8 },
  partnerRefTag: { fontSize: 11, color: '#ffffff' },
  candFeeText: { fontSize: 11, fontWeight: '700', color: '#fef08a' },
  updateStatusBtn: { flex: 1, backgroundColor: '#ffffff', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  updateStatusBtnText: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
`;

content = content.replace("container: {", extraStyles + "\r\n  container: {");

fs.writeFileSync(file, content, 'utf8');
console.log('SUCCESSFULLY_UPDATED_ADMIN_HR_SCREEN');
