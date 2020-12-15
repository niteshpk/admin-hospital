import { Injectable } from '@angular/core';
import db, { serverTimestamp } from './firebase';
import { Observable } from 'rxjs';
import { CategoryService } from '../services/category.service';
import * as _ from 'lodash';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class PackageService extends ApiService {
  constructor(private categoryService: CategoryService) {
    super();
  }

  getPackages(filter?) {
    return new Observable((observer) => {
      let categories;
      this.categoryService.getCategories().subscribe((data) => {
        categories = data;

        db.collection('/packages').onSnapshot((snapshot) => {
          const packages = snapshot.docs.map((doc) => {
            return Object.assign(doc.data(), { id: doc.id });
          });

          const packageList = packages.filter((pkg) => {
            let validName = true;
            const filterName = _.get(filter, 'name', 'null');
            if (filterName !== 'null') {
              validName = pkg.name
                .toLowerCase()
                .includes(filter.name.toLowerCase());
            }

            let validCategory = true;
            const filterCategory = _.get(filter, 'category', 'null');
            if (filterCategory !== 'null') {
              validCategory = pkg.category_id === filterCategory;
            }

            let validVisibility = true;
            const filterVisibility = _.get(filter, 'visibility', 'null');
            if (filterVisibility !== 'null') {
              validVisibility =
                pkg.visibility === (filterVisibility === 'true');
            }
            return validName && validCategory && validVisibility;
          });

          if (packageList.length !== 0) {
            packageList.forEach((pkg) => {
              pkg.category = categories.find((c) => {
                return c.id === pkg.category_id;
              });
            });

            const sortBy = filter.sortBy || 'name';
            if (Object.keys(packageList[0]).includes(sortBy)) {
              packageList.sort((a, b) => {
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
                packageList.reverse();
              }
            }
          }

          observer.next(packageList);
        });
      });
    });
  }

  getPackage(id) {
    return new Observable((observer) => {
      db.collection('packages')
        .doc(id)
        .onSnapshot((snapshot) => {
          observer.next(Object.assign(snapshot.data(), { id: snapshot.id }));
        });
    });
  }

  createPackage(pkg) {
    if (!pkg.created_on) {
      pkg.created_on = serverTimestamp;
    }
    if (!pkg.updated_on) {
      pkg.updated_on = serverTimestamp;
    }
    return new Observable((observer) => {
      db.collection('packages')
        .add(pkg)
        .then((newObj) => {
          pkg = Object.assign(pkg, { id: newObj.id });
          observer.next(pkg);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  updatePackage(pkg) {
    if (!pkg.created_on) {
      pkg.created_on = serverTimestamp;
    }
    if (!pkg.updated_on) {
      pkg.updated_on = serverTimestamp;
    }
    const id = _.clone(pkg.id);
    delete pkg.id;
    return new Observable((observer) => {
      db.collection('packages')
        .doc(id)
        .update(pkg)
        .then(() => {
          pkg.id = id;
          observer.next(pkg);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  deletePackage(packageId) {
    return new Observable((observer) => {
      db.collection('packages')
        .doc(packageId)
        .delete()
        .then(() => {
          observer.next(true);
        })
        .catch((error) => {
          observer.error(new Error(error));
        });
    });
  }

  hasOffer(pkg) {
    if (!pkg) {
      return false;
    }

    return pkg.offer_amount < pkg.original_amount;
  }

  showDiscountPercentage(pkg) {
    if (!this.hasOffer(pkg)) {
      return;
    }

    const original_amount = Number(pkg.original_amount);
    const discountPrice = original_amount - Number(pkg.offer_amount);
    const discountPercentage = (discountPrice / original_amount) * 100;

    return Math.floor(discountPercentage + Number.EPSILON).toFixed(0);
  }

  getPopularPackages() {
    return new Observable((observer) => {
      db.collection('/packages').onSnapshot((snapshot) => {
        observer.next(
          snapshot.docs.map((doc) => {
            return Object.assign(doc.data(), { id: doc.id });
          })
        );
      });
    });
  }
}
