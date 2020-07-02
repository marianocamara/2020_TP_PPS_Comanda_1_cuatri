import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ImagePickerComponent } from './pickers/image-picker/image-picker.component';
import { QrPickerComponent } from './pickers/qr-picker/qr-picker.component';
import { DateAgoPipe } from './pipes/date-ago.pipe';

@NgModule({
  declarations: [
    ImagePickerComponent,
    QrPickerComponent,
    DateAgoPipe
  ],
  imports: [CommonModule, IonicModule],
  exports: [ImagePickerComponent,
            QrPickerComponent,
            DateAgoPipe],
  entryComponents: []
})
export class SharedModule {}
