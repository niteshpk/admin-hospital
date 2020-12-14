export class Product {
    id?: string;
    name: string;
    description: string;
    image: string;
    price: number;
    oldPrice: number;
    quantity: number;
    // tslint:disable-next-line: variable-name
    category_id: string;
    visibility?: boolean;
    // tslint:disable-next-line: variable-name
    created_on?: Date;
    // tslint:disable-next-line: variable-name
    updated_on?: Date;
}
