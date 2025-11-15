import React, { useState } from 'react';
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#0f2430] rounded-2xl shadow-2xl max-w-md w-full border border-slate-700/60">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-wide">Actualizar a Premium</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Número de Tarjeta</label>
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-violet-500 outline-none text-white placeholder-slate-500 transition"
                placeholder="1234 5678 9012 3456"
                maxLength={16}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Fecha de Expiración</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={handleExpiryChange}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-violet-500 outline-none text-white placeholder-slate-500 transition"
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">CVC</label>
                <input
                  type="text"
                  value={cvc}
                  onChange={handleCvcChange}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-violet-500 outline-none text-white placeholder-slate-500 transition"
                  placeholder="123"
                  maxLength={3}
                />
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#5b34ff] to-[#b144ff] text-white font-semibold tracking-wide disabled:opacity-50 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition"
              >
                {loading ? 'Procesando...' : 'Pagar $9.99 USD'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-slate-400 hover:text-white transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
