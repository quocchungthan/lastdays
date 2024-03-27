import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestKonvaNg2Component } from './test-konva-ng2.component';

describe('TestKonvaNg2Component', () => {
  let component: TestKonvaNg2Component;
  let fixture: ComponentFixture<TestKonvaNg2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestKonvaNg2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestKonvaNg2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
