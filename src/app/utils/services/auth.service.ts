import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import db from './firebase';
import { User } from '../models';

const USER_FIELD = 'hospital-admin-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject: BehaviorSubject<any>;
  public user: Observable<User>;

  constructor(private router: Router) {
    this.userSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem(USER_FIELD))
    );
    this.user = this.userSubject.asObservable();
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
          const user = Object.assign(doc.data(), { id: doc.id });
          if (!user.activated) {
            observer.next('User not activated yet!');
            return false;
          }
          delete user.password;
          user.authData = window.btoa(username + ':' + password);
          user.image = 'assets/img/user2-160x160.jpg';
          localStorage.setItem(USER_FIELD, JSON.stringify(user));
          this.userSubject.next(user);
          observer.next(user);
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
          localStorage.setItem(USER_FIELD, JSON.stringify(userObj));
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
    localStorage.removeItem(USER_FIELD);
    this.userSubject.next(null);
    if (url) {
      this.router.navigate([url]);
    }
  }
}
