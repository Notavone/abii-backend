import {NextFunction, Request, Response} from "express";
import Client from "./clients.service";
import {SubscriptionStatus} from "./shared/subscription-status";

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
