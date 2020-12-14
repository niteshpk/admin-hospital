import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {
  @Output() redirectBtnClicked = new EventEmitter();
  @Output() actionButtonEmitter = new EventEmitter();
  @Input() title: string;
  @Input() description: string;
  @Input() showRedirectBtn: boolean;
  @Input() redirectBtnLabel: string;
  @Input() redirectUrl: string;
  @Input() showIcon: boolean;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.title = this.title || 'Oops! Page not found.';
    this.description =
      this.description ||
      'We could not find the page you were looking for. Please click on the button below to return back to home page.';
    this.redirectBtnLabel = this.redirectBtnLabel || 'Return To Home Page';
    this.redirectUrl = this.redirectUrl || '/';
    this.showRedirectBtn = this.showRedirectBtn === undefined ? true : this.showRedirectBtn;
    this.showIcon = this.showIcon === undefined ? true : this.showIcon;
  }

  redirectToUrl() {
    this.redirectBtnClicked.emit();
    this.router.navigateByUrl(this.redirectUrl);
  }
}
