import React, { useEffect, useState } from 'react';
import { api } from '../api';
import AdminPanel from './Admin';

export default function Dashboard({ token, onLogout }: { token: string, onLogout: ()=>void }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [meIsAdmin, setMeIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await api('/api/projects', 'GET', token);
      if (r.ok) setProjects(r.data || []);
      const users = await api('/api/users', 'GET', token);
      setMeIsAdmin(users.ok);
    })();
  }, []);

  async function createProject() {
    const title = prompt('Project title');
    if (!title) return;
    const r = await api('/api/projects', 'POST', token, { title, description: '' });
    if (r.ok) {
      setProjects((p)=>[{ id: r.data.id, title, description: '' }, ...p]);
    } else alert('Fehler');
  }

  return (
    <div style={{padding:20}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>WebCut - Dashboard</h2>
        <div>
          <button onClick={createProject}>Neues Projekt</button>{' '}
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      <section>
        <h3>Projekte</h3>
        <ul>
          {projects.map(p => <li key={p.id}>{p.title} — {p.description}</li>)}
        </ul>
      </section>

      {meIsAdmin && <AdminPanel token={token} /> }
    </div>
  );
}