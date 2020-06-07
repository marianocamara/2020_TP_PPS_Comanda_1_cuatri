import { Component, OnInit, Input } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';

@Component({
  selector: 'qr-picker',
  templateUrl: './qr-picker.component.html',
  styleUrls: ['./qr-picker.component.scss'],
})
export class QrPickerComponent implements OnInit {
  @Input() clientStatus:String; 
  constructor(
    private toastController: ToastController,
    private barcodeScanner: BarcodeScanner) { }

    private optionsQrScanner: BarcodeScannerOptions = {
      formats: "PDF_417"
    };

  ngOnInit() {}

  scanCode() {
    this.barcodeScanner.scan(this.optionsQrScanner).then(barcodeData => {
      let barcodeText = barcodeData.text;

      if(barcodeText === "status_check"){
        if(this.clientStatus == "waiting_room"){
          
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
}
