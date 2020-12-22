import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './views/profile/profile.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { AuthGuard } from './utils/guards/auth.guard';
import { NonAuthGuard } from './utils/guards/non-auth.guard';
import { CategoriesComponent } from './views/categories/categories.component';
import { ProductsComponent } from './views/products/products.component';
import { UsersComponent } from './views/users/users.component';
import { OrdersComponent } from './views/orders/orders.component';
import { OrderDetailsComponent } from './views/orders/order-details/order-details.component';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { PackagesComponent } from './views/packages/packages.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'profile/:id',
        component: ProfileComponent,
      },
      {
        path: 'categories',
        component: CategoriesComponent,
      },
      {
        path: 'products',
        component: ProductsComponent,
      },
      {
        path: 'users',
        component: UsersComponent,
      },
      {
        path: 'orders/:orderId',
        component: OrderDetailsComponent,
      },
      {
        path: 'orders',
        component: OrdersComponent,
      },
      {
        path: 'packages',
        component: PackagesComponent,
      },
      {
        path: '',
        component: DashboardComponent,
      },
    ],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NonAuthGuard],
  },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
