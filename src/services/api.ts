const API_URL = import.meta.env.VITE_API_URL || 'https://friv2-backend.onrender.com';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  hasPaid?: boolean;
}

// Helper function to get headers with authorization token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const api = {
  // Auth endpoints
  getMe: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener datos del usuario');
    }

    return response.json();
  },

  login: async (data: LoginData) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en el inicio de sesión');
    }
    
    return response.json();
  },

  register: async (data: RegisterData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en el registro');
    }
    
    return response.json();
  },

  // User CRUD endpoints
  getUsers: async () => {
    const response = await fetch(`${API_URL}/auth/users`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error obteniendo usuarios');
    }
    
    return response.json();
  },

  getUser: async (id: string) => {
    const response = await fetch(`${API_URL}/auth/users/${id}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error obteniendo usuario');
    }
    
    return response.json();
  },

  updateUser: async (id: string, data: UpdateUserData) => {
    const response = await fetch(`${API_URL}/auth/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error actualizando usuario');
    }
    
    return response.json();
  },

  deleteUser: async (id: string) => {
    const response = await fetch(`${API_URL}/auth/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error eliminando usuario');
    }
    
    return response.json();
  },

  // Leaderboard endpoints
  postGameScore: async (gameName: string, score: number) => {
    if (!gameName) {
      throw new Error('Nombre del juego es requerido');
    }
    
    // Asegurarse de que score es un número válido
    const numericScore = Number(score);
    if (isNaN(numericScore)) {
      throw new Error('La puntuación debe ser un número válido');
    }

    // Asegurarse de que el token existe
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Usuario no autenticado');
    }

    const headers = getAuthHeaders();
    console.log('Headers:', headers); // Debug
    console.log('Score:', numericScore, typeof numericScore); // Debug

    const response = await fetch(`${API_URL}/leaderboard/${gameName}/score`, {
      method: 'POST',
      headers: {
        ...headers,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        score: Math.floor(numericScore),
        name: gameName 
      }), 
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText); // Debug
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.message || 'Error guardando puntuación');
      } catch {
        throw new Error('Error guardando puntuación');
      }
    }
    
    return response.json();
  },

  getGameTop: async (gameName: string, limit: number = 50) => {
    const response = await fetch(`${API_URL}/leaderboard/${gameName}/top?limit=${limit}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error obteniendo leaderboard');
    }

    const data = await response.json();
    // Backend returns { game, top } — normalize to return the array of entries
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.top)) return data.top;
  return [] as unknown[];
  },

  // Get scores for the authenticated user
  getMyScores: async () => {
    const response = await fetch(`${API_URL}/leaderboard/me`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error obteniendo mis scores');
    }

    return response.json();
  },

  // Get scores for a given user id (public)
  getUserScores: async (userId: string) => {
    const response = await fetch(`${API_URL}/leaderboard/user/${userId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error obteniendo scores del usuario');
    }
    return response.json();
  },
};
