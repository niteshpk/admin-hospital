import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor() {}

  restrictedAction(object, action) {
    const actionRestriction = _.get(environment, `restrict.${object}`, []);

    return !!(actionRestriction && actionRestriction.includes(action));
  }
}
