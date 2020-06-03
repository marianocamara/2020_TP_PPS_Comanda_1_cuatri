import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-add-modal',
  templateUrl: './add-modal.page.html',
  styleUrls: ['./add-modal.page.scss'],
})
export class AddModalPage implements OnInit {

  @Input() public product;
  quantity = 1;


  constructor( private modalController: ModalController,
               private database: DatabaseService) { }

  ngOnInit() {
    // console.log ( 'recibo esto: ' + this.product);
  }


  async closeModal(add?) {
    if (add) {
      this.database.publishSomeData({
        foo: this.quantity
      });
      await this.modalController.dismiss(
        {
          productId: this.product.id,
          quantity: this.quantity
        });
    } else {
      await this.modalController.dismiss();
    }
  }

}
