import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { Product } from 'src/app/models/product';
import { take } from 'rxjs/operators';
import { Order, OrderStatus } from 'src/app/models/order';
import { User } from 'src/app/models/user';


@Component({
  selector: 'app-add-modal',
  templateUrl: './add-modal.page.html',
  styleUrls: ['./add-modal.page.scss'],
})
export class AddModalPage implements OnInit {

  @Input() public product: Product;
  @Input() public user: User;
  quantity: number;
  pendingOrder: Order;
  foundProductIndex;


  constructor( private modalController: ModalController,
               private database: DatabaseService,
  ) { }

  ngOnInit() {
    // console.log ( 'recibo esto: ' + this.product);
  }

  ionViewWillEnter() {
    this.quantity = 1;
    this.database.GetPendingOrder(this.user.id).pipe(take(1)).subscribe(order => {
      if (order.length > 0) {
        this.pendingOrder = order[0];
        this.foundProductIndex = this.pendingOrder.products.findIndex(p => p.product.id === this.product.id);
        if (this.foundProductIndex >= 0) {
          this.quantity = this.pendingOrder.products[this.foundProductIndex].quantity;
        }
      }
      else {
        console.log('El user no tiene pedidos pendientes');
      }
    });
  }


  async closeModal(add?) {
    if (add) {
      if (this.pendingOrder) {
        if (this.foundProductIndex >= 0) {
          this.pendingOrder.products[this.foundProductIndex].quantity = this.quantity;
        }
        else {
          this.pendingOrder.products.push({product: this.product, quantity: this.quantity, isPrepared: false });
        }
        this.database.UpdateOne(JSON.parse(JSON.stringify(this.pendingOrder)), 'orders')
        .then( () => {
          console.log('Order updated');
        });
      }
      else {
        // console.log('no hay');
        this.database.GetOne('users', this.user.id)
          .then(user => {
            this.database.CreateOne(JSON.parse(JSON.stringify(
              new Order({
                date: new Date(),
                idClient: user.id,
                products: [{ product: this.product, quantity: this.quantity, isPrepared: false }],
                table: user.table,
                status: OrderStatus.Pending
              }))), 'orders').then(() => {
              });
          })
      }

      // this.database.publishSomeData({
      //   quantity: this.quantity,
      //   productId: this.product.id,
      //   userId: this.userId
      // });
      await this.modalController.dismiss(
        // {
        //   productId: this.product.id,
        //   userId: this.userId,
        //   quantity: this.quantity
        // }
      );
    } else {
      await this.modalController.dismiss();
    }
  }


}
