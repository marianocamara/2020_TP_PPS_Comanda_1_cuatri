import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IonItemSliding, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { User, Status } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';
import { table } from 'console';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.page.html',
  styleUrls: ['./tables.page.scss'],
})
export class TablesPage implements OnInit {

  private custormersSub: Subscription;
  private userSub: Subscription;
  isLoading = true;
  user: User;
  inputPending;
  activeType;
  segment: String;
  userTableAssigned : User[];
  customers = [];
  aviableTables = ['1','2','3','4','5','6','7','8','9','10'];
  waitingCustomers = [];

  tablesInUse = [];
  
  constructor( private loadingCtrl: LoadingController,
    private authService: AuthService,
    public navCtrl: NavController,
    private database: DatabaseService,
    public toastController: ToastController) { }
    
    ngOnInit() {
      this.isLoading = true;
      this.custormersSub = this.database.GetAll('waiting-list').subscribe(data => {
        this.customers = data;
        this.waitingCustomers = data;
        this.isLoading = false;
      });      

      this.userSub = this.database.GetAll('users').subscribe(
        data => {
          this.userTableAssigned = data.filter(data => data.status !== 'undefined' && (
            data.status === Status.Recent_Sit || 
            data.status === Status.Waiting_Account ||
            data.status === Status.Waiting_Order ||
            data.status === Status.Preparing_Order ||
            data.status === Status.Eating ||
            data.status === Status.Waiting_Table
          ) && data.table !== 'undefined' && data.table !== "" && data.table !== null
          );//.map(x => { return x.table, x.id, x.imageUrl, x.name; });

          this.tablesInUse = data.filter(data => data.status !== 'undefined' && (
            data.status === Status.Recent_Sit || 
            data.status === Status.Waiting_Account ||
            data.status === Status.Waiting_Order ||
            data.status === Status.Preparing_Order ||
            data.status === Status.Eating ||
            data.status === Status.Waiting_Table
          )).map(x => x.table);
          this.tablesInUse = this.tablesInUse.filter(function (el) {
            return el != null;
          });

          this.aviableTables = this.aviableTables.filter( data => !this.tablesInUse.includes(data)  );

        });
    }
    
    onChange(userId, tableAssigned){
      this.presentToast("¿Asignar mesa número " + tableAssigned + "?", userId, tableAssigned);
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
      
      // confirm(item: IonItemSliding, userId, tableAssigned) {
      //   //item.close();
      //   item.close();
      //   this.presentToast("¿Asignar mesa número " + tableAssigned + "?", userId, tableAssigned);
      // }
      
      assingTable(userId, tableAssigned){   
        this.database.UpdateSingleField('table', tableAssigned, 'users', userId)
        .then(() =>
          this.database.DeleteOne(userId, "waiting-list").then(() => this.presentToastMessage("La mesa número " + tableAssigned + " fue asignada con exito."))
        ).catch(() => 
          this.presentToastMessage("Ocurrió un error. Por favor, reintente más tarde.")
        );

      }

      async presentToastMessage(message: string) {
        const toast = await this.toastController.create({
          message,
          duration: 3000
        });
        toast.present();
      }

      async presentToast(message: string, userId, tableAssigned) {
        const toast = await this.toastController.create({
          message,
          duration: 5000,
          buttons: [
            {
              text: 'OK',
              handler: (): void => { 
                this.assingTable(userId, tableAssigned);  
                console.log('button ok'); 
              }
            },
            {   
              text: 'Cancelar',
              role: 'cancel'
            }
          ]
        });
        toast.present();
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
            
      
      
      ngOnDestroy() {
        if (this.custormersSub) {
          this.custormersSub.unsubscribe();
        }
        if (this.userSub){
          this.userSub.unsubscribe();
        }
      }
      
      
      
}
