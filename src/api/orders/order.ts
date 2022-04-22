import {OrderLine} from "./order-line";

export interface Order {
    lines: OrderLine[],
    total: number
    client: string,
    date: number
}
