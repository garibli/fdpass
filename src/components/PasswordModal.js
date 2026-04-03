import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Lock, Mail, Globe, User, Tag, FileText } from 'lucide-react';

const CATEGORIES = ['General', 'Social', 'Work', 'Finance', 'Shopping', 'Gaming', 'Other'];

const emptyForm = {
  description: '',
  email: '',
  username: '',
  password: '',
  website_url: '',
  other_credential: '',
  category: 'General',
};

export default function PasswordModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(emptyForm);
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...emptyForm, ...initial } : emptyForm);
      setErrors({});
      setShowPass(false);
    }
  }, [open, initial]);

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.password.trim()) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setErrors({ global: err.message });
    } finally {
      setSaving(false);
    }
  };

  const field = (key, label, icon, type = 'text', placeholder = '') => (
    <div className="field-group">
      <label>{label}</label>
      <div className="input-wrap">
        <span className="input-icon">{icon}</span>
        <input
          type={key === 'password' ? (showPass ? 'text' : 'password') : type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          className={errors[key] ? 'error' : ''}
        />
        {key === 'password' && (
          <button type="button" className="eye-btn" onClick={() => setShowPass(s => !s)}>
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {errors[key] && <span className="field-error">{errors[key]}</span>}
    </div>
  );

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>{initial ? 'Edit Entry' : 'New Entry'}</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {errors.global && <div className="global-error">{errors.global}</div>}
          {field('description', 'Description *', <FileText size={15} />, 'text', 'e.g. Microsoft, Netflix...')}
          {field('email', 'Email', <Mail size={15} />, 'email', 'account@email.com')}
          {field('username', 'Username', <User size={15} />, 'text', 'your username')}
          {field('password', 'Password *', <Lock size={15} />, 'password', '••••••••')}
          {field('website_url', 'Website URL', <Globe size={15} />, 'url', 'https://')}
          {field('other_credential', 'Other Credential', <Tag size={15} />, 'text', 'PIN, security answer...')}
          <div className="field-group">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving…' : (initial ? 'Update' : 'Add Entry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
