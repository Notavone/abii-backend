import {Router} from "express";
import products from "./products/products.route";
import clients from "./clients/clients.route";
import orders from "./orders/orders.route";
import passport from "passport";

const router = Router();

router.use("/products", products);
router.use("/clients", passport.authenticate("jwt"), clients);
router.use("/orders", passport.authenticate("jwt"), orders);

export default router;
