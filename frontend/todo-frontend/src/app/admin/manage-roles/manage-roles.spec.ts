import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRoles } from './manage-roles';

describe('ManageRoles', () => {
  let component: ManageRoles;
  let fixture: ComponentFixture<ManageRoles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRoles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageRoles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
