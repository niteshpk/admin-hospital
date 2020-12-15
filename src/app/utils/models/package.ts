export class Package {
  id?: string;
  name: string;
  description: string;
  // tslint:disable-next-line: variable-name
  no_of_days: string;
  image: string;
  // tslint:disable-next-line: variable-name
  original_amount: number;
  // tslint:disable-next-line: variable-name
  offer_amount: number;
  visibility?: boolean;
  // tslint:disable-next-line: variable-name
  created_on?: Date;
  // tslint:disable-next-line: variable-name
  updated_on?: Date;
}
