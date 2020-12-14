import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from 'src/app/utils/services/category.service';
import * as _ from 'lodash';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Select2OptionData } from 'ng-select2';
declare var jQuery: any;

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  @ViewChild('categoryFormModal') categoryFormModal: ElementRef;
  @ViewChild('deleteCategoryModal') deleteCategoryModal: ElementRef;
  categoryForm: FormGroup;
  categories: any;
  action = 'create';
  deleteCategoryId = '';
  itemsPerPage = 5;
  currentPage = 1;
  totalItems = 0;
  loading = true;
  filterCollapsed = true;
  filter = {
    visibility: 'null'
  };
  categoryVisibilities: Array<Select2OptionData>;

  public get categoryName(): any {
    return this.categoryForm.controls.name;
  }

  public get categoryId(): any {
    return this.categoryForm.controls.id;
  }

  public get categoryVisibility(): any {
    return this.categoryForm.controls.visibility;
  }

  constructor(
    private toastr: ToastrService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) {
    this.resetFilters();
    this.getCategories(this.currentPage);
    this.setFilterValues();
  }

  resetFilters() {
    this.filter = {
      visibility: 'null'
    };
    this.currentPage = 1;
    this.totalItems = 0;
  }

  showNotFoundSection() {
    return !_.get(this.categories, 'length') && !this.loading && this.filter.visibility === 'null';
  }

  showNoSearchResultsSection() {
    return !_.get(this.categories, 'length') && !this.loading && this.filter.visibility !== 'null';
  }

  reinitCategories() {
    this.resetFilters();
    this.filterCategories();
  }

  setFilterValues() {
    this.categoryVisibilities = [
      {id: 'null', text: '- Select Category Visibility -'},
      {id: 'true', text: 'Visible'},
      {id: 'false', text: 'Hidden'},
    ];
  }

  ngOnInit() {
    this.categoryForm = this.fb.group({
      id: new FormControl(''),
      name: new FormControl('',  [Validators.required, Validators.minLength(2)]),
      visibility: new FormControl('',  [Validators.required]),
    });
  }

  filterCategories() {
    this.currentPage = 1;
    this.getCategories(this.currentPage);
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

  onCategoryFormSubmit() {
    if (this.categoryForm.invalid) {
      this.toastr.error('Please recheck the form values', 'Validation Failed');
      return;
    }
    this.action === 'create' ? this.createCategory() : this.updateCategory();
  }

  getCategoryObject(category?, addId?) {
    const categoryObj: any = {
      name: _.get(category, 'name', ''),
      visibility: _.get(category, 'visibility', true),
    };

    if (addId) {
      categoryObj.id = _.get(category, 'id', '');
    }
    
    return categoryObj;
  }

  openCreateModal() {
    this.action = 'create';
    this.categoryForm.patchValue(this.getCategoryObject({}, false));
    this.categoryForm.get('id').setValidators([]);
    jQuery(this.categoryFormModal.nativeElement).modal('show');
  }

  openUpdateModal(category) {
    this.action = 'update';
    this.categoryForm.patchValue(this.getCategoryObject(category, true));
    this.categoryForm.get('id').setValidators([Validators.required]);
    jQuery(this.categoryFormModal.nativeElement).modal('show');
  }

  openDeleteModal(category) {
    this.action = 'delete';
    this.deleteCategoryId = _.cloneDeep(category.id);
    jQuery(this.deleteCategoryModal.nativeElement).modal('show');
  }

  getCategories(currentPage) {
    this.loading = true;
    this.categories = [];
    this.totalItems = 0;
    this.categoryService.getCategories(this.filter).subscribe((response: any) => {
      this.totalItems = response.length;
      this.currentPage = currentPage;
      this.categories = response;
      this.loading = false;
    });
  }

  createCategory() {
    this.categoryService.createCategory(this.getCategoryObject(this.categoryForm.value, false)).subscribe(
      (response) => {
        jQuery(this.categoryFormModal.nativeElement).modal('hide');
        this.toastr.success('Category created successfully!', 'Successful');
        this.reinitCategories();
      }
    );
  }

  updateCategory() {
    const restricted = this.categoryService.restrictedAction('category', 'update');

    if (restricted) {
      this.toastr.error('Category updation is restricted in demo site!', 'Failed');
      return false;
    }
    
    this.categoryService.updateCategory(_.cloneDeep(this.categoryForm.value)).subscribe(
      (response) => {
        jQuery(this.categoryFormModal.nativeElement).modal('hide');
        this.toastr.success('Category updated successfully!', 'Successful');
        this.reinitCategories();
      }
    );
  }

  deleteCategory() {
    const restricted = this.categoryService.restrictedAction('category', 'delete');

    if (restricted) {
      this.toastr.error('Category deletion is restricted in demo site!', 'Failed');
      return false;
    }

    this.categoryService.deleteCategory(this.deleteCategoryId).subscribe(
      (response) => {
        jQuery(this.deleteCategoryModal.nativeElement).modal('hide');
        this.toastr.success('Category deleted successfully!', 'Successful');
        this.reinitCategories();
      }
    );
  }
}
