import {Document, Schema, model} from 'mongoose';

export interface IUser {
    email: string,
    password: string
}

export interface IUserDocument extends Document<IUser> {

}

export const UserSchema = new Schema<IUser, IUserDocument>({
    email: {
        type: Schema.Types.String
    },
    password: {
        type: Schema.Types.String
    }
}, {versionKey: false, id: true, _id: false})

export const User = model<IUser>("User", UserSchema);
