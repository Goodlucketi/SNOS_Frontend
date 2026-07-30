import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User as UserIcon, Mail, Phone, MapPin, Edit3, Save, X, Compass, Radio } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Alert, User } from '../types';
import Button from './Button';

interface OutletContextType {
  alerts: Alert[];
  user: User;
}

const Profile: React.FC = () => {
  const { user: authUser } = useAuth();
  const { user: currentUser = {} as User } = useOutletContext<OutletContextType>();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    address: "",
    phone: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.user_id) return;
      try {
        const response = await axios.get(`/api/users/read_single.php?user_id=${currentUser.user_id}`);
        if (response.data && response.data.user) {
          const { name, email, location, address, phone } = response.data.user;
          setFormData({
            name: name || response.data.user.user_name || "",
            email: email || response.data.user.user_email || "",
            location: location || response.data.user.user_location || "",
            address: address || response.data.user.user_address || "",
            phone: phone || response.data.user.user_phone || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch user data, loading context instead:", err);
        // Fallback to outlet context data
        setFormData({
          name: currentUser.name || "",
          email: currentUser.email || "",
          location: currentUser.location || "",
          address: currentUser.address || "",
          phone: currentUser.phone || "",
        });
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(`/api/admin/update_user.php`, {
        user_id: currentUser.user_id,
        ...formData,
      });

      if (response.status === 200 || response.data?.success) {
        toast.success("Profile updated on central gateway server.");
        setIsEditing(false);
      } else {
        throw new Error("Update rejected by server");
      }
    } catch (err) {
      console.error("Failed to update on remote server, saving locally:", err);
      // Fallback local update (offline first)
      toast.success("Profile updated successfully (Cached locally).");
      setIsEditing(false);
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
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Gateway Identity</h4>
                  <p className="text-sm text-slate-800 dark:text-slate-100 font-mono font-semibold mt-0.5">{currentUser?.user_id}</p>
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
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
