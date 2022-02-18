import {ProductType} from "./product-type";

export interface Product {
    type: ProductType
    name: string,
    price: number,
    discount: number,
    available: boolean
}
