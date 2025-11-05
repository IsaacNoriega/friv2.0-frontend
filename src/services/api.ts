const API_URL = 'http://localhost:3000';

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
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const api = {
  // Auth endpoints
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
};
