import {Router} from "express";
import * as controller from "./orders.controller";
import * as apicache from "apicache";

const router = Router();

router.get("/", apicache.middleware("1 minute"), controller.getAll);

router.post("/", controller.create);

router.get("/:orderId", apicache.middleware("1 minute"), controller.get);

router.delete("/:orderId", controller.remove);

export default router;
