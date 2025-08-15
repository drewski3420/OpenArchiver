import type { Request, Response } from 'express';
import { AuthService } from '../../services/AuthService';
import { UserService } from '../../services/UserService';
import { db } from '../../database';
import * as schema from '../../database/schema';
import { sql } from 'drizzle-orm';
import 'dotenv/config';

export class AuthController {
	#authService: AuthService;
	#userService: UserService;

	constructor(authService: AuthService, userService: UserService) {
		this.#authService = authService;
		this.#userService = userService;
	}
	/**
	 * Only used for setting up the instance, should only be displayed once upon instance set up.
	 * @param req
	 * @param res
	 * @returns
	 */
	public setup = async (req: Request, res: Response): Promise<Response> => {
		const { email, password, first_name, last_name } = req.body;

		if (!email || !password || !first_name || !last_name) {
			return res.status(400).json({ message: 'Email, password, and name are required' });
		}

		try {
			const userCountResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.users);
			const userCount = Number(userCountResult[0].count);

			if (userCount > 0) {
				return res.status(403).json({ message: 'Setup has already been completed.' });
			}

			const newUser = await this.#userService.createAdminUser(
				{ email, password, first_name, last_name },
				true
			);
			const result = await this.#authService.login(email, password);
			return res.status(201).json(result);
		} catch (error) {
			console.error('Setup error:', error);
			return res.status(500).json({ message: 'An internal server error occurred' });
		}
	};

	public login = async (req: Request, res: Response): Promise<Response> => {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required' });
		}

		try {
			const result = await this.#authService.login(email, password);

			if (!result) {
				return res.status(401).json({ message: 'Invalid credentials' });
			}

			return res.status(200).json(result);
		} catch (error) {
			console.error('Login error:', error);
			return res.status(500).json({ message: 'An internal server error occurred' });
		}
	};

	public status = async (req: Request, res: Response): Promise<Response> => {
		try {
			const userCountResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.users);
			const userCount = Number(userCountResult[0].count);
			const needsSetup = userCount === 0;
			// in case user uses older version with admin user variables, we will create the admin user using those variables.
			if (needsSetup && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
				await this.#userService.createAdminUser(
					{
						email: process.env.ADMIN_EMAIL,
						password: process.env.ADMIN_PASSWORD,
						first_name: 'Admin',
						last_name: 'User',
					},
					true
				);
				return res.status(200).json({ needsSetup: false });
			}
			return res.status(200).json({ needsSetup });
		} catch (error) {
			console.error('Status check error:', error);
			return res.status(500).json({ message: 'An internal server error occurred' });
		}
	};
}
