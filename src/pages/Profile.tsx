import React, { useState } from "react";

export default function Profile({ user, onSave }: { user: { username: string; email?: string } | null; onSave: (u: unknown)=>void }){
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");

  function submit(e: React.FormEvent){
    e.preventDefault();
    onSave({ username, email });
    alert('Saved (visual only)')
  }

  return (
    <div>
      <h2>Profile</h2>
      <div className="card-retro" style={{marginTop:12}}>
        <form className="form-row" onSubmit={submit}>
          <label>Username</label>
          <input value={username} onChange={(e)=>setUsername(e.target.value)} />
          <label>Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <div style={{display:'flex',gap:8}}>
            <button className="retro-cta" type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
