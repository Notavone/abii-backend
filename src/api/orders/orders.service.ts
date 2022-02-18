import {model, Schema} from "mongoose";
import {Order} from "./shared/order";

const schema = new Schema<Order>({
    lines: {
        type: [{
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product"
            },
            qty: Number
        }],
        required: true
    },
    total: {
        type: Schema.Types.Number,
        required: true
    },
    client: {
        type: Schema.Types.String,
        ref: "Client",
        required: true
    }
});

export default model<Order>("Order", schema);
