import {Router} from "express";
import * as controller from "./orders.controller";

const router = Router();

router.get("/", controller.getAll);

router.post("/:orderId", controller.get);

export default router;
