import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Mail, 
  Shield, 
  Key, 
  CheckCircle, 
  AlertCircle,
  Save,
  UserCheck
} from 'lucide-react';
import API from '../api';

export default function SettingsView({ user, onUpdateUser = () => {} }) {
  const [notifyEmail, setNotifyEmail] = useState(user?.notify_email || user?.email || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(Boolean(user?.notifications_enabled));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const updated = await API.profile({
        notify_email: notifyEmail,
        notifications_enabled: notificationsEnabled ? 1 : 0
      });
      onUpdateUser(updated);
      setMessage('Profile and notification preferences saved.');
      setSaving(false);
    } catch (err) {
      setMessage(err.message || 'Failed to update preferences');
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-space-md lg:px-margin py-space-lg flex flex-col gap-space-lg">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-space-xs text-secondary">
          <Settings size={18} />
          <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary font-bold">
            Account &amp; System Configuration
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
          Profile &amp; Settings
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Manage clinical notifications, notification recipient email, and metabolic parameters.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-secondary-container text-on-secondary-fixed-variant rounded-lg font-body-sm flex items-center gap-2 border border-secondary">
          <CheckCircle size={18} className="text-secondary" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-space-lg">
        
        {/* Account Info Box */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col gap-space-md">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <span className="font-label-caps text-label-caps uppercase text-outline font-bold">
              Account Credentials
            </span>
            <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-fixed-variant font-label-caps text-label-caps font-bold">
              Authenticated
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface-container-low rounded-lg">
            <div>
              <span className="font-body-sm text-body-sm text-outline block">Signed in email</span>
              <strong className="font-title text-title text-on-surface font-semibold">{user?.email}</strong>
            </div>
            <span className="text-[11px] text-secondary font-bold px-2 py-1 bg-surface-container rounded">
              Standard Account
            </span>
          </div>
        </div>

        {/* Email Alerts Box */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col gap-space-md">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <span className="font-label-caps text-label-caps uppercase text-outline font-bold">
              Calorie Goal Email Alerts
            </span>
            <Bell size={18} className="text-secondary" />
          </div>

          <p className="text-body-sm text-on-surface-variant">
            NutriTrack will automatically trigger an email notification if your daily logged calories exceed your target goal.
          </p>

          <label className="flex items-center gap-3 cursor-pointer select-none p-3 bg-surface-container-low rounded-lg border border-surface-container hover:bg-surface-container transition-colors">
            <input 
              type="checkbox"
              checked={notificationsEnabled}
              onChange={e => setNotificationsEnabled(e.target.checked)}
              className="w-5 h-5 accent-primary rounded cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-bold text-on-surface">
                Enable Calorie Goal Exceeded Email Alerts
              </span>
              <span className="text-[12px] text-outline">
                Sends automated email alert via configured SMTP transporter when goal is passed.
              </span>
            </div>
          </label>

          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-bold text-[10px]">
              Notification Recipient Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={18} />
              <input 
                type="email"
                placeholder="you@example.com"
                value={notifyEmail}
                onChange={e => setNotifyEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-surface-container rounded-lg focus:ring-2 focus:ring-primary text-body-md font-medium"
              />
            </div>
          </div>
        </div>

        {/* Privacy & Clinical Safeguards */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col gap-3">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-container text-on-surface">
            <Shield size={18} className="text-secondary" />
            <span className="font-label-caps text-label-caps uppercase text-outline font-bold">
              Privacy &amp; Data Security
            </span>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            All dietary records and metabolic markers are stored privately in encrypted user partitions. NutriTrack does not monetize or distribute individual nutritional logs.
          </p>
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          className="self-start px-8 py-3 bg-primary text-on-primary font-label-lg font-bold rounded-lg hover:bg-primary-container transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          <Save size={18} />
          <span>{saving ? 'Saving Preferences...' : 'Save Settings'}</span>
        </button>

      </form>

    </div>
  );
}
