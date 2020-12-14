import { Component, ElementRef, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../utils/models';
import { UserService } from '../../utils/services/user.service';
import * as _ from 'lodash';
import { AuthService } from 'src/app/utils/services/auth.service';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Select2OptionData } from 'ng-select2';
declare var jQuery: any;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  @ViewChild('userFormModal') userFormModal: ElementRef;
  @ViewChild('deleteUserModal') deleteUserModal: ElementRef;
  @ViewChild('userAddressesModal') userAddressesModal: ElementRef;
  
  emailRegEx =  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  userForm: FormGroup;
  deleteUserId = '';
  users: any;
  rolesArray = [
    'buyer', 'admin'
  ];
  action = 'create';
  loggedInUser: any;
  itemsPerPage = 5;
  currentPage = 1;
  totalItems = 0;
  loading = true;
  addresses = [];
  filterCollapsed = true;
  filter = {
    activated: 'null',
    role: 'null'
  };
  userActivated: Array<Select2OptionData>;
  userRoles: Array<Select2OptionData>;

  public get userId(): any {
    return this.userForm.controls.id;
  }
  public get username(): any {
    return this.userForm.controls.username;
  }
  public get password(): any {
    return this.userForm.controls.password;
  }
  public get firstName(): any {
    return this.userForm.controls.firstName;
  }
  public get lastName(): any {
    return this.userForm.controls.lastName;
  }
  public get roles(): any {
    return this.userForm.controls.roles;
  }
  public get activated(): any {
    return this.userForm.controls.activated;
  }
  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) {
    this.resetFilters();
    this.loggedInUser = this.authService.userValue;
    this.getUsers(this.currentPage);
    this.setFilterValues();
  }

  resetFilters() {
    this.filter = {
      activated: 'null',
      role: 'null'
    };
    this.currentPage = 1;
    this.totalItems = 0;
  }

  showNotFoundSection() {
    return !_.get(this.users, 'length') && !this.loading && this.filter.activated === 'null' && this.filter.role === 'null';
  }

  showNoSearchResultsSection() {
    return !_.get(this.users, 'length') && !this.loading && (this.filter.activated !== 'null' || this.filter.role !== 'null');
  }

  reinitUsers() {
    this.resetFilters();
    this.filterUsers();
  }

  ngOnInit() {
    this.userForm = this.fb.group({
      id: new FormControl(''),
      username: new FormControl('',  [
        Validators.required, 
        Validators.minLength(10), 
        Validators.maxLength(30), 
        Validators.pattern(this.emailRegEx)
      ]),
      firstName: new FormControl('',  [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
      lastName: new FormControl('',  [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
      password: new FormControl('',  [Validators.required, Validators.minLength(6), Validators.maxLength(30)]),
      roles: this.fb.array(['buyer'], [Validators.required]),
      activated: new FormControl('', [Validators.required]),
    });
  }

  filterUsers() {
    this.currentPage = 1;
    this.getUsers(this.currentPage);
  }

  setFilterValues() {
    this.userActivated = [
      {id: 'null', text: '- Select User Activated -'},
      {id: 'true', text: 'Activated'},
      {id: 'false', text: 'Not Activated'},
    ];
    this.userRoles = [
      {id: 'null', text: '- Select User Role -'},
      {id: 'buyer', text: 'Buyer'},
      {id: 'admin', text: 'Admin'},
    ];
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

  onRoleChange(role) {
    this.userForm.get('roles').patchValue([role]);
  }

  getUserObject(user?, addId?) {
    const userObj: User = {
      firstName: _.get(user, 'firstName', ''),
      lastName: _.get(user, 'lastName', ''),
      username: _.get(user, 'username', ''),
      password: _.get(user, 'password', ''),
      authData: _.get(user, 'authData', ''),
      roles: _.get(user, 'roles', ['buyer']),
      activated: _.get(user, 'activated', true),
    };

    if (addId) {
      userObj.id = _.get(user, 'id', '');
    }
    
    return userObj;
  }
  
  onUserFormSubmit() {
    if (this.userForm.invalid) {
      this.toastr.error('Please recheck the form values', 'Validation Failed');
      return;
    }
    this.action === 'create' ? this.createUser() : this.updateUser();
  }

  openCreateModal() {    
    this.action = 'create';
    this.userForm.patchValue(this.getUserObject({}, false));
    this.userForm.get('id').setValidators([]);
    jQuery(this.userFormModal.nativeElement).modal('show');
  }

  openUpdateModal(user) {    
    this.action = 'update';
    this.userForm.patchValue(this.getUserObject(user, true));
    this.userForm.get('id').setValidators([Validators.required]);
    jQuery(this.userFormModal.nativeElement).modal('show');
  }

  openDeleteModal(user) {
    this.action = 'delete';
    this.deleteUserId = _.cloneDeep(user.id);
    jQuery(this.deleteUserModal.nativeElement).modal('show');
  }

  openAddressesModal(user) {
    this.action = 'addresses';
    this.userService.getUserAddress(user.id).subscribe((addresses: any) => {
      this.addresses = addresses;
      jQuery(this.userAddressesModal.nativeElement).modal('show');
    });
  }

  getUsers(currentPage) {
    this.loading = true;
    this.users = [];
    this.totalItems = 0;
    this.userService.getUsers(this.filter).subscribe((response) => {
      this.users = _.filter(response, (u) => {
        return u.id !== this.loggedInUser.id;
      });
      this.totalItems = this.users.length;
      this.currentPage = currentPage;
      this.loading = false; 
    });
  }

  createUser() {
    this.userService.createUser(this.getUserObject(this.userForm.value, false)).subscribe(
      (response) => {
        jQuery(this.userFormModal.nativeElement).modal('hide');
        this.toastr.success('User created successfully!', 'Successful');
        this.reinitUsers();
      }
    );
  }

  updateUser() {
    const restricted = this.userService.restrictedAction('user', 'update');

    if (restricted) {
      this.toastr.error('User updation is restricted in demo site!', 'Failed');
      return false;
    }

    this.userService.updateUser(this.userForm.value).subscribe(
      (response) => {
        jQuery(this.userFormModal.nativeElement).modal('hide');
        this.toastr.success('User updated successfully!', 'Successful');
        this.reinitUsers();
      }
    );
  }

  deleteUser() {
    const restricted = this.userService.restrictedAction('user', 'delete');

    if (restricted) {
      this.toastr.error('User deletion is restricted in demo site!', 'Failed');
      return false;
    }

    this.userService.deleteUser(this.deleteUserId).subscribe(
      (response) => {
        jQuery(this.deleteUserModal.nativeElement).modal('hide');
        this.toastr.success('User deleted successfully!', 'Successful');
        this.reinitUsers();
      }
    );
  }
}