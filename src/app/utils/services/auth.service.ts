import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import db, { serverTimestamp } from './firebase';
import { User } from '../models';
import * as _ from 'lodash';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject: BehaviorSubject<any>;
  public user$: Observable<User>;

  constructor(private router: Router) {
    this.userSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('admin-user'))
    );
    this.user$ = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  login(username: string, password: string) {
    return new Observable((observer) => {
      db.collection('users')
        .where('username', '==', username)
        .where('password', '==', password)
        .get()
        .then((querySnapshot) => {
          const doc = querySnapshot.docs[0];
          if (!doc) {
            observer.next('Invalid credentials');
            return false;
          }
          const user: any = { ...doc.data(), id: doc.id };
          if (!user.activated) {
            observer.next('User not activated yet!');
            return false;
          }
          if (!user.roles.includes('admin')) {
            observer.next('You are not allowed to login in admin area!');
            return false;
          }
          // Set local storage
          this.setLocalStorage(user);

          observer.next(user);

          // Update last login timestamp
          this.updateLastLogInOn(user).subscribe();
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  setLocalStorage(user) {
    user.authData = window.btoa(user.username + ':' + user.password);
    user.image = 'assets/img/user2-160x160.jpg';
    delete user.password;
    localStorage.setItem('admin-user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  updateLastLogInOn(user) {
    user.last_login_on = serverTimestamp;
    const id = _.clone(user.id);
    delete user.id;
    return new Observable((observer) => {
      db.collection('users')
        .doc(id)
        .update(user)
        .then(() => {
          user.id = id;
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  register(userObj) {
    userObj.roles = ['buyer'];
    userObj.authData = window.btoa(userObj.username + ':' + userObj.password);

    return new Observable((observer) => {
      db.collection('users')
        .add(userObj)
        .then((newObj) => {
          userObj = Object.assign(userObj, { id: newObj.id });
          delete userObj.password;
          localStorage.setItem('admin-user', JSON.stringify(userObj));
          this.userSubject.next(userObj);
          observer.next(userObj);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  logout(url?: string) {
    // remove user from local storage to log user out
    localStorage.removeItem('admin-user');
    this.userSubject.next(null);
    if (url) {
      this.router.navigate([url]);
    }
  }
}
