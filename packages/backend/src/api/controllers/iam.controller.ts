import { Request, Response } from 'express';
import { IamService } from '../../services/IamService';
import { PolicyValidator } from '../../iam-policy/policy-validator';
import type { PolicyStatement } from '@open-archiver/types';

export class IamController {
	#iamService: IamService;

	constructor(iamService: IamService) {
		this.#iamService = iamService;
	}

	public getRoles = async (req: Request, res: Response): Promise<void> => {
		try {
			const roles = await this.#iamService.getRoles();
			res.status(200).json(roles);
		} catch (error) {
			res.status(500).json({ error: 'Failed to get roles.' });
		}
	};

	public getRoleById = async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params;

		try {
			const role = await this.#iamService.getRoleById(id);
			if (role) {
				res.status(200).json(role);
			} else {
				res.status(404).json({ error: 'Role not found.' });
			}
		} catch (error) {
			res.status(500).json({ error: 'Failed to get role.' });
		}
	};

	public createRole = async (req: Request, res: Response): Promise<void> => {
		const { name, policy } = req.body;

		if (!name || !policy) {
			res.status(400).json({ error: 'Missing required fields: name and policy.' });
			return;
		}

		for (const statement of policy) {
			const { valid, reason } = PolicyValidator.isValid(statement as PolicyStatement);
			if (!valid) {
				res.status(400).json({ error: `Invalid policy statement: ${reason}` });
				return;
			}
		}

		try {
			const role = await this.#iamService.createRole(name, policy);
			res.status(201).json(role);
		} catch (error) {
			res.status(500).json({ error: 'Failed to create role.' });
		}
	};

	public deleteRole = async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params;

		try {
			await this.#iamService.deleteRole(id);
			res.status(204).send();
		} catch (error) {
			res.status(500).json({ error: 'Failed to delete role.' });
		}
	};
}
