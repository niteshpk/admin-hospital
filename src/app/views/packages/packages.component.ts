import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Package } from '../../utils/models';
import { PackageService } from '../../utils/services/package.service';
import * as _ from 'lodash';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Select2OptionData } from 'ng-select2';
declare var jQuery: any;

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
})
export class PackagesComponent implements OnInit {
  @ViewChild('packageFormModal') packageFormModal: ElementRef;
  @ViewChild('deletePackageModal') deletePackageModal: ElementRef;
  packages: any;
  images: any;
  action = 'create';
  filter = {
    visibility: 'null',
    name: '',
    sortBy: 'name',
    sortOrder: 'asc',
  };
  packageForm: FormGroup;
  deletePackageId = '';
  itemsPerPage = 5;
  currentPage = 1;
  totalItems = 0;
  loading = true;
  filterCollapsed = true;

  packageVisibilities: Array<Select2OptionData>;

  public get packageName(): any {
    return this.packageForm.controls.name;
  }

  public get packageId(): any {
    return this.packageForm.controls.id;
  }

  public get packageDescription(): any {
    return this.packageForm.controls.description;
  }

  public get packageNoOfDays(): any {
    return this.packageForm.controls.no_of_days;
  }

  public get packageOfferAmount(): any {
    return this.packageForm.controls.offer_amount;
  }

  public get packageOriginalAmount(): any {
    return this.packageForm.controls.original_amount;
  }

  public get packageVisibility(): any {
    return this.packageForm.controls.visibility;
  }

  public get packageImage(): any {
    return this.packageForm.controls.image;
  }

  constructor(
    private toastr: ToastrService,
    private pkgService: PackageService,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) {
    this.resetFilters();
    this.setFilterValues();
    this.getPackages(this.currentPage);
  }

  showNotFoundSection() {
    return (
      !_.get(this.packages, 'length') &&
      !this.loading &&
      this.filter.visibility === 'null'
    );
  }

  showNoSearchResultsSection() {
    return (
      !_.get(this.packages, 'length') &&
      !this.loading &&
      this.filter.visibility !== 'null'
    );
  }

  resetFilters() {
    this.filter = {
      visibility: 'null',
      name: '',
      sortBy: 'name',
      sortOrder: 'asc',
    };
    this.currentPage = 1;
    this.totalItems = 0;
  }

  reinitPackages() {
    this.resetFilters();
    this.getPackages(this.currentPage);
  }

  ngOnInit() {
    this.packageForm = this.fb.group({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      image: new FormControl('', []), // Validators.required
      offer_amount: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(100000),
      ]),
      original_amount: new FormControl('', [
        Validators.required,
        Validators.min(1),
        ,
        Validators.max(100000),
      ]),
      no_of_days: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(1000),
      ]),
      visibility: new FormControl('', [Validators.required]),
    });
  }

  onPackageFormSubmit() {
    if (this.packageForm.invalid) {
      this.toastr.error('Please recheck the form values', 'Validation Failed');
      return;
    }
    this.action === 'create' ? this.createPackage() : this.updatePackage();
  }

  filterPackages() {
    this.currentPage = 1;
    this.getPackages(this.currentPage);
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
    this.packageVisibilities = [
      { id: 'null', text: '- Select Package Visibility -' },
      { id: 'true', text: 'Visible' },
      { id: 'false', text: 'Hidden' },
    ];
  }

  getPackageObject(pkg?, addId?) {
    const pkgObj: Package = {
      name: _.get(pkg, 'name', ''),
      description: _.get(pkg, 'description', ''),
      image: _.get(pkg, 'image', ''),
      original_amount: _.get(pkg, 'original_amount', null),
      offer_amount: _.get(pkg, 'offer_amount', null),
      no_of_days: _.get(pkg, 'no_of_days', null),
      visibility: _.get(pkg, 'visibility', true),
    };

    if (addId) {
      pkgObj.id = _.get(pkg, 'id', '');
    }

    return pkgObj;
  }

  openCreateModal() {
    this.action = 'create';
    this.packageForm.patchValue(this.getPackageObject({}, false));
    this.packageForm.get('id').setValidators([]);
    jQuery(this.packageFormModal.nativeElement).modal('show');
  }

  openUpdateModal(pkg) {
    this.action = 'update';
    this.packageForm.patchValue(this.getPackageObject(pkg, true));
    this.packageForm.get('id').setValidators([Validators.required]);
    jQuery(this.packageFormModal.nativeElement).modal('show');
  }

  openDeleteModal(pkg) {
    this.action = 'delete';
    this.deletePackageId = _.cloneDeep(pkg.id);
    jQuery(this.deletePackageModal.nativeElement).modal('show');
  }

  getPackages(currentPage) {
    this.loading = true;
    this.packages = [];
    this.images = [];
    this.totalItems = 0;
    this.pkgService.getPackages(this.filter).subscribe((response: any) => {
      this.totalItems = response.length;
      this.currentPage = currentPage;
      this.packages = response;
      this.images = _.sortedUniq(_.map(this.packages, (p) => p.image));
      this.loading = false;
    });
  }

  createPackage() {
    this.pkgService
      .createPackage(this.getPackageObject(this.packageForm.value, false))
      .subscribe((response) => {
        jQuery(this.packageFormModal.nativeElement).modal('hide');
        this.toastr.success('Package created successfully!', 'Successful');
        this.reinitPackages();
      });
  }

  updatePackage() {
    const restricted = this.pkgService.restrictedAction('pkg', 'update');

    if (restricted) {
      this.toastr.error(
        'Package updation is restricted in demo site!',
        'Failed'
      );
      return false;
    }
    this.pkgService
      .updatePackage(this.packageForm.value)
      .subscribe((response) => {
        jQuery(this.packageFormModal.nativeElement).modal('hide');
        this.toastr.success('Package updated successfully!', 'Successful');
        this.reinitPackages();
      });
  }

  deletePackage() {
    const restricted = this.pkgService.restrictedAction('pkg', 'delete');

    if (restricted) {
      this.toastr.error(
        'Package deletion is restricted in demo site!',
        'Failed'
      );
      return false;
    }

    this.pkgService
      .deletePackage(this.deletePackageId)
      .subscribe((response) => {
        jQuery(this.deletePackageModal.nativeElement).modal('hide');
        this.toastr.success('Package deleted successfully!', 'Successful');
        this.reinitPackages();
      });
  }
}
