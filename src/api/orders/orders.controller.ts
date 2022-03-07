import {NextFunction, Request, Response} from "express";
import Order from "./orders.service";
import Client from "../clients/clients.service";
import Product from "../products/products.service";

export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query;
        const conditions = Object.keys(query)
            .reduce((result, key) => {
                if (query[key]) {
                    let parsed = JSON.parse(String(query[key]));
                    // @ts-ignore
                    if(parsed) result[key] = parsed;
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

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        let {lines, client} = req.body;

        let foundClients = await Client.findById(client);
        if (!foundClients) throw "Clear not found.";

        for (let line of lines) {
            let product = await Product.findById(line.product._id);
            if (!product) throw "Product not found.";
            line.product = product;
        }

        if (!lines.length || lines.map((l: any) => l.product).includes(undefined)) throw "Bad request.";
        let isSubscribed = Date.now() < foundClients.subscriptionEnd;

        let total = Math.abs(lines.reduce((acc: number, cur: any) => acc + (isSubscribed ? cur.product.price_red : cur.product.price) * cur.qty, 0)) * -1;

        let order = await Order.create({
            lines: lines.map((l: any) => {
                return {...l, product: l.product._id};
            }),
            total,
            client: foundClients._id,
            date: Date.now()
        });

        foundClients = await Client.findByIdAndUpdate(foundClients._id, {
            balance: foundClients.balance + total
        }, {new: true});
        if (!foundClients) throw "Client not found.";

        res.json({data: {client: foundClients, order}});
    } catch (e) {
        next(e);
    }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        let order = await Order.findById(req.params.orderId);
        if (!order) throw "Order not found.";

        let client = await Client.findById(order.client);

        if(client) {
            client = await Client.findByIdAndUpdate(client._id, {
                balance: client.balance - order.total
            }, {new: true});
        }

        await Order.findByIdAndDelete(order._id);

        res.json({data: {client, order}});
    } catch (e) {
        next(e);
    }
}
