import db from './database';

export const savePassword = async (hashedPassword: string) => {
    try {
        await db.settingsTable.put({ key: 'password', value: hashedPassword });
    } catch (error) {
        console.error('Failed to save password:', error);
        throw error;
    }
};

export const getPassword = async () => {
    try {
        const record = await db.settingsTable.get('password');
        return record?.value;
    } catch (error) {
        console.error('Failed to get password:', error);
        return null;
    }
};

export const createSession = async () => {
    try {
        const session = {
            id: crypto.randomUUID(),
            timestamp: Date.now()
        };
        await db.settingsTable.put({ key: 'session', value: session });
        return session;
    } catch (error) {
        console.error('Failed to create session:', error);
        throw error;
    }
};

export const checkSession = async () => {
    try {
        const record = await db.settingsTable.get('session');
        if (!record?.value) return false;
        
        await createSession();
        return true;
    } catch (error) {
        console.error('Failed to check session:', error);
        return false;
    }
};

export const clearSession = async () => {
    try {
        await db.settingsTable.delete('session');
    } catch (error) {
        console.error('Failed to clear session:', error);
    }
};