'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Music, CreditCard, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSongs: 0,
    activeSubscriptions: 0,
    totalPlays: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [usersRes, songsRes, subsRes, playsRes, recentRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('songs').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_subscribed', true),
      supabase.from('songs').select('plays'),
      supabase.from('users').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    const totalPlays = playsRes.data?.reduce((sum, s) => sum + (s.plays || 0), 0) || 0;

    setStats({
      totalUsers: usersRes.count || 0,
      totalSongs: songsRes.count || 0,
      activeSubscriptions: subsRes.count || 0,
      totalPlays,
    });
    setRecentUsers(recentRes.data || []);
    setLoading(false);
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Songs', value: stats.totalSongs, icon: Music, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: CreditCard, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Total Plays', value: stats.totalPlays, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">NOX Music Overview</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-[#111] border border-[#222] rounded-xl p-4">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon size={20} className={color} />
                </div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-gray-500 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Recent Users */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Recent Users</h2>
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className="text-gray-500 text-sm">No users yet</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#6C63FF]/20 flex items-center justify-center text-xs text-[#6C63FF] font-bold">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{user.name || 'Unknown'}</p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${user.is_subscribed ? 'bg-green-400/10 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                      {user.is_subscribed ? 'Premium' : 'Free'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
