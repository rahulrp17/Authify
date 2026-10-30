import { Router } from 'express';
import {
  changePassword,
  deleteAccount,
  getProfile,
  getSessions,
  revokeSession,
  updateProfile,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validate.js';
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateProfileSchema,
} from '../validators/userValidators.js';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', validateBody(updateProfileSchema), updateProfile);
router.put('/change-password', validateBody(changePasswordSchema), changePassword);
router.delete('/account', validateBody(deleteAccountSchema), deleteAccount);
router.get('/sessions', getSessions);
router.delete('/sessions/:sessionId', revokeSession);

export default router;
