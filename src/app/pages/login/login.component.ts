import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/utils/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  public loginForm: FormGroup;
  public isAuthLoading = false;
  returnUrl: string;
  emailRegEx = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  public get username(): any {
    return this.loginForm.controls.username;
  }

  public get password(): any {
    return this.loginForm.controls.password;
  }

  constructor(
    private renderer: Renderer2,
    private toastr: ToastrService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // redirect to home if already logged in
    if (this.authService.userValue) {
      this.router.navigate(['/']);
    }
    this.renderer.addClass(document.querySelector('app-root'), 'login-page');
    this.loginForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(30),
        Validators.pattern(this.emailRegEx),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(30),
      ]),
    });
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';

    this.loginForm.patchValue({
      username: 'admin@hospital.com',
      password: 'test@123',
    });
  }

  login() {
    if (this.loginForm.invalid) {
      this.toastr.error(
        'Please check the username and password.',
        'Invalid Credentials!'
      );
      return;
    }
    this.isAuthLoading = true;
    this.authService.login(this.username.value, this.password.value).subscribe(
      (data) => {
        this.isAuthLoading = false;
        if (typeof data === 'string') {
          this.toastr.error(data, 'Failed');
          return false;
        }
        this.toastr.success('Login successfully!', 'Successful');
        this.router.navigate([this.returnUrl]);
      },
      (error) => {
        this.toastr.error(error.getMessage(), 'Failed');
        console.log(error);
        alert(error);
      }
    );
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.querySelector('app-root'), 'login-page');
  }
}
