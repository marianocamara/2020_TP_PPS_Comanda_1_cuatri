import { Component, OnInit, Input } from '@angular/core';
import { ToastController, NavController, Platform } from '@ionic/angular';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { Status, User } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';
import { Plugins } from '@capacitor/core';
import { AuthService } from 'src/app/services/auth.service';
import { WaitingListEntry } from 'src/app/models/waiting-list-entry';

@Component({
  selector: 'app-qr-picker',
  templateUrl: './qr-picker.component.html',
  styleUrls: ['./qr-picker.component.scss'],
})
export class QrPickerComponent implements OnInit {

  private user: User;
  constructor(
    private toastController: ToastController,
    private barcodeScanner: BarcodeScanner,
    private database: DatabaseService,
    private authService: AuthService,
    private platform: Platform,
    private navCtrl: NavController) { }

  private optionsQrScanner: BarcodeScannerOptions = {
    formats: "PDF_417"
  };

  ngOnInit() {
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

  scanCode() {
    if ((this.platform.is('mobile') && !this.platform.is('hybrid')) ||
    this.platform.is('desktop')) {
      this.database.GetOne('users', this.user.id)
        .then((user) => {
          if ((user as User).table) {
            // abrir camara para elegir Qr mesa, luego redirigir a:
            this.navCtrl.navigateForward('/customer/main/home');
          }
          else if ((user as User).status === Status.Recent_Enter) {
            // abrir camara para escanear Qr lista de espera
            // luego de leer Qr cambio el estado a 'waiting-table' y redirijo:
            this.database.UpdateSingleField('status', Status.Waiting_Table, 'users', this.user.id)
              .then(() => {
                this.database.CreateOne(JSON.parse(JSON.stringify(
                  new WaitingListEntry({
                    id: user.id,
                    customerName: this.user.name,
                    customerImg: this.user.imageUrl,
                    date: new Date()
                  }))), 'waiting-list')
                  .then(() => {
                    this.presentToast("Has sido agregado a la lista de espera con exito.");
                    this.navCtrl.navigateForward('/customer/waiting-list');
                  }).
                  catch(() => this.presentToast("Ocurrió un error al querer agregarlo a la sala de espera. Por favor, reintente."));
              });
          }
          else if ((user as User).status === Status.Waiting_Table) {
            this.presentToast("Cuando la pantalla se lo indique, podra leer el qr de la mesa que le corresponda.");
            this.navCtrl.navigateForward('/customer/waiting-list');
          }
        });

    } else {
      this.barcodeScanner.scan().then(barcodeData => {
        let barcodeText = barcodeData.text;
        if (barcodeText === "status_check") {
          this.database.GetOne('users', this.user.id)
            .then((user) => {
              if ((user as User).status === Status.Recent_Enter) {
                // abrir camara para escanear Qr lista de espera
                // luego de leer Qr cambio el estado a 'waiting-table' y redirijo:
                this.database.UpdateSingleField('status', Status.Waiting_Table, 'users', this.user.id)
                  .then(() => {
                    this.database.CreateOne(JSON.parse(JSON.stringify(
                      new WaitingListEntry({
                        id: user.id,
                        customerName: this.user.name,
                        customerImg: this.user.imageUrl,
                        date: new Date()
                      }))), 'waiting-list')
                      .then(
                        () => {
                        this.presentToast("Has sido agregado a la lista de espera con exito.");
                        this.navCtrl.navigateForward('/customer/waiting-list');                    
                      }).catch(()=>this.presentToast("Ocurrió un error al querer agregarlo a la sala de espera. Por favor, reintente."));
                  });
              }
              else if ((user as User).status === Status.Waiting_Table) {
                this.presentToast("Cuando la pantalla se lo indique, podra leer el qr de la mesa que le corresponda.");
                this.navCtrl.navigateForward('/customer/waiting-list');
              }
            });


        }

        if (barcodeText.includes("morfy_table")) {
          let number_table = "";
          number_table = barcodeText.split('_')[2];

          this.database.GetOne('users', this.user.id)
            .then((user) => {
              if ((user as User).table === number_table) {
                //this.database.UpdateSingleField('status', Status.Recent_Sit, 'users', this.user.id)
                this.navCtrl.navigateForward('/customer/main/home');
              } else {
                this.presentToast("Ingreso incorrecto. Su mesa asignada es la número " + (user as User).table + ".");
              }

            }).catch(() => {
              this.presentToast("Ocurrió un error al intentar leer el código QR. Por favor, reintente.")
            });

        }

      });
    }
  }


  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000
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
}
