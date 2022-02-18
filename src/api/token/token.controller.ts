import {sign} from 'jsonwebtoken';
import {compare} from "bcrypt";
import {NextFunction, Request, Response} from "express";
import User from "../users/users.service";

export async function request(req: Request, res: Response, next: NextFunction) {
    try {
        let {email, password} = req.body;
        if (!email || !password) throw "MISSING_CREDENTIALS";
        let secret = process.env.JWT_SECRET;
        if(!secret) throw "Missing JWT_SECRET in .env";

        let account = await User.findOne({email});
        if (!account) return next("ACCOUNT_NOT_FOUND");

        let good = await compare(password, account.password);
        if (!good) throw "INCORRECT_PASSWORD";

        sign(req.body, secret, {
            expiresIn: "1 hour"
        }, (err: Error | null, token: string | undefined) => {
            if (err) next(err);
            return res.json({token});
        });
    } catch (e) {
        next(e);
    }
}
