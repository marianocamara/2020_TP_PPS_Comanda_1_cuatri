import { Component, OnInit } from '@angular/core';
import { ActionSheetController, NavController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

import { Plugins } from '@capacitor/core';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  constructor(
    public actionSheetController: ActionSheetController,
    private navCtrl: NavController,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private database: DatabaseService,
  ) { }

  validationsForm: FormGroup;
  errorMessage = '';
  isAnonymous = false;

  validation_messages = {
    email: [
      { type: 'required', message: 'El email es un campo requerido.' },
      { type: 'pattern', message: 'Por favor ingrese un email válido.' }
    ],
    password: [
      { type: 'required', message: 'La contraseña es un campo requerido.' },
      { type: 'minlength', message: 'La contraseña debe tener al menos 6 caracteres.' }
    ],
    dni: [
      { type: 'required', message: 'El DNI es un campo requerido.' },
      { type: 'minlength', message: 'El DNI debe tener 8 caracteres.' }
    ]
  };

  ngOnInit() {
    this.validationsForm = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
      dni: new FormControl('', Validators.compose([
        Validators.required
      ])),
      name: new FormControl(''),
      lastName: new FormControl(''),
      image: new FormControl(null),
    });
  }


  base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = window.atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  }


  createUser(value) {
    if (!this.validationsForm.get('image').value) {
      return;
    }
    this.loadingCtrl
    .create({ keyboardClose: true, message: 'Ingresando...' })
    .then(loadingEl => {
      loadingEl.present();

      const imagen = this.validationsForm.get('image').value;

      if (!document.URL.startsWith('http')){
      const imageName = (this.validationsForm.value.title).replace(/\s/g, '-') + '-' + Math.floor(Math.random() * (999 - 100 + 1) + 100);
      imagen.name = imageName;
      }

      const uploadTask = this.database.uploadImage(this.validationsForm.get('image').value);
      uploadTask.task.on('state_changed', (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');

      }, (error) => {
        // Handle unsuccessful uploads

      }, () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        uploadTask.task.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log('File available at', downloadURL);

          if (this.isAnonymous) {
            console.log('anon');
            this.authService.signUpAnonymous(value, downloadURL)
            .then(res => {
              console.log(res);
              this.errorMessage = '';
              this.loadingCtrl.dismiss();
              this.navCtrl.navigateForward('/customer/home');
            }, err => {
              this.loadingCtrl.dismiss();
              this.errorMessage =  this.authService.printErrorByCode (err.code);
            });
          }else{
            console.log('not anon');
            this.authService.signUp(value, downloadURL)
            .then(res => {
              console.log(res);
              this.errorMessage = '';
              this.loadingCtrl.dismiss();
              this.navCtrl.navigateForward('/customer/home');
            }, err => {
              this.loadingCtrl.dismiss();
              this.errorMessage =  this.authService.printErrorByCode (err.code);
            });
          }
        });
      });
    });
  }


  goToSignInPage() {
    this.navCtrl.navigateForward('/signin');
  }


  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'users',
      buttons: [{
        text: 'Admin',
        role: 'destructive',
        icon: 'person-add-outline',
        handler: () => {
          this.validationsForm.controls.email.setValue('admin@test.com');
          this.validationsForm.controls.password.setValue('adminpass');
        }
      }, {
        text: 'Usuario',
        icon: 'person-outline',
        handler: () => {
          this.validationsForm.controls.email.setValue('usuario@test.com');
          this.validationsForm.controls.password.setValue('usuariopass');
        }
      }, {
        text: 'Anónimo',
        icon: 'person-outline',
        handler: () => {
          this.validationsForm.controls.email.setValue('anonimo@test.com');
          this.validationsForm.controls.password.setValue('anonimopass');
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        handler: () => {
        }
      }]
    });
    await actionSheet.present();
  }


  onImagePicked(imageData: string | File) {
    console.log('valor form' + this.validationsForm);
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = this.base64toBlob(
          imageData.replace('data:image/jpeg;base64,', ''),
          'image/jpeg'
        );
      } catch (error) {
        console.log(error);
        alert(error);
        return;
      }
    } else {
      imageFile = imageData;
    }
    this.validationsForm.patchValue({ image: imageFile });
  }


  createAnonymousUser(){
  }


}
