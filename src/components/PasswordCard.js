import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Edit2, Trash2, Globe, Mail, User, Tag, Shield } from 'lucide-react';

const CATEGORY_COLORS = {
  General: '#6366f1', Social: '#ec4899', Work: '#0ea5e9',
  Finance: '#10b981', Shopping: '#f59e0b', Gaming: '#8b5cf6', Other: '#94a3b8',
};

function copyToClipboard(text, setCopied) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  });
}

export default function PasswordCard({ entry, onEdit, onDelete }) {
  const [showPass, setShowPass] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const copy = (text, field) => {
    copyToClipboard(text, (v) => v && setCopiedField(field));
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    setDeleting(true);
    try { await onDelete(entry.id); } catch { setDeleting(false); }
  };

  const color = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Other;
  const initials = entry.description.slice(0, 2).toUpperCase();

  return (
    <div className="card">
      <div className="card-accent" style={{ background: color }} />
      <div className="card-top">
        <div className="card-avatar" style={{ background: color + '22', color }}>
          {initials}
        </div>
        <div className="card-title-wrap">
          <h3 className="card-title">{entry.description}</h3>
          <span className="card-category" style={{ color, background: color + '18' }}>{entry.category}</span>
        </div>
        <div className="card-actions-top">
          <button className="icon-btn edit" onClick={() => onEdit(entry)} title="Edit"><Edit2 size={15} /></button>
          <button
            className={`icon-btn delete${confirmDelete ? ' confirm' : ''}`}
            onClick={handleDelete}
            disabled={deleting}
            title={confirmDelete ? 'Click again to confirm' : 'Delete'}
          >
            {deleting ? '…' : <Trash2 size={15} />}
          </button>
        </div>
      </div>

      <div className="card-fields">
        {entry.email && (
          <div className="card-field">
            <Mail size={13} className="field-icon" />
            <span className="field-val">{entry.email}</span>
            <button className="cp-btn" onClick={() => copy(entry.email, 'email')}>
              {copiedField === 'email' ? '✓' : <Copy size={12} />}
            </button>
          </div>
        )}
        {entry.username && (
          <div className="card-field">
            <User size={13} className="field-icon" />
            <span className="field-val">{entry.username}</span>
            <button className="cp-btn" onClick={() => copy(entry.username, 'username')}>
              {copiedField === 'username' ? '✓' : <Copy size={12} />}
            </button>
          </div>
        )}
        <div className="card-field">
          <Shield size={13} className="field-icon" />
          <span className="field-val password-val">
            {showPass ? entry.password : '••••••••••••'}
          </span>
          <button className="cp-btn" onClick={() => setShowPass(s => !s)}>
            {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <button className="cp-btn" onClick={() => copy(entry.password, 'password')}>
            {copiedField === 'password' ? '✓' : <Copy size={12} />}
          </button>
        </div>
        {entry.website_url && (
          <div className="card-field">
            <Globe size={13} className="field-icon" />
            <a href={entry.website_url} target="_blank" rel="noreferrer" className="field-link">
              {entry.website_url.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        {entry.other_credential && (
          <div className="card-field">
            <Tag size={13} className="field-icon" />
            <span className="field-val">{entry.other_credential}</span>
            <button className="cp-btn" onClick={() => copy(entry.other_credential, 'other')}>
              {copiedField === 'other' ? '✓' : <Copy size={12} />}
            </button>
          </div>
        )}
      </div>

      {confirmDelete && <div className="delete-warning">Click delete again to confirm</div>}
    </div>
  );
}
