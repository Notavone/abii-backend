import Router from "express";
import * as controller from "./products.controller";
import passport from "passport";
import * as apicache from "apicache";

const router = Router();

router.get("/", apicache.middleware("1 minute"), controller.getAll);

router.post("/", passport.authenticate("jwt"), controller.create);

router.get("/:productId", passport.authenticate("jwt"), apicache.middleware("1 minute"), controller.get);

router.patch("/:productId", passport.authenticate("jwt"), controller.update);

router.delete("/:productId", passport.authenticate("jwt"), controller.remove);

router.patch("/:productId/available", passport.authenticate("jwt"), controller.toggleAvailability);

export default router;
