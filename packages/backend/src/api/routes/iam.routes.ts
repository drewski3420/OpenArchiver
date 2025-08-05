import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import type { IamController } from '../controllers/iam.controller';

export const createIamRouter = (iamController: IamController): Router => {
    const router = Router();

    /**
     * @route GET /api/v1/iam/roles
     * @description Gets all roles.
     * @access Private
     */
    router.get('/roles', requireAuth, iamController.getRoles);

    /**
     * @route GET /api/v1/iam/roles/:id
     * @description Gets a role by ID.
     * @access Private
     */
    router.get('/roles/:id', requireAuth, iamController.getRoleById);

    /**
     * @route POST /api/v1/iam/roles
     * @description Creates a new role.
     * @access Private
     */
    router.post('/roles', requireAuth, iamController.createRole);

    /**
     * @route DELETE /api/v1/iam/roles/:id
     * @description Deletes a role.
     * @access Private
     */
    router.delete('/roles/:id', requireAuth, iamController.deleteRole);
    return router;
};
