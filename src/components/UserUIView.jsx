import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../services/api';

export const UserUIView = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // App version state (read from localStorage or default to 1.0.0)
  const [selectedVersion, setSelectedVersion] = useState(
    () => localStorage.getItem('user_app_version') || '1.0.0',
  );
  const [selectedPlatform, setSelectedPlatform] = useState(() => {
    const saved = localStorage.getItem('user_app_platform');
    if (!saved) {
      localStorage.setItem('user_app_platform', 'ANDROID');
      return 'ANDROID';
    }
    return saved;
  });
  const [toastMessage, setToastMessage] = useState('');

  // Patch popup state
  const [patchPopup, setPatchPopup] = useState(null);
  const [isSkipped, setIsSkipped] = useState(false);

  // Static documents state (Read-Only on employee portal)
  const [documents, setDocuments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const loadDocuments = async () => {
    try {
      const data = await apiGet('/static-documents/public');
      if (Array.isArray(data) && data.length > 0) {
        setDocuments(
          data.map((d) => ({
            _id: d._id || d.id,
            type: d.type,
            tag:
              d.type === 'PRIVACY_POLICY'
                ? 'Privacy Policy'
                : d.type === 'TERMS_AND_CONDITIONS'
                ? 'Terms and Conditions'
                : d.type === 'MY_BENEFITS'
                ? 'My Benefits'
                : 'About App Document',
            title: d.title || d.type,
            content: d.content || '',
            updatedAt: d.updatedAt,
          })),
        );
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadDocuments();

    const checkForUpdates = async () => {
      try {
        const currentVer = (
          localStorage.getItem('user_app_version') ||
          selectedVersion ||
          '1.0.0'
        ).replace(/^v/i, '').trim();

        const platform =
          localStorage.getItem('user_app_platform') ||
          selectedPlatform ||
          'ANDROID';

        const res = await apiGet(
          `/patch-releases/check?currentVersion=${currentVer}&platform=${platform}`,
        );

        if (res && res.updateAvailable && !isSkipped) {
          const latestVer = (res.latestVersion || '').replace(/^v/i, '').trim();

          // Only show popup when version is different from the latest patch release
          if (latestVer === currentVer) {
            return;
          }

          const isForce = Boolean(res.updateRequired || res.updateType === 'FORCE');
          setPatchPopup({
            isForce,
            latestVersion: latestVer,
            title:
              res.title ||
              (isForce ? 'Mandatory Update Required' : 'New Update Available'),
            releaseNotes:
              res.content ||
              (isForce
                ? 'A mandatory application patch release must be installed before you can continue accessing the application.'
                : 'A new optional patch release is available. You can update now or skip.'),
            currentVersion: currentVer,
          });
        }
      } catch {
        // Fallback
      }
    };

    checkForUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVersion, selectedPlatform]);

  // Global listeners for middleware patch release enforcement
  useEffect(() => {
    const handleForceUpdate = (event) => {
      const data = event.detail;
      const latestVer = (data?.latestVersion || data?.requiredVersion || '1.0.0').replace(/^v/i, '').trim();
      const currentVer = (
        localStorage.getItem('user_app_version') ||
        selectedVersion ||
        '1.0.0'
      ).replace(/^v/i, '').trim();

      if (latestVer === currentVer) {
        return;
      }

      setPatchPopup({
        isForce: true,
        latestVersion: latestVer,
        title: data?.title || 'Mandatory Update Required',
        releaseNotes:
          data?.message ||
          data?.releaseNotes ||
          'A mandatory application patch release must be installed before you can continue accessing the application.',
        currentVersion: currentVer,
      });
    };

    const handleOptionalUpdate = (event) => {
      const data = event.detail;
      const latestVer = (data?.latestVersion || '1.0.0').replace(/^v/i, '').trim();
      const currentVer = (
        localStorage.getItem('user_app_version') ||
        selectedVersion ||
        '1.0.0'
      ).replace(/^v/i, '').trim();

      if (latestVer === currentVer) {
        return;
      }

      if (!isSkipped && !patchPopup) {
        setPatchPopup({
          isForce: false,
          latestVersion: latestVer,
          title: data?.title || 'New Update Available',
          releaseNotes:
            data?.releaseNotes ||
            'A new optional patch release is available. You can update now or skip.',
          currentVersion: currentVer,
        });
      }
    };

    window.addEventListener('app:force_update_required', handleForceUpdate);
    window.addEventListener('app:optional_update_available', handleOptionalUpdate);

    return () => {
      window.removeEventListener('app:force_update_required', handleForceUpdate);
      window.removeEventListener('app:optional_update_available', handleOptionalUpdate);
    };
  }, [isSkipped, patchPopup, selectedVersion]);

  const handleApplyUpdate = () => {
    if (!patchPopup?.latestVersion) return;
    const newVer = patchPopup.latestVersion.replace(/^v/i, '').trim();
    localStorage.setItem('user_app_version', newVer);
    setSelectedVersion(newVer);
    setPatchPopup(null);
    setIsSkipped(false);
    setToastMessage(`Successfully updated to version v${newVer}!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSkipUpdate = () => {
    setIsSkipped(true);
    setPatchPopup(null);
  };

  const filteredDocs =
    activeFilter === 'ALL'
      ? documents
      : documents.filter(
          (d) =>
            d.type === activeFilter ||
            d.tag.toLowerCase().includes(activeFilter.toLowerCase()),
        );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      {/* 1. MANDATORY FORCE UPDATE MODAL (BLOCKING - NO SKIP BUTTON) */}
      {patchPopup && patchPopup.isForce && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-rose-200 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xl font-bold">
              !
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-100 text-rose-700 mb-2">
              Mandatory Patch Update (FORCE)
            </span>
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Application Update Required
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              A required update (<span className="font-bold text-rose-600">v{patchPopup.latestVersion}</span>) must be installed to continue.
            </p>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-4">
              <div>
                <span className="text-slate-400 block text-[11px]">Installed</span>
                <span className="font-bold text-slate-700">v{patchPopup.currentVersion}</span>
              </div>
              <div>
                <span className="text-rose-600 block text-[11px] font-semibold">Required</span>
                <span className="font-bold text-rose-600">v{patchPopup.latestVersion}</span>
              </div>
            </div>

            <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-5 max-h-32 overflow-y-auto">
              <span className="font-semibold text-slate-800 block mb-1">
                {patchPopup.title}
              </span>
              <p className="text-slate-600 whitespace-pre-wrap">
                {patchPopup.releaseNotes}
              </p>
            </div>

            <button
              onClick={handleApplyUpdate}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
            >
              Update Now
            </button>
            <p className="text-[11px] text-slate-400 mt-2">
              Skipping is not permitted for mandatory releases.
            </p>
          </div>
        </div>
      )}

      {/* 2. OPTIONAL UPDATE MODAL (SKIPPABLE) */}
      {patchPopup && !patchPopup.isForce && !isSkipped && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-700 mb-2">
              Optional Update
            </span>
            <h2 className="text-base font-bold text-slate-900 mb-1">New Update Available</h2>
            <p className="text-xs text-slate-600 mb-4">
              A new optional update (<span className="font-bold text-indigo-600">v{patchPopup.latestVersion}</span>) is available.
            </p>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-4">
              <div>
                <span className="text-slate-400 block text-[11px]">Current</span>
                <span className="font-bold text-slate-700">v{patchPopup.currentVersion}</span>
              </div>
              <div>
                <span className="text-indigo-600 block text-[11px] font-semibold">Available</span>
                <span className="font-bold text-indigo-600">v{patchPopup.latestVersion}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-5 max-h-32 overflow-y-auto">
              <span className="font-semibold text-slate-800 block mb-1">{patchPopup.title}</span>
              <p className="text-slate-600 whitespace-pre-wrap">{patchPopup.releaseNotes}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSkipUpdate}
                className="flex-1 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs"
              >
                Skip for Now
              </button>
              <button
                onClick={handleApplyUpdate}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
              >
                Update Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm font-bold text-slate-900">User Portal</h1>
          </div>
        </div>

        {/* User Info & App Version Display */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('user_app_platform', 'ANDROID');
                setSelectedPlatform('ANDROID');
                setIsSkipped(false);
              }}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                selectedPlatform === 'ANDROID'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Android
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('user_app_platform', 'IOS');
                setSelectedPlatform('IOS');
                setIsSkipped(false);
              }}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                selectedPlatform === 'IOS'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              iOS
            </button>
          </div>

          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
            v{selectedVersion}
          </span>

          {isAdmin && (
            <Link
              to="/admin"
              className="px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 font-medium hover:bg-slate-100 rounded-lg"
            >
              Admin View →
            </Link>
          )}

          <div className="text-right hidden sm:block">
            <span className="font-bold text-slate-800 text-xs block">{user?.name || 'Employee User'}</span>
            <span className="text-[10px] text-indigo-600 font-semibold block">{user?.role || 'EMPLOYEE'}</span>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content (Read-Only Static Documents for Employees) */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 space-y-4">
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage('')} className="font-bold text-emerald-600 hover:text-emerald-900 ml-2">
              ✕
            </button>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-slate-900">Static Content</h2>
          <p className="text-xs text-slate-500">
            Official company documentation: Privacy, Terms, Benefits, and About App. (Read-Only)
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { id: 'ALL', label: `All (${documents.length})` },
            { id: 'PRIVACY_POLICY', label: `Privacy Policy (${documents.filter((d) => d.type === 'PRIVACY_POLICY').length})` },
            { id: 'TERMS_AND_CONDITIONS', label: `Terms (${documents.filter((d) => d.type === 'TERMS_AND_CONDITIONS').length})` },
            { id: 'MY_BENEFITS', label: `Benefits (${documents.filter((d) => d.type === 'MY_BENEFITS').length})` },
            { id: 'ABOUT_APP', label: `About App (${documents.filter((d) => d.type === 'ABOUT_APP').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Document Cards (Strictly Read-Only - No Edit or Delete Buttons) */}
        <div className="space-y-3 pt-2">
          {filteredDocs.map((doc, idx) => (
            <div
              key={doc._id || idx}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm"
            >
              <div className="mb-2">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1">
                  {doc.tag}
                </span>
                <h3 className="text-base font-bold text-slate-900">{doc.title}</h3>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">
                {doc.content}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default UserUIView;
