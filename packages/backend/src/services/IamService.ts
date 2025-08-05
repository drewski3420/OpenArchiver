import { db } from '../database';
import { roles } from '../database/schema/users';
import type { Role, PolicyStatement } from '@open-archiver/types';
import { eq } from 'drizzle-orm';

export class IamService {
    public async getRoles(): Promise<Role[]> {
        return db.select().from(roles);
    }

    public async getRoleById(id: string): Promise<Role | undefined> {
        const [role] = await db.select().from(roles).where(eq(roles.id, id));
        return role;
    }

    public async createRole(name: string, policy: PolicyStatement[]): Promise<Role> {
        const [role] = await db.insert(roles).values({ name, policies: policy }).returning();
        return role;
    }

    public async deleteRole(id: string): Promise<void> {
        await db.delete(roles).where(eq(roles.id, id));
    }
}
