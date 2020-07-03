import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IonItemSliding, LoadingController, NavController, ToastController, AlertController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { User, Status } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';

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
  segment = 'pending';
  userTableAssigned : User[];
  customers = [];
  aviableTables = ['1','2','3','4','5','6','7','8','9','10'];
  waitingCustomers = [];

  tablesInUse = [];
  
  constructor( private loadingCtrl: LoadingController,
    private authService: AuthService,
    public navCtrl: NavController,
    private database: DatabaseService,
    public toastController: ToastController,
    public alertController: AlertController) { }
    
    ngOnInit() {
      this.isLoading = true;
      this.custormersSub = this.database.GetAll('waiting-list').subscribe(data => {
        this.customers = data;
        this.waitingCustomers = data;
        this.isLoading = false;
      });      

      this.userSub = this.database.GetAll('users').subscribe(
        data => {
          this.userTableAssigned = data.filter(data => 
          data.status !== undefined && 
          data.status !== 'undefined' && 
          (
            data.status === Status.Recent_Enter || 
            data.status === Status.Waiting_Table
          ) && 
          data.table !== "" && 
          data.table !== null &&
          data.table != null && 
          data.table !== '' &&
          data.table !== " " &&  
          (data.type === 'cliente' || data.type === 'anonimo')
          );

          this.tablesInUse = data.filter(data => 
            data.status !== undefined && 
            data.status !== 'undefined' && 
            (
              data.status === Status.Recent_Enter || 
              data.status === Status.Waiting_Table
            ) && 
            data.table !== "" && 
            data.table !== null && 
            data.table != null && 
            data.table !== '' &&
            data.table !== " " &&  
            (data.type === 'cliente' || data.type === 'anonimo')
            ).map(x => x.table);
          this.tablesInUse = this.tablesInUse.filter(function (el) {
            return el != null;
          });

          this.aviableTables = this.aviableTables.filter( data => !this.tablesInUse.includes(data)  );
          this.userTableAssigned = this.userTableAssigned.sort((a, b) => (a.table as any) - (b.table as any));
          console.log(this.userTableAssigned);
        });
    }
    
    // onChange(userId, tableAssigned){
    //   this.presentToast("¿Asignar mesa número " + tableAssigned + "?", userId, tableAssigned);
    // }
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

      // async presentToast(message: string, userId, tableAssigned) {
      //   const toast = await this.toastController.create({
      //     message,
      //     duration: 5000,
      //     buttons: [
      //       {
      //         text: 'OK',
      //         handler: (): void => { 
      //           this.assingTable(userId, tableAssigned);  
      //         }
      //       },
      //       {   
      //         text: 'Cancelar',
      //         role: 'cancel'
      //       }
      //     ]
      //   });
      //   toast.present();
      // }

      logout() {
        this.authService.logoutUser()
        .then(res => {
          this.navCtrl.navigateBack('');
        })
        .catch(error => {
        });
      }
      
      async presentAlertLogout() {
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Finalizando sesión',
          message: '¿Estás seguro de querer salir?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              cssClass: 'secondary',
              handler: (blah) => {
              }
            }, {
              text: 'Cerrar Sesión',
              handler: () => {
                this.logout();          
              }
            }
          ]
        });
    
        await alert.present();
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
