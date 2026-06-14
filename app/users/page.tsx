'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Crown, CrownIcon, UserX } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function toggleSubscription(user: any) {
    const newStatus = !user.is_subscribed;
    const endDate = newStatus ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
    await supabase.from('users').update({
      is_subscribed: newStatus,
      subscription_end_date: endDate,
    }).eq('id', user.id);
    loadUsers();
  }

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const premiumCount = users.filter(u => u.is_subscribed).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-gray-500 text-sm mt-1">
          {users.length} total · <span className="text-yellow-400">{premiumCount} premium</span>
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]"
          placeholder="Search by name or email..."
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">USER</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">STATUS</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">EXPIRES</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">JOINED</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const daysLeft = user.subscription_end_date
                  ? Math.max(0, Math.ceil((new Date(user.subscription_end_date).getTime() - Date.now()) / 86400000))
                  : 0;
                return (
                  <tr key={user.id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#6C63FF]/20 flex items-center justify-center text-xs text-[#6C63FF] font-bold shrink-0">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{user.name || 'Unknown'}</p>
                          <p className="text-gray-500 text-xs truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user.is_subscribed && daysLeft > 0 ? 'bg-yellow-400/10 text-yellow-400' : 'bg-gray-700 text-gray-400'}`}>
                        {user.is_subscribed && daysLeft > 0 ? '✨ Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {user.subscription_end_date && daysLeft > 0
                        ? <span className="text-green-400">{daysLeft} days left</span>
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSubscription(user)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          user.is_subscribed
                            ? 'bg-red-400/10 text-red-400 hover:bg-red-400/20'
                            : 'bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20'
                        }`}
                      >
                        {user.is_subscribed ? <><UserX size={12} /> Revoke</> : <><Crown size={12} /> Grant</>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">No users found</div>
          )}
        </div>
      )}
    </div>
  );
}
