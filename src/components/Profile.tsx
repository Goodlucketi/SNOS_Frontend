import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Compass, Radio, Building2, Smartphone, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { updateClientProfile, updateClientProfileInMetadata } from '../lib/api';
import Button from './Button';

const Profile: React.FC = () => {
  const { user: authUser, clientData } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    address: "",
    phone: "",
    account_type: "",
    building_count: "",
    primary_whatsapp: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load profile from clientData (direct columns + metadata for extra fields)
  useEffect(() => {
    if (clientData) {
      const metadataProfile = clientData.metadata?.profile || {};
      setFormData({
        name: clientData.name || "",
        email: clientData.email || authUser?.email || "",
        location: clientData.location || "",
        address: clientData.address || "",
        phone: clientData.phone || "",
        account_type: metadataProfile.account_type || "",
        building_count: metadataProfile.building_count || "",
        primary_whatsapp: metadataProfile.primary_whatsapp || "",
      });
    }
  }, [clientData, authUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser?.id) return;
    setLoading(true);
    try {
      // Update direct columns on clients table
      const { account_type, building_count, primary_whatsapp, ...directColumns } = formData;
      await updateClientProfile(authUser.id, directColumns);

      // Also update metadata for fields not yet migrated to columns
      if (account_type || building_count || primary_whatsapp) {
        await updateClientProfileInMetadata(authUser.id, { account_type, building_count, primary_whatsapp });
      }

      toast.success("Profile updated.");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update client profile:", err);
      toast.error("Could not save your profile changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">Account Details</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage credentials and physical coordinates of your LoT.</p>
        </div>
        {!isEditing && (
          <Button
            text="Modify Details"
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="gap-1.5"
          />
        )}
      </div>

      {/* Main Profile Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 md:p-8 shadow-sm max-w-3xl">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">State, L.G.A</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Account Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Account Type</label>
                <select
                  name="account_type"
                  value={formData.account_type}
                  onChange={handleChange}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select account type</option>
                  <option value="personal">Personal</option>
                  <option value="business">Business</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              {/* Building Count */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Building Count</label>
                <input
                  type="number"
                  name="building_count"
                  value={formData.building_count}
                  onChange={handleChange}
                  min="0"
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Physical Address</label>
              <textarea
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>

            {/* Primary WhatsApp */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Primary WhatsApp</label>
              <input
                type="text"
                name="primary_whatsapp"
                value={formData.primary_whatsapp}
                onChange={handleChange}
                placeholder="+234 XXX XXX XXXX"
                className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Form actions */}
            <div className="flex gap-3 pt-2">
              <Button
                text="Save Settings"
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
              />
              <Button
                text="Discard"
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsEditing(false)}
              />
            </div>
          </form>
        ) : (
          <div className="space-y-6">

            {/* Display Fields in a structured fashion */}
            <div className="flex flex-col gap-4">
              {/* Field: ID */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/10">
                  <Radio className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account ID</h4>
                  <p className="text-sm text-slate-800 dark:text-slate-100 font-mono font-semibold mt-0.5">{authUser?.id}</p>
                </div>
              </div>

              {/* Field: Name */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/10">
                  <UserIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Full Operator Name</h4>
                  <p className="text-sm text-slate-800 dark:text-slate-100 font-semibold mt-0.5">{formData.name || "Client Name"}</p>
                </div>
              </div>

              {/* Field: Email */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/10">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Secure Email</h4>
                  <p className="text-sm text-slate-800 dark:text-slate-100 font-semibold mt-0.5">{formData.email}</p>
                </div>
              </div>

              {/* Field: Phone */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/10">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hotline Contact (SIM)</h4>
                  <p className="text-sm text-slate-800 dark:text-slate-100 font-semibold mt-0.5">{formData.phone || "No phone added"}</p>
                </div>
              </div>

              {/* Field: Location */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/10">
                  <Compass className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monitored Region</h4>
                  <p className="text-sm text-slate-800 dark:text-slate-100 font-semibold mt-0.5">{formData.location || "Unspecified Area"}</p>
                </div>
              </div>

              {/* Field: Address */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/10">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Physical Premises Coordinates</h4>
                  <p className="text-sm text-slate-800 dark:text-slate-100 font-semibold mt-0.5 leading-relaxed">{formData.address || "No address configured"}</p>
                </div>
              </div>

              {/* Field: Account Type */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/10">
                  <UserCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Type</h4>
                  <p className="text-sm text-slate-800 dark:text-slate-100 font-semibold mt-0.5">{formData.account_type || "Not specified"}</p>
                </div>
              </div>

              {/* Field: Building Count */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/10">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Registered Buildings</h4>
                  <p className="text-sm text-slate-800 dark:text-slate-100 font-semibold mt-0.5">{formData.building_count || "0"}</p>
                </div>
              </div>

              {/* Field: Primary WhatsApp */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/10">
                  <Smartphone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Primary WhatsApp</h4>
                  <p className="text-sm text-slate-800 dark:text-slate-100 font-semibold mt-0.5">{formData.primary_whatsapp || "Not configured"}</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;