export class User {
  id?: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  authData?: string;
  roles?: string[];
  activated?: boolean;
  // tslint:disable-next-line: variable-name
  created_on?: Date;
  // tslint:disable-next-line: variable-name
  updated_on?: Date;
}
