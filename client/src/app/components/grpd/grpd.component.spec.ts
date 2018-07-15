import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrpdComponent } from './grpd.component';

describe('GrpdComponent', () => {
  let component: GrpdComponent;
  let fixture: ComponentFixture<GrpdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrpdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrpdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
