import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseUploadComponent } from './expense-upload.component';

describe('ExpenseUploadComponent', () => {
  let component: ExpenseUploadComponent;
  let fixture: ComponentFixture<ExpenseUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
