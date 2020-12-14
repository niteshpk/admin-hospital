import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import db from './firebase';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor() { }

  getCategoriesCount() {
    return new Observable((observer) => {
      db.collection('/categories').onSnapshot((snapshot) => {
        observer.next(snapshot.size);
      });
    });
  }
  
  getOrdersCount() {
    return new Observable((observer) => {
      db.collection('/orders').onSnapshot((snapshot) => {
        observer.next(snapshot.size);
      });
    });
  }
  
  getProductsCount() {
    return new Observable((observer) => {
      db.collection('/products').onSnapshot((snapshot) => {
        observer.next(snapshot.size);
      });
    });
  }
  
  getUsersCount() {
    return new Observable((observer) => {
      db.collection('/users').onSnapshot((snapshot) => {
        observer.next(snapshot.size);
      });
    });
  }
}
