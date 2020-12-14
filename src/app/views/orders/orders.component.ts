import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from '../../utils/services/order.service';
import * as _ from 'lodash';
import { Select2OptionData } from 'ng-select2';
import { UserService } from 'src/app/utils/services/user.service';
declare var jQuery: any;

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  @ViewChild('userModal') userModal: ElementRef;
  @ViewChild('paymentModal') paymentModal: ElementRef;
  @ViewChild('productModal') productModal: ElementRef;
  @ViewChild('changeStatusModal') changeStatusModal: ElementRef;
  @ViewChild('deleteOrderModal') deleteOrderModal: ElementRef;
  orders: any;
  user: any;
  order: any;
  newOrderStatus = '';
  newPaymentStatus = '';
  roles = ['buyer', 'admin'];
  action = 'create';
  loading = true;
  orderStatusesMap = {
    Pending: ['Confirmed', 'Cancelled'],
    Confirmed: ['Pending', 'Delivered', 'Cancelled'],
    Cancelled: [],
    Delivered: [],
  };
  paymentStatusesMap = {
    Pending: ['Received', 'Cancelled'],
    Received: ['Pending', 'Refunded', 'Cancelled'],
    Refunded: ['Pending', 'Received', 'Cancelled'],
    Cancelled: ['Pending', 'Received', 'Cancelled'],
  };
  changeOrderStatuses = [];
  changePaymentStatuses = [];
  itemsPerPage = 5;
  currentPage = 1;
  totalItems = 0;
  users: Array<Select2OptionData>;
  orderStatuses: Array<Select2OptionData>;
  paymentStatuses: Array<Select2OptionData>;
  filterCollapsed = true;
  filter = {
    user: 'null',
    order_status: 'null',
    payment_status: 'null',
  };

  constructor(
    private toastr: ToastrService,
    private userService: UserService,
    private orderService: OrderService,
    private renderer: Renderer2
  ) {
    this.resetFilters();
    this.order = this.getOrderObject();
    this.getOrders(this.currentPage);
    this.setFilterValues();
  }

  reinitOrders() {
    this.resetFilters();
    this.getOrders(this.currentPage);
  }

  resetFilters() {
    this.filter = {
      user: 'null',
      order_status: 'null',
      payment_status: 'null',
    };
    this.currentPage = 1;
    this.totalItems = 0;
  }

  showNotFoundSection() {
    return (
      !_.get(this.orders, 'length') &&
      !this.loading &&
      this.filter.user === 'null' &&
      this.filter.order_status === 'null' &&
      this.filter.payment_status === 'null'
    );
  }

  showNoSearchResultsSection() {
    return (
      !_.get(this.orders, 'length') &&
      !this.loading &&
      (this.filter.user !== 'null' ||
        this.filter.order_status !== 'null' ||
        this.filter.payment_status !== 'null')
    );
  }

  setFilterValues() {
    this.userService.getBuyerUsers().subscribe((users) => {
      this.users = _.map(users, (user) => {
        return {
          id: user.id,
          text: `${user.firstName} ${user.lastName}`,
        };
      });
      this.users.unshift({ id: 'null', text: '- Select User -' });
    });
    this.orderStatuses = ['Pending', 'Confirmed', 'Delivered', 'Cancelled'].map(
      (status) => {
        return {
          id: status,
          text: status,
        };
      }
    );
    this.orderStatuses.unshift({ id: 'null', text: '- Select Order Status -' });
    this.paymentStatuses = ['Pending', 'Received', 'Refunded', 'Cancelled'].map(
      (status) => {
        return {
          id: status,
          text: status,
        };
      }
    );
    this.paymentStatuses.unshift({
      id: 'null',
      text: '- Select Payment Status -',
    });
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

  filterOrders() {
    this.currentPage = 1;
    this.getOrders(this.currentPage);
  }

  getOrderObject(order?, addId?) {
    const orderObj: any = {
      user_id: _.get(order, 'user_id', ''),
      status: _.get(order, 'status', ''),
      order_amount: _.get(order, 'order_amount', ''),
      discount_amount: _.get(order, 'discount_amount', ''),
      sub_total: _.get(order, 'sub_total', ''),
      payment_method: _.get(order, 'payment_method', ''),
      payment_status: _.get(order, 'payment_status', ''),
      created_on: _.get(order, 'created_on', ''),
    };

    if (addId) {
      orderObj.id = _.get(order, 'id', '');
    }

    return orderObj;
  }

  openCustomerModal(order) {
    this.action = 'customer_details';
    this.order = _.cloneDeep(order);
    jQuery(this.userModal.nativeElement).modal('show');
  }

  openUpdateStatusModal(order) {
    this.action = 'update_status';
    this.newOrderStatus = '';
    this.newPaymentStatus = '';
    this.order = _.cloneDeep(order);
    this.changeOrderStatuses = this.orderStatusesMap[order.status];
    this.changePaymentStatuses = this.paymentStatusesMap[order.payment_status];
    jQuery(this.changeStatusModal.nativeElement).modal('show');
  }

  openProductModal(order) {
    this.action = 'product_details';
    this.order = _.cloneDeep(order);
    jQuery(this.productModal.nativeElement).modal('show');
  }

  getOrders(currentPage) {
    this.loading = true;
    this.orders = [];
    this.totalItems = 0;
    this.orderService.getOrders(this.filter).subscribe((response: any) => {
      this.orders = response;
      this.totalItems = response.length;
      this.currentPage = currentPage;
      this.loading = false;
    });
  }

  updateStatus() {
    const order = this.getOrderObject(this.order, true);
    order.status =
      this.newOrderStatus && this.newOrderStatus
        ? this.newOrderStatus
        : order.status;
    order.payment_status = this.newPaymentStatus
      ? this.newPaymentStatus
      : order.payment_status;
    this.orderService.updateOrder(order).subscribe((response) => {
      this.newOrderStatus = '';
      this.newPaymentStatus = '';
      this.getOrders(this.currentPage);
      this.toastr.success('Order status changed successfully', 'Successful');
      jQuery(this.changeStatusModal.nativeElement).modal('hide');
    });
  }

  ngOnInit() {}
}
