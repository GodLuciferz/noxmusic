'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Send, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', message: '', target: 'all' });
  const [sending, setSending] = useState(false);

  useEffect(() => { loadNotifications(); }, []);

  async function loadNotifications() {
    // Store notifications in Supabase (create table if needed)
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    }
  }

  async function sendNotification() {
    if (!form.title || !form.message) return alert('Title aur message required hai!');
    setSending(true);
    try {
      await supabase.from('notifications').insert({
        title: form.title,
        message: form.message,
        target: form.target,
        sent_at: new Date().toISOString(),
      });
      setForm({ title: '', message: '', target: 'all' });
      await loadNotifications();
      alert('Notification sent! ✅\n\nNote: App mein dikhaane ke liye Flutter mein notification polling add karna hoga.');
    } catch (e: any) {
      alert('Error: ' + e.message + '\n\nPehle notifications table banao Supabase mein.');
    }
    setSending(false);
  }

  async function deleteNotification(id: number) {
    await supabase.from('notifications').delete().eq('id', id);
    loadNotifications();
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-gray-500 text-sm mt-1">Send notices to your users</p>
      </div>

      {/* Send Form */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-5 mb-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Bell size={16} className="text-[#6C63FF]" /> Send New Notification
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Title *</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]"
              placeholder="e.g. New songs added! 🎵"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Message *</label>
            <textarea
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              rows={3}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF] resize-none"
              placeholder="Your message here..."
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Target</label>
            <select
              value={form.target}
              onChange={e => setForm({ ...form, target: e.target.value })}
              className="bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]"
            >
              <option value="all">All Users</option>
              <option value="premium">Premium Users Only</option>
              <option value="free">Free Users Only</option>
            </select>
          </div>
          <button
            onClick={sendNotification}
            disabled={sending}
            className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5a52e0] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
            {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </div>

      {/* Notification History */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Sent Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No notifications sent yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 bg-[#1a1a1a] rounded-lg">
                <div className="w-8 h-8 rounded-full bg-[#6C63FF]/20 flex items-center justify-center shrink-0">
                  <Bell size={14} className="text-[#6C63FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{n.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-600 text-xs">{new Date(n.sent_at || n.created_at).toLocaleString('en-IN')}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-[#6C63FF]/20 text-[#6C63FF] rounded">{n.target}</span>
                  </div>
                </div>
                <button onClick={() => deleteNotification(n.id)} className="text-gray-600 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
