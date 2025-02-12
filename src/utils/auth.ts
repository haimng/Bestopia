export const isSignedIn = (): boolean => {
    return !!localStorage.getItem('token');
};

export const isAdmin = (): boolean => {
    const role = localStorage.getItem('role');
    return role === 'admin';
};
