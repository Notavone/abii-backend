import {Router} from "express";
import * as controller from "./orders.controller";

const router = Router();

router.get("/", controller.getAll);

router.post("/", controller.create);

router.get("/:orderId", controller.get);

router.delete("/:orderId", controller.remove);

export default router;
