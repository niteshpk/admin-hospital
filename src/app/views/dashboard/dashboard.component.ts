import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/utils/services/dashboard.service';
import { OrderService } from 'src/app/utils/services/order.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  categoriesCount: any;
  ordersCount: any;
  usersCount: any;
  productsCount: any;
  ordersCountLoading = true;
  productsCountLoading = true;
  usersCountLoading = true;
  categoriesCountLoading = true;
  orders: any;

  constructor(
    private dashboardService: DashboardService,
    private orderService: OrderService,
  ) {}

  ngOnInit() {
    this.dashboardService.getOrdersCount().subscribe((response) => {
      this.ordersCount = response;
      this.ordersCountLoading = false;
    });
    this.dashboardService.getProductsCount().subscribe((response) => {
      this.productsCount = response;
      this.productsCountLoading = false;
    });
    this.dashboardService.getUsersCount().subscribe((response) => {
      this.usersCount = response;
      this.usersCountLoading = false;
    });
    this.dashboardService.getCategoriesCount().subscribe((response) => {
      this.categoriesCount = response;
      this.categoriesCountLoading = false;
    });
    this.orderService.getOrders().subscribe((orders) => {
      this.orders = _.slice(orders, 0, 5);
    });
  }
}
