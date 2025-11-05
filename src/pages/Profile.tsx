import React, { useState } from "react";

type User = { username: string; email?: string; bio?: string; location?: string; favorite?: string; memberSince?: string } | null;
export default function Profile({ user, onSave }: { user: User; onSave: (u: unknown)=>void }){
  const [username, setUsername] = useState(user?.username || "Invitado");
  const [email, setEmail] = useState(user?.email || "player@friv2.com");
  const [password, setPassword] = useState('');

  function submit(e: React.FormEvent){
    e.preventDefault();
    onSave({ username, email, password });
    alert('Información guardada (visual-only)');
  }

  return (
    <main className="p-8 text-slate-100">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left card */}
        <aside className="lg:col-span-1 bg-[#0f2430] rounded-xl p-6 border border-slate-800">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-linear-to-br from-[#7c4dff] to-[#ff6fb5] flex items-center justify-center text-white text-2xl font-bold ring-2 ring-sky-500/20">{(username||'IN').slice(0,2).toUpperCase()}</div>
            <div className="text-center">
              <div className="text-xl font-semibold">{username}</div>
              <div className="text-amber-300 text-sm">Modo Invitado</div>
            </div>

            <div className="w-full border-t border-slate-800 pt-4 text-sm text-slate-300">
              <div className="flex justify-between mb-2"><span>Nivel:</span><span className="font-semibold">42</span></div>
              <div className="flex justify-between mb-2"><span>Ranking:</span><span className="font-semibold">#247</span></div>
              <div className="flex justify-between mb-2"><span>Victorias:</span><span className="font-semibold">189</span></div>
            </div>

            <button className="mt-4 w-full py-2 rounded-md bg-gradient-to-r from-[#5b34ff] to-[#ff3fb6] text-white font-semibold">Cambiar Avatar</button>
          </div>
        </aside>

        {/* Right form */}
        <section className="lg:col-span-2 bg-[#0e1b26] rounded-xl border border-slate-800 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Información del Jugador</h2>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300">Nombre de Usuario</label>
              <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full mt-1 p-3 bg-[#08121a] border border-slate-700 rounded-md text-white" />
            </div>

            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full mt-1 p-3 bg-[#08121a] border border-slate-700 rounded-md text-white" />
            </div>

            <div>
              <label className="text-sm text-slate-300">Contraseña</label>
              <input type="password" placeholder="Nueva contraseña" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full mt-1 p-3 bg-[#08121a] border border-slate-700 rounded-md text-white" />
            </div>

            <div className="flex justify-end">
              <button type="submit" className="py-2 px-4 rounded-md bg-linear-to-r from-[#5b34ff] to-[#ff3fb6] text-white font-semibold">Guardar</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

