import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../utils/models';
import { ProductService } from '../../utils/services/product.service';
import * as _ from 'lodash';
import { CategoryService } from 'src/app/utils/services/category.service';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Select2OptionData } from 'ng-select2';
declare var jQuery: any;

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  @ViewChild('productFormModal') productFormModal: ElementRef;
  @ViewChild('deleteProductModal') deleteProductModal: ElementRef;
  products: any;
  images: any;
  categories: any;
  action = 'create';
  filter = {
    category: 'null',
    visibility: 'null',
    name: '',
    sortBy: 'name',
    sortOrder: 'asc',
  };
  productForm: FormGroup;
  deleteProductId = '';
  itemsPerPage = 5;
  currentPage = 1;
  totalItems = 0;
  loading = true;
  filterCollapsed = true;
  
  productCategories: Array<Select2OptionData>;
  productVisibilities: Array<Select2OptionData>;

  public get productName(): any {
    return this.productForm.controls.name;
  }

  public get productId(): any {
    return this.productForm.controls.id;
  }

  public get productDescription(): any {
    return this.productForm.controls.description;
  }

  public get productQuantity(): any {
    return this.productForm.controls.quantity;
  }

  public get productPrice(): any {
    return this.productForm.controls.price;
  }

  public get productOldPrice(): any {
    return this.productForm.controls.oldPrice;
  }

  public get productVisibility(): any {
    return this.productForm.controls.visibility;
  }

  public get productCategory(): any {
    return this.productForm.controls.category_id;
  }

  public get productImage(): any {
    return this.productForm.controls.image;
  }

  constructor(
    private toastr: ToastrService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) {
    this.resetFilters();
    this.getCategories();
    this.getProducts(this.currentPage);
  }

  showNotFoundSection() {
    return !_.get(this.products, 'length') && !this.loading && this.filter.category === 'null' && this.filter.visibility === 'null';
  }

  showNoSearchResultsSection() {
    return !_.get(this.products, 'length') && !this.loading && (this.filter.category !== 'null' || this.filter.visibility !== 'null');
  }

  resetFilters() {
    this.filter = {
      category: 'null',
      visibility: 'null',
      name: '',
      sortBy: 'name',
      sortOrder: 'asc',
    };
    this.currentPage = 1;
    this.totalItems = 0;
  }

  reinitProducts() {
    this.resetFilters();
    this.getProducts(this.currentPage);
  }

  ngOnInit() {
    this.productForm = this.fb.group({
      id: new FormControl(''),
      name: new FormControl('',  [Validators.required, Validators.minLength(2)]),
      description: new FormControl('',  [Validators.required, Validators.minLength(2)]),
      image: new FormControl('',  [Validators.required]),
      category_id: new FormControl('',  [Validators.required]),
      price: new FormControl('',  [Validators.required, Validators.min(1), Validators.max(100000)]),
      oldPrice: new FormControl('',  [Validators.required, Validators.min(1), , Validators.max(100000)]),
      quantity: new FormControl('',  [Validators.required, Validators.min(1), Validators.max(1000)]),
      visibility: new FormControl('',  [Validators.required]),
    });
  }

  onProductFormSubmit() {
    if (this.productForm.invalid) {
      this.toastr.error('Please recheck the form values', 'Validation Failed');
      return;
    }
    this.action === 'create' ? this.createProduct() : this.updateProduct();
  }
  
  getCategories() {
    this.categories = [];
    this.categoryService.getCategories().subscribe((response: any) => {
      this.categories = response;
      this.setFilterValues();
    });
  }

  filterProducts() {
    this.currentPage = 1;
    this.getProducts(this.currentPage);
  }

  filterCardToggle() {
    this.filterCollapsed = !this.filterCollapsed;
    if (this.filterCollapsed) {
      this.renderer.addClass(
        document.querySelector('app-root'),
        'collapsed-card'
      );
    } else {
      this.renderer.removeClass(
        document.querySelector('app-root'),
        'collapsed-card'
      );
    }
  }

  setFilterValues() {
    if (this.categories) {
      this.productCategories = this.categories.map(category => {
        return {
          id: category.id,
          text: category.name,
        };
      });
      this.productCategories.unshift({id: 'null', text: '- Select Product Category -'});
    }
    this.productVisibilities = [
      {id: 'null', text: '- Select Product Visibility -'},
      {id: 'true', text: 'Visible'},
      {id: 'false', text: 'Hidden'},
    ];
  }

  getProductObject(product?, addId?) {
    const productObj: Product = {
      name: _.get(product, 'name', ''),
      description: _.get(product, 'description', ''),
      image: _.get(product, 'image', ''),
      price: _.get(product, 'price', null),
      oldPrice: _.get(product, 'oldPrice', null),
      quantity: _.get(product, 'quantity', null),
      category_id: _.get(product, 'category_id', ''),
      visibility: _.get(product, 'visibility', true),
    };

    if (addId) {
      productObj.id = _.get(product, 'id', '');
    }
    
    return productObj;
  }

  openCreateModal() {
    this.action = 'create';
    this.productForm.patchValue(this.getProductObject({}, false));
    this.productForm.get('id').setValidators([]);
    jQuery(this.productFormModal.nativeElement).modal('show');
  }

  openUpdateModal(product) {
    this.action = 'update';
    this.productForm.patchValue(this.getProductObject(product, true));
    this.productForm.get('id').setValidators([Validators.required]);
    jQuery(this.productFormModal.nativeElement).modal('show');
  }

  openDeleteModal(product) {
    this.action = 'delete';
    this.deleteProductId = _.cloneDeep(product.id);
    jQuery(this.deleteProductModal.nativeElement).modal('show');
  }

  getProducts(currentPage) {
    this.loading = true;
    this.products = [];
    this.images = [];
    this.totalItems = 0;
    this.productService.getProducts(this.filter).subscribe((response: any) => {
      this.totalItems = response.length;
      this.currentPage = currentPage;
      this.products = response;
      this.images = _.sortedUniq(_.map(this.products, (p) => p.image));
      this.loading = false;
    });
  }

  createProduct() {
    this.productService.createProduct(this.getProductObject(this.productForm.value, false)).subscribe(
      (response) => {
        jQuery(this.productFormModal.nativeElement).modal('hide');
        this.toastr.success('Product created successfully!', 'Successful');
        this.reinitProducts();
      }
    );
  }

  updateProduct() {
    const restricted = this.productService.restrictedAction('product', 'update');

    if (restricted) {
      this.toastr.error('Product updation is restricted in demo site!', 'Failed');
      return false;
    }
    this.productService.updateProduct(this.productForm.value).subscribe(
      (response) => {
        jQuery(this.productFormModal.nativeElement).modal('hide');
        this.toastr.success('Product updated successfully!', 'Successful');
        this.reinitProducts();
      }
    );
  }

  deleteProduct() {
    const restricted = this.productService.restrictedAction('product', 'delete');

    if (restricted) {
      this.toastr.error('Product deletion is restricted in demo site!', 'Failed');
      return false;
    }

    this.productService.deleteProduct(this.deleteProductId).subscribe(
      (response) => {
        jQuery(this.deleteProductModal.nativeElement).modal('hide');
        this.toastr.success('Product deleted successfully!', 'Successful');
        this.reinitProducts();
      }
    );
  }
}
