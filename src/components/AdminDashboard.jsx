import React, { useState, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost, apiPatch, apiDelete } from '../services/api';

export const AdminDashboard = ({ initialTab = 'patches' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // 'patches' | 'documents'

  // Patch Releases State
  const [releases, setReleases] = useState([]);
  const [loadingReleases, setLoadingReleases] = useState(true);
  const [showPatchModal, setShowPatchModal] = useState(false);
  const [patchVersion, setPatchVersion] = useState('');
  const [patchTitle, setPatchTitle] = useState('');
  const [patchContent, setPatchContent] = useState('');
  const [patchType, setPatchType] = useState('OPTIONAL');
  const [patchPlatform, setPatchPlatform] = useState('ANDROID');
  const [isPatchTypeOpen, setIsPatchTypeOpen] = useState(false);

  // Static Documents State
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [showDocModal, setShowDocModal] = useState(false);
  const [editingDocId, setEditingDocId] = useState(null);
  const [docType, setDocType] = useState('PRIVACY_POLICY');
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [isDocTypeOpen, setIsDocTypeOpen] = useState(false);

  const fetchReleases = async () => {
    setLoadingReleases(true);
    try {
      const data = await apiGet('/patch-releases');
      setReleases(Array.isArray(data) ? data : []);
    } catch {
      
    } finally {
      setLoadingReleases(false);
    }
  };

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const data = await apiGet('/static-documents');
      setDocuments(Array.isArray(data) ? data : []);
    } catch {
      
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchReleases();
    fetchDocuments();
  }, []);

  // Patch Release Handlers
  const openNewPatchModal = () => {
    setPatchVersion('');
    setPatchTitle('');
    setPatchContent('');
    setPatchType('OPTIONAL');
    setPatchPlatform('ANDROID');
    setIsPatchTypeOpen(false);
    setShowPatchModal(true);
  };

  const handleSavePatch = async (e) => {
    e.preventDefault();
    try {
      await apiPost('/patch-releases', {
        version: patchVersion,
        title: patchTitle,
        content: patchContent,
        updateType: patchType,
        platform: patchPlatform,
      });
      setShowPatchModal(false);
      fetchReleases();
    } catch (err) {
      alert(err.message || 'Failed to save patch release.');
    }
  };

  // Static Document Handlers
  const openNewDocModal = () => {
    setEditingDocId(null);
    setDocType('PRIVACY_POLICY');
    setDocTitle('Privacy Policy');
    setDocContent('');
    setIsDocTypeOpen(false);
    setShowDocModal(true);
  };

  const openEditDocModal = (doc) => {
    setEditingDocId(doc._id || doc.id);
    setDocType(doc.type);
    setDocTitle(doc.title);
    setDocContent(doc.content);
    setIsDocTypeOpen(false);
    setShowDocModal(true);
  };

  const handleSaveDoc = async (e) => {
    e.preventDefault();
    try {
      if (editingDocId) {
        await apiPatch(`/static-documents/${editingDocId}`, {
          title: docTitle,
          content: docContent,
        });
      } else {
        await apiPost('/static-documents', {
          type: docType,
          title: docTitle,
          content: docContent,
        });
      }
      setShowDocModal(false);
      fetchDocuments();
    } catch (err) {
      alert(err.message || 'Failed to save document.');
    }
  };

  const handleDeleteDoc = async (doc) => {
    const id = doc._id || doc.id;
    if (!window.confirm(`Delete "${doc.title}"?`)) return;
    try {
      await apiDelete(`/static-documents/${id}`);
      fetchDocuments();
    } catch (err) {
      alert(err.message || 'Failed to delete document.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 sm:px-10 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
            A
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Patch Admin Console</h1>
            <p className="text-[10px] text-slate-400">Release Management & Policy Governance</p>
          </div>
        </div>

        {/* Tab Switcher & Navigation */}
        <div className="flex items-center gap-3 text-xs">
          <nav className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('patches')}
              className={`px-3.5 py-1.5 font-semibold rounded-lg transition-all ${
                activeTab === 'patches'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Patch Releases
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3.5 py-1.5 font-semibold rounded-lg transition-all ${
                activeTab === 'documents'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Static Documents
            </button>
          </nav>

          <div className="text-right hidden sm:block">
            <span className="font-bold text-slate-800 text-xs block">{user?.name || 'Administrator'}</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">{user?.role || 'ADMIN'}</span>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        {/* TAB 1: Patch Releases */}
        {activeTab === 'patches' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Patch Release Management
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Create, configure, publish, and delete mandatory or optional patch updates.
                </p>
              </div>

              <button
                onClick={openNewPatchModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-sm transition-all self-start sm:self-auto"
              >
                + New Patch Release
              </button>
            </div>

            {loadingReleases ? (
              <div className="text-center py-12 text-xs text-slate-400">Loading releases...</div>
            ) : releases.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500 shadow-xs">
                No patch releases created yet. Click &quot;+ New Patch Release&quot; to deploy an update.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4">Version</th>
                        <th className="py-3 px-4">Platform</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Update Type</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Release Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {releases.map((rel) => {
                        const id = rel._id || rel.id;
                        return (
                          <tr key={id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                              v{rel.version}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  rel.platform === 'IOS'
                                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {rel.platform === 'IOS' ? 'iOS' : 'Android'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900">{rel.title}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  rel.updateType === 'FORCE'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {rel.updateType}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Active
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={rel.content}>
                              {rel.content}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Static Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Static Document Management
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage Privacy Policy, Terms & Conditions, My Benefits, and About App documents.
                </p>
              </div>

              <button
                onClick={openNewDocModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-sm transition-all self-start sm:self-auto"
              >
                + New Document
              </button>
            </div>

            {loadingDocs ? (
              <div className="text-center py-12 text-xs text-slate-400">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500 shadow-xs">
                No documents created yet. Click &quot;+ New Document&quot; to configure one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc._id || doc.type}
                    className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {doc.type}
                        </span>
                        {doc.lastAction && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-600">
                            Action: {doc.lastAction}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-1">{doc.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                        {doc.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        By {doc.updatedBy || 'Admin'}
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={() => openEditDocModal(doc)}
                          className="px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc)}
                          className="px-3 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Patch Release Modal */}
      {showPatchModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                New Patch Release
              </h3>
              <button
                onClick={() => setShowPatchModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Version (e.g. 2.1)</label>
                  <input
                    type="text"
                    value={patchVersion}
                    onChange={(e) => setPatchVersion(e.target.value)}
                    placeholder="2.1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-slate-700 font-semibold mb-1">Update Type</label>
                  <button
                    type="button"
                    onClick={() => setIsPatchTypeOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span className={`w-2 h-2 rounded-full ${patchType === 'FORCE' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                      {patchType === 'FORCE' ? 'FORCE (Mandatory)' : 'OPTIONAL (Skippable)'}
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform ${isPatchTypeOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isPatchTypeOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPatchType('OPTIONAL');
                          setIsPatchTypeOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          patchType === 'OPTIONAL' ? 'bg-indigo-50/70 text-indigo-700 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <div>
                            <p className="font-semibold">OPTIONAL (Skippable)</p>
                            <p className="text-[10px] text-slate-400 font-normal">Clients can skip this release</p>
                          </div>
                        </div>
                        {patchType === 'OPTIONAL' && <span className="font-bold text-indigo-600">✓</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPatchType('FORCE');
                          setIsPatchTypeOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          patchType === 'FORCE' ? 'bg-indigo-50/70 text-indigo-700 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <div>
                            <p className="font-semibold">FORCE (Mandatory)</p>
                            <p className="text-[10px] text-slate-400 font-normal">Blocks client app until updated</p>
                          </div>
                        </div>
                        {patchType === 'FORCE' && <span className="font-bold text-indigo-600">✓</span>}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Platform Selection: Android or iOS */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Platform</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPatchPlatform('ANDROID')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      patchPlatform === 'ANDROID'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold ring-2 ring-emerald-200'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Android</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatchPlatform('IOS')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      patchPlatform === 'IOS'
                        ? 'bg-sky-50 border-sky-500 text-sky-700 font-bold ring-2 ring-sky-200'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>iOS</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Release Title</label>
                <input
                  type="text"
                  value={patchTitle}
                  onChange={(e) => setPatchTitle(e.target.value)}
                  placeholder="Security and Bug Fixes"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Release Notes</label>
                <textarea
                  rows={4}
                  value={patchContent}
                  onChange={(e) => setPatchContent(e.target.value)}
                  placeholder="Describe update highlights..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPatchModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Save Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Static Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingDocId ? 'Edit Document' : 'New Document'}
              </h3>
              <button
                onClick={() => setShowDocModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-4 text-xs">
              <div className="relative">
                <label className="block text-slate-700 font-semibold mb-1">Document Type</label>
                <button
                  type="button"
                  disabled={Boolean(editingDocId)}
                  onClick={() => setIsDocTypeOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-xs transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <span className="font-medium">
                    {docType === 'PRIVACY_POLICY' && 'Privacy Policy'}
                    {docType === 'TERMS_AND_CONDITIONS' && 'Terms and Conditions'}
                    {docType === 'MY_BENEFITS' && 'My Benefits'}
                    {docType === 'ABOUT_APP' && 'About App Document'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${isDocTypeOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDocTypeOpen && !editingDocId && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden py-1">
                    {[
                      { key: 'PRIVACY_POLICY', label: 'Privacy Policy' },
                      { key: 'TERMS_AND_CONDITIONS', label: 'Terms and Conditions' },
                      { key: 'MY_BENEFITS', label: 'My Benefits' },
                      { key: 'ABOUT_APP', label: 'About App Document' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setDocType(item.key);
                          if (!editingDocId) setDocTitle(item.label);
                          setIsDocTypeOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          docType === item.key ? 'bg-indigo-50/70 text-indigo-700 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <span>{item.label}</span>
                        {docType === item.key && <span className="font-bold text-indigo-600">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Document Content</label>
                <textarea
                  rows={6}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
