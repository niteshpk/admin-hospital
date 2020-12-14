import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './pages/main/main.component';
import { LoginComponent } from './pages/login/login.component';
import { HeaderComponent } from './pages/main/header/header.component';
import { FooterComponent } from './pages/main/footer/footer.component';
import { MenuSidebarComponent } from './pages/main/menu-sidebar/menu-sidebar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './views/profile/profile.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { ToastrModule } from 'ngx-toastr';
import { MessagesDropdownMenuComponent } from './pages/main/header/messages-dropdown-menu/messages-dropdown-menu.component';
import { NotificationsDropdownMenuComponent } from './pages/main/header/notifications-dropdown-menu/notifications-dropdown-menu.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import {NgxPaginationModule} from 'ngx-pagination';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import { UserDropdownMenuComponent } from './pages/main/header/user-dropdown-menu/user-dropdown-menu.component';
import { CategoriesComponent } from './views/categories/categories.component';
import { ProductsComponent } from './views/products/products.component';
import { UsersComponent } from './views/users/users.component';
import { OrdersComponent } from './views/orders/orders.component';
import { EllipsisPipe } from './utils/pipes/ellipsis.pipe';
import { OrderDetailsComponent } from './views/orders/order-details/order-details.component';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { LoaderComponent } from './views/loader/loader.component';
import { DateAgoPipe } from './utils/pipes/date-ago.pipe';
import { NgSelect2Module } from 'ng-select2';

registerLocaleData(localeEn, 'en-EN');

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
    HeaderComponent,
    FooterComponent,
    MenuSidebarComponent,
    ProfileComponent,
    DashboardComponent,
    MessagesDropdownMenuComponent,
    NotificationsDropdownMenuComponent,
    UserDropdownMenuComponent,
    CategoriesComponent,    
    ProductsComponent,
    UsersComponent,
    OrdersComponent,
    EllipsisPipe,
    OrderDetailsComponent,
    NotFoundComponent,
    LoaderComponent,
    DateAgoPipe,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgSelect2Module,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    NgbModule,
    FormsModule,
    NgxPaginationModule
  ],
  providers: [EllipsisPipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
