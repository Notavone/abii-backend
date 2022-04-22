import {model, Schema} from "mongoose";
import {User} from "./user";

const schema = new Schema<User>({
    email: {
        type: Schema.Types.String,
        required: true
    },
    password: {
        type: Schema.Types.String,
        required: true
    }
});

export default model<User>("User", schema);
