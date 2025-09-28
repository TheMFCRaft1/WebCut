import React, { useState } from 'react';
import { api } from '../api';

export default function Login({ onLogin }: { onLogin: (t: string) => void }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await api('/api/login', 'POST', undefined, { username, password });
    if (r.ok && r.data?.token) {
      onLogin(r.data.token);
    } else {
      setErr(r.data?.error || 'Login failed');
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>WebCut - Login</h2>
      <form onSubmit={submit}>
        <div>
          <label>Username</label><br />
          <input value={username} onChange={e=>setUsername(e.target.value)} />
        </div>
        <div>
          <label>Password</label><br />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
        {err && <div style={{color:'red'}}>{err}</div>}
      </form>
    </div>
  );
}