import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import db, { serverTimestamp } from './firebase';
import * as _ from 'lodash';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService extends ApiService {
  constructor() {
    super();
  }

  getUsers(filter?) {
    return new Observable((observer) => {
      db.collection('/users').onSnapshot((snapshot) => {
        const userList = [];
        snapshot.docs.map((doc) => {
          const user = Object.assign(doc.data(), { id: doc.id });

          let validActivated = true;
          const filterActivated = _.get(filter, 'activated', 'null');
          if (filterActivated !== 'null') {
            validActivated = user.activated === (filterActivated === 'true');
          }

          let validRole = true;
          const filterRole = _.get(filter, 'role', 'null');
          if (filterRole !== 'null') {
            validRole = user.roles.includes(filterRole);
          }

          if (validActivated && validRole) {
            userList.push(user);
          }
        });

        observer.next(userList);
      });
    });
  }

  getUser(id) {
    return new Observable((observer) => {
      db.collection('/users')
        .doc(id)
        .onSnapshot((snapshot) => {
          observer.next(Object.assign(snapshot.data(), { id: snapshot.id }));
        });
    });
  }

  createUser(user) {
    if (!user.updated_on) {
      user.updated_on = serverTimestamp;
    }
    if (!user.updated_on) {
      user.updated_on = serverTimestamp;
    }

    return new Observable((observer) => {
      db.collection('users')
        .add(user)
        .then((newObj) => {
          user = Object.assign(user, { id: newObj.id });
          observer.next(user);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  updateUser(user) {
    if (!user.created_on) {
      user.created_on = serverTimestamp;
    }
    if (!user.updated_on) {
      user.updated_on = serverTimestamp;
    }
    const id = _.clone(user.id);
    delete user.id;
    return new Observable((observer) => {
      db.collection('users')
        .doc(id)
        .update(user)
        .then(() => {
          user.id = id;
          observer.next(user);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  deleteUser(userId) {
    return new Observable((observer) => {
      db.collection('users')
        .doc(userId)
        .delete()
        .then(() => {
          observer.next(true);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  getUserAddress(userId) {
    const userAddressList = [];
    return new Observable((observer) => {
      db.collection('addresses')
        .where('user_id', '==', userId)
        .orderBy('created_on', 'desc')
        .get()
        .then((querySnapshot) => {
          if (querySnapshot.docs.length) {
            _.map(querySnapshot.docs, (snapshot) => {
              userAddressList.push(
                Object.assign(snapshot.data(), { id: snapshot.id })
              );
            });
          }
          observer.next(userAddressList);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  getBuyerUsers() {
    const userAddressList = [];
    return new Observable((observer) => {
      db.collection('users')
        .where('roles', 'array-contains-any', ['buyer'])
        .orderBy('username', 'asc')
        .get()
        .then((querySnapshot) => {
          if (querySnapshot.docs.length) {
            _.map(querySnapshot.docs, (snapshot) => {
              userAddressList.push(
                Object.assign(snapshot.data(), { id: snapshot.id })
              );
            });
          }
          observer.next(userAddressList);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  getRecentLoggedInUsers(count) {
    return new Observable((observer) => {
      db.collection('users')
        .orderBy('last_login_on', 'desc')
        .get()
        .then((querySnapshot) => {
          const users = [];
          if (querySnapshot.docs.length) {
            const usersTemp = _.slice(querySnapshot.docs, 0, count);
            _.map(usersTemp, (snapshot) => {
              users.push(Object.assign(snapshot.data(), { id: snapshot.id }));
            });
          }
          observer.next(users);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }
}
