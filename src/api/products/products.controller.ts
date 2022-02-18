import {NextFunction, Request, Response} from "express";
import Product from "./products.service";

export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        let products = await Product.find({});
        res.json({data: products});
    } catch (e) {
        next(e);
    }
}

export async function get(req: Request, res: Response, next: NextFunction) {
    try {
        let product = await Product.findById(req.params.productId);
        if (!product) throw "Product not found.";
        res.json({data: product});
    } catch (e) {
        next(e);
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        let {type, name, price, discount} = req.body;
        let product = await Product.create({type, name, price, discount});
        res.status(201).json({data: product});
    } catch (e) {
        next(e);
    }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        let {type, name, price, discount, available} = req.body;
        let product = await Product.findByIdAndUpdate(req.params.productId, {
            type, name, price, discount, available
        }, {new: true});
        if (!product) throw "Product not found.";
        res.json({data: product});
    } catch (e) {
        next(e);
    }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        let product = await Product.findByIdAndRemove(req.params.productId);
        if (!product) throw "Product not found.";
        res.status(204).json({});
    } catch (e) {
        next(e);
    }
}

export async function toggleAvailability(req: Request, res: Response, next: NextFunction) {
    try {
        let product = await Product.findById(req.params.productId);
        if (!product) throw "Product not found.";

        product = await Product.findByIdAndUpdate(req.params.productId, {
            available: !product.available
        }, {new: true});
        if (!product) throw "Product not found.";

        res.json({data: product});
    } catch (e) {
        next(e);
    }
}
