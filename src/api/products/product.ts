import {ProductType} from "./product-type";

export interface Product {
    type: ProductType
    name: string,
    price: number,
    price_red: number,
    available: boolean
}
