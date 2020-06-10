import { Component, OnInit, Input } from '@angular/core';
import { ToastController, NavController } from '@ionic/angular';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { Status, User } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';
import { Plugins } from '@capacitor/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'qr-picker',
  templateUrl: './qr-picker.component.html',
  styleUrls: ['./qr-picker.component.scss'],
})
export class QrPickerComponent implements OnInit {

  private user:User;
  constructor(
    private toastController: ToastController,
    private barcodeScanner: BarcodeScanner,
    private database:DatabaseService,
    private authService:AuthService,
    private navCtrl:NavController) { }

    private optionsQrScanner: BarcodeScannerOptions = {
      formats: "PDF_417"
    };

  ngOnInit() {}

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
    this.barcodeScanner.scan(this.optionsQrScanner).then(barcodeData => {
      let barcodeText = barcodeData.text;

      if(barcodeText === "status_check"){
        if(this.user.status === Status.Recent_Enter){
          //Agregar a collection waiting_room
          let obj = {
            id: this.user.id,
            tableAssigned: null,
            name: this.user.name,
            lastName: this.user.lastName,
            idWaiterAssigned: null
          }
          // Lo agrego a sala de espera.
         this.database.CreateOne(JSON.parse(JSON.stringify(obj)), "client_waiting").then(()=>{
           this.presentToast("Usted fue agregado a la sala de espera");
         }).catch(()=>{
           this.presentToast("Ocurrió un error al intentar ser agregado a la sala de espera.");
         });
        }
        if(this.user.status === Status.Waiting_Table){

        }
      }

     })
     .catch(err => 
      {
        this.presentToast("El codigo QR leido es invalido.");}
      );
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
