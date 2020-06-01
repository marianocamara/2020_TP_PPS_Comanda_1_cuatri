import { Component, OnInit } from '@angular/core';
import { ActionSheetController, NavController, LoadingController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {

  constructor(
    public actionSheetController: ActionSheetController,
    private navCtrl: NavController,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    public toastController: ToastController
    ) { }

    validationsForm: FormGroup;
    errorMessage = '';

    validation_messages = {
      email: [
        { type: 'required', message: 'El email es un campo requerido.' },
        { type: 'pattern', message: 'Por favor ingrese un email válido.' }
      ],
      password: [
        { type: 'required', message: 'La contraseña es un campo requerido.' },
        { type: 'minlength', message: 'La contraseña debe tener al menos 6 caracteres.' }
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
      });

    }


    loginUser(value) {
      this.loadingCtrl
      .create({ keyboardClose: true, message: 'Ingresando...' })
      .then(loadingEl => {
        loadingEl.present();
        this.authService.signIn(value)
        .then(res => {
          console.log(res);
          this.errorMessage = '';
          this.loadingCtrl.dismiss();
          if ( res === 'cliente') {
            this.navCtrl.navigateForward('/customer/home');
          } else {
            this.navCtrl.navigateForward('/staff');
          }
        }, err => {
          this.loadingCtrl.dismiss();
          this.presentToast(this.authService.printErrorByCode (err.code));
        });
      });
    }


    goToSignUpPage() {
      this.navCtrl.navigateForward('/signup');
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

    signInGoogle(){

      this.loadingCtrl
      .create({ keyboardClose: true, message: 'Ingresando...' })
      .then(loadingEl => {
        loadingEl.present();
        this.authService.googleSignin()
        .then(res => {
          console.log(res);
          this.errorMessage = '';
          this.loadingCtrl.dismiss();
          this.navCtrl.navigateForward('/home');
        }, err => {
          this.loadingCtrl.dismiss();
          this.errorMessage =  this.authService.printErrorByCode (err.code);
        });
      });
    }

    async presentToast(message: string) {
      const toast = await this.toastController.create({
        message,
        duration: 3000
      });
      toast.present();
    }


  }
