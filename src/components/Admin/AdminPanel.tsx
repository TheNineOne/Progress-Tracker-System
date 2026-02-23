import {
    ShieldAlert,
    Users,
    FileText,
    MessageSquare,
    Search,
    Activity,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const mockSystemStats = [
    { name: 'Mon', visits: 120, analyzes: 45, sessions: 30 },
    { name: 'Tue', visits: 150, analyzes: 52, sessions: 35 },
    { name: 'Wed', visits: 180, analyzes: 60, sessions: 42 },
    { name: 'Thu', visits: 140, analyzes: 48, sessions: 38 },
    { name: 'Fri', visits: 220, analyzes: 75, sessions: 55 },
    { name: 'Sat', visits: 250, analyzes: 88, sessions: 65 },
    { name: 'Sun', visits: 210, analyzes: 70, sessions: 50 },
];

const mockUsers = [
    { id: '1', name: 'Alex Chen', email: 'alex@example.com', joins: 12, resumes: 4, lastActive: '2h ago', status: 'Active' },
    { id: '2', name: 'Sarah J.', email: 'sarah.j@gmail.com', joins: 8, resumes: 2, lastActive: '5h ago', status: 'Active' },
    { id: '3', name: 'Mike Ross', email: 'mike@corporate.com', joins: 15, resumes: 7, lastActive: '1d ago', status: 'Idle' },
    { id: '4', name: 'Emily White', email: 'emily@tech.io', joins: 5, resumes: 1, lastActive: '3h ago', status: 'Active' },
    { id: '5', name: 'David Smith', email: 'dave@soft.com', joins: 22, resumes: 9, lastActive: '10m ago', status: 'Online' },
];

export function AdminPanel() {
    const { isDarkMode, user } = useAppStore();

    const isAdmin = user?.email === 'mishrashrey.000@gmail.com' || user?.email === 'admin@example.com' || user?.name?.toLowerCase().includes('shrey');

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                    <ShieldAlert className="w-10 h-10" />
                </div>
                <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-gray-900")}>Access Denied</h2>
                <p className="text-gray-500 max-w-md">This area is restricted to administrators only. Your activity has been logged.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-all"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={cn("text-3xl font-bold flex items-center gap-3", isDarkMode ? "text-white" : "text-gray-900")}>
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                        Admin Intelligence Console
                    </h1>
                    <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>System-wide overview and user engagement analytics</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={cn("px-4 py-2 rounded-xl border flex items-center gap-2", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm")}>
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span className={cn("text-sm font-semibold", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>Live System Healthy</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', val: '1,284', grow: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Resumes Analyzed', val: '452', grow: '+25%', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'AI Interviews', val: '891', grow: '+18%', icon: MessageSquare, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                    { label: 'System Load', val: '24%', grow: 'Stable', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((s) => (
                    <div key={s.label} className={cn("p-6 rounded-3xl border transition-all", isDarkMode ? "bg-gray-900 border-gray-800 hover:border-gray-700" : "bg-white border-gray-200 shadow-sm hover:shadow-md")}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", s.bg)}>
                                <s.icon className={cn("w-6 h-6", s.color)} />
                            </div>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">{s.grow}</span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">{s.label}</p>
                        <h3 className={cn("text-2xl font-bold mt-1", isDarkMode ? "text-white" : "text-gray-900")}>{s.val}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Engagement Chart */}
                <div className={cn("lg:col-span-2 p-6 rounded-3xl border", isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm")}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className={cn("font-bold text-lg", isDarkMode ? "text-white" : "text-gray-900")}>Usage Intensity</h3>
                        <select className={cn("text-xs bg-transparent border-none outline-none font-semibold", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockSystemStats}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} vertical={false} />
                                <XAxis dataKey="name" stroke={isDarkMode ? '#6b7280' : '#9ca3af'} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke={isDarkMode ? '#6b7280' : '#9ca3af'} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: isDarkMode ? '#111827' : '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="visits" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={3} />
                                <Area type="monotone" dataKey="analyzes" stroke="#10b981" fillOpacity={0} strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Active Users */}
                <div className={cn("p-6 rounded-3xl border", isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm")}>
                    <h3 className={cn("font-bold text-lg mb-6", isDarkMode ? "text-white" : "text-gray-900")}>Recent Users</h3>
                    <div className="space-y-4">
                        {mockUsers.map((u) => (
                            <div key={u.id} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xs">
                                    {u.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn("text-sm font-bold truncate", isDarkMode ? "text-white" : "text-gray-800")}>{u.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{u.lastActive}</p>
                                </div>
                                <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", u.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500')}>
                                    {u.status}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 rounded-xl border border-dashed border-gray-700 text-gray-500 text-xs font-bold hover:bg-gray-800 transition-all">
                        View All Users
                    </button>
                </div>
            </div>

            {/* Audit Log / Detailed Data */}
            <div className={cn("p-6 rounded-3xl border", isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm")}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className={cn("font-bold text-lg", isDarkMode ? "text-white" : "text-gray-900")}>System Security Log</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Filter logs..."
                            className={cn("pl-10 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500", isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200")}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={cn("border-b", isDarkMode ? "border-gray-800" : "border-gray-100")}>
                                <th className="pb-4 font-bold text-sm text-gray-500">Operation</th>
                                <th className="pb-4 font-bold text-sm text-gray-500">User ID</th>
                                <th className="pb-4 font-bold text-sm text-gray-500">Payload</th>
                                <th className="pb-4 font-bold text-sm text-gray-500">Timestamp</th>
                                <th className="pb-4 font-bold text-sm text-gray-500">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {[
                                { op: 'RESUME_UPLOAD', user: 'user_921', data: 'resume_pdf_v2', time: '12:45:01', res: 'Success' },
                                { op: 'INTERVIEW_START', user: 'user_443', data: 'react_dev_role', time: '12:42:15', res: 'Success' },
                                { op: 'LOGIN_ATTEMPT', user: 'ip_182.xx', data: 'email_auth', time: '12:38:00', res: 'Success' },
                                { op: 'CODE_ROOM_CREATE', user: 'user_112', data: 'room_V8X2', time: '12:30:11', res: 'Critical' },
                            ].map((log, i) => (
                                <tr key={i} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-4 font-semibold text-sm text-violet-400">{log.op}</td>
                                    <td className={cn("py-4 text-sm font-medium", isDarkMode ? "text-gray-300" : "text-gray-700")}>{log.user}</td>
                                    <td className="py-4 text-xs text-gray-500 font-mono italic">{log.data}</td>
                                    <td className="py-4 text-sm text-gray-500">{log.time}</td>
                                    <td className="py-4">
                                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", log.res === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500')}>
                                            {log.res}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
