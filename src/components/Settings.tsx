import React, { useEffect, useState } from 'react';
import { Bell, Phone, Save, Lock, Plus, Trash2, UserPlus, Mail, MessageCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { updateClientSettings, AlertContact } from '../lib/api';
import Button from './Button';

const Settings: React.FC = () => {
  const { user: currentUser, clientData } = useAuth();

  // Notification preferences, secondary contact, and alert contacts all
  // live in clients.metadata now. clientData already carries the current
  // metadata via AuthContext, so we hydrate local state from that instead
  // of a separate fetch.
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  const [secondaryContact, setSecondaryContact] = useState("");
  const [secondaryName, setSecondaryName] = useState("");

  // Additional alert contacts (max 5)
  const [contacts, setContacts] = useState<AlertContact[]>([]);

  // Existing contact arrays from database (direct columns)
  const [existingPhones, setExistingPhones] = useState<string[]>([]);
  const [existingEmails, setExistingEmails] = useState<string[]>([]);
  const [existingWhatsapps, setExistingWhatsapps] = useState<string[]>([]);

  const addContact = () => {
    if (contacts.length >= 5) return;
    setContacts([...contacts, { id: crypto.randomUUID(), phone: '', email: '', whatsapp: '' }]);
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const updateContact = (id: string, field: keyof Omit<AlertContact, 'id'>, value: string) => {
    setContacts(contacts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // Functions to remove existing database contacts
  const removeExistingPhone = async (phone: string) => {
    const updatedPhones = existingPhones.filter(p => p !== phone);
    setExistingPhones(updatedPhones);
    if (clientData?.id) {
      try {
        await supabase.from('clients').update({ phones: updatedPhones }).eq('id', clientData.id);
      } catch (err) {
        console.error('Failed to remove phone:', err);
        setExistingPhones(existingPhones); // revert on error
        toast.error('Failed to remove phone number');
      }
    }
  };

  const removeExistingEmail = async (email: string) => {
    const updatedEmails = existingEmails.filter(e => e !== email);
    setExistingEmails(updatedEmails);
    if (clientData?.id) {
      try {
        await supabase.from('clients').update({ emails: updatedEmails }).eq('id', clientData.id);
      } catch (err) {
        console.error('Failed to remove email:', err);
        setExistingEmails(existingEmails); // revert on error
        toast.error('Failed to remove email address');
      }
    }
  };

  const removeExistingWhatsapp = async (whatsapp: string) => {
    const updatedWhatsapps = existingWhatsapps.filter(w => w !== whatsapp);
    setExistingWhatsapps(updatedWhatsapps);
    if (clientData?.id) {
      try {
        await supabase.from('clients').update({ whatsapps: updatedWhatsapps }).eq('id', clientData.id);
      } catch (err) {
        console.error('Failed to remove WhatsApp:', err);
        setExistingWhatsapps(existingWhatsapps); // revert on error
        toast.error('Failed to remove WhatsApp number');
      }
    }
  };

  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (clientData) {
      const metadata = clientData.metadata || {};

      const prefs = metadata.notification_preferences;
      if (prefs) {
        setEmailEnabled(!!prefs.email);
        setSmsEnabled(!!prefs.sms);
        setWhatsappEnabled(!!prefs.whatsapp);
      }

      const secondary = metadata.secondary_contacts;
      if (secondary && secondary.length > 0) {
        setSecondaryName(secondary[0].name || "");
        setSecondaryContact(secondary[0].phone || "");
      }

      setContacts(metadata.alert_contacts || []);

      // Populate existing contact arrays from direct database columns
      setExistingPhones(clientData.phones || []);
      setExistingEmails(clientData.emails || []);
      setExistingWhatsapps(clientData.whatsapps || []);
    }
    setLoadingPrefs(false);
  }, [clientData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientData?.id) return;
    setSaving(true);
    try {
      await updateClientSettings(clientData.id, {
        notification_preferences: { email: emailEnabled, sms: smsEnabled, whatsapp: whatsappEnabled },
        secondary_contacts: [{ name: secondaryName, phone: secondaryContact }],
        alert_contacts: contacts,
        primary_whatsapp: contacts.find(c => c.whatsapp)?.whatsapp || '',
      });
      toast.success("Notification preferences saved.");
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error("Could not save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("New password and confirmation must match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    setChangingPassword(true);
    try {
      await axios.post("/api/users/change_password.php", {
        user_id: currentUser.id,
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password updated successfully.");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error("Failed to change password:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Could not update your password.");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">System Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure alert payloads, secondary emergency dispatch contacts, and additional alert recipients.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* Toggle Preferences Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 space-y-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-850">
            <Bell className="w-4 h-4 text-blue-500" />
            Alert Payloads
          </h3>

          <div className="space-y-4">
            {/* SMS Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Real-time SMS Dispatch</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sends sensor trip reports to primary and secondary SIM networks.</p>
              </div>
              <button
                type="button"
                disabled={loadingPrefs}
                onClick={() => setSmsEnabled(!smsEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative disabled:opacity-50 ${smsEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-800'}`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${smsEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            {/* Email Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Email Server Logs</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pushes detailed HTML media frames and timestamps to your inbox.</p>
              </div>
              <button
                type="button"
                disabled={loadingPrefs}
                onClick={() => setEmailEnabled(!emailEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative disabled:opacity-50 ${emailEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-800'}`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${emailEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            {/* WhatsApp Notifications Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">WhatsApp Notifications</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sends trigger alerts and media frames to your registered WhatsApp number.</p>
              </div>
              <button
                type="button"
                disabled={loadingPrefs}
                onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative disabled:opacity-50 ${whatsappEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-800'}`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${whatsappEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Contact Dispatch */}
        {/* <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 space-y-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-855">
            <Phone className="w-4 h-4 text-blue-500" />
            Designated Rapid Response Dispatch
          </h3>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Designee / Team Name</label>
              <input
                type="text"
                className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={secondaryName}
                onChange={(e) => setSecondaryName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Designee Hotline (SIM)</label>
              <input
                type="text"
                className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={secondaryContact}
                onChange={(e) => setSecondaryContact(e.target.value)}
              />
            </div>
          </div>
        </div> */}

        {/* Additional Alert Contacts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-500" />
              Additional Alert Contacts
            </h3>
            <button
              type="button"
              onClick={addContact}
              disabled={contacts.length >= 5}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Contact
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-3">
            {contacts.length === 0
              ? 'No additional contacts added. Add up to 5 contacts to receive alerts via SMS, Email, and WhatsApp.'
              : `${contacts.length} of 5 contact${contacts.length !== 1 ? 's' : ''} added.`}
          </p>

          {contacts.length === 0 && (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              Click the <span className="font-semibold text-blue-500">+ Add Contact</span> button above to add emergency alert recipients (Phone, Email, WhatsApp).
            </div>
          )}

          {/* Existing Database Contacts Display */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-blue-500" />
              Current Database Contacts
            </h4>

            {(existingPhones.length > 0 || existingEmails.length > 0 || existingWhatsapps.length > 0) ? (
              <div className="space-y-3">
                {existingPhones.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">SMS Numbers:</span>
                    {existingPhones.map((phone, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-xs font-mono border border-blue-100 dark:border-blue-500/20">
                        <Phone className="w-3 h-3" />
                        {phone}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeExistingPhone(phone); }}
                          className="p-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-500 hover:text-red-500 transition-colors"
                          title="Remove phone number"
                          aria-label="Remove phone number"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {existingEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Email Addresses:</span>
                    {existingEmails.map((email, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-mono border border-emerald-100 dark:border-emerald-500/20">
                        <Mail className="w-3 h-3" />
                        {email}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeExistingEmail(email); }}
                          className="p-0.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-500 hover:text-red-500 transition-colors"
                          title="Remove email address"
                          aria-label="Remove email address"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {existingWhatsapps.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">WhatsApp Numbers:</span>
                    {existingWhatsapps.map((whatsapp, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-full text-xs font-mono border border-green-100 dark:border-green-500/20">
                        <MessageCircle className="w-3 h-3" />
                        {whatsapp}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeExistingWhatsapp(whatsapp); }}
                          className="p-0.5 rounded hover:bg-green-100 dark:hover:bg-green-500/20 text-green-500 hover:text-red-500 transition-colors"
                          title="Remove WhatsApp number"
                          aria-label="Remove WhatsApp number"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">No existing contacts in database yet.</p>
            )}
          </div>

          <div className="space-y-4">
            {contacts.map((contact, index) => (
              <div
                key={contact.id}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-4 space-y-3 relative animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Contact #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeContact(contact.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    title="Remove contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Phone (SMS)</label>
                    <input
                      type="text"
                      className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={contact.phone}
                      onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                      placeholder="+234 XXX-XXX-XXXX"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Address</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                      className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">WhatsApp Number</label>
                    <input
                      type="text"
                      value={contact.whatsapp}
                      onChange={(e) => updateContact(contact.id, 'whatsapp', e.target.value)}
                      className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="+234 XXX-XXX-XXXX"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Save */}
        <Button
          text="Update Preferences"
          type="submit"
          variant="primary"
          size="md"
          className="gap-2 self-start"
          isLoading={saving}
        />
      </form>

      {/* Password Change */}
      <form onSubmit={handleChangePassword} className="max-w-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 space-y-5 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-850">
          <Lock className="w-4 h-4 text-blue-500" />
          Change Password
        </h3>
        <div className="grid md:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Current Password</label>
            <input
              type="password"
              className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">New Password</label>
            <input
              type="password"
              className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Confirm New Password</label>
            <input
              type="password"
              className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
        </div>
        <Button
          text="Update Password"
          type="submit"
          variant="primary"
          size="md"
          className="gap-2 self-start"
          isLoading={changingPassword}
        />
      </form>
    </div>
  );
};

export default Settings;