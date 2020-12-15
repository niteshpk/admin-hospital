export class Package {
  id?: string;
  name: string;
  description: string;
  no_of_days: string;
  image: string;
  original_amount: number;
  offer_amount: number;
  visibility?: boolean;
  // tslint:disable-next-line: variable-name
  created_on?: Date;
  // tslint:disable-next-line: variable-name
  updated_on?: Date;
}
