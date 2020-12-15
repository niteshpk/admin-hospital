export class User {
  id?: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  date_of_birth: string;
  mobile_number: string;
  authData?: string;
  roles?: string[];
  activated?: boolean;
  // tslint:disable-next-line: variable-name
  created_on?: Date;
  // tslint:disable-next-line: variable-name
  updated_on?: Date;
}
