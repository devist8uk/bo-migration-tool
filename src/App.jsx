// BO Migration Tool v6.3 - Supabase Edition
import React, { useState, useCallback, useMemo } from 'react';
import { Upload, FileText, Database, AlertTriangle, Copy, ClipboardCheck, Sparkles, X, Trash2, ChevronDown, ChevronRight, LogOut, User, Mail, Lock, ArrowRight, Menu, Home, Plus, ChevronLeft, Folder, Edit3, Calendar, Users, Building, Clock, CheckCircle, Circle, PlayCircle, TestTube, Search, Archive, CheckSquare, Square, Files } from 'lucide-react';
import { useAuth } from './lib/useAuth';
import { useProjects } from './lib/useProjects';

const KNOWN_TABLES = new Set(['admin_units','admin_groupings','properties','prop_groupings','addresses','address_elements','tenancies','tenancy_instances','revenue_accounts','account_balances','transactions','batch_runs','payment_methods','service_requests','works_orders','works_order_versions','inspection_visits','inspection_results','inspections','contractors','job_roles','interested_parties','household_persons','parties','users','first_ref_values','parameter_values','schedule_of_rates','sor_prices','arrears_actions','contact_details','summary_rents','pp_applications','pp_events','status_codes','dual']);

const STATUSES = [
  { id: 'not_started', label: 'Not Started', color: 'bg-gray-100 text-gray-600', icon: Circle },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: PlayCircle },
  { id: 'testing', label: 'Testing', color: 'bg-amber-100 text-amber-700', icon: TestTube },
  { id: 'complete', label: 'Complete', color: 'bg-green-100 text-green-700', icon: CheckCircle }
];

const isLikelyGarbage = (str) => {
  if (!str || str.length < 3 || str.length > 40) return true;
  if (/^\d+$/.test(str) || /\d{6,}/.test(str)) return true;
  const noise = ['the','from','above','below','flat','roof','wall','door','bathroom','kitchen','toilet','boiler'];
  return noise.includes(str.toLowerCase());
};

const LoginPage = ({ onLogin, onSignUp, authLoading }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    if (isSignup && !name) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        const { error } = await onSignUp(email, password, name);
        if (error) {
          setError(error.message);
        }
      } else {
        const { error } = await onLogin(email, password);
        if (error) {
          setError(error.message);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Database className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">BO Migration Tool</h1>
          <p className="text-blue-200">Business Objects to Power BI Migration</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
          <div className="flex mb-6 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => { setIsSignup(false); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${!isSignup ? 'bg-white text-slate-900' : 'text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignup(true); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${isSignup ? 'bg-white text-slate-900' : 'text-white'}`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-blue-100 text-sm mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="John Smith"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-blue-100 text-sm mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-blue-100 text-sm mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || authLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              {loading || authLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  {isSignup ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {isSignup && (
            <p className="mt-4 text-xs text-blue-200/60 text-center">
              Contact your administrator if you need access to the system.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const calcEndDate = (startDate, reports, developers) => {
  if (!startDate || !reports?.length || !developers?.length) return '';
  const totalDaysPerWeek = developers.reduce((sum, d) => sum + (d.daysPerWeek || 0), 0);
  if (totalDaysPerWeek === 0) return '';
  const totalDays = reports.reduce((sum, r) => sum + r.days, 0);
  const start = new Date(startDate);
  const weeks = Math.ceil(totalDays / totalDaysPerWeek);
  const end = new Date(start);
  end.setDate(end.getDate() + (weeks * 7));
  return end.toISOString().split('T')[0];
};

export default function App() {
  const { user, profile, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const {
    projects,
    loading: projectsLoading,
    createProject,
    updateProject,
    deleteProject: deleteProjectDB,
    toggleArchive,
    duplicateProject: duplicateProjectDB,
    addReports,
    updateReport: updateReportDB,
    deleteReport: deleteReportDB,
    bulkUpdateReports
  } = useProjects(user?.id);

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showArchived, setShowArchived] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showExport, setShowExport] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterComplexity, setFilterComplexity] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedReports, setSelectedReports] = useState(new Set());
  const [showGantt, setShowGantt] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const emptyProject = { name: '', client: '', lead: '', startDate: '', developers: [], reports: [], archived: false };

  const parseRepFile = async (file) => {
    try {
      const ab = await file.arrayBuffer();
      const bytes = new Uint8Array(ab);
      const clean = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) clean[i] = (bytes[i] === 0 || bytes[i] < 32) ? 32 : bytes[i];
      const text = new TextDecoder('utf-8', { fatal: false }).decode(clean);

      let fields = [];
      const sqlSections = text.match(/SELECT[\s\S]{0,10000}?(?:FROM|WHERE)/gi) || [];
      const sqlText = sqlSections.join('\n');
      const p1 = /,\s*([\w\.]+)\s+"([^"]{3,50})"/g;
      let m;
      while ((m = p1.exec(sqlText)) !== null) {
        if (m[2].length >= 3 && !m[2].match(/^[\d\s\W]+$/)) fields.push({ column: m[1].trim(), alias: m[2].trim() });
      }

      const necPattern = /\b(srq|wov|wor|con|ivi|ins|pro|adr|aun|tcy|rac|tra)_[a-z_]+\b/gi;
      const necCols = [...new Set([...text.matchAll(necPattern)].map(x => x[0].toLowerCase()))];
      if (fields.length < 5) necCols.forEach(c => fields.push({ column: c, alias: c.split('_').slice(1).join(' ') }));
      fields = fields.filter((f, i, a) => a.findIndex(x => x.column === f.column) === i);

      const params = [...text.matchAll(/@prompt\s*\(\s*'([^']+)'/gi)].map(x => x[1]).filter((p, i, a) => a.indexOf(p) === i);
      const formulas = [...text.matchAll(/=\s*(Year|Month|Sum|Count|Max|Min|Avg|If)\s*\(<([^>]+)>\)/gi)].map(x => `${x[1]}(<${x[2]}>)`);

      const tblPattern = /\b(?:FROM|JOIN)\s+([a-z_][a-z0-9_]*)/gi;
      const rawTbls = [];
      let tm;
      while ((tm = tblPattern.exec(sqlText)) !== null) {
        const t = tm[1].toLowerCase();
        if (KNOWN_TABLES.has(t) || (t.includes('_') && !isLikelyGarbage(t))) rawTbls.push(t);
      }
      const tables = [...new Set(rawTbls)].sort();

      let sql = '';
      let start = text.search(/select\s+[\w\.]+\s+"[^"]+"/i);
      if (start === -1) start = text.search(/select\s+(distinct\s+)?[\w\.\(\)]+[\s\S]{10,500}?from\s+\w+/i);
      if (start > -1) {
        const section = text.substring(start, start + 8000).split(/\s+/);
        let depth = 0, parts = [], ff = false;
        for (let i = 0; i < Math.min(section.length, 250); i++) {
          const w = section[i];
          if (w.toLowerCase() === 'from') ff = true;
          parts.push(w);
          depth += (w.match(/\(/g) || []).length - (w.match(/\)/g) || []).length;
          if (ff && depth <= 0 && parts.length > 25 && /^(order|group|having|;)$/i.test(w)) break;
        }
        sql = parts.join(' ').replace(/\s+/g, ' ').replace(/[^\x20-\x7E]/g, '').substring(0, 1500);
      }

      const hasVBA = /\b(Sub\s+\w+|Function\s+\w+|End\s+Sub)\b/.test(text);
      const score = (fields.length * 0.5) + (params.length * 2) + (formulas.length * 1.5) + tables.length + (hasVBA ? 10 : 0);
      let complexity = 'Simple', days = 0.5;
      if (score > 30) { complexity = 'Complex'; days = 3; }
      else if (score > 15) { complexity = 'Medium'; days = 1.5; }

      return {
        fileName: file.name,
        sql,
        fieldAliases: fields,
        parameters: params,
        formulas,
        tables,
        hasVBA,
        complexity,
        days,
        status: 'not_started',
        assignedTo: '',
        actualDays: '',
        notes: '',
        pbiReportName: '',
        dateCompleted: '',
        signedOff: false,
        signedOffBy: '',
        signedOffDate: ''
      };
    } catch (e) {
      return { error: e.message, fileName: file.name };
    }
  };

  const handleFileUpload = useCallback(async (e) => {
    if (!activeProject) return;
    const files = Array.from(e.target.files).filter(f => /\.(rep|wid)$/i.test(f.name));
    if (!files.length) { setError('Please upload .rep or .wid files'); return; }
    setIsExtracting(true);
    setError('');
    const results = await Promise.all(files.map(parseRepFile));
    const ok = results.filter(r => !r.error);
    if (ok.length > 0) {
      await addReports(activeProject.id, ok);
    }
    setIsExtracting(false);
    e.target.value = ''; // Reset file input
  }, [activeProject, addReports]);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    if (!activeProject) return;
    const files = Array.from(e.dataTransfer.files).filter(f => /\.(rep|wid)$/i.test(f.name));
    if (!files.length) { setError('Please upload .rep or .wid files'); return; }
    setIsExtracting(true);
    setError('');
    const results = await Promise.all(files.map(parseRepFile));
    const ok = results.filter(r => !r.error);
    if (ok.length > 0) {
      await addReports(activeProject.id, ok);
    }
    setIsExtracting(false);
  }, [activeProject, addReports]);

  const saveProject = async () => {
    if (!editingProject.name.trim()) return;

    if (editingProject.id) {
      await updateProject(editingProject.id, editingProject);
    } else {
      const { data } = await createProject(editingProject);
      if (data) {
        setActiveProjectId(data.id);
        setCurrentView('project');
      }
    }
    setShowNewProject(false);
    setShowEditProject(false);
    setEditingProject(null);
  };

  const handleDuplicateProject = async (p) => {
    await duplicateProjectDB(p.id);
  };

  const handleArchiveProject = async (id) => {
    await toggleArchive(id);
    if (activeProjectId === id) {
      setActiveProjectId(null);
      setCurrentView('dashboard');
    }
  };

  const openProject = (p) => {
    setActiveProjectId(p.id);
    setCurrentView('project');
    setSelectedReports(new Set());
  };

  const handleDeleteProject = async (id) => {
    await deleteProjectDB(id);
    if (activeProjectId === id) {
      setActiveProjectId(null);
      setCurrentView('dashboard');
    }
  };

  const removeReport = async (id) => {
    await deleteReportDB(id);
    setSelectedReports(s => { const n = new Set(s); n.delete(id); return n; });
  };

  const updateReport = async (reportId, field, value) => {
    await updateReportDB(reportId, field, value);
  };

  const bulkUpdateStatus = async (newStatus) => {
    await bulkUpdateReports(Array.from(selectedReports), 'status', newStatus);
    setSelectedReports(new Set());
    setShowBulkActions(false);
  };

  const bulkAssign = async (developer) => {
    await bulkUpdateReports(Array.from(selectedReports), 'assignedTo', developer);
    setSelectedReports(new Set());
    setShowBulkActions(false);
  };

  const toggleSelectReport = (id) => {
    setSelectedReports(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const filteredReports = useMemo(() => {
    if (!activeProject) return [];
    let reps = [...activeProject.reports];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      reps = reps.filter(r => r.fileName.toLowerCase().includes(term) || r.notes?.toLowerCase().includes(term));
    }
    if (filterStatus !== 'all') reps = reps.filter(r => r.status === filterStatus);
    if (filterComplexity !== 'all') reps = reps.filter(r => r.complexity === filterComplexity);

    reps.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.fileName.localeCompare(b.fileName);
      else if (sortBy === 'status') cmp = STATUSES.findIndex(s => s.id === a.status) - STATUSES.findIndex(s => s.id === b.status);
      else if (sortBy === 'complexity') cmp = ['Simple','Medium','Complex'].indexOf(a.complexity) - ['Simple','Medium','Complex'].indexOf(b.complexity);
      else if (sortBy === 'days') cmp = a.days - b.days;
      else if (sortBy === 'assigned') cmp = (a.assignedTo || 'zzz').localeCompare(b.assignedTo || 'zzz');
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return reps;
  }, [activeProject, searchTerm, filterStatus, filterComplexity, sortBy, sortDir]);

  const selectAllFiltered = () => {
    if (selectedReports.size === filteredReports.length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(filteredReports.map(r => r.id)));
    }
  };

  const getTotals = (reps) => ({
    count: reps.length,
    days: reps.reduce((s, r) => s + r.days, 0),
    actual: reps.reduce((s, r) => s + (parseFloat(r.actualDays) || 0), 0),
    tables: [...new Set(reps.flatMap(r => r.tables || []))].length,
    simple: reps.filter(r => r.complexity === 'Simple').length,
    medium: reps.filter(r => r.complexity === 'Medium').length,
    complex: reps.filter(r => r.complexity === 'Complex').length,
    signedOff: reps.filter(r => r.signedOff).length,
    byStatus: STATUSES.map(s => ({ ...s, count: reps.filter(r => r.status === s.id).length }))
  });

  const generateCSV = () => {
    if (!activeProject) return '';
    const t = getTotals(activeProject.reports);
    const totalDaysPerWeek = activeProject.developers?.reduce((sum, d) => sum + (d.daysPerWeek || 0), 0) || 0;
    let csv = `Project,${activeProject.name}\nClient,${activeProject.client}\nLead,${activeProject.lead}\nStart,${activeProject.startDate}\nTotal Days/Week,${totalDaysPerWeek}\nEnd Date,${calcEndDate(activeProject.startDate, activeProject.reports, activeProject.developers)}\nTotal Est Days,${t.days}\nTotal Actual Days,${t.actual}\nSigned Off,${t.signedOff}/${t.count}\n\nDEVELOPERS\nName,Days/Week\n`;
    activeProject.developers?.forEach(d => csv += `${d.name},${d.daysPerWeek}\n`);
    csv += `\nREPORTS\nBO Report,PBI Report,Complexity,Est Days,Actual,Status,Assigned,Date Completed,Signed Off,Signed Off By,Notes\n`;
    activeProject.reports.forEach(r => csv += `"${r.fileName}","${r.pbiReportName||''}",${r.complexity},${r.days},${r.actualDays||''},${STATUSES.find(s=>s.id===r.status)?.label},${r.assignedTo},${r.dateCompleted||''},${r.signedOff?'Yes':'No'},${r.signedOffBy||''},"${(r.notes||'').replace(/"/g,'""')}"\n`);
    return csv;
  };

  const generatePDFContent = () => {
    if (!activeProject) return '';
    const t = getTotals(activeProject.reports);
    const endDate = calcEndDate(activeProject.startDate, activeProject.reports, activeProject.developers);
    const totalDaysPerWeek = activeProject.developers?.reduce((sum, d) => sum + (d.daysPerWeek || 0), 0) || 0;
    const complete = t.byStatus.find(s => s.id === 'complete')?.count || 0;
    const pct = t.count ? Math.round((complete / t.count) * 100) : 0;

    let content = `BO MIGRATION PROJECT REPORT\n${'='.repeat(50)}\n\n`;
    content += `Project: ${activeProject.name}\nClient: ${activeProject.client}\nProject Lead: ${activeProject.lead}\n\n`;
    content += `DEVELOPERS\n${'-'.repeat(30)}\n`;
    activeProject.developers?.forEach(d => content += `${d.name}: ${d.daysPerWeek} days/week\n`);
    content += `Total: ${totalDaysPerWeek} days/week\n\n`;
    content += `TIMELINE\n${'-'.repeat(30)}\nStart Date: ${activeProject.startDate || 'TBD'}\nEnd Date: ${endDate || 'TBD'}\n\n`;
    content += `SUMMARY\n${'-'.repeat(30)}\nTotal Reports: ${t.count}\nEstimated Days: ${t.days.toFixed(1)}\nActual Days: ${t.actual.toFixed(1)}\nProgress: ${pct}% (${complete}/${t.count} complete)\nSigned Off: ${t.signedOff}/${t.count}\n\n`;
    content += `COMPLEXITY BREAKDOWN\n${'-'.repeat(30)}\nSimple: ${t.simple}\nMedium: ${t.medium}\nComplex: ${t.complex}\n\n`;
    content += `STATUS BREAKDOWN\n${'-'.repeat(30)}\n`;
    t.byStatus.forEach(s => content += `${s.label}: ${s.count}\n`);
    content += `\nREPORT DETAILS\n${'='.repeat(50)}\n\n`;
    activeProject.reports.forEach((r, i) => {
      content += `${i+1}. ${r.fileName}${r.pbiReportName ? ` → ${r.pbiReportName}` : ''}\n`;
      content += `   Complexity: ${r.complexity} | Est: ${r.days}d | Actual: ${r.actualDays || '-'}d\n`;
      content += `   Status: ${STATUSES.find(s=>s.id===r.status)?.label} | Assigned: ${r.assignedTo || 'Unassigned'}\n`;
      content += `   Completed: ${r.dateCompleted || '-'} | Signed Off: ${r.signedOff ? `Yes (${r.signedOffBy}, ${r.signedOffDate})` : 'No'}\n`;
      if (r.notes) content += `   Notes: ${r.notes}\n`;
      content += `   Tables: ${r.tables?.join(', ') || 'None'}\n\n`;
    });
    content += `\n${'='.repeat(50)}\nGenerated: ${new Date().toLocaleString('en-GB')}\n`;
    return content;
  };

  const generateGanttData = () => {
    if (!activeProject || !activeProject.reports.length || !activeProject.startDate) return [];

    const startDate = new Date(activeProject.startDate);
    const totalDaysPerWeek = activeProject.developers?.reduce((sum, d) => sum + (d.daysPerWeek || 0), 0) || 5;

    const ganttItems = [];
    const byDeveloper = {};

    activeProject.reports.forEach(r => {
      const dev = r.assignedTo || 'Unassigned';
      if (!byDeveloper[dev]) byDeveloper[dev] = [];
      byDeveloper[dev].push(r);
    });

    Object.entries(byDeveloper).forEach(([dev, reports]) => {
      const devInfo = activeProject.developers?.find(d => d.name === dev);
      const devDaysPerWeek = devInfo?.daysPerWeek || (dev === 'Unassigned' ? totalDaysPerWeek : 5);

      let devCurrentDay = 0;
      reports.forEach(r => {
        const weeksNeeded = r.days / devDaysPerWeek;
        const calendarDays = Math.ceil(weeksNeeded * 7);

        const itemStart = new Date(startDate);
        itemStart.setDate(itemStart.getDate() + devCurrentDay);

        const itemEnd = new Date(itemStart);
        itemEnd.setDate(itemEnd.getDate() + calendarDays);

        ganttItems.push({
          id: r.id,
          name: r.fileName,
          developer: dev,
          complexity: r.complexity,
          status: r.status,
          days: r.days,
          startDate: itemStart,
          endDate: itemEnd,
          startDay: devCurrentDay,
          duration: calendarDays
        });

        devCurrentDay += calendarDays;
      });
    });

    return ganttItems;
  };

  const downloadGanttPDF = () => {
    const ganttData = generateGanttData();
    if (!ganttData.length) return;

    const allDates = ganttData.flatMap(g => [g.startDate, g.endDate]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    const developers = [...new Set(ganttData.map(g => g.developer))];
    const t = getTotals(activeProject.reports);
    const totalDaysPerWeek = activeProject.developers?.reduce((sum, d) => sum + (d.daysPerWeek || 0), 0) || 0;

    let content = `PROJECT TIMELINE / GANTT CHART\n${'='.repeat(60)}\n\n`;
    content += `Project: ${activeProject.name}\n`;
    content += `Client: ${activeProject.client}\n`;
    content += `Generated: ${new Date().toLocaleString('en-GB')}\n\n`;
    content += `TIMELINE OVERVIEW\n${'-'.repeat(40)}\n`;
    content += `Start Date: ${minDate.toLocaleDateString('en-GB')}\n`;
    content += `End Date: ${maxDate.toLocaleDateString('en-GB')}\n`;
    content += `Total Reports: ${t.count}\n`;
    content += `Total Estimated Days: ${t.days.toFixed(1)}\n`;
    content += `Team Capacity: ${totalDaysPerWeek} days/week\n\n`;

    content += `SCHEDULE BY DEVELOPER\n${'='.repeat(60)}\n\n`;

    developers.forEach(dev => {
      const devReports = ganttData.filter(g => g.developer === dev);
      const devInfo = activeProject.developers?.find(d => d.name === dev);
      content += `${dev}${devInfo ? ` (${devInfo.daysPerWeek}d/wk)` : ''}\n${'-'.repeat(40)}\n`;

      devReports.forEach((item, i) => {
        const status = STATUSES.find(s => s.id === item.status)?.label || 'Unknown';
        content += `${i + 1}. ${item.name}\n`;
        content += `   ${item.startDate.toLocaleDateString('en-GB')} → ${item.endDate.toLocaleDateString('en-GB')} (${item.days}d)\n`;
        content += `   Complexity: ${item.complexity} | Status: ${status}\n\n`;
      });
      content += '\n';
    });

    content += `${'='.repeat(60)}\n`;
    content += `Legend: Dates shown are calendar dates based on developer availability.\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject?.name || 'project'}-timeline.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const content = generatePDFContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject?.name || 'project'}-report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (txt, type) => {
    await navigator.clipboard.writeText(txt);
    setCopied(type);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    setActiveProjectId(null);
    setCurrentView('dashboard');
  };

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30 animate-pulse">
            <Database className="w-9 h-9 text-white" />
          </div>
          <p className="text-blue-200">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginPage onLogin={signIn} onSignUp={signUp} authLoading={authLoading} />;
  }

  const userName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';

  const activeProjects = projects.filter(p => !p.archived);
  const archivedProjects = projects.filter(p => p.archived);
  const displayProjects = showArchived ? archivedProjects : activeProjects;
  const totalReports = activeProjects.reduce((s, p) => s + p.reports.length, 0);
  const totalDays = activeProjects.reduce((s, p) => s + p.reports.reduce((x, r) => x + r.days, 0), 0);

  const ProjectModal = ({ isNew }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold text-lg mb-4">{isNew ? 'Create New Project' : 'Edit Project'}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input type="text" value={editingProject?.name || ''} onChange={(e) => setEditingProject(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Repairs Migration 2026" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client / Council</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={editingProject?.client || ''} onChange={(e) => setEditingProject(p => ({ ...p, client: e.target.value }))} placeholder="e.g. Southwark Council" className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Lead</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={editingProject?.lead || ''} onChange={(e) => setEditingProject(p => ({ ...p, lead: e.target.value }))} placeholder="e.g. Sarah Johnson" className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" value={editingProject?.startDate || ''} onChange={(e) => setEditingProject(p => ({ ...p, startDate: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Developers</label>
            <div className="space-y-2">
              {editingProject?.developers?.map((dev, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input type="text" value={dev.name} onChange={(e) => setEditingProject(p => ({ ...p, developers: p.developers.map((d, i) => i === idx ? { ...d, name: e.target.value } : d) }))} placeholder="Name" className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="flex items-center gap-1">
                    <input type="number" min="1" max="7" value={dev.daysPerWeek} onChange={(e) => setEditingProject(p => ({ ...p, developers: p.developers.map((d, i) => i === idx ? { ...d, daysPerWeek: parseInt(e.target.value) || 1 } : d) }))} className="w-16 px-2 py-2 border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <span className="text-xs text-gray-500">d/wk</span>
                  </div>
                  <button onClick={() => setEditingProject(p => ({ ...p, developers: p.developers.filter((_, i) => i !== idx) }))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => setEditingProject(p => ({ ...p, developers: [...(p.developers || []), { name: '', daysPerWeek: 5 }] }))} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-1"><Plus className="w-4 h-4" /> Add Developer</button>
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button onClick={() => { setShowNewProject(false); setShowEditProject(false); setEditingProject(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={saveProject} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isNew ? 'Create' : 'Save'}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <div className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ${sidebarExpanded ? 'w-64' : 'w-16'}`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          {sidebarExpanded && <div className="flex items-center gap-2"><Database className="w-6 h-6 text-blue-400" /><span className="font-bold text-sm">BO Migration</span></div>}
          <button onClick={() => setSidebarExpanded(!sidebarExpanded)} className="p-1.5 hover:bg-slate-700 rounded-lg">{sidebarExpanded ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <button onClick={() => { setCurrentView('dashboard'); setActiveProjectId(null); setShowArchived(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${currentView === 'dashboard' && !showArchived ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><Home className="w-5 h-5 flex-shrink-0" />{sidebarExpanded && <span className="text-sm">Dashboard</span>}</button>
          <button onClick={() => { setCurrentView('dashboard'); setActiveProjectId(null); setShowArchived(true); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${showArchived ? 'bg-slate-700' : 'hover:bg-slate-800'}`}><Archive className="w-5 h-5 flex-shrink-0" />{sidebarExpanded && <span className="text-sm">Archived ({archivedProjects.length})</span>}</button>
          <div className="pt-4 pb-2">{sidebarExpanded && <p className="px-3 text-xs text-slate-500 uppercase tracking-wider">Projects</p>}</div>
          <button onClick={() => { setEditingProject({ ...emptyProject }); setShowNewProject(true); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-blue-400"><Plus className="w-5 h-5 flex-shrink-0" />{sidebarExpanded && <span className="text-sm">New Project</span>}</button>
          {projectsLoading ? (
            <div className="px-3 py-2 text-slate-500 text-sm">{sidebarExpanded && 'Loading...'}</div>
          ) : (
            activeProjects.map(p => (
              <button key={p.id} onClick={() => openProject(p)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeProjectId === p.id ? 'bg-slate-700' : 'hover:bg-slate-800'}`}>
                <Folder className="w-5 h-5 flex-shrink-0 text-slate-400" />
                {sidebarExpanded && <div className="flex-1 text-left truncate"><p className="text-sm truncate">{p.name}</p><p className="text-xs text-slate-500">{p.reports.length} reports</p></div>}
              </button>
            ))
          )}
        </nav>
        <div className="p-2 border-t border-slate-700">
          <div className={`flex items-center gap-3 px-3 py-2 ${sidebarExpanded ? '' : 'justify-center'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">{userName.charAt(0).toUpperCase()}</div>
            {sidebarExpanded && <div className="flex-1 truncate"><p className="text-sm truncate">{userName}</p><p className="text-xs text-slate-500 truncate">{userEmail}</p></div>}
          </div>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 mt-1"><LogOut className="w-5 h-5 flex-shrink-0" />{sidebarExpanded && <span className="text-sm">Sign Out</span>}</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{currentView === 'dashboard' ? (showArchived ? 'Archived Projects' : 'Dashboard') : activeProject?.name}</h1>
            <p className="text-sm text-gray-500">{currentView === 'dashboard' ? `${displayProjects.length} projects` : activeProject?.client}</p>
          </div>
          {currentView === 'project' && activeProject && (
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditingProject({ ...activeProject }); setShowEditProject(true); }} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm flex items-center gap-2"><Edit3 className="w-4 h-4" /> Edit</button>
              <button onClick={() => handleDuplicateProject(activeProject)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm flex items-center gap-2"><Files className="w-4 h-4" /> Clone</button>
              <button onClick={() => handleArchiveProject(activeProject.id)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm flex items-center gap-2"><Archive className="w-4 h-4" /> Archive</button>
            </div>
          )}
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {(showNewProject || showEditProject) && <ProjectModal isNew={showNewProject} />}

          {showExport && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">{showExport === 'csv' ? 'CSV Export' : 'Project Report'}</h3>
                  <button onClick={() => setShowExport(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-4 flex-1 overflow-auto">
                  <textarea readOnly value={showExport === 'csv' ? generateCSV() : generatePDFContent()} className="w-full h-96 p-3 border rounded-lg font-mono text-xs bg-gray-50" />
                </div>
                <div className="p-4 border-t flex justify-between">
                  <p className="text-sm text-gray-500 self-center">{showExport === 'pdf' ? 'Download as text file or copy to clipboard' : 'Copy to clipboard or download'}</p>
                  <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(showExport === 'csv' ? generateCSV() : generatePDFContent(), 'export')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-200">
                      {copied === 'export' ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied === 'export' ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={downloadPDF} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
                      <FileText className="w-4 h-4" /> Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showBulkActions && selectedReports.size > 0 && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-sm w-full p-6">
                <h3 className="font-semibold text-lg mb-4">Bulk Update ({selectedReports.size} reports)</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Set Status:</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map(s => <button key={s.id} onClick={() => bulkUpdateStatus(s.id)} className={`px-3 py-1.5 rounded text-sm font-medium ${s.color} hover:opacity-80`}>{s.label}</button>)}
                    </div>
                  </div>
                  {activeProject?.developers?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Assign To:</p>
                      <div className="flex flex-wrap gap-2">
                        {activeProject.developers.map(d => <button key={d.name} onClick={() => bulkAssign(d.name)} className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">{d.name}</button>)}
                        <button onClick={() => bulkAssign('')} className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200">Unassign</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-6">
                  <button onClick={() => setShowBulkActions(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {showGantt && activeProject && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">Timeline / Gantt Chart - {activeProject.name}</h3>
                  <button onClick={() => setShowGantt(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-4 flex-1 overflow-auto">
                  {(() => {
                    const ganttData = generateGanttData();
                    if (!ganttData.length) return <p className="text-gray-500 text-center py-8">Add reports and set a start date to view timeline</p>;

                    const allDates = ganttData.flatMap(g => [g.startDate, g.endDate]);
                    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
                    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
                    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const todayOffset = Math.ceil((today - minDate) / (1000 * 60 * 60 * 24));
                    const todayPosition = (todayOffset / totalDays) * 100;
                    const showTodayLine = today >= minDate && today <= maxDate;

                    const developers = [...new Set(ganttData.map(g => g.developer))];
                    const weeks = [];
                    let weekStart = new Date(minDate);
                    while (weekStart <= maxDate) {
                      weeks.push(new Date(weekStart));
                      weekStart.setDate(weekStart.getDate() + 7);
                    }

                    const getBarStyle = (item) => {
                      const startOffset = Math.ceil((item.startDate - minDate) / (1000 * 60 * 60 * 24));
                      const left = (startOffset / totalDays) * 100;
                      const width = (item.duration / totalDays) * 100;
                      return { left: `${left}%`, width: `${Math.max(width, 1)}%` };
                    };

                    const getBarColor = (status) => {
                      switch(status) {
                        case 'complete': return 'bg-green-500';
                        case 'testing': return 'bg-amber-500';
                        case 'in_progress': return 'bg-blue-500';
                        default: return 'bg-gray-400';
                      }
                    };

                    return (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex gap-4 text-xs">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-400 rounded" /> Not Started</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded" /> In Progress</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded" /> Testing</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded" /> Complete</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500" style={{width: '12px'}} /> Today</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Today: {today.toLocaleDateString('en-GB')}
                          </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="flex border-b bg-gray-50">
                            <div className="w-48 flex-shrink-0 p-2 border-r font-medium text-sm">Developer / Report</div>
                            <div className="flex-1 flex relative">
                              {weeks.map((w, i) => (
                                <div key={i} className="flex-1 p-2 text-xs text-center border-r last:border-r-0 text-gray-600">
                                  {w.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </div>
                              ))}
                            </div>
                          </div>
                          {developers.map(dev => {
                            const devReports = ganttData.filter(g => g.developer === dev);
                            return (
                              <div key={dev}>
                                <div className="flex border-b bg-gray-50">
                                  <div className="w-48 flex-shrink-0 p-2 border-r font-medium text-sm truncate">{dev}</div>
                                  <div className="flex-1 relative">
                                    {showTodayLine && <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${todayPosition}%` }} />}
                                  </div>
                                </div>
                                {devReports.map(item => (
                                  <div key={item.id} className="flex border-b hover:bg-gray-50">
                                    <div className="w-48 flex-shrink-0 p-2 border-r text-xs truncate pl-4" title={item.name}>
                                      {item.name}
                                    </div>
                                    <div className="flex-1 relative h-8">
                                      {showTodayLine && <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${todayPosition}%` }} />}
                                      <div
                                        className={`absolute top-1 h-6 rounded ${getBarColor(item.status)} opacity-80 flex items-center px-2 overflow-hidden`}
                                        style={getBarStyle(item)}
                                        title={`${item.name}: ${item.days}d (${item.startDate.toLocaleDateString('en-GB')} - ${item.endDate.toLocaleDateString('en-GB')})`}
                                      >
                                        <span className="text-white text-xs truncate">{item.days}d</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Timeline based on start date {activeProject.startDate} and developer availability. Assign reports to developers for accurate scheduling.</p>
                      </div>
                    );
                  })()}
                </div>
                <div className="p-4 border-t flex justify-between">
                  <p className="text-sm text-gray-500 self-center">Export timeline as text file</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowGantt(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Close</button>
                    <button onClick={downloadGanttPDF} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'dashboard' && (
            <div>
              {!showArchived && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-5 border"><p className="text-sm text-gray-500 mb-1">Projects</p><p className="text-3xl font-bold">{activeProjects.length}</p></div>
                  <div className="bg-white rounded-xl p-5 border"><p className="text-sm text-gray-500 mb-1">Reports</p><p className="text-3xl font-bold text-blue-600">{totalReports}</p></div>
                  <div className="bg-white rounded-xl p-5 border"><p className="text-sm text-gray-500 mb-1">Est. Days</p><p className="text-3xl font-bold text-purple-600">{totalDays.toFixed(1)}</p></div>
                  <div className="bg-white rounded-xl p-5 border"><p className="text-sm text-gray-500 mb-1">Archived</p><p className="text-3xl font-bold text-gray-400">{archivedProjects.length}</p></div>
                </div>
              )}
              <div className="bg-white rounded-xl border">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-semibold">{showArchived ? 'Archived Projects' : 'Active Projects'}</h2>
                  {!showArchived && <button onClick={() => { setEditingProject({ ...emptyProject }); setShowNewProject(true); }} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> New</button>}
                </div>
                <div className="divide-y">
                  {projectsLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading projects...</div>
                  ) : displayProjects.map(p => {
                    const t = getTotals(p.reports);
                    const endDate = calcEndDate(p.startDate, p.reports, p.developers);
                    const totalDpw = p.developers?.reduce((sum, d) => sum + (d.daysPerWeek || 0), 0) || 0;
                    const complete = t.byStatus.find(s => s.id === 'complete')?.count || 0;
                    const pct = t.count ? Math.round((complete / t.count) * 100) : 0;
                    return (
                      <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                        <button onClick={() => openProject(p)} className="flex-1 flex items-center gap-4 text-left">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${p.archived ? 'bg-gray-100' : 'bg-blue-100'}`}><Folder className={`w-6 h-6 ${p.archived ? 'text-gray-400' : 'text-blue-600'}`} /></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{p.name}</p>
                            <p className="text-sm text-gray-500">{p.client} · {p.lead}{totalDpw > 0 ? ` · ${totalDpw}d/wk` : ''}</p>
                            {t.count > 0 && <div className="flex items-center gap-2 mt-1"><div className="flex-1 h-1.5 bg-gray-200 rounded-full max-w-32"><div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} /></div><span className="text-xs text-gray-500">{pct}%</span></div>}
                          </div>
                        </button>
                        <div className="text-right text-sm">
                          <p className="text-gray-900">{t.count} reports · {t.days.toFixed(1)}d</p>
                          <p className="text-gray-500">{p.startDate || '?'} → {endDate || '?'}</p>
                        </div>
                        <div className="flex items-center">
                          <button onClick={() => handleDuplicateProject(p)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg" title="Clone"><Files className="w-4 h-4" /></button>
                          <button onClick={() => { setEditingProject({ ...p }); setShowEditProject(true); }} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleArchiveProject(p.id)} className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg" title={p.archived ? 'Restore' : 'Archive'}><Archive className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteProject(p.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    );
                  })}
                  {!projectsLoading && !displayProjects.length && <div className="p-8 text-center text-gray-500">{showArchived ? 'No archived projects' : 'No projects yet'}</div>}
                </div>
              </div>
            </div>
          )}

          {currentView === 'project' && activeProject && (() => {
            const t = getTotals(activeProject.reports);
            const endDate = calcEndDate(activeProject.startDate, activeProject.reports, activeProject.developers);
            const totalDaysPerWeek = activeProject.developers?.reduce((sum, d) => sum + (d.daysPerWeek || 0), 0) || 0;
            const complete = t.byStatus.find(s => s.id === 'complete')?.count || 0;
            const pct = t.count ? Math.round((complete / t.count) * 100) : 0;
            return (
              <div>
                <div className="bg-white rounded-xl border p-5 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div><p className="text-sm text-gray-500">Project Lead: <span className="text-gray-900">{activeProject.lead || '—'}</span></p><p className="text-sm text-gray-500">Developers: <span className="text-gray-900">{activeProject.developers?.map(d => `${d.name} (${d.daysPerWeek}d/wk)`).join(', ') || '—'}</span></p></div>
                    <div className="text-right"><p className="text-sm text-gray-500">Timeline: <span className="text-gray-900">{activeProject.startDate || '?'} → {endDate || '?'}</span></p><p className="text-sm text-gray-500">{totalDaysPerWeek} days/week total</p></div>
                  </div>
                  <div className="flex items-center gap-3"><div className="flex-1 h-3 bg-gray-200 rounded-full"><div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} /></div><span className="text-sm font-medium text-gray-700">{complete}/{t.count} complete ({pct}%)</span></div>
                  <div className="flex gap-2 mt-3">{t.byStatus.map(s => (<span key={s.id} className={`px-2 py-1 rounded text-xs font-medium ${s.color}`}>{s.label}: {s.count}</span>))}</div>
                </div>

                <div className="grid grid-cols-7 gap-3 mb-4">
                  <div className="bg-white rounded-xl p-4 border text-center"><p className="text-2xl font-bold text-blue-600">{t.count}</p><p className="text-xs text-gray-500">Reports</p></div>
                  <div className="bg-white rounded-xl p-4 border text-center"><p className="text-2xl font-bold text-green-600">{t.simple}</p><p className="text-xs text-gray-500">Simple</p></div>
                  <div className="bg-white rounded-xl p-4 border text-center"><p className="text-2xl font-bold text-amber-600">{t.medium}</p><p className="text-xs text-gray-500">Medium</p></div>
                  <div className="bg-white rounded-xl p-4 border text-center"><p className="text-2xl font-bold text-red-600">{t.complex}</p><p className="text-xs text-gray-500">Complex</p></div>
                  <div className="bg-white rounded-xl p-4 border text-center"><p className="text-2xl font-bold text-purple-600">{t.days.toFixed(1)}</p><p className="text-xs text-gray-500">Est Days</p></div>
                  <div className="bg-white rounded-xl p-4 border text-center"><p className="text-2xl font-bold text-gray-600">{t.actual.toFixed(1)}</p><p className="text-xs text-gray-500">Actual</p></div>
                  <div className="bg-white rounded-xl p-4 border text-center"><p className="text-2xl font-bold text-green-600">{t.signedOff}</p><p className="text-xs text-gray-500">Signed Off</p></div>
                </div>

                <div className="bg-white rounded-xl border p-6 mb-4">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-blue-600" /> Import Reports</h2>
                  <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 cursor-pointer">
                    <input type="file" accept=".rep,.wid" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer">{isExtracting ? <p className="text-blue-600 font-medium">Processing...</p> : <><Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" /><p className="text-gray-600">Drop .rep or .wid files</p></>}</label>
                  </div>
                  {error && <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-600" /><span className="text-red-800 text-sm">{error}</span></div>}
                </div>

                {activeProject.reports.length > 0 && (
                  <div className="bg-white rounded-xl border mb-4">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold">Reports ({filteredReports.length}{filteredReports.length !== activeProject.reports.length ? ` of ${activeProject.reports.length}` : ''})</h2>
                        <div className="flex gap-2">
                          {selectedReports.size > 0 && <button onClick={() => setShowBulkActions(true)} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Bulk Update ({selectedReports.size})</button>}
                          <button onClick={() => setShowExport('csv')} className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700">CSV</button>
                          <button onClick={() => setShowExport('pdf')} className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">Report</button>
                          <button onClick={() => setShowGantt(true)} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">Timeline</button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="relative flex-1 min-w-48"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search reports..." className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm"><option value="all">All Statuses</option>{STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
                        <select value={filterComplexity} onChange={e => setFilterComplexity(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm"><option value="all">All Complexity</option><option value="Simple">Simple</option><option value="Medium">Medium</option><option value="Complex">Complex</option></select>
                        <select value={`${sortBy}-${sortDir}`} onChange={e => { const [by, dir] = e.target.value.split('-'); setSortBy(by); setSortDir(dir); }} className="px-3 py-1.5 border rounded-lg text-sm">
                          <option value="name-asc">Name A-Z</option><option value="name-desc">Name Z-A</option>
                          <option value="status-asc">Status ↑</option><option value="status-desc">Status ↓</option>
                          <option value="complexity-asc">Complexity ↑</option><option value="complexity-desc">Complexity ↓</option>
                          <option value="days-asc">Days ↑</option><option value="days-desc">Days ↓</option>
                          <option value="assigned-asc">Assigned A-Z</option><option value="assigned-desc">Assigned Z-A</option>
                        </select>
                      </div>
                    </div>
                    <div className="divide-y">
                      <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 border-b">
                        <button onClick={selectAllFiltered} className="p-1 hover:bg-gray-200 rounded">{selectedReports.size === filteredReports.length && filteredReports.length > 0 ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-gray-400" />}</button>
                        <span className="text-xs text-gray-500">{selectedReports.size > 0 ? `${selectedReports.size} selected` : 'Select all'}</span>
                      </div>
                      {filteredReports.map(r => (
                        <div key={r.id}>
                          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedReport(expandedReport === r.id ? null : r.id)}>
                            <div className="flex items-center gap-3">
                              <button onClick={e => { e.stopPropagation(); toggleSelectReport(r.id); }} className="p-1 hover:bg-gray-200 rounded">{selectedReports.has(r.id) ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-gray-400" />}</button>
                              {expandedReport === r.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              <span className="font-medium text-sm">{r.fileName}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.complexity === 'Simple' ? 'bg-green-100 text-green-700' : r.complexity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{r.complexity}</span>
                              <span className="text-xs text-gray-500">{r.days}d</span>
                              {r.pbiReportName && <span className="text-xs text-blue-600">→ {r.pbiReportName}</span>}
                              {r.signedOff && <CheckCircle className="w-4 h-4 text-green-500" />}
                              {r.assignedTo && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{r.assignedTo}</span>}
                              {r.hasVBA && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                            </div>
                            <div className="flex items-center gap-2">
                              <select value={r.status} onChange={e => { e.stopPropagation(); updateReport(r.id, 'status', e.target.value); }} onClick={e => e.stopPropagation()} className={`text-xs px-2 py-1 rounded border-0 font-medium ${STATUSES.find(s => s.id === r.status)?.color}`}>{STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
                              <button onClick={e => { e.stopPropagation(); removeReport(r.id); }} className="p-1 hover:bg-red-100 rounded text-red-500"><X className="w-4 h-4" /></button>
                            </div>
                          </div>
                          {expandedReport === r.id && (
                            <div className="px-4 pb-4 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">BO Report Name</label>
                                  <input type="text" readOnly value={r.fileName} className="w-full text-sm px-2 py-1.5 border rounded-lg bg-gray-50" />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Power BI Report Name</label>
                                  <input type="text" value={r.pbiReportName || ''} onChange={e => updateReport(r.id, 'pbiReportName', e.target.value)} placeholder="New report name in PBI..." className="w-full text-sm px-2 py-1.5 border rounded-lg" />
                                </div>
                              </div>
                              <div className="grid grid-cols-4 gap-3">
                                <div><label className="block text-xs text-gray-500 mb-1">Assigned To</label><select value={r.assignedTo || ''} onChange={e => updateReport(r.id, 'assignedTo', e.target.value)} className="w-full text-sm px-2 py-1.5 border rounded-lg"><option value="">Unassigned</option>{activeProject.developers?.map(d => <option key={d.name} value={d.name}>{d.name} ({d.daysPerWeek}d/wk)</option>)}</select></div>
                                <div><label className="block text-xs text-gray-500 mb-1">Est. Days</label><input type="text" readOnly value={r.days} className="w-full text-sm px-2 py-1.5 border rounded-lg bg-gray-50" /></div>
                                <div><label className="block text-xs text-gray-500 mb-1">Actual Days</label><input type="number" step="0.5" min="0" value={r.actualDays || ''} onChange={e => updateReport(r.id, 'actualDays', e.target.value)} placeholder="0" className="w-full text-sm px-2 py-1.5 border rounded-lg" /></div>
                                <div><label className="block text-xs text-gray-500 mb-1">Variance</label><input type="text" readOnly value={r.actualDays ? ((parseFloat(r.actualDays) - r.days) > 0 ? '+' : '') + (parseFloat(r.actualDays) - r.days).toFixed(1) : '—'} className={`w-full text-sm px-2 py-1.5 border rounded-lg bg-gray-50 ${r.actualDays && parseFloat(r.actualDays) > r.days ? 'text-red-600' : 'text-green-600'}`} /></div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Date Completed</label>
                                  <input type="date" value={r.dateCompleted || ''} onChange={e => updateReport(r.id, 'dateCompleted', e.target.value)} className="w-full text-sm px-2 py-1.5 border rounded-lg" />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Sign-off</label>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        if (r.signedOff) {
                                          updateReport(r.id, 'signedOff', false);
                                          updateReport(r.id, 'signedOffBy', '');
                                          updateReport(r.id, 'signedOffDate', '');
                                        } else {
                                          updateReport(r.id, 'signedOff', true);
                                          updateReport(r.id, 'signedOffBy', userName);
                                          updateReport(r.id, 'signedOffDate', new Date().toISOString().split('T')[0]);
                                        }
                                      }}
                                      className={`flex-1 text-sm px-3 py-1.5 rounded-lg font-medium flex items-center justify-center gap-2 ${r.signedOff ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'}`}
                                    >
                                      {r.signedOff ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                      {r.signedOff ? `Signed off by ${r.signedOffBy}` : 'Mark as Signed Off'}
                                    </button>
                                  </div>
                                  {r.signedOff && <p className="text-xs text-gray-500 mt-1">{r.signedOffDate}</p>}
                                </div>
                              </div>
                              <div><label className="block text-xs text-gray-500 mb-1">Notes</label><textarea value={r.notes || ''} onChange={e => updateReport(r.id, 'notes', e.target.value)} placeholder="Add notes, blockers, dependencies..." className="w-full text-sm px-2 py-1.5 border rounded-lg h-16" /></div>
                              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-3">
                                <div className="grid grid-cols-4 gap-4">
                                  <div><span className="text-gray-500">Fields:</span> {r.fieldAliases?.length || 0}</div>
                                  <div><span className="text-gray-500">Params:</span> {r.parameters?.length || 0}</div>
                                  <div><span className="text-gray-500">Formulas:</span> {r.formulas?.length || 0}</div>
                                  <div><span className="text-gray-500">Tables:</span> {r.tables?.length || 0}</div>
                                </div>
                                {r.fieldAliases?.length > 0 && (
                                  <div><p className="text-gray-500 mb-1 font-medium">Fields:</p><div className="max-h-40 overflow-y-auto border rounded bg-white"><table className="w-full"><thead className="bg-gray-100 sticky top-0"><tr><th className="text-left py-1 px-2 font-medium">Column</th><th className="text-left py-1 px-2 font-medium">Display Name</th></tr></thead><tbody>{r.fieldAliases.map((f, i) => <tr key={i} className="border-t"><td className="py-1 px-2 font-mono text-gray-600">{f.column}</td><td className="py-1 px-2">{f.alias}</td></tr>)}</tbody></table></div></div>
                                )}
                                {r.parameters?.length > 0 && (<div><p className="text-gray-500 mb-1 font-medium">Parameters:</p><div className="flex flex-wrap gap-1">{r.parameters.map((p, i) => <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{p}</span>)}</div></div>)}
                                {r.formulas?.length > 0 && (<div><p className="text-gray-500 mb-1 font-medium">Formulas:</p><div className="flex flex-wrap gap-1">{r.formulas.map((f, i) => <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-mono">{f}</span>)}</div></div>)}
                                {r.tables?.length > 0 && (<div><p className="text-gray-500 mb-1 font-medium">Tables:</p><div className="flex flex-wrap gap-1">{r.tables.map((t, i) => <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-mono">{t}</span>)}</div></div>)}
                              </div>
                              {r.sql && <div><p className="text-xs text-gray-500 mb-1">SQL:</p><textarea readOnly value={r.sql} className="w-full h-24 p-2 border rounded font-mono text-xs bg-gray-50" /></div>}
                            </div>
                          )}
                        </div>
                      ))}
                      {filteredReports.length === 0 && <div className="p-8 text-center text-gray-500">No reports match your filters</div>}
                    </div>
                  </div>
                )}

                {activeProject.reports.length > 0 && (
                  <div className="bg-blue-600 rounded-xl p-4 text-white">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6" />
                      <div className="flex-1"><h3 className="font-semibold text-sm">AI Analysis</h3><p className="text-blue-100 text-xs">Get migration recommendations</p></div>
                      <button onClick={() => copyToClipboard(generatePDFContent(), 'ai')} className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold text-sm flex items-center gap-2">{copied === 'ai' ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy for AI</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
}
