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
        // normalize user object to always include `id` field
        const normalized: any = {
            id: (user as any)?.id || (user as any)?._id || null,
            username: (user as any)?.username,
            email: (user as any)?.email,
            hasPaid: !!(user as any)?.hasPaid,
        };
        localStorage.setItem('user', JSON.stringify(normalized));
        try {
            window.dispatchEvent(new CustomEvent('auth:changed', { detail: normalized }));
        } catch {}
    },
    getUser: (): UserData | null => {
        const user = localStorage.getItem('user');
        if (!user) return null;
        try {
            const parsed = JSON.parse(user) as any;
            // support both _id or id coming from backend
            const normalized: any = {
                id: parsed.id || parsed._id || null,
                username: parsed.username,
                email: parsed.email,
                hasPaid: !!parsed.hasPaid,
            };
            return normalized as UserData;
        } catch {
            return null;
        }
    },
    removeUser: () => {
        localStorage.removeItem('user');
        try {
            window.dispatchEvent(new CustomEvent('auth:changed', { detail: null }));
        } catch {}
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
        try {
            window.dispatchEvent(new CustomEvent('auth:changed', { detail: null }));
        } catch {}
    },

    // Check if user is logged in
    isLoggedIn: () => {
        const token = auth.getToken();
        const user = auth.getUser();
        if (!token || !user) {
            auth.logout(); // Limpia todo si falta alguno
            return false;
        }
        return true;
    }
};
