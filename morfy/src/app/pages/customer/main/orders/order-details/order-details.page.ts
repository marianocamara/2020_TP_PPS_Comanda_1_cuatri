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
  selected = '0';
  total = 0;
  totalWithTip;

  constructor( private modalController: ModalController ) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.calculateAllOrdersTotal(this.receivedOrders);
    this.totalWithTip = this.total;
  }


  calculateOrderTotal(order: Order) {
    return order ? order.products.reduce((a, b) => a + b.quantity * b.product.price, 0) : 0;
  }

  calculateAllOrdersTotal(orders){
    orders.forEach(order => {
      this.total += order ? order.products.reduce((a, b) => a + b.quantity * b.product.price, 0) : 0;  
    });
  }

  async closeModal(action?) {
    await this.modalController.dismiss(
      action
    );
  }

  tip(amount){
    this.totalWithTip = 0;
    this.selected = amount;
    this.totalWithTip += Math.round(this.total * amount / 100);
    this.totalWithTip += this.total;
  }

}
