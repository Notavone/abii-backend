import Router from "express";
import * as apicache from "apicache";
import * as controller from "./clients.controller";

const router = Router();

router.get("/", apicache.middleware("1 minute"), controller.getAll);

router.post("/", controller.create);

router.get("/:clientId", apicache.middleware("1 minute"), controller.get);

router.patch("/:clientId", controller.update);

router.patch("/:clientId/status", controller.updateStatus);

router.patch("/:clientId/balance", controller.updateBalance);

router.delete("/:clientId", controller.remove);

export default router;
