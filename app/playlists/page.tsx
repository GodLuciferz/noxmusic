'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Star, StarOff, ListMusic, X, Check } from 'lucide-react';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', cover_url: '' });
  const [selectedSongs, setSelectedSongs] = useState<number[]>([]);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [p, s] = await Promise.all([
      supabase.from('playlists').select('*').order('created_at', { ascending: false }),
      supabase.from('songs').select('id, title, artist'),
    ]);
    setPlaylists(p.data || []);
    setSongs(s.data || []);
    setLoading(false);
  }

  async function createPlaylist() {
    if (!form.name) return alert('Playlist name required!');
    const { data: pl } = await supabase.from('playlists').insert({
      name: form.name,
      cover_url: form.cover_url || null,
      is_featured: false,
    }).select().single();

    if (pl && selectedSongs.length > 0) {
      await supabase.from('playlist_songs').insert(
        selectedSongs.map((sid, i) => ({ playlist_id: pl.id, song_id: sid, position: i }))
      );
    }
    setForm({ name: '', cover_url: '' });
    setSelectedSongs([]);
    setShowForm(false);
    loadAll();
  }

  async function toggleFeatured(pl: any) {
    await supabase.from('playlists').update({ is_featured: !pl.is_featured }).eq('id', pl.id);
    loadAll();
  }

  async function deletePlaylist(id: number) {
    if (!confirm('Delete this playlist?')) return;
    await supabase.from('playlists').delete().eq('id', id);
    loadAll();
  }

  function toggleSong(id: number) {
    setSelectedSongs(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Playlists</h1>
          <p className="text-gray-500 text-sm mt-1">{playlists.length} playlists</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5a52e0] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Playlist
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Create Playlist</h2>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Playlist Name *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]"
                placeholder="e.g. Top Hits 2024"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Cover Image URL (optional)</label>
              <input
                value={form.cover_url}
                onChange={e => setForm({ ...form, cover_url: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-gray-400 text-xs mb-2 block">Add Songs ({selectedSongs.length} selected)</label>
            <div className="max-h-48 overflow-y-auto space-y-1 bg-[#1a1a1a] rounded-lg p-2">
              {songs.map(song => (
                <label key={song.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#222] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSongs.includes(song.id)}
                    onChange={() => toggleSong(song.id)}
                    className="accent-[#6C63FF]"
                  />
                  <span className="text-white text-sm">{song.title}</span>
                  <span className="text-gray-500 text-xs">{song.artist}</span>
                </label>
              ))}
              {songs.length === 0 && <p className="text-gray-500 text-sm p-2">No songs available. Upload songs first.</p>}
            </div>
          </div>
          <button
            onClick={createPlaylist}
            className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5a52e0] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Check size={16} /> Create Playlist
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <ListMusic size={40} className="mx-auto mb-3 opacity-30" />
          <p>No playlists yet. Create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map(pl => (
            <div key={pl.id} className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-[#2D1B69] to-[#1A0A3A] flex items-center justify-center overflow-hidden">
                {pl.cover_url
                  ? <img src={pl.cover_url} alt="" className="w-full h-full object-cover" />
                  : <ListMusic size={40} className="text-white/30" />}
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold">{pl.name}</h3>
                <p className="text-gray-500 text-xs mt-1">
                  {pl.is_featured ? '⭐ Featured on Home' : 'Not featured'}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => toggleFeatured(pl)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg flex-1 justify-center transition-colors ${
                      pl.is_featured ? 'bg-yellow-400/10 text-yellow-400' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                    }`}
                  >
                    {pl.is_featured ? <><StarOff size={12} /> Unfeature</> : <><Star size={12} /> Feature</>}
                  </button>
                  <button
                    onClick={() => deletePlaylist(pl.id)}
                    className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
