import {Router} from 'express';
import * as controller from "./token.controller";

const router = Router();
router.post("/", controller.request);

export default router;
