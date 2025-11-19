import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/auth';
import { api } from '../services/api';

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('🔵 GoogleCallback iniciado');
        console.log('🔵 URL completa:', window.location.href);
        console.log('🔵 Hash:', window.location.hash);
        
        // Obtener el token del hash de la URL
        const hash = window.location.hash.substring(1); // Quitar el #
        const params = new URLSearchParams(hash);
        const token = params.get('token');

        console.log('🔵 Token extraído:', token ? '✅ Token encontrado' : '❌ No hay token');

        if (!token) {
          console.error('❌ No token found in URL');
          navigate('/login');
          return;
        }

        // Verificar y obtener datos del usuario
        console.log('🔵 Guardando token en localStorage...');
        auth.setToken(token);
        console.log('✅ Token guardado');
        
        try {
          console.log('🔵 Obteniendo datos del usuario...');
          const userResponse = await api.getMe();
          console.log('✅ Datos del usuario obtenidos:', userResponse);
          
          if (userResponse) {
            // Guardar datos del usuario
            auth.setUser(userResponse);
            console.log('✅ Usuario guardado en localStorage');
            
            // Redirigir al dashboard
            console.log('🔵 Redirigiendo al dashboard...');
            navigate('/dashboard', { replace: true });
            return;
          }
        } catch (error) {
          console.error('❌ Error getting user data:', error);
          // Si hay error de autenticación, limpiar y volver al login
          auth.logout();
          navigate('/login', { replace: true });
          return;
        }
      } catch (error) {
        console.error('❌ Error en el callback de Google:', error);
        navigate('/login');
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 via-violet-950 to-fuchsia-950">
      <div className="text-white text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Completando inicio de sesión...</p>
      </div>
    </div>
  );
}