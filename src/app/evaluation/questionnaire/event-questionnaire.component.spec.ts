import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventQuestionnaireComponent } from './event-questionnaire.component';

describe('EventQuestionnaireComponent', () => {
  let component: EventQuestionnaireComponent;
  let fixture: ComponentFixture<EventQuestionnaireComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventQuestionnaireComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
