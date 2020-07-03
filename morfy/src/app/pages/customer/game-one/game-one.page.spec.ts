import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GameOnePage } from './game-one.page';

describe('GameOnePage', () => {
  let component: GameOnePage;
  let fixture: ComponentFixture<GameOnePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameOnePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GameOnePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
