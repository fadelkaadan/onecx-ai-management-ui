/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { LetDirective } from '@ngrx/component'
import { ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { TranslateService } from '@ngx-translate/core'
import { BreadcrumbService, PortalCoreModule, UserService } from '@onecx/portal-integration-angular'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { PrimeIcons } from 'primeng/api'
import { AutoCompleteModule } from 'primeng/autocomplete'
import { of } from 'rxjs'
import { AiContextDetailsActions } from './ai-context-details.actions'
import { AiContextDetailsComponent } from './ai-context-details.component'
import { AiContextDetailsHarness } from './ai-context-details.harness'
import { initialState } from './ai-context-details.reducers'
import { selectAiContextDetailsViewModel } from './ai-context-details.selectors'
import { AiContextDetailsViewModel } from './ai-context-details.viewmodel'

describe('AiContextDetailsComponent', () => {
  const origAddEventListener = window.addEventListener
  const origPostMessage = window.postMessage

  let listeners: any[] = []
  window.addEventListener = (_type: any, listener: any) => {
    listeners.push(listener)
  }

  window.removeEventListener = (_type: any, listener: any) => {
    listeners = listeners.filter((l) => l !== listener)
  }

  window.postMessage = (m: any) => {
    listeners.forEach((l) =>
      l({
        data: m,
        stopImmediatePropagation: () => undefined,
        stopPropagation: () => undefined
      })
    )
  }

  afterAll(() => {
    window.addEventListener = origAddEventListener
    window.postMessage = origPostMessage
  })

  let component: AiContextDetailsComponent
  let fixture: ComponentFixture<AiContextDetailsComponent>
  let store: MockStore<Store>
  let breadcrumbService: BreadcrumbService
  let aiContextDetails: AiContextDetailsHarness

  const mockActivatedRoute = {
    snapshot: {
      data: {}
    }
  }
  const baseAiContextDetailsViewModel: AiContextDetailsViewModel = {
    details: undefined,
    detailsLoadingIndicator: false,
    detailsLoaded: true,
    backNavigationPossible: true,
    editMode: false,
    isSubmitting: false,
    aiProviders: undefined,
    aiProvidersLoaded: false,
    aiProvidersLoadingIndicator: false,
    aiKnowledgeBases: undefined,
    aiKnowledgeBasesLoaded: false,
    aiKnowledgeBasesLoadingIndicator: false,
    knowledgeVectorDbs: undefined,
    knowledgeVectorDbsLoaded: false,
    knowledgeVectorDbsLoadingIndicator: false
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AiContextDetailsComponent],
      imports: [
        PortalCoreModule,
        LetDirective,
        TranslateTestingModule.withTranslations('en', {
          // Add minimum translations needed for tests
          'ACTIONS.BACK': 'Back',
          'ACTIONS.EDIT': 'Edit',
          'ACTIONS.SAVE': 'Save',
          'ACTIONS.CANCEL': 'Cancel',
          'COMMON.NAME': 'Name',
          'COMMON.DESCRIPTION': 'Description'
        }),
        HttpClientTestingModule,
        AutoCompleteModule,
        ReactiveFormsModule
      ],
      providers: [
        provideMockStore({
          initialState: { aiContext: { details: initialState } }
        }),
        BreadcrumbService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents()

    const userService = TestBed.inject(UserService)
    userService.hasPermission = () => true
    const translateService = TestBed.inject(TranslateService)
    translateService.use('en')

    store = TestBed.inject(MockStore)
    store.overrideSelector(selectAiContextDetailsViewModel, baseAiContextDetailsViewModel)
    store.refreshState()

    fixture = TestBed.createComponent(AiContextDetailsComponent)
    component = fixture.componentInstance
    breadcrumbService = TestBed.inject(BreadcrumbService)
    fixture.detectChanges()
    aiContextDetails = await TestbedHarnessEnvironment.harnessForFixture(fixture, AiContextDetailsHarness)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should display correct breadcrumbs', async () => {
    jest.spyOn(breadcrumbService, 'setItems')

    component.ngOnInit()
    fixture.detectChanges()

    expect(breadcrumbService.setItems).toHaveBeenCalledTimes(1)
    const pageHeader = await aiContextDetails.getHeader()
    const searchBreadcrumbItem = await pageHeader.getBreadcrumbItem('Details')
    expect(await searchBreadcrumbItem!.getText()).toEqual('Details')
  })

  it('should display translated headers', async () => {
    const pageHeader = await aiContextDetails.getHeader()
    expect(await pageHeader.getHeaderText()).toEqual('AiContext Details')
    expect(await pageHeader.getSubheaderText()).toEqual('Display of AiContext Details')
  })

  it('should have 2 inline actions', async () => {
    const pageHeader = await aiContextDetails.getHeader()
    const inlineActions = await pageHeader.getInlineActionButtons()
    expect(inlineActions.length).toBe(2)

    const backAction = await pageHeader.getInlineActionButtonByLabel('Back')
    expect(backAction).toBeTruthy()

    const moreActionButton = fixture.debugElement.nativeElement.querySelector('button .pi.pi-ellipsis-v')
    expect(moreActionButton).toBeTruthy()
  })

  it('should dispatch navigateBackButtonClicked action on back button click', async () => {
    jest.spyOn(window.history, 'back')
    const doneFn = jest.fn()

    const pageHeader = await aiContextDetails.getHeader()
    const backAction = await pageHeader.getInlineActionButtonByLabel('Back')
    store.scannedActions$.pipe(ofType(AiContextDetailsActions.navigateBackButtonClicked)).subscribe(() => {
      doneFn()
    })
    await backAction?.click()
    expect(doneFn).toHaveBeenCalledTimes(1)
  })

  it('should display item details in page header', async () => {
    component.headerLabels$ = of([
      {
        label: 'first',
        value: 'first value'
      },
      {
        label: 'second',
        value: 'second value'
      },
      {
        label: 'third',
        icon: PrimeIcons.PLUS
      },
      {
        label: 'fourth',
        value: 'fourth value',
        icon: PrimeIcons.QUESTION
      }
    ])

    const pageHeader = await aiContextDetails.getHeader()
    const objectDetails = await pageHeader.getObjectInfos()
    expect(objectDetails.length).toBe(4)

    const firstDetailItem = await pageHeader.getObjectInfoByLabel('first')
    expect(await firstDetailItem?.getLabel()).toEqual('first')
    expect(await firstDetailItem?.getValue()).toEqual('first value')
    expect(await firstDetailItem?.getIcon()).toBeUndefined()

    const secondDetailItem = await pageHeader.getObjectInfoByLabel('second')
    expect(await secondDetailItem?.getLabel()).toEqual('second')
    expect(await secondDetailItem?.getValue()).toEqual('second value')
    expect(await secondDetailItem?.getIcon()).toBeUndefined()

    const thirdDetailItem = await pageHeader.getObjectInfoByLabel('third')
    expect(await thirdDetailItem?.getLabel()).toEqual('third')
    expect(await thirdDetailItem?.getValue()).toEqual('')
    expect(await thirdDetailItem?.getIcon()).toEqual(PrimeIcons.PLUS)

    const fourthDetailItem = await pageHeader.getObjectInfoByLabel('fourth')
    expect(await fourthDetailItem?.getLabel()).toEqual('fourth')
    expect(await fourthDetailItem?.getValue()).toEqual('fourth value')
    expect(await fourthDetailItem?.getIcon()).toEqual(PrimeIcons.QUESTION)
  })

  it('should enable or disable the form based on editMode', async () => {
    // Test view mode (disabled)
    store.overrideSelector(selectAiContextDetailsViewModel, { ...baseAiContextDetailsViewModel, editMode: false })
    store.refreshState()
    fixture.detectChanges()
    expect(component.formGroup.disabled).toBeTruthy()

    // Test edit mode (enabled)
    store.overrideSelector(selectAiContextDetailsViewModel, { ...baseAiContextDetailsViewModel, editMode: true })
    store.refreshState()
    fixture.detectChanges()
    expect(component.formGroup.enabled).toBeTruthy()
  })

  it('should show the correct actions for edit and view modes', async () => {
    // View mode
    store.overrideSelector(selectAiContextDetailsViewModel, { ...baseAiContextDetailsViewModel, editMode: false })
    store.refreshState()
    fixture.detectChanges()

    const pageHeader = await aiContextDetails.getHeader()
    let inlineActions = await pageHeader.getInlineActionButtons()
    expect(inlineActions.length).toBe(2) // Back and Edit

    // Edit mode
    store.overrideSelector(selectAiContextDetailsViewModel, { ...baseAiContextDetailsViewModel, editMode: true })
    store.refreshState()
    fixture.detectChanges()

    inlineActions = await pageHeader.getInlineActionButtons()
    expect(inlineActions.length).toBe(2) // Save and Cancel
  })

  it('should dispatch edit action when edit() is called', () => {
    const doneFn = jest.fn()
    store.scannedActions$.pipe(ofType(AiContextDetailsActions.editButtonClicked)).subscribe(() => {
      doneFn()
    })

    component.edit()
    expect(doneFn).toHaveBeenCalledTimes(1)
  })

  it('should dispatch save action with form values when save() is called', () => {
    const doneFn = jest.fn()
    const formValues = {
      appId: 'test-app',
      name: 'Test Name',
      description: 'Test Description'
    }

    component.formGroup.patchValue(formValues)

    store.scannedActions$.pipe(ofType(AiContextDetailsActions.saveButtonClicked)).subscribe((action) => {
      expect(action.details).toEqual({
        ...formValues
      })
      doneFn()
    })

    component.save()
    expect(doneFn).toHaveBeenCalledTimes(1)
  })

  it('should dispatch cancel action with dirty state when cancel() is called', () => {
    const doneFn = jest.fn()
    component.formGroup.markAsDirty()

    store.scannedActions$.pipe(ofType(AiContextDetailsActions.cancelButtonClicked)).subscribe((action) => {
      expect(action.dirty).toBeTruthy()
      doneFn()
    })

    component.cancel()
    expect(doneFn).toHaveBeenCalledTimes(1)
  })

  it('should dispatch delete action when delete() is called', () => {
    const doneFn = jest.fn()
    store.scannedActions$.pipe(ofType(AiContextDetailsActions.deleteButtonClicked)).subscribe(() => {
      doneFn()
    })

    component.delete()
    expect(doneFn).toHaveBeenCalledTimes(1)
  })

  it('should patch form with details when vm changes', () => {
    const details = {
      appId: 'test-app',
      name: 'Test Name',
      description: 'Test Description'
    }

    store.overrideSelector(selectAiContextDetailsViewModel, {
      ...baseAiContextDetailsViewModel,
      details
    })
    store.refreshState()
    fixture.detectChanges()

    expect(component.formGroup.get('appId')?.value).toBe(details.appId)
    expect(component.formGroup.get('name')?.value).toBe(details.name)
    expect(component.formGroup.get('description')?.value).toBe(details.description)
  })

  describe('Form field suggestions', () => {
    it('should filter provider suggestions based on query', () => {
      component.searchProviders({ query: 'test' })
      // Add expectations for filtered providers
      expect(component.providerQuery$.value).toBe('test')
    })

    it('should filter knowledge base suggestions based on query', () => {
      component.searchKnowledgeBases({ query: 'test' })
      // Add expectations for filtered knowledge bases
      expect(component.knowledgeBaseQuery$.value).toBe('test')
    })

    it('should filter vector DB suggestions based on query', () => {
      component.searchVectorDbs({ query: 'test' })
      // Add expectations for vector DB suggestions
      component.vectorDbSuggestions$.subscribe(suggestions => {
        expect(suggestions.length).toBeDefined()
      })
    })
  })
})
