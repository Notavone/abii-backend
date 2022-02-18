import {NextFunction, Request, Response} from "express";
import Order from "./orders.service";

export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query;
        const conditions = Object.keys(query)
            .reduce((result, key) => {
                if (query[key]) {
                    // @ts-ignore
                    result[key] = query[key];
                }
                return result;
            }, {});
        let orders = await Order.find(conditions);
        res.json({data: orders});
    } catch (e) {
        next(e);
    }
}

export async function get(req: Request, res: Response, next: NextFunction) {
    try {
        let order = Order.findById(req.params.orderId);
        res.json({data: order});
    } catch (e) {
        next(e);
    }
}
