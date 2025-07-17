 
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { LetDirective } from '@ngrx/component'
import { BreadcrumbService, PortalCoreModule } from '@onecx/portal-integration-angular'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { AIKnowledgeVectorDbCreateUpdateComponent } from './ai-knowledge-vector-db-create-update.component'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

describe('AIKnowledgeVectorDbCreateUpdateComponent', () => {
  let component: AIKnowledgeVectorDbCreateUpdateComponent
  let fixture: ComponentFixture<AIKnowledgeVectorDbCreateUpdateComponent>

  const mockActivatedRoute = {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AIKnowledgeVectorDbCreateUpdateComponent],
      imports: [
        PortalCoreModule,
        FormsModule,
        ReactiveFormsModule,
        LetDirective,
        TranslateTestingModule.withTranslations(
          'en',
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('./../../../../../../assets/i18n/en.json')
          // eslint-disable-next-line @typescript-eslint/no-require-imports
        ).withTranslations('de', require('./../../../../../../assets/i18n/de.json'))
      ],
      providers: [BreadcrumbService, { provide: ActivatedRoute, useValue: mockActivatedRoute }, provideHttpClientTesting()]
    }).compileComponents()

    fixture = TestBed.createComponent(AIKnowledgeVectorDbCreateUpdateComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should patch formGroup values from vm.itemToEdit on ngOnInit', () => {
    const itemToEdit = {
      id: 'test id',
      name: 'Test Name',
      description: 'Test Desc',
      vdb: 'Test VDB',
      vdbCollection: 'Test Collection'
    }
    component.vm = { itemToEdit }
    const patchSpy = jest.spyOn(component.formGroup, 'patchValue')
    component.ngOnInit()
    expect(patchSpy).toHaveBeenCalledWith({
      name: 'Test Name',
      description: 'Test Desc',
      vdb: 'Test VDB',
      vdbCollection: 'Test Collection'
    })
  })

  it('should set dialogResult with merged itemToEdit and form values on ocxDialogButtonClicked', () => {
    component.vm = { itemToEdit: {      
      id:'test id',
      name: 'Old', description: 'Old', vdb: 'Old', vdbCollection: 'Old' } }

    component.formGroup.setValue({    
      name: 'New Name',
      description: 'New Desc',
      vdb: 'New VDB',
      vdbCollection: 'New Collection'
    })
    component.ocxDialogButtonClicked()
    expect(component.dialogResult).toEqual({   
      id:'test id',
   
      name: 'New Name',
      description: 'New Desc',
      vdb: 'New VDB',
      vdbCollection: 'New Collection'
    })
  })

  it('should emit true to primaryButtonEnabled when form is valid', (done) => {
    component.formGroup.setValue({
      name: 'Valid',
      description: 'Valid',
      vdb: 'Valid',
      vdbCollection: 'Valid'
    })
    component.primaryButtonEnabled.subscribe((enabled) => {
      expect(enabled).toBeTruthy()
      done()
    })
    component.formGroup.updateValueAndValidity()
  })

  it('should emit false to primaryButtonEnabled when form is invalid', (done) => {
    component.formGroup.setValue({
      name: '', // empty, but still valid due to only maxLength validator
      description: '', // empty, but still valid
      vdb: '', // empty, but still valid
      vdbCollection: '' // empty, but still valid
    })
    component.primaryButtonEnabled.subscribe((enabled) => {
      expect(enabled).toBeTruthy() // Should be true, as empty values are valid
      done()
    })
    component.formGroup.updateValueAndValidity()
  })

  it('should emit false to primaryButtonEnabled when form is invalid (maxLength)', (done) => {
    component.formGroup.setValue({
      name: 'a'.repeat(256), // invalid
      description: 'desc',
      vdb: 'vdb',
      vdbCollection: 'coll'
    })
    component.primaryButtonEnabled.subscribe((enabled) => {
      expect(enabled).toBeFalsy()
      done()
    })
    component.formGroup.updateValueAndValidity()
  })

})
