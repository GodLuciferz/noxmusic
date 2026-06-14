'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, Trash2, Star, StarOff, Music, X, Check } from 'lucide-react';

export default function SongsPage() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', artist: '', album: '' });
  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadSongs(); }, []);

  async function loadSongs() {
    const { data } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
    setSongs(data || []);
    setLoading(false);
  }

  async function uploadSong() {
    const audioFile = audioRef.current?.files?.[0];
    const coverFile = coverRef.current?.files?.[0];
    if (!audioFile || !form.title) return alert('Song file aur title required hai!');

    setUploading(true);
    try {
      let audioUrl = '';
      let coverUrl = '';

      // Upload audio to R2 via API
      setUploadProgress('Uploading audio...');
      const audioForm = new FormData();
      audioForm.append('file', audioFile);
      audioForm.append('folder', 'songs');
      const audioRes = await fetch('/api/upload', { method: 'POST', body: audioForm });
      const audioData = await audioRes.json();
      audioUrl = audioData.url;

      // Upload cover if provided
      if (coverFile) {
        setUploadProgress('Uploading cover...');
        const coverForm = new FormData();
        coverForm.append('file', coverFile);
        coverForm.append('folder', 'covers');
        const coverRes = await fetch('/api/upload', { method: 'POST', body: coverForm });
        const coverData = await coverRes.json();
        coverUrl = coverData.url;
      }

      setUploadProgress('Saving to database...');
      await supabase.from('songs').insert({
        title: form.title,
        artist: form.artist,
        album: form.album,
        r2_url: audioUrl,
        thumbnail_url: coverUrl || null,
        plays: 0,
        is_trending: false,
      });

      setForm({ title: '', artist: '', album: '' });
      setShowForm(false);
      if (audioRef.current) audioRef.current.value = '';
      if (coverRef.current) coverRef.current.value = '';
      await loadSongs();
      setUploadProgress('');
      alert('Song uploaded successfully! ✅');
    } catch (e: any) {
      alert('Upload failed: ' + e.message);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  }

  async function toggleTrending(song: any) {
    await supabase.from('songs').update({ is_trending: !song.is_trending }).eq('id', song.id);
    loadSongs();
  }

  async function deleteSong(id: number) {
    if (!confirm('Delete this song?')) return;
    await supabase.from('songs').delete().eq('id', id);
    loadSongs();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Songs</h1>
          <p className="text-gray-500 text-sm mt-1">{songs.length} songs in library</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5a52e0] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Upload size={16} />
          Upload Song
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Upload New Song</h2>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Song Title *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]"
                placeholder="Song name"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Artist</label>
              <input
                value={form.artist}
                onChange={e => setForm({ ...form, artist: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]"
                placeholder="Artist name"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Album (optional)</label>
              <input
                value={form.album}
                onChange={e => setForm({ ...form, album: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]"
                placeholder="Album name"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Audio File * (MP3/WAV)</label>
              <input ref={audioRef} type="file" accept="audio/*"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-gray-400 text-sm file:mr-3 file:bg-[#6C63FF] file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs cursor-pointer"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Cover Image (optional)</label>
              <input ref={coverRef} type="file" accept="image/*"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-gray-400 text-sm file:mr-3 file:bg-[#6C63FF] file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs cursor-pointer"
              />
            </div>
          </div>
          {uploadProgress && (
            <div className="flex items-center gap-2 mb-3 text-[#6C63FF] text-sm">
              <div className="w-4 h-4 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
              {uploadProgress}
            </div>
          )}
          <button
            onClick={uploadSong}
            disabled={uploading}
            className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5a52e0] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {uploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={16} />}
            {uploading ? 'Uploading...' : 'Upload & Save'}
          </button>
        </div>
      )}

      {/* Songs List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Music size={40} className="mx-auto mb-3 opacity-30" />
          <p>No songs yet. Upload your first song!</p>
        </div>
      ) : (
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">SONG</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">ARTIST</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">PLAYS</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">TRENDING</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr key={song.id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#6C63FF]/20 flex items-center justify-center overflow-hidden shrink-0">
                        {song.thumbnail_url
                          ? <img src={song.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          : <Music size={16} className="text-[#6C63FF]" />}
                      </div>
                      <span className="text-white text-sm font-medium">{song.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{song.artist || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{song.plays || 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleTrending(song)} className="transition-colors">
                      {song.is_trending
                        ? <Star size={18} className="text-yellow-400 fill-yellow-400" />
                        : <StarOff size={18} className="text-gray-600" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteSong(song.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
