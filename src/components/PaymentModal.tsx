import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCardIcon, XMarkIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { api } from '../services/api';
import { auth } from '../utils/auth';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const invalidCard = cardNumber.length !== 16;
    const invalidExpiry = expiry.length !== 5;
    const invalidCvc = cvc.length !== 3;

    if (invalidCard || invalidExpiry || invalidCvc) {
      setError('Por favor verifica los datos de tu tarjeta');
      setLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const user = auth.getUser();
      if (!user?.id) throw new Error('Usuario no encontrado');

      await api.updateUser(user.id, { hasPaid: true });
      const updatedUser = await api.getUser(user.id);
      auth.setUser(updatedUser);

      onSuccess();
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Error procesando el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(value);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setExpiry(value.replace(/(\d{2})(\d{2})/, '$1/$2'));
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvc(value);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-violet-500/30 relative overflow-hidden"
          >
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors z-10"
            >
              <XMarkIcon className="w-5 h-5 text-slate-400" />
            </button>

            <div className="p-8 relative">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30"
                >
                  <SparklesIcon className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-black mb-2 bg-linear-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
                  Actualizar a Premium
                </h2>
                <p className="text-slate-400 text-sm">Desbloquea todos los juegos premium</p>
              </div>

              {/* Premium features */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50"
              >
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span>Acceso a Pacman, Tetris, Battleship</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span>Sudoku y Flappy Bird</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span>Rankings exclusivos</span>
                  </div>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm overflow-hidden"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">⚠️</span>
                      <span>{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Card Number */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                    <CreditCardIcon className="w-4 h-4 text-violet-400" />
                    Número de Tarjeta
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-white placeholder-slate-500 transition-all"
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                  />
                </motion.div>

                {/* Expiry & CVC */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-slate-300 mb-2">Expiración</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={handleExpiryChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-white placeholder-slate-500 transition-all"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <label className="block text-sm font-medium text-slate-300 mb-2">CVC</label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={handleCvcChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-white placeholder-slate-500 transition-all"
                      placeholder="123"
                      maxLength={3}
                    />
                  </motion.div>
                </div>

                {/* Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-4 space-y-3"
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-linear-to-r from-violet-500 via-purple-600 to-violet-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-5 h-5" />
                        Pagar $9.99 USD
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 text-slate-400 hover:text-white transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
