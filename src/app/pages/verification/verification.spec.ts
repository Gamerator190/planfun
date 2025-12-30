import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Verification } from './verification';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { vi } from 'vitest';

describe('Verification', () => {
  let component: Verification;
  let fixture: ComponentFixture<Verification>;
  let apiServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    apiServiceMock = {
      verify: vi.fn().mockReturnValue(of({ success: true }))
    };

    routerMock = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Verification, FormsModule, CommonModule, RouterTestingModule],
      providers: [
        { provide: ApiService, useValue: apiServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ email: 'test@example.com' })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Verification);
    component = fixture.componentInstance;
    fixture.detectChanges(); // This will trigger ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get email from query params on init', () => {
    expect(component.email).toBe('test@example.com');
  });

  it('should call apiService.verify on verify()', () => {
    component.verificationCode = '123456';
    component.verify();
    expect(apiServiceMock.verify).toHaveBeenCalledWith('test@example.com', '123456');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { verified: true } });
  });

  it('should set error message if verification fails', () => {
    apiServiceMock.verify.mockReturnValue(throwError(() => ({ error: { message: 'Invalid code' } }))); // Use mockReturnValue
    component.verificationCode = 'wrongcode';
    component.verify();
    expect(component.errorMessage).toBe('Invalid code');
  });

  it('should set error message if no email is present', () => {
    component.email = null;
    component.verify();
    expect(component.errorMessage).toBe('Email not found. Please register again.');
    expect(apiServiceMock.verify).not.toHaveBeenCalled();
  });
});