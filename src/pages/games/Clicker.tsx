import React from 'react'

export default function Clicker(){
  const [count, setCount] = React.useState(0)
  return (
    <main className="p-6 text-slate-100 min-h-screen bg-[linear-gradient(180deg,#071123_0%,#071726_100%)]">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Clicker</h1>
        <p className="text-slate-400 mb-4">Haz clic para sumar puntos.</p>
        <div className="bg-[#0e1b26] p-6 rounded-xl border border-slate-800 text-center">
          <div className="text-4xl font-bold text-white mb-4">{count}</div>
          <button onClick={() => setCount(c => c+1)} className="py-2 px-4 rounded-md bg-linear-to-r from-[#5b34ff] to-[#ff3fb6] text-white">Clic</button>
        </div>
      </div>
    </main>
  )
}
