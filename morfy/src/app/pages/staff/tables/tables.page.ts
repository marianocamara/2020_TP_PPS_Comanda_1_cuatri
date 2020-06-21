import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IonItemSliding, LoadingController, NavController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { User } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.page.html',
  styleUrls: ['./tables.page.scss'],
})
export class TablesPage implements OnInit {

  private custormersSub: Subscription;
  isLoading = true;
  user: User;
  inputApproved;
  inputPending;
  activeType;

  customers = [];
  aviableTables = ['1','2','3','4','5','6','7','8','9','10'];
  waitingCustomers = [];
  
  constructor( private loadingCtrl: LoadingController,
    private authService: AuthService,
    public navCtrl: NavController,
    private database: DatabaseService ) { }
    
    ngOnInit() {
      this.isLoading = true;
      this.custormersSub = this.database.GetAll('waiting-list').subscribe(data => {
        this.customers = data;
        this.waitingCustomers = data;
        this.isLoading = false;
      });      
    }
    
    
    ionViewWillEnter() {
      this.isLoading = true;
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
      
      
      goToProfile() {}
      
       
      
      
      confirm(item: IonItemSliding, userId, userApproved) {
        item.close();
        this.loadingCtrl.create({ message: 'Confirmando...' }).then(loadingEl => {
          loadingEl.present();
          this.authService.approveUser(userId, userApproved);
          setTimeout (() => {
            loadingEl.dismiss();
          }, 1000);
        });
      }
      
      
      
      ngOnDestroy() {
        if (this.custormersSub) {
          this.custormersSub.unsubscribe();
        }
      }
      
      
      
}
