import { Router } from 'express';
import { uploadFile } from '../controllers/upload.controller';
import { requireAuth } from '../middleware/requireAuth';
import { AuthService } from '../../services/AuthService';

export const createUploadRouter = (authService: AuthService): Router => {
	const router = Router();

	router.use(requireAuth(authService));

	router.post('/', uploadFile);

	return router;
};
