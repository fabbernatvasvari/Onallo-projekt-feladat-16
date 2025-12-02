import os from "os";

export const username = os.userInfo().username;

export function generateCHAT() {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `CHAT-${randomNum}`;
}

export function getUserHomeDir() {
    return os.homedir();
}

export function getSystemInfo() {
    return {
        platform: os.platform(),
        release: os.release(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
    };
}

export function getUserName() {
    return os.userInfo().username;
}