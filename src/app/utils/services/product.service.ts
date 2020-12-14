import { Injectable } from '@angular/core';
import db, {serverTimestamp} from './firebase';
import { Observable } from 'rxjs';
import { CategoryService } from '../services/category.service';
import * as _ from 'lodash';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends ApiService {
  constructor(private categoryService: CategoryService) {
    super();
  }

  getProducts(filter?) {
    return new Observable((observer) => {
      let categories;
      this.categoryService.getCategories().subscribe((data) => {
        categories = data;

        db.collection('/products').onSnapshot((snapshot) => {
          const products = snapshot.docs.map((doc) => {
            return Object.assign(doc.data(), { id: doc.id });
          });

          const productList = products.filter((product) => {
            let validName = true;
            const filterName = _.get(filter, 'name', 'null');
            if (filterName !== 'null') {
              validName = product.name
                .toLowerCase()
                .includes(filter.name.toLowerCase());
            }

            let validCategory = true;
            const filterCategory = _.get(filter, 'category', 'null');
            if (filterCategory !== 'null') {
              validCategory = product.category_id === filterCategory;
            }

            let validVisibility = true;
            const filterVisibility = _.get(filter, 'visibility', 'null');
            if (filterVisibility !== 'null') {
              validVisibility = product.visibility === (filterVisibility === 'true');
            }
            return validName && validCategory && validVisibility;
          });

          if (productList.length !== 0) {
            productList.forEach((product) => {
              product.category = categories.find((c) => {
                return c.id === product.category_id;
              });
            });

            const sortBy = filter.sortBy || 'name';
            if (Object.keys(productList[0]).includes(sortBy)) {
              productList.sort((a, b) => {
                if (
                  typeof a[sortBy] === 'string' &&
                  typeof b[sortBy] === 'string'
                ) {
                  return a[sortBy]
                    .toLowerCase()
                    .localeCompare(b[sortBy].toLowerCase());
                }
                return a[sortBy] - b[sortBy];
              });

              const sortOrder = filter.sortOrder || 'asc';
              if (sortOrder === 'desc') {
                productList.reverse();
              }
            }
          }

          observer.next(productList);
        });
      });
    });
  }

  getProduct(id) {
    return new Observable((observer) => {
      db.collection('products')
        .doc(id)
        .onSnapshot((snapshot) => {
          observer.next(Object.assign(snapshot.data(), { id: snapshot.id }));
        });
    });
  }

  createProduct(product) {
    if (!product.created_on) {
      product.created_on = serverTimestamp;
    }
    if (!product.updated_on) {
      product.updated_on = serverTimestamp;
    }
    return new Observable((observer) => {
      db.collection('products')
        .add(product)
        .then((newObj) => {
          product = Object.assign(product, { id: newObj.id });
          observer.next(product);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  updateProduct(product) {
    if (!product.updated_on) {
      product.updated_on = serverTimestamp;
    }
    const id = _.clone(product.id);
    delete product.id;
    return new Observable((observer) => {
      db.collection('products')
        .doc(id)
        .update(product)
        .then(() => {
          product.id = id;
          observer.next(product);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }
  
  deleteProduct(productId) {
    return new Observable((observer) => {
      db.collection('products')
        .doc(productId)
        .delete()
        .then(() => {
          observer.next(true);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  hasOffer(product) {
    if (!product) {
      return false;
    }

    return product.price < product.oldPrice;
  }

  showDiscountPercentage(product) {
    if (!this.hasOffer(product)) {
      return;
    }

    const oldPrice = Number(product.oldPrice);
    const discountPrice = oldPrice - Number(product.price);
    const discountPercentage = (discountPrice / oldPrice) * 100;

    return Math.floor(discountPercentage + Number.EPSILON).toFixed(0);
  }

  getPopularProducts() {
    return new Observable((observer) => {
      db.collection('/products').onSnapshot((snapshot) => {
        observer.next(
          snapshot.docs.map((doc) => {
            return Object.assign(doc.data(), { id: doc.id });
          })
        );
      });
    });
  }
}
