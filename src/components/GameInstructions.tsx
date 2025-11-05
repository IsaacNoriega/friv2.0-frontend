import React from 'react'

type Props = {
  children?: React.ReactNode
  note?: string
}

export default function GameInstructions({ children, note }: Props){
  return (
    <section className="mb-4 p-4 rounded-lg bg-gradient-to-b from-[#071123] to-[#071726] border border-slate-800 text-slate-300">
      <h3 className="font-semibold text-slate-100 mb-1">Instrucciones:</h3>
      <p className="text-sm text-slate-400">
        Esta es una simulación de juego. En una aplicación real, aquí se cargaría el juego completo.
        Presiona <strong className="text-slate-200">Iniciar</strong> para comenzar y observa cómo aumenta tu puntuación.
        ¡Intenta superar tu récord!
      </p>
      {note && <p className="mt-2 text-xs text-amber-300">{note}</p>}
      {children}
    </section>
  )
}
