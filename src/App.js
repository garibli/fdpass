import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, RefreshCw, KeyRound, AlertCircle, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import { usePasswords } from './hooks/usePasswords';
import PasswordCard from './components/PasswordCard';
import PasswordModal from './components/PasswordModal';
import Login from './components/Login';
import './App.css';

const CATEGORIES = ['All', 'General', 'Social', 'Work', 'Finance', 'Shopping', 'Gaming', 'Other'];

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = still checking

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="app">
        <div className="bg-grid" />
        <div className="loading" style={{ paddingTop: '40vh' }}>
          <div className="spinner" />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (!session) return <Login />;

  return <Vault onSignOut={() => supabase.auth.signOut()} />;
}

function Vault({ onSignOut }) {
  const { passwords, loading, error, addPassword, updatePassword, deletePassword, refetch } = usePasswords();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    return passwords.filter(p => {
      const matchCat = category === 'All' || p.category === category;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        p.description?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.username?.toLowerCase().includes(q) ||
        p.website_url?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [passwords, search, category]);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (entry) => { setEditing(entry); setModalOpen(true); };
  const handleSave = async (form) => {
    if (editing) await updatePassword(editing.id, form);
    else await addPassword(form);
  };

  return (
    <div className="app">
      <div className="bg-grid" />
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <KeyRound size={28} strokeWidth={1.5} />
            <span>Vaultly</span>
          </div>
          <div className="header-actions">
            <button className="btn-refresh" onClick={refetch} title="Refresh">
              <RefreshCw size={16} />
            </button>
            <button className="btn-add" onClick={openAdd}>
              <Plus size={18} />
              <span>Add Entry</span>
            </button>
            <button className="btn-refresh" onClick={onSignOut} title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="controls">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search entries…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="category-tabs">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`cat-tab${category === c ? ' active' : ''}`}
                onClick={() => setCategory(c)}
              >{c}</button>
            ))}
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            <p>Loading vault…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <KeyRound size={52} strokeWidth={1} />
            <h3>{passwords.length === 0 ? 'Your vault is empty' : 'No results found'}</h3>
            <p>{passwords.length === 0 ? 'Add your first password entry to get started.' : 'Try a different search or category.'}</p>
            {passwords.length === 0 && (
              <button className="btn-add" onClick={openAdd}><Plus size={16} /> Add First Entry</button>
            )}
          </div>
        ) : (
          <>
            <p className="results-count">{filtered.length} entr{filtered.length === 1 ? 'y' : 'ies'}</p>
            <div className="grid">
              {filtered.map(p => (
                <PasswordCard key={p.id} entry={p} onEdit={openEdit} onDelete={deletePassword} />
              ))}
            </div>
          </>
        )}
      </main>

      <PasswordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
}
