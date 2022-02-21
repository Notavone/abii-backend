import express from "express";
import {config} from "dotenv";
import {connect} from "mongoose";
import morgan from "morgan";
import cors from "cors";
import apiRouter from "./api/api.route";
import passport from "passport";
import User from "./api/users/users.service";
import jwt, {ExtractJwt} from "passport-jwt";
import * as bcrypt from "bcrypt";
import tokenRouter from "./api/token/token.route";

config();

const APP_PORT = process.env.APP_PORT ?? 9000;
const MONGODB = process.env.MONGODB ?? "";

connect(MONGODB).catch((e) => {
    console.error(e);
    process.exit(1);
});

const app = express();

app.listen(APP_PORT, () => console.log("Listening on port " + APP_PORT));

app.use(
    morgan("dev"),
    cors({
        origin: "*",
    }),
    express.json(),
    express.urlencoded({extended: true}),
    passport.initialize()
);

passport.use(new jwt.Strategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    algorithms: ["HS256"]
}, (payload, done) => {
    User.findOne({email: payload.email})
        .then((acc) => {
            if (!acc) return done(null, false);
            bcrypt.compare(payload.password, acc.password, (err, same) => {
                if (err) return done(err, false);
                if (!same) return done(null, false);
                return done(null, acc);
            });
        }).catch((err) => {
        return done(err, false);
    });
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    done(null, user);
});

app.use("/token", tokenRouter);
app.use("/api", apiRouter);
