import { Injectable, EventEmitter } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import * as _ from 'lodash';
import { User } from '../models';
import db, { serverTimestamp } from './firebase';
import { AuthService } from '../services/auth.service';
import { UserService } from './user.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService extends ApiService {
  ordersCount = new EventEmitter<any>();
  user: User;

  constructor(private authService: AuthService, private userService: UserService) {
    super();
    this.authService.user.subscribe((user) => {
      this.user = user;
    });
  }

  getOrder(orderId: string) {
    let order: any;
    return new Observable((observer) => {
      db.collection('orders')
        .doc(orderId)
        .onSnapshot((snapshot) => {
          if (!snapshot.exists) {
            observer.next('No order found for this orderId');
            return false;
          }
          order = Object.assign(snapshot.data(), { id: snapshot.id });
          this.getOrderAddress(orderId).subscribe((address) => {
            order.address = address;
            this.getOrderItems(orderId).subscribe((items) => {
              order.products = items;
            });
          });
          observer.next(order);
        });
    });
  }

  getOrders(filter?) {
    const orderList = [];
    return new Observable((observer) => {
      db.collection('orders').orderBy('created_on', 'desc').get()
        .then((querySnapshot) => {
          const docs = querySnapshot.docs;
          if (docs.length) {
            _.map(docs, (snapshot) => {
              const order = Object.assign(snapshot.data(), { id: snapshot.id });
              let validFilterUser = true;
              let validFilterOrderStatus = true;
              let validFilterPaymentStatus = true;
              const filterUser = _.get(filter, 'user', 'null');
              if (filterUser !== 'null') {
                validFilterUser = order.user_id === filterUser;
              }
              const filterOrderStatus = _.get(filter, 'order_status', 'null');
              if (filterOrderStatus !== 'null') {
                validFilterOrderStatus = order.status === filterOrderStatus;
              }
              const filterPaymentStatus = _.get(filter, 'payment_status', 'null');
              if (filterPaymentStatus !== 'null') {
                validFilterPaymentStatus = order.payment_status === filterPaymentStatus;
              }
              if (validFilterUser && validFilterOrderStatus && validFilterPaymentStatus) {
                orderList.push(order);
                
                this.getOrderAddress(order.id).subscribe((address) => {
                  order.address = address;
                  this.getOrderItems(order.id).subscribe((items) => {
                    order.products = items;
                    this.userService.getUser(order.user_id).subscribe((user) => {
                      order.user = user;
                    });
                  });
                });                
              }
            });
          }
          this.ordersCount.emit(orderList.length);
          observer.next(orderList);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  getOrderItems(orderId) {
    const orderItemList = [];
    return new Observable((observer) => {
      db.collection('order_items')
        .where('order_id', '==', orderId)
        .get()
        .then((querySnapshot) => {
          const docs = querySnapshot.docs;
          if (docs.length) {
            _.map(docs, (snapshot) => {
              orderItemList.push(
                Object.assign(snapshot.data(), { id: snapshot.id })
              );
            });
          }
          observer.next(orderItemList);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  getOrderAddress(orderId) {
    const orderAddressList = [];
    return new Observable((observer) => {
      db.collection('order_addresses')
        .where('order_id', '==', orderId)
        .get()
        .then((querySnapshot) => {
          if (querySnapshot.docs.length) {
            _.map(querySnapshot.docs, (snapshot) => {
              orderAddressList.push(
                Object.assign(snapshot.data(), { id: snapshot.id })
              );
            });
          }
          observer.next(orderAddressList[0]);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  updateOrder(order) {
    if (!order.updated_on) {
      order.updated_on = serverTimestamp;
    }
    const id = _.clone(order.id);
    delete order.id;
    return new Observable((observer) => {
      db.collection('orders')
        .doc(id)
        .update(order)
        .then(() => {
          order.id = id;
          observer.next(order);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  deleteOrder(orderId) {
    return new Observable((observer) => {
      db.collection('orders')
        .doc(orderId)
        .delete()
        .then(() => {
          db.collection('order_items')
            .where('order_id', '==', orderId)
            .get()
            .then((querySnapshot1) => {
              querySnapshot1.forEach((doc) => {
                doc.ref.delete();
              });

              db.collection('order_addresses')
              .where('order_id', '==', orderId)
              .get()
              .then((querySnapshot2) => {
                querySnapshot2.forEach((doc) => {
                  doc.ref.delete();
                });
                observer.next(true);
              })
              .catch((error) => {
                observer.error(new Error(error));
              }); 
            })
            .catch((error) => {
              observer.error(new Error(error));
            });          
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }
}
