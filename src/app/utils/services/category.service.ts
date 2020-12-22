import { Injectable } from '@angular/core';
import db, { serverTimestamp } from './firebase';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends ApiService {
  constructor() {
    super();
  }

  getCategories(filter?) {
    return new Observable((observer) => {
      db.collection('/categories').onSnapshot((snapshot) => {
        const categoryList = [];
        snapshot.docs.map((doc) => {
          const category = Object.assign(doc.data(), { id: doc.id });

          let validVisibility = true;
          const filterVisibility = _.get(filter, 'visibility', 'null');
          if (filterVisibility !== 'null') {
            validVisibility =
              category.visibility === (filterVisibility === 'true');
          }

          if (validVisibility) {
            categoryList.push(category);
          }
        });

        observer.next(categoryList);
      });
    });
  }

  getCategory(id) {
    return new Observable((observer) => {
      db.collection('/categories')
        .doc(id)
        .onSnapshot((snapshot) => {
          observer.next(Object.assign(snapshot.data(), { id: snapshot.id }));
        });
    });
  }

  createCategory(category) {
    if (!category.created_on) {
      category.created_on = serverTimestamp;
    }
    if (!category.updated_on) {
      category.updated_on = serverTimestamp;
    }
    return new Observable((observer) => {
      db.collection('categories')
        .add(category)
        .then((newObj) => {
          category = Object.assign(category, { id: newObj.id });
          observer.next(category);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  updateCategory(category) {
    if (!category.updated_on) {
      category.updated_on = serverTimestamp;
    }
    const id = _.clone(category.id);
    delete category.id;
    return new Observable((observer) => {
      db.collection('categories')
        .doc(id)
        .update(category)
        .then(() => {
          category.id = id;
          observer.next(category);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  deleteCategory(categoryId) {
    return new Observable((observer) => {
      db.collection('categories')
        .doc(categoryId)
        .delete()
        .then(() => {
          observer.next(true);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }
}
