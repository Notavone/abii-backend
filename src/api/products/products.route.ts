import Router from "express";
import * as controller from "./products.controller";
import passport from "passport";

const router = Router();

router.get("/", controller.getAll);

router.post("/", passport.authenticate("jwt"), controller.create);

router.get("/:productId", passport.authenticate("jwt"), controller.get);

router.patch("/:productId", passport.authenticate("jwt"), controller.update);

router.delete("/:productId", passport.authenticate("jwt"), controller.remove);

export default router;
