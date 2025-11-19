import { motion } from 'framer-motion'
import { InformationCircleIcon, CommandLineIcon } from '@heroicons/react/24/outline'

type Props = {
  title?: string
  description?: string
  controls?: Array<{ key: string; action: string }>
  note?: string
}

export default function GameInstructions({ 
  title = "Cómo Jugar",
  description = "Lee las instrucciones y controles para dominar este juego.",
  controls = [],
  note
}: Props){
  return (
    <motion.section 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-5 rounded-xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm"
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <InformationCircleIcon className="w-6 h-6 text-sky-400" />
        <h3 className="font-bold text-lg text-white">{title}</h3>
      </div>

      {/* Description */}
      {description && (
        <div className="mb-4 p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
          <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
        </div>
      )}

      {/* Controls */}
      {controls.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CommandLineIcon className="w-5 h-5 text-emerald-400" />
            <h4 className="font-semibold text-white">Controles</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {controls.map((control, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-2.5 bg-slate-800/30 rounded-lg border border-slate-700/20"
              >
                <kbd className="px-3 py-1.5 bg-slate-700/60 border border-slate-600 rounded text-xs font-mono text-white shadow-sm min-w-16 text-center">
                  {control.key}
                </kbd>
                <span className="text-sm text-slate-400">{control.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      {note && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-xs text-amber-300 flex items-center gap-2">
            <span>💡</span>
            <span>{note}</span>
          </p>
        </div>
      )}
    </motion.section>
  )
}
