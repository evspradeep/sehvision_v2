'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { SankaraLogo } from '@/components/branding/SankaraLogo';
import {
  ScreeningSession,
  SchoolSummary,
  UserRole,
  ReferralStatus,
  ClinicalConfig,
  ScreeningOverallStatus,
} from '@/lib/types';
import { DEMO_SCHOOLS } from '@/lib/mockData';
import {
  getAllScreeningSessions,
  getPendingSyncCount,
  syncPendingSessionsToServer,
  exportSessionsAsJson,
  getClinicalConfig,
  saveClinicalConfig,
  updateReferralStatus,
} from '@/lib/storage';
import {
  LayoutDashboard,
  School,
  Users,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  Download,
  RefreshCw,
  Search,
  Filter,
  Sliders,
  Eye,
  Building2,
  Calendar,
  ShieldAlert,
  Printer,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [sessions, setSessions] = useState<ScreeningSession[]>(() => getAllScreeningSessions());
  const [schools] = useState<SchoolSummary[]>(DEMO_SCHOOLS);
  const [activeTab, setActiveTab] = useState<'screenings' | 'schools' | 'referrals' | 'clinical_config'>('screenings');
  const [currentRole, setCurrentRole] = useState<UserRole>('clinical_reviewer');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Sync state
  const [pendingSync, setPendingSync] = useState(() => getPendingSyncCount());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Selected session for deep-dive detail modal
  const [detailSession, setDetailSession] = useState<ScreeningSession | null>(null);

  // QR Print Modal
  const [showQrPrintModal, setShowQrPrintModal] = useState(false);

  // Clinical config state
  const [config, setConfig] = useState<ClinicalConfig>(getClinicalConfig());
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await syncPendingSessionsToServer();
      setPendingSync(getPendingSyncCount());
      setSessions(getAllScreeningSessions());
      setSyncFeedback(`Successfully synchronized ${result.success} sessions to Sankara repository.`);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch {
      setSyncFeedback('Sync failed. Please verify network connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesSearch =
        s.opCardId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.qrId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.gradeClass.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSchool = selectedSchoolId === 'all' || s.schoolId === selectedSchoolId;
      const matchesStatus = selectedStatus === 'all' || s.overallStatus === selectedStatus;

      return matchesSearch && matchesSchool && matchesStatus;
    });
  }, [sessions, searchQuery, selectedSchoolId, selectedStatus]);

  // High level metrics
  const totalScreened = sessions.length;
  const normalCount = sessions.filter(s => s.overallStatus === 'normal').length;
  const recheckCount = sessions.filter(s => s.overallStatus === 'recheck').length;
  const referralCount = sessions.filter(s => s.overallStatus === 'referral').length;

  const normalPct = totalScreened > 0 ? Math.round((normalCount / totalScreened) * 100) : 0;
  const recheckPct = totalScreened > 0 ? Math.round((recheckCount / totalScreened) * 100) : 0;
  const referralPct = totalScreened > 0 ? Math.round((referralCount / totalScreened) * 100) : 0;

  const handleStatusChangeInModal = (newStatus: ReferralStatus) => {
    if (!detailSession) return;
    updateReferralStatus(detailSession.sessionId, newStatus);
    const updated = getAllScreeningSessions();
    setSessions(updated);
    setDetailSession(updated.find(s => s.sessionId === detailSession.sessionId) || null);
  };

  const handleSaveConfig = () => {
    saveClinicalConfig(config);
    setConfigSaveSuccess(true);
    setTimeout(() => setConfigSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-teal-100 text-slate-900" id="admin-dashboard-container">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:opacity-90 transition">
              <SankaraLogo variant="white" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Role Switcher */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400">Role:</span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                id="select-admin-role"
              >
                <option value="clinical_reviewer" className="bg-slate-900">Clinical Reviewer</option>
                <option value="super_admin" className="bg-slate-900">Super Admin</option>
                <option value="org_admin" className="bg-slate-900">Org Admin</option>
                <option value="school_coordinator" className="bg-slate-900">School Coordinator</option>
                <option value="screening_staff" className="bg-slate-900">Screening Staff</option>
              </select>
            </div>

            {/* Sync Now Action */}
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              id="btn-admin-sync"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : `Sync (${pendingSync})`}</span>
            </button>

            {/* Export JSON Backup */}
            <button
              onClick={exportSessionsAsJson}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer"
              id="btn-admin-export"
              title="Export offline screening data as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {/* Back to Screening */}
            <Link
              href="/screening/a8F7k29LmQ"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-bold transition border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Screen Student</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div className="bg-teal-600 text-white text-xs py-2 px-4 text-center font-bold animate-fadeIn">
          {syncFeedback}
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Bento Grid Metrics Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
          {/* Bento Card 1: Project & Clinical Screening Overview (Cols 1-8) */}
          <div className="lg:col-span-8 bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-teal-100">
                  <Users className="w-3.5 h-3.5 text-teal-700" />
                  <span>Outreach Performance</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Screening Health Matrix
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {totalScreened} Students Evaluated Across 4 Partner Schools
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('referrals')}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  View Referrals
                </button>
              </div>
            </div>

            {/* Inner Bento 3-Cell Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Normal Vision</p>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
                  {normalPct}<span className="text-sm font-semibold text-slate-400">%</span>
                </h3>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mb-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${normalPct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {normalCount} passed standard cutoff
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Re-Check Advised</p>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
                  {recheckPct}<span className="text-sm font-semibold text-slate-400">%</span>
                </h3>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mb-3 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${recheckPct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {recheckCount} borderline / fatigue cases
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Hospital Referral</p>
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
                  {referralPct}<span className="text-sm font-semibold text-slate-400">%</span>
                </h3>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mb-3 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${referralPct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {referralCount} flagged for ophthalmologist
                </p>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Hospital Pipeline Priority & Camp Sync (Cols 9-12) */}
          <div className="lg:col-span-4 bg-slate-900 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl shadow-slate-950/10 relative overflow-hidden flex flex-col justify-between">
            {/* Ambient Background Circles matching Bento theme */}
            <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white opacity-[0.05] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-40px] left-[-40px] w-64 h-64 border-2 border-white opacity-[0.05] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-bold tracking-widest text-teal-400 uppercase">Action Pipeline</span>
                <span className="bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  High Priority
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                {referralCount} Pending Leads
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Active students requiring parent consultation, refractive confirmation, and tertiary clinic follow-up.
              </p>
            </div>

            <div className="relative z-10 bg-slate-800/80 rounded-2xl p-4 border border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Local Camp Sync</p>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200">
                    {pendingSync === 0 ? 'All Sessions Synced' : `${pendingSync} Pending Sync`}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="bg-slate-200/70 p-1.5 rounded-2xl inline-flex items-center gap-1 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('screenings')}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'screenings'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="tab-screenings"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Screenings ({sessions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('schools')}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'schools'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="tab-schools"
            >
              <School className="w-4 h-4" />
              <span>Schools Registry ({schools.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('referrals')}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'referrals'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="tab-referrals"
            >
              <Building2 className="w-4 h-4" />
              <span>Hospital Referral Pipeline</span>
            </button>

            <button
              onClick={() => setActiveTab('clinical_config')}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'clinical_config'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="tab-clinical-config"
            >
              <Sliders className="w-4 h-4" />
              <span>Clinical Protocol Settings</span>
            </button>
          </div>

          {/* Print QR Cards button */}
          <button
            onClick={() => setShowQrPrintModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition shadow-2xs cursor-pointer"
            id="btn-print-qr-cards"
          >
            <Printer className="w-3.5 h-3.5 text-teal-700" />
            <span>Generate OP Card QRs</span>
          </button>
        </div>

        {/* TAB 1: SCREENINGS LIST */}
        {activeTab === 'screenings' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by OP Card ID, QR token, School, Class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  id="input-screening-search"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                  id="select-filter-school"
                >
                  <option value="all">All Schools</option>
                  {schools.map(s => (
                    <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                  id="select-filter-status"
                >
                  <option value="all">All Outcomes</option>
                  <option value="normal">Normal</option>
                  <option value="recheck">Re-check</option>
                  <option value="referral">Referral</option>
                </select>
              </div>
            </div>

            {/* Screenings Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">OP Card / QR</th>
                      <th className="py-3.5 px-4">School & Class</th>
                      <th className="py-3.5 px-4">Right Eye (OD)</th>
                      <th className="py-3.5 px-4">Left Eye (OS)</th>
                      <th className="py-3.5 px-4">Colour Vision</th>
                      <th className="py-3.5 px-4">Screening Outcome</th>
                      <th className="py-3.5 px-4">Sync</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                          No screening sessions match current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredSessions.map((sess) => (
                        <tr
                          key={sess.sessionId}
                          className="hover:bg-teal-50/40 transition cursor-pointer"
                          onClick={() => setDetailSession(sess)}
                        >
                          <td className="py-3.5 px-5">
                            <div className="font-mono font-bold text-slate-900">
                              {sess.opCardId}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">
                              QR: {sess.qrId}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 line-clamp-1 max-w-[200px]">
                              {sess.schoolName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {sess.gradeClass} ({sess.section})
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-bold font-mono">
                            {sess.rightEyeResult?.snellenEquivalent || 'N/A'}
                          </td>

                          <td className="py-3.5 px-4 font-bold font-mono">
                            {sess.leftEyeResult?.snellenEquivalent || 'N/A'}
                          </td>

                          <td className="py-3.5 px-4">
                            {sess.colourVisionResult?.tested ? (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  sess.colourVisionResult.status === 'normal'
                                    ? 'bg-emerald-50 text-emerald-800'
                                    : 'bg-amber-50 text-amber-800'
                                }`}
                              >
                                {sess.colourVisionResult.status === 'normal' ? 'Normal' : 'Plate Concern'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">N/A</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                sess.overallStatus === 'normal'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : sess.overallStatus === 'recheck'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {sess.overallStatus === 'normal' && <CheckCircle className="w-3 h-3" />}
                              {sess.overallStatus === 'recheck' && <AlertTriangle className="w-3 h-3" />}
                              {sess.overallStatus === 'referral' && <AlertCircle className="w-3 h-3" />}
                              <span className="capitalize">{sess.overallStatus}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block w-2.5 h-2.5 rounded-full ${
                                sess.syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              title={sess.syncStatus === 'synced' ? 'Synced to server' : 'Pending sync'}
                            />
                          </td>

                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailSession(sess);
                              }}
                              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-teal-900 rounded-xl transition"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHOOLS REGISTRY */}
        {activeTab === 'schools' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {schools.map((sch) => (
              <div
                key={sch.schoolId}
                className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {sch.schoolName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      📍 {sch.location} • Contact: {sch.contactPerson}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded-xl border border-teal-200">
                    {sch.schoolId}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Registered</div>
                    <div className="text-lg font-black text-slate-800 mt-0.5">{sch.totalStudentsRegistered}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100">
                    <div className="text-teal-700 font-bold uppercase text-[10px]">Screened</div>
                    <div className="text-lg font-black text-teal-800 mt-0.5">{sch.totalScreened}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
                    <div className="text-rose-700 font-bold uppercase text-[10px]">Referrals</div>
                    <div className="text-lg font-black text-rose-800 mt-0.5">{sch.referralCount}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">
                    Follow-ups completed: <span className="font-bold text-slate-800">{sch.followupsCompleted} / {sch.referralCount}</span>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedSchoolId(sch.schoolId);
                      setActiveTab('screenings');
                    }}
                    className="text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Sessions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: REFERRAL PIPELINE */}
        {activeTab === 'referrals' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Community Ophthalmology Referral Management
                </h3>
                <p className="text-xs text-slate-500">
                  Tracks students flagged for further examination to ensure no child slips through the crack.
                </p>
              </div>
              <span className="text-xs font-bold px-3.5 py-1.5 bg-rose-100 text-rose-800 rounded-full">
                {sessions.filter(s => s.referralRequired).length} Flagged Cases
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sessions.filter(s => s.referralRequired).map((ref) => (
                <div
                  key={ref.sessionId}
                  className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {ref.opCardId}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                      {ref.referralStatus || 'Recommended'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <div className="font-semibold text-slate-800">{ref.schoolName}</div>
                    <div>{ref.gradeClass} - Section {ref.section}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-100">
                    <div className="flex justify-between font-mono">
                      <span>Right Eye (OD):</span>
                      <span className="font-bold text-slate-900">{ref.rightEyeResult?.snellenEquivalent || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Left Eye (OS):</span>
                      <span className="font-bold text-slate-900">{ref.leftEyeResult?.snellenEquivalent || 'N/A'}</span>
                    </div>
                  </div>

                  {ref.clinicalNotes && (
                    <p className="text-[11px] text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-200 leading-snug">
                      {ref.clinicalNotes}
                    </p>
                  )}

                  {/* Status Pipeline Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Update status:</span>
                    <select
                      value={ref.referralStatus || 'recommended'}
                      onChange={(e) => {
                        updateReferralStatus(ref.sessionId, e.target.value as ReferralStatus);
                        setSessions(getAllScreeningSessions());
                      }}
                      className="text-xs bg-slate-100 border border-slate-300 font-semibold rounded-xl px-2.5 py-1.5 cursor-pointer"
                    >
                      <option value="recommended">Recommended</option>
                      <option value="parent_informed">Parent Informed</option>
                      <option value="appointment_booked">Appointment Booked</option>
                      <option value="exam_completed">Exam Completed</option>
                      <option value="treatment_advised">Treatment Advised</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CLINICAL PROTOCOL SETTINGS */}
        {activeTab === 'clinical_config' && (
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
            {/* Prominent Clinical Authorization Notice */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Clinical Protocol Configuration Notice
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  These optical parameters, testing distances, and referral cutoffs directly control the screening algorithm. Changes must be formally validated and approved by Sankara Eye Hospital Pediatric Ophthalmology leadership.
                </p>
                <div className="text-[11px] font-mono text-amber-900 font-semibold mt-2">
                  Currently approved by: {config.approvedByClinician} (v{config.version})
                </div>
              </div>
            </div>

            {configSaveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Protocol settings saved and updated locally.</span>
              </div>
            )}

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Testing Distance */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Standard Testing Distance (cm):
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Standard digital school room distance (Default: 150 cm / 1.5m; Hallway: 300 cm / 3.0m).
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={50}
                    max={600}
                    step={10}
                    value={config.testingDistanceCm}
                    onChange={(e) => setConfig({ ...config, testingDistanceCm: Number(e.target.value) })}
                    className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                  <span className="text-xs text-slate-600">
                    cm ({ (config.testingDistanceCm / 100).toFixed(1) } metres)
                  </span>
                </div>
              </div>

              {/* Passing Threshold */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block font-bold text-slate-800 mb-1">
                  School Passing Threshold (Snellen):
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Children who achieve worse than this acuity level in either eye will be flagged for referral.
                </p>
                <select
                  value={config.passingThresholdSnellen}
                  onChange={(e) => setConfig({ ...config, passingThresholdSnellen: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  <option value="6/6">6/6 (Normal standard)</option>
                  <option value="6/9">6/9 (Recommended school cutoff)</option>
                  <option value="6/12">6/12 (Relaxed cutoff)</option>
                </select>
              </div>

              {/* Interocular difference lines */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block font-bold text-slate-800 mb-1">
                  Inter-Ocular Difference Referral Trigger (Lines):
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Amblyopia / Anisometropia risk flag if right and left eye differ by this many lines.
                </p>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={config.referralRuleInterocularDifferenceLines}
                  onChange={(e) => setConfig({ ...config, referralRuleInterocularDifferenceLines: Number(e.target.value) })}
                  className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              {/* Toggles */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.colourVisionEnabled}
                    onChange={(e) => setConfig({ ...config, colourVisionEnabled: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                  />
                  <span className="font-semibold text-slate-800">
                    Enable Colour Vision Screening Module
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.binocularTestingEnabled}
                    onChange={(e) => setConfig({ ...config, binocularTestingEnabled: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                  />
                  <span className="font-semibold text-slate-800">
                    Enable Binocular (Both Eyes Open) Screening Round
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                id="btn-save-clinical-config"
              >
                Save & Apply Protocol Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* DETAIL MODAL FOR AUDIT & TRIAL RESPONSES */}
      {detailSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase">Screening Audit</span>
                <h3 className="text-lg font-black text-slate-900">
                  {detailSession.opCardId} (QR: {detailSession.qrId})
                </h3>
              </div>
              <button
                onClick={() => setDetailSession(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>School: <span className="font-semibold">{detailSession.schoolName}</span></div>
                <div>Class: <span className="font-semibold">{detailSession.gradeClass} ({detailSession.section})</span></div>
                <div>Device: <span className="font-mono text-[11px] text-slate-600">{detailSession.deviceId}</span></div>
                <div>Date: <span className="text-slate-600">{new Date(detailSession.startedAt).toLocaleDateString()}</span></div>
              </div>

              {/* Calibration Audit Info */}
              <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-1 font-mono border border-slate-100">
                <div className="font-bold text-slate-700 uppercase text-[10px]">Calibration & Optics</div>
                <div>Factor: {detailSession.calibration?.pxPerMm.toFixed(3)} px/mm</div>
                <div>Distance: {detailSession.testDistanceCm} cm</div>
                <div>Screen: {detailSession.calibration?.screenWidth} × {detailSession.calibration?.screenHeight} (DPR: {detailSession.calibration?.dpr})</div>
              </div>

              {/* Trial-by-Trial Responses */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">
                  Trial Responses Recorded ({detailSession.responses.length} trials):
                </h4>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 text-xs">
                  {detailSession.responses.length === 0 ? (
                    <div className="p-3 text-slate-400 text-center">Summary score stored. Individual trials empty for legacy record.</div>
                  ) : (
                    detailSession.responses.map((resp, i) => (
                      <div key={i} className="p-2.5 flex items-center justify-between font-mono">
                        <div>
                          <span className="font-bold uppercase text-slate-700">[{resp.eye}]</span> Q{resp.questionNumber}: {resp.snellenEquivalent} ({resp.optotypeSizeMm.toFixed(1)}mm)
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Target: {resp.expectedAnswer}</span>
                          <span>Ans: {resp.userAnswer}</span>
                          <span className={`px-1.5 py-0.5 rounded font-bold ${resp.correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {resp.correct ? 'PASS' : 'FAIL'}
                          </span>
                          <span className="text-slate-400 text-[10px]">{resp.responseTimeMs}ms</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Referral Status updater */}
              {detailSession.referralRequired && (
                <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                  <div className="font-bold text-rose-900">Hospital Referral Status:</div>
                  <div className="flex items-center gap-2">
                    <select
                      value={detailSession.referralStatus || 'recommended'}
                      onChange={(e) => handleStatusChangeInModal(e.target.value as ReferralStatus)}
                      className="bg-white border border-rose-300 rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <option value="recommended">Recommended</option>
                      <option value="parent_informed">Parent Informed</option>
                      <option value="appointment_booked">Appointment Booked</option>
                      <option value="exam_completed">Exam Completed</option>
                      <option value="treatment_advised">Treatment Advised</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetailSession(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR PRINT MODAL */}
      {showQrPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-teal-700" />
                <span>Print Sankara OP Card QR Codes</span>
              </h3>
              <button onClick={() => setShowQrPrintModal(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Each card embeds a secure, opaque QR code format: <code className="bg-slate-100 px-1.5 py-0.5 rounded-md font-mono text-teal-800">/screening/[QR_ID]</code>
            </p>

            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
              {[
                { name: 'Aarav Sharma', op: 'SEH-OP-2026-8812', qr: 'a8F7k29LmQ' },
                { name: 'Diya Krishnan', op: 'SEH-OP-2026-8813', qr: 'k3P9x42VwR' },
                { name: 'Rohan Patel', op: 'SEH-OP-2026-8814', qr: 'm5N8y17QzT' },
                { name: 'Ananya Reddy', op: 'SEH-OP-2026-8815', qr: 'p2W6c94LbM' },
              ].map((item) => (
                <div key={item.qr} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                  <div className="w-12 h-12 bg-white border border-slate-300 rounded-xl flex items-center justify-center p-1">
                    <svg viewBox="0 0 24 24" className="w-full h-full text-slate-800 fill-current">
                      <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 4h4v4h-4v-4zm-4 2h2v2h-2v-2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{item.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{item.op}</div>
                    <Link
                      href={`/screening/${item.qr}`}
                      className="text-[10px] text-teal-700 font-bold hover:underline"
                    >
                      Test Link
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowQrPrintModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                Print Cards Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
