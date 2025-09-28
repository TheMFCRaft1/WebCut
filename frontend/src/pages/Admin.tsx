import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function AdminPanel({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function load() {
    const r = await api('/api/users', 'GET', token);
    if (r.ok) setUsers(r.data || []);
  }
  useEffect(()=>{ load(); }, []);

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    const r = await api('/api/users', 'POST', token, { username, password, isAdmin: false });
    if (r.ok) { setUsername(''); setPassword(''); load(); }
    else alert(r.data?.error || 'Fehler');
  }

  async function del(id: number) {
    if (!confirm('Delete user?')) return;
    const r = await api('/api/users/' + id, 'DELETE', token);
    if (r.ok) load();
    else alert('Fehler');
  }

  return (
    <section style={{marginTop:20}}>
      <h3>Admin: Nutzerverwaltung</h3>
      <form onSubmit={addUser}>
        <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Add User</button>
      </form>
      <ul>
        {users.map(u => (
          <li key={u.id}>
            {u.username} {u.isAdmin ? '(admin)' : ''} <button onClick={()=>del(u.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}