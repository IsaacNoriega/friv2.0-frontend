interface UserData {
    id: string;
    username: string;
    email: string;
    hasPaid: boolean;
}

export const auth = {
    // Token management
    setToken: (token: string) => {
        localStorage.setItem('token', token);
    },
    getToken: () => {
        return localStorage.getItem('token');
    },
    removeToken: () => {
        localStorage.removeItem('token');
    },

    // User data management
    setUser: (user: UserData) => {
        localStorage.setItem('user', JSON.stringify(user));
    },
    getUser: (): UserData | null => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    removeUser: () => {
        localStorage.removeItem('user');
    },

    // Combined login data setter
    setLoginData: (token: string, user: UserData) => {
        auth.setToken(token);
        auth.setUser(user);
    },

    // Logout helper
    logout: () => {
        auth.removeToken();
        auth.removeUser();
    },

    // Check if user is logged in
    isLoggedIn: () => {
        return !!auth.getToken() && !!auth.getUser();
    }
};
