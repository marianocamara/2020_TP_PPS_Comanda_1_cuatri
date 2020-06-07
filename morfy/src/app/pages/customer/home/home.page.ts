import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddModalPage } from './add-modal/add-modal.page';
import { Subscription } from 'rxjs';
import { Product, Category } from 'src/app/models/product';
import { DatabaseService } from 'src/app/services/database.service';
import { Plugins } from '@capacitor/core';
import { User } from 'src/app/models/user';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  types = Object.keys(Category);
  public received: any;
  private productsSub: Subscription;
  isLoading = false;
  products: Product[] = [];
  featured = [];
  drinks = [];
  filteredProducts: Product[] = [];
  user: User;


  constructor( private modalController: ModalController,
               private database: DatabaseService ) { }

  ngOnInit() {
    this.isLoading = true;
    this.productsSub = this.database.GetAll('products').subscribe(products => {
      this.products = products;
      console.log(this.products);
      this.featured = this.products.filter(product => product.category.includes(Category.Featured));
      this.filterProducts('principal');
      this.drinks = this.products.filter(product => product.category.includes(Category.Bebida));
      this.isLoading = false;
    });
  }


  ionViewWillEnter() {
    Plugins.Storage.get({ key: 'user-bd' }).then(
      (userData) => {
        if (userData.value) {
          this.user = JSON.parse(userData.value);
        }
        else {
          this.user = null;
          // this.logout();
        }
      }, () => {
        // this.logout();
      }
    );
  }


  filterProducts(type: string) {
    this.filteredProducts = this.products.filter(product => product.category.includes(type.toLowerCase() as Category));
  }


  async openAddModal(selectedProduct) {
    const modal = await this.modalController.create({
      component: AddModalPage,
      cssClass: 'add-product-modal',
      componentProps: {
        product: selectedProduct,
        userId: this.user.id
      }
    });
    modal.onWillDismiss().then(dataReturned => {
      // trigger when about to close the modal
      this.received = dataReturned.data;
      // console.log('Receive: ', this.received);
    });
    return await modal.present().then(_ => {
      // triggered when opening the modal
      // console.log('Sending: ', selectedProduct);
    });
  }


  ngOnDestroy() {
    if (this.productsSub) {
      this.productsSub.unsubscribe();
    }
  }


}
