import { Component, OnInit, Input } from '@angular/core';
import { Order } from 'src/app/models/order';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
})
export class OrderDetailsPage implements OnInit {

  @Input() public receivedOrders: Order[] = [];

  constructor( private modalController: ModalController ) { }

  ngOnInit() {
  }


  calculateOrderTotal(order: Order) {
    return order ? order.products.reduce((a, b) => a + b.quantity * b.product.price, 0) : 0;
  }

  calculateAllOrdersTotal(orders){
    let total = 0;
    orders.forEach(order => {
      total += order ? order.products.reduce((a, b) => a + b.quantity * b.product.price, 0) : 0;  
    });
    return total;
  }

  async closeModal(action?) {
    await this.modalController.dismiss(
      action
    );
  }

}
