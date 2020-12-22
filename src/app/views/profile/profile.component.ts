import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from 'src/app/utils/services/order.service';
import { UserService } from 'src/app/utils/services/user.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  id = '';
  user: any;
  orders: any;
  wishlist: any;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private orderService: OrderService,
    private location: Location
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');
      this.userService.getUser(this.id).subscribe((user) => {
        this.user = user;
        this.orderService
          .getOrders({ user: this.user.id })
          .subscribe((orders) => {
            this.orders = orders;
          });
      });
    });
  }

  back() {
    this.location.back();
  }
}
