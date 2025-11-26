// frontend/live-chat-app/src/helperLibs/idGenerator.tsx
// A simple ID generator utility that creates a random alphanumeric string of a given length.
class IdGenerator {
    static generateId(length: number = 16): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

export default IdGenerator;