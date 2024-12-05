import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewChatModalComponent } from './new-chat-modal.component';

describe('NewChatModalComponent', () => {
  let component: NewChatModalComponent;
  let fixture: ComponentFixture<NewChatModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewChatModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewChatModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
