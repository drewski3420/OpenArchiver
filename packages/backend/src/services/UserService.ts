import { db } from '../database';
import * as schema from '../database/schema';
import { and, eq, asc, sql } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import type { PolicyStatement, User } from '@open-archiver/types';
import { PolicyValidator } from '../iam-policy/policy-validator';

export class UserService {
    /**
     * Finds a user by their email address.
     * @param email The email address of the user to find.
     * @returns The user object if found, otherwise null.
     */
    public async findByEmail(email: string): Promise<(typeof schema.users.$inferSelect) | null> {
        const user = await db.query.users.findFirst({
            where: eq(schema.users.email, email)
        });
        return user || null;
    }

    /**
     * Finds a user by their ID.
     * @param id The ID of the user to find.
     * @returns The user object if found, otherwise null.
     */
    public async findById(id: string): Promise<(typeof schema.users.$inferSelect) | null> {
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, id)
        });
        return user || null;
    }

    /**
     * Creates a new user in the database.
     * The first user created will be assigned the 'Super Admin' role.
     * @param userDetails The details of the user to create.
     * @returns The newly created user object.
     */
    public async createAdminUser(userDetails: Pick<User, 'email' | 'first_name' | 'last_name'> & { password?: string; }): Promise<(typeof schema.users.$inferSelect)> {
        const { email, first_name, last_name, password } = userDetails;

        const userCountResult = await db.select({ count: sql<number>`count(*)` }).from(schema.users);
        const isFirstUser = Number(userCountResult[0].count) === 0;

        const hashedPassword = password ? await hash(password, 10) : undefined;

        const newUser = await db.insert(schema.users).values({
            email,
            first_name,
            last_name,
            password: hashedPassword,
        }).returning();

        // find super admin role
        let superAdminRole = await db.query.roles.findFirst({
            where: eq(schema.roles.name, 'Super Admin')
        });

        if (!superAdminRole) {
            const suerAdminPolicies: PolicyStatement[] = [{
                Effect: 'Allow',
                Action: ['*'],
                Resource: ['*']
            }];
            superAdminRole = (await db.insert(schema.roles).values({
                name: 'Super Admin',
                policies: suerAdminPolicies
            }).returning())[0];
        }

        await db.insert(schema.userRoles).values({
            userId: newUser[0].id,
            roleId: superAdminRole.id
        });


        return newUser[0];
    }
}
