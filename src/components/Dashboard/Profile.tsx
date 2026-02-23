import { useState, useRef } from 'react';
import {
    User as UserIcon,
    Mail,
    Camera,
    Save,
    ShieldCheck,
    Lock,
    ArrowLeft,
    Sparkles,
    Github
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';

export function Profile() {
    const { user, setUser, isDarkMode, setActiveModule } = useAppStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        avatar: user?.avatar || ''
    });
    const [showNotif, setShowNotif] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        if (user) {
            setUser({
                ...user,
                name: formData.name,
                email: formData.email,
                avatar: formData.avatar
            });
            setIsEditing(false);
            setShowNotif(true);
            setTimeout(() => setShowNotif(false), 3000);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, avatar: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveModule('dashboard')}
                        className={cn(
                            "p-2 rounded-xl transition-all",
                            isDarkMode ? "bg-gray-800 text-gray-400 hover:text-white" : "bg-white text-gray-500 hover:text-gray-900 shadow-sm"
                        )}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={cn("text-3xl font-bold", isDarkMode ? "text-white" : "text-gray-900")}>Account Profile</h1>
                        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Manage your personal information and preferences</p>
                    </div>
                </div>

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsEditing(false)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl font-medium transition-all",
                                isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/30"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            {showNotif && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Profile updated successfully!
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className={cn(
                    "md:col-span-1 p-8 rounded-3xl border flex flex-col items-center text-center",
                    isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"
                )}>
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full ring-4 ring-violet-500/20 overflow-hidden bg-gray-800">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-4xl font-bold">
                                    {user?.name?.charAt(0) || 'D'}
                                </div>
                            )}
                        </div>
                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-violet-600 text-white border-4 border-gray-950 hover:bg-violet-700 transition-all shadow-xl"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>

                    <div className="mt-6">
                        <h2 className={cn("text-xl font-bold", isDarkMode ? "text-white" : "text-gray-900")}>
                            {formData.name || 'Developer'}
                        </h2>
                        <p className="text-violet-400 font-medium text-sm mt-1">{user?.provider === 'google' ? 'Google Account' : 'Email Account'}</p>
                        <div className={cn(
                            "mt-4 px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2",
                            isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                        )}>
                            <ShieldCheck className="w-3 h-3" />
                            Identity Verified
                        </div>
                    </div>

                    <div className="w-full border-t border-gray-800 my-6" />

                    <div className="space-y-4 w-full text-left font-medium">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 text-sm">Member Since</span>
                            <span className={isDarkMode ? "text-white" : "text-gray-900"}>
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Feb 2026'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 text-sm">Auth Provider</span>
                            <span className={cn(
                                "capitalize",
                                isDarkMode ? "text-white" : "text-gray-900"
                            )}>{user?.provider || 'Email'}</span>
                        </div>
                    </div>
                </div>

                {/* Edit Info Form */}
                <div className={cn(
                    "md:col-span-2 p-8 rounded-3xl border",
                    isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"
                )}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className={cn("text-sm font-semibold", isDarkMode ? "text-gray-400" : "text-gray-600")}>
                                    Full Name
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={cn(
                                            "w-full pl-11 pr-4 py-3 rounded-2xl border transition-all focux:ring-2 focus:ring-violet-500 outline-none",
                                            isDarkMode
                                                ? "bg-gray-800 border-gray-700 text-white disabled:bg-gray-950/50"
                                                : "bg-gray-50 border-gray-200 text-gray-900"
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className={cn("text-sm font-semibold", isDarkMode ? "text-gray-400" : "text-gray-600")}>
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="email"
                                        disabled={!isEditing}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={cn(
                                            "w-full pl-11 pr-4 py-3 rounded-2xl border transition-all focux:ring-2 focus:ring-violet-500 outline-none",
                                            isDarkMode
                                                ? "bg-gray-800 border-gray-700 text-white disabled:bg-gray-950/50"
                                                : "bg-gray-50 border-gray-200 text-gray-900"
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <label className={cn("text-sm font-semibold", isDarkMode ? "text-gray-400" : "text-gray-600")}>
                                Security Settings
                            </label>
                            <div className={cn(
                                "p-4 rounded-2xl border flex items-center justify-between",
                                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                            )}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-500">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className={cn("font-bold text-sm", isDarkMode ? "text-white" : "text-gray-900")}>Change Password</p>
                                        <p className="text-xs text-gray-500">Last changed 2 weeks ago</p>
                                    </div>
                                </div>
                                <button className="text-sm font-semibold text-violet-400 hover:text-violet-300 px-4 py-2">
                                    Update
                                </button>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 mt-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0 text-white shadow-lg">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className={cn("font-bold", isDarkMode ? "text-white" : "text-gray-900")}>Developer Badge</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Your profile is currently featured in the global developer pool.
                                        Keep logging productivity to unlock more premium perks.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
