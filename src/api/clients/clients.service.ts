import {model, Schema} from "mongoose";
import {Client} from "./client";

const schema = new Schema<Client>({
    name: {
        type: Schema.Types.String,
        required: true
    },
    balance: {
        type: Schema.Types.Number,
        required: false,
        default: 0
    },
    subscriptionEnd: {
        type: Schema.Types.Number,
        required: false,
        default: 0
    }
});

export default model<Client>("Client", schema);
