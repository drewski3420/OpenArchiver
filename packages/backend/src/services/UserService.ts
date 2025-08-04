import { hash } from 'bcryptjs';
import type { User } from '@open-archiver/types';
import type { IUserService } from './AuthService';

// This is a mock implementation of the IUserService.
// Later on, this service would interact with a database.
export class AdminUserService implements IUserService {
    #users: User[] = [];

    constructor() {
        // Immediately seed the user when the service is instantiated.
        this.seed();
    }

    // use .env admin user
    private async seed() {
        const passwordHash = await hash(process.env.ADMIN_PASSWORD as string, 10);
        this.#users.push({
            id: '1',
            email: process.env.ADMIN_EMAIL as string,
            role: 'Super Administrator',
            passwordHash: passwordHash,
        });
    }

    public async findByEmail(email: string): Promise<User | null> {
        // once user service is ready, this would be a database query.
        const user = this.#users.find(u => u.email === email);
        return user || null;
    }
}
