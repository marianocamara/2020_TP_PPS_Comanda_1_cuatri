import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';
import { Plugins } from '@capacitor/core';
import { NavController, ModalController } from '@ionic/angular';
import { AddModalPage } from './add-modal/add-modal.page';
import { Subscription } from 'rxjs';
import { Product, Category } from 'src/app/models/product';
import { DatabaseService } from 'src/app/services/database.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit, OnDestroy {
  
  user: User;
  products: Product[] = [];
  types = Object.keys(Category);
  private productsSub: Subscription;
  isLoading = false;
  featured = [];
  drinks = [];
  filteredProducts: Product[] = [];
  
  // types = [
  //   'principal', '/',
  //   'postres', '/',
  //   'desayuno', '/',
  //   'pastas', '/',
  //   'sandwiches', '/',
  //   'acompañamientos', '/',
  //   'pizzas'
  // ];
  
  
  constructor(  public navCtrl: NavController,
    private authService: AuthService,
    private modalController: ModalController,
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
      
      Plugins.Storage.get({ key: 'user-bd' }).then(
        (userData) => {
          if (userData.value) {
            this.user = JSON.parse(userData.value);
          }
          else {
            this.logout();
          }
        }, () => {
          this.logout();
        }
        );
        
      }
      
      
      ionViewWillEnter() {
        Plugins.Storage.get({ key: 'user-bd' }).then(
          (userData) => {
            if (userData.value) {
              this.user = JSON.parse(userData.value);
            }
            else {
              this.logout();
            }
          }, () => {
            this.logout();
          }
          );
        }
        
        
        logout() {
          this.authService.logoutUser()
          .then(res => {
            // console.log(res);
            this.navCtrl.navigateBack('');
          })
          .catch(error => {
            console.log(error);
          });
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
            // this.received = dataReturned.data;
            // console.log('Receive: ', this.received);
          });
          return await modal.present().then(_ => {
            // triggered when opening the modal
            // console.log('Sending: ', selectedProduct);
          });
        }
        
        newChat(){
          
          this.database.GetOne('enquiries', this.user.id)
          .then( (enquiry) => {
            if (enquiry) {
              this.navCtrl.navigateForward('/chat/chat-detail/'+this.user.id);
            }else{
              //create chat
              let enquiry = {
                id: this.user.id,
                clientName: this.user.name,
                clientTable: this.user.table,
                clientImg: this.user.imageUrl,
                messages: [],   
                msgCount: 0
              };
              this.database.CreateOne(enquiry, 'enquiries');          
              this.navCtrl.navigateForward('/chat/chat-detail/'+this.user.id);
            }
          });
        }
        
        
        
        ngOnDestroy() {
          if (this.productsSub) {
            this.productsSub.unsubscribe();
          }
        }
        
        
      }