import {model, Schema} from "mongoose";
import {Product} from "./shared/product";
import {ProductType} from "./shared/product-type";

const schema = new Schema<Product>({
    type: {
        type: Schema.Types.Number,
        enum: ProductType,
        required: false,
        default: ProductType.PRODUCT_FOOD
    },
    name: {
        type: Schema.Types.String,
        required: true
    },
    price: {
        type: Schema.Types.Number,
        required: true
    },
    discount: {
        type: Schema.Types.Number,
        required: false,
        default: 0
    },
    available: {
        type: Schema.Types.Boolean,
        required: false,
        default: true
    }
});

export default model<Product>("Product", schema);
