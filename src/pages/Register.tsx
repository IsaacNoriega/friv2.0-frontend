import React, { useState } from "react";

export default function Register({ onRegister }: { onRegister: (u: { username: string; email?: string }) => void }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // simulate register -> login
    onRegister({ username: username || email.split("@")[0], email });
  }

  return (
    <div>
      <h2>Register</h2>
      <div className="card-retro" style={{marginTop:12}}>
        <form className="form-row" onSubmit={submit}>
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div style={{display:'flex',gap:8}}>
            <button className="retro-cta" type="submit">Create account</button>
            <button type="button" className="retro-ghost" onClick={() => onRegister({ username: 'Guest' })}>Continue as Guest</button>
          </div>
        </form>
      </div>
    </div>
  );
}
