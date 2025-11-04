import React, { useState } from "react";

export default function Login({ onLogin }: { onLogin: (u: { username: string; email?: string }) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // simulate login
    onLogin({ username: email.split("@")[0] || "Player", email });
  }

  return (
    <div>
      <h2>Login</h2>
      <div className="card-retro" style={{marginTop:12}}>
        <form className="form-row" onSubmit={submit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div style={{display:'flex',gap:8}}>
            <button className="retro-cta" type="submit">Sign in</button>
            <button type="button" className="retro-ghost" onClick={() => onLogin({ username: 'Guest' })}>Play as Guest</button>
          </div>
        </form>
      </div>
    </div>
  );
}
