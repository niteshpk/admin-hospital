import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {Location} from '@angular/common';
import { OrderService } from 'src/app/utils/services/order.service';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
declare var jQuery: any;

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('deleteOrderModal') deleteOrderModal: ElementRef;
  private routeParamSubscription: any;
  public orderId: string;
  public order: any;
  loading = true;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService,
    private location: Location
    ) { }

  ngOnDestroy() {
    this.routeParamSubscription.unsubscribe();
  }

  print() {
    window.print();
  }

  back() {
    this.location.back();
  }

  ngOnInit(): void {
    this.routeParamSubscription = this.route.params.subscribe((params) => {
      this.orderId = params.orderId;
      this.orderService.getOrder(this.orderId).subscribe(
        (response: any) => {
          if (typeof(response) === 'string') {
            this.loading = false;
            return false;
          }
          this.order = response;
          this.loading = false;
        },
        (error) => {
          this.handleError(error);
        }
      );
    });
  }
  
  openDeleteModal() {
    jQuery(this.deleteOrderModal.nativeElement).modal('show');
  }
  
  deleteOrder() {
    const restricted = this.orderService.restrictedAction('order', 'delete');

    if (restricted) {
      this.toastr.error('Order deletion is restricted in demo site!', 'Failed');
      return false;
    }

    this.orderService.deleteOrder(this.orderId).subscribe(
      (response) => {
        jQuery(this.deleteOrderModal.nativeElement).modal('hide');
        this.toastr.success('Order deleted successfully!', 'Successful');
        this.router.navigateByUrl('/orders');
      }
    );
  }

  handleError(response) {
    const errorMessage = response.error || response.message;
    alert(errorMessage);
    console.log('Error:', response);
  }
}
