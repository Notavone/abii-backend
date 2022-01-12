import passport from "passport";
import * as local from "passport-local";
import {IUserDocument, User} from "./models/User";
import {compareSync} from "bcrypt";

export default function passportConfig() {

    passport.serializeUser((user: Partial<IUserDocument>, done) => {
        done(null, user.id)
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, null, null, (err, user) => {
            done(err, user);
        })
    })


    passport.use(new local.Strategy({
        usernameField: "email"
    }, (email, password, done) => {
        User.findOne({email}, null, null, (err, user) => {
            if(!user) return done("User not found", false);
            if(compareSync(password, user.password)) {
                return done(null, user);
            }
            return done("Password does not match", false);
        })
    }))
}
