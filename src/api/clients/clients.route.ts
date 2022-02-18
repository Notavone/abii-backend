import Router from "express";
import * as controller from "./clients.controller";

const router = Router();

router.get("/", controller.getAll);

router.post("/", controller.create);

router.get("/:clientId", controller.get);

router.patch("/:clientId", controller.update);

router.patch("/:clientId/status", controller.updateStatus);

router.patch("/:clientId/balance", controller.updateBalance);

router.post("/:clientId/orders", controller.createOrder);

router.delete("/:clientId", controller.remove);

export default router;
