import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { Action, BreadcrumbService, ObjectDetailItem } from '@onecx/portal-integration-angular'
import { map, Observable, BehaviorSubject, combineLatest } from 'rxjs'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { PrimeIcons } from 'primeng/api'
import { AiContextDetailsActions } from './ai-context-details.actions'
import { AiContextDetailsViewModel } from './ai-context-details.viewmodel'
import { selectAiContextDetailsViewModel } from './ai-context-details.selectors'
import {
  AIKnowledgeBase,
  AIKnowledgeDatabase,
  AIKnowledgeDocument,
  AIKnowledgeUrl,
  AIKnowledgeVectorDb,
  AIProvider
} from 'src/app/shared/generated'

@Component({
  selector: 'app-ai-context-details',
  templateUrl: './ai-context-details.component.html',
  styleUrls: ['./ai-context-details.component.scss']
})
export class AiContextDetailsComponent implements OnInit {
  viewModel$: Observable<AiContextDetailsViewModel> = this.store.select(selectAiContextDetailsViewModel)

  headerLabels$: Observable<ObjectDetailItem[]> = this.viewModel$.pipe(
    map(() => {
      const labels: ObjectDetailItem[] = []
      return labels
    })
  )

  headerActions$: Observable<Action[]> = this.viewModel$.pipe(
    map((vm) => {
      const actions: Action[] = [
        {
          titleKey: 'AI_CONTEXT_DETAILS.GENERAL.BACK',
          labelKey: 'AI_CONTEXT_DETAILS.GENERAL.BACK',
          show: 'always',
          disabled: !vm.backNavigationPossible,
          icon: PrimeIcons.ARROW_LEFT,
          conditional: true,
          showCondition: !vm.editMode,
          actionCallback: () => {
            this.goBack()
          }
        },
        {
          titleKey: 'AI_CONTEXT_DETAILS.GENERAL.EDIT',
          labelKey: 'AI_CONTEXT_DETAILS.GENERAL.EDIT',
          show: 'always',
          icon: PrimeIcons.PENCIL,
          conditional: true,
          showCondition: !vm.editMode,
          actionCallback: () => {
            this.edit()
          }
        },
        {
          titleKey: 'AI_CONTEXT_DETAILS.GENERAL.CANCEL',
          labelKey: 'AI_CONTEXT_DETAILS.GENERAL.CANCEL',
          show: 'always',
          icon: PrimeIcons.TIMES,
          conditional: true,
          showCondition: vm.editMode,
          disabled: vm.isSubmitting,
          actionCallback: () => {
            this.cancel()
          }
        },
        {
          titleKey: 'AI_CONTEXT_DETAILS.GENERAL.SAVE',
          labelKey: 'AI_CONTEXT_DETAILS.GENERAL.SAVE',
          show: 'always',
          icon: PrimeIcons.SAVE,
          conditional: true,
          disabled: vm.isSubmitting,
          showCondition: vm.editMode,
          actionCallback: () => {
            this.save()
          }
        },
        {
          titleKey: 'AI_CONTEXT_DETAILS.GENERAL.DELETE',
          labelKey: 'AI_CONTEXT_DETAILS.GENERAL.DELETE',
          icon: PrimeIcons.TRASH,
          show: 'asOverflow',
          btnClass: '',
          conditional: true,
          showCondition: !vm.editMode,
          actionCallback: () => {
            this.delete()
          }
        }
      ]
      return actions
    })
  )

  public formGroup: FormGroup

  providersSuggestions$: Observable<AIProvider[]>
  providerQuery$: BehaviorSubject<string> = new BehaviorSubject<string>('')
  filteredProviders$: Observable<AIProvider[]>

  knowledgeBaseSuggestions$: Observable<AIKnowledgeBase[]>
  knowledgeBaseQuery$: BehaviorSubject<string> = new BehaviorSubject<string>('')
  filteredKnowledgeBases$: Observable<AIKnowledgeBase[]>

  vectorDbSuggestions$: Observable<AIKnowledgeVectorDb[]>
  vectorDbQuery$: BehaviorSubject<string> = new BehaviorSubject<string>('')
  filteredVectorDbs$: Observable<AIKnowledgeVectorDb[]>

  knowledgeUrlOptions$: Observable<AIKnowledgeUrl[]> = this.viewModel$.pipe(
    map((vm) => vm.details?.aIKnowledgeUrl || [])
  )
  knowledgeDbOptions$: Observable<AIKnowledgeDatabase[]> = this.viewModel$.pipe(
    map((vm) => vm.details?.aIKnowledgeDbs || [])
  )
  documentOptions$: Observable<AIKnowledgeDocument[]> = this.viewModel$.pipe(
    map((vm) => vm.details?.aIKnowledgeDocuments || [])
  )

  constructor(
    private store: Store,
    private breadcrumbService: BreadcrumbService
  ) {
    this.providersSuggestions$ = this.viewModel$.pipe(
      map(({ details, aiProviders }) => {
        const selectedProviders = Array.isArray(details?.provider) ? details.provider : []
        const allProviders = aiProviders?.filter((ctx) => !selectedProviders.some((c) => c.id === ctx.id))
        if (!allProviders || allProviders.length === 0) {
          return selectedProviders
        }
        return [...selectedProviders, ...allProviders]
      })
    )
    this.providerQuery$ = new BehaviorSubject<string>('')
    this.filteredProviders$ = combineLatest([this.providersSuggestions$, this.providerQuery$]).pipe(
      map(([providers, query]) =>
        providers.filter((p) => (p.name + ' ' + p.appId).toLowerCase().includes(query.toLowerCase()))
      )
    )

    this.knowledgeBaseSuggestions$ = this.viewModel$.pipe(
      map(({ details, aiKnowledgeBases }) => {
        const selectedKnowledgeBases = Array.isArray(details?.AIKnowledgeBase) ? details.AIKnowledgeBase : []
        const allKnowledgeBases = aiKnowledgeBases?.filter(
          (ctx) => !selectedKnowledgeBases.some((c) => c.id === ctx.id)
        )
        if (!allKnowledgeBases || allKnowledgeBases.length === 0) {
          return selectedKnowledgeBases
        }
        return [...selectedKnowledgeBases, ...allKnowledgeBases]
      })
    )
    this.knowledgeBaseQuery$ = new BehaviorSubject<string>('')
    this.filteredKnowledgeBases$ = combineLatest([this.knowledgeBaseSuggestions$, this.knowledgeBaseQuery$]).pipe(
      map(([knowledgeBases, query]) =>
        knowledgeBases.filter((kb) => (kb.name + ' ' + kb.appId).toLowerCase().includes(query.toLowerCase()))
      )
    )

    this.vectorDbSuggestions$ = this.viewModel$.pipe(
      map(({ details, knowledgeVectorDbs }) => {
        const selectedVectorDbs = Array.isArray(details?.aIKnowledgeVectorDb) ? details.aIKnowledgeVectorDb : []
        // There is no allVectorDbs property in the view model, so fallback to []
        const allVectorDbs = knowledgeVectorDbs?.filter((ctx) => !selectedVectorDbs.some((c) => c.id === ctx.id))
        if (!allVectorDbs || allVectorDbs.length === 0) {
          return selectedVectorDbs
        }
        return [...selectedVectorDbs, ...allVectorDbs]
      })
    )
    this.vectorDbQuery$ = new BehaviorSubject<string>('')
    this.filteredVectorDbs$ = combineLatest([this.vectorDbSuggestions$, this.vectorDbQuery$]).pipe(
      map(([vectorDbs, query]) =>
        vectorDbs.filter((vdb) =>
          (vdb.name + ' ' + (vdb.description || '')).toLowerCase().includes(query.toLowerCase())
        )
      )
    )

    this.formGroup = new FormGroup({
      id: new FormControl('', [Validators.maxLength(255)]),
      appId: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      AIKnowledgeBase: new FormControl(null),
      provider: new FormControl(null),
      aIKnowledgeVectorDb: new FormControl(null),
      aIKnowledgeUrl: new FormControl([]),
      aIKnowledgeDbs: new FormControl([]),
      aIKnowledgeDocuments: new FormControl([])
    })
    this.formGroup.disable()

    this.viewModel$.subscribe((vm) => {
      if (!vm.editMode) {
        this.formGroup.patchValue({
          appId: vm.details?.appId,
          name: vm.details?.name,
          description: vm.details?.description,
          AIKnowledgeBase: vm.details?.AIKnowledgeBase ? vm.details?.AIKnowledgeBase[0] : null,
          provider: vm.details?.provider ? vm.details?.provider[0] : null,
          aIKnowledgeVectorDb: vm.details?.aIKnowledgeVectorDb ? vm.details?.aIKnowledgeVectorDb[0] : null,
          aIKnowledgeUrl: vm.details?.aIKnowledgeUrl || [],
          aIKnowledgeDbs: vm.details?.aIKnowledgeDbs || [],
          aIKnowledgeDocuments: vm.details?.aIKnowledgeDocuments || []
        })

        this.formGroup.markAsPristine()
      }
      if (vm.editMode) {
        this.formGroup.enable()
      } else {
        this.formGroup.disable()
      }
    })
  }

  ngOnInit(): void {
    this.breadcrumbService.setItems([
      {
        titleKey: 'AI_CONTEXT_DETAILS.BREADCRUMB',
        labelKey: 'AI_CONTEXT_DETAILS.BREADCRUMB',
        routerLink: '/ai-context'
      }
    ])
  }

  searchKnowledgeBases(event: { query: string }) {
    this.knowledgeBaseQuery$.next(event.query)
  }

  searchProviders(event: { query: string }) {
    this.providerQuery$.next(event.query)
  }

  searchVectorDbs(event: { query: string }) {
    this.vectorDbQuery$.next(event.query)
  }

  edit() {
    this.store.dispatch(AiContextDetailsActions.editButtonClicked())
  }

  cancel() {
    this.store.dispatch(AiContextDetailsActions.cancelButtonClicked({ dirty: this.formGroup.dirty }))
  }

  save() {
    const formValue = this.formGroup.value

    const payload = {
      ...formValue,
      AIKnowledgeBase: formValue.AIKnowledgeBase ? [formValue.AIKnowledgeBase] : [],
      provider: formValue.provider ? [formValue.provider] : [],
      aIKnowledgeVectorDb: formValue.aIKnowledgeVectorDb ? [formValue.aIKnowledgeVectorDb] : []
    }

    this.store.dispatch(
      AiContextDetailsActions.saveButtonClicked({
        details: payload
      })
    )
  }

  delete() {
    this.store.dispatch(AiContextDetailsActions.deleteButtonClicked())
  }

  goBack() {
    this.store.dispatch(AiContextDetailsActions.navigateBackButtonClicked())
  }
}
