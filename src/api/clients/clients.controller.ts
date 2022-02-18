import {NextFunction, Request, Response} from "express";
import Client from "./clients.service";
import {SubscriptionStatus} from "./shared/subscription-status";
import Product from "../products/products.service";
import Order from "../orders/orders.service";

export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        let clients = await Client.find({});
        res.json({data: clients});
    } catch (e) {
        next(e);
    }
}

export async function get(req: Request, res: Response, next: NextFunction) {
    try {
        let client = await Client.findById(req.params.clientId);
        if (!client) throw "Client not found.";
        res.json({data: client});
    } catch (e) {
        next(e);
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        let {name} = req.body;
        let client = await Client.create({name});
        res.status(201).json({data: client});
    } catch (e) {
        next(e);
    }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        let {name} = req.body;
        let client = await Client.findByIdAndUpdate(req.params.clientId, {
            name
        }, {new: true});
        if (!client) throw "Client not found.";
        res.json({data: client});
    } catch (e) {
        next(e);
    }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        let client = await Client.findByIdAndRemove(req.params.clientId);
        if (!client) throw "Client not found.";
        res.status(204).json({data: client});
    } catch (e) {
        next(e);
    }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
        let {status} = req.body;
        let client = await Client.findById(req.params.clientId);
        if (!client) throw "Client not found.";

        let date = client.subscriptionEnd;

        switch (status) {
        case SubscriptionStatus.NONE:
            date = 0;
            break;
        case SubscriptionStatus.ANNUAL:
            date = Date.now() + 31557600000;
            break;
        case SubscriptionStatus.SEMESTER:
            date = Date.now() + 7889400000;
        }

        client = await Client.findByIdAndUpdate(req.params.clientId, {
            subscriptionEnd: date
        }, {new: true});
        if (!client) throw "Client not found.";

        res.json({data: client});
    } catch (e) {
        next(e);
    }
}

export async function updateBalance(req: Request, res: Response, next: NextFunction) {
    try {
        let {type, amount} = req.body;
        let client = await Client.findById(req.params.clientId);
        if (!client) throw "Client not found.";
        if (isNaN(Number(amount)) || isNaN(Number(type))) throw "Bad request.";

        client = await Client.findByIdAndUpdate(client._id, {
            balance: client.balance + Number(amount)
        }, {new: true});
        if (!client) throw "Client not found.";

        res.json({data: client});
    } catch (e) {
        next(e);
    }
}

export async function createOrder(req: Request, res: Response, next: NextFunction) {
    try {
        let {lines} = req.body;

        let client = await Client.findById(req.params.clientId);
        if (!client) throw "Clear not found.";

        for (let line of lines) {
            let product = await Product.findById(line.product._id);
            if (!product) throw "Product not found.";
            line.product = product;
        }

        if (!lines.length || lines.map((l: any) => l.product).includes(undefined)) throw "Bad request.";
        let isSubscribed = Date.now() < client.subscriptionEnd;

        let total = Math.abs(lines.reduce((acc: number, cur: any) => acc + (isSubscribed ? cur.product.price - cur.product.price * cur.product.discount / 100 : cur.product.price) * cur.qty, 0)) * -1;

        let order = await Order.create({
            lines: lines.map((l: any) => {
                return {...l, product: l.product._id};
            }),
            total,
            client: client._id
        });

        client = await Client.findByIdAndUpdate(client._id, {
            balance: client.balance + total
        }, {new: true});
        if (!client) throw "Client not found.";

        res.json({data: {client, order}});
    } catch (e) {
        next(e);
    }
}
