import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { Action, BreadcrumbService, ObjectDetailItem } from '@onecx/portal-integration-angular'
import { combineLatest, map, Observable } from 'rxjs'

import { PrimeIcons } from 'primeng/api'
import { selectAIKnowledgeVectorDbDetailsViewModel } from './ai-knowledge-vector-db-details.selectors'
import { AIKnowledgeVectorDbDetailsViewModel } from './ai-knowledge-vector-db-details.viewmodel'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { AIContext } from 'src/app/shared/generated'
import { AIKnowledgeVectorDbDetailsActions } from './ai-knowledge-vector-db-details.actions'

@Component({
  selector: 'app-ai-knowledge-vector-db-details',
  templateUrl: './ai-knowledge-vector-db-details.component.html',
  styleUrls: ['./ai-knowledge-vector-db-details.component.scss']
})
export class AIKnowledgeVectorDbDetailsComponent implements OnInit {
  public formGroup: FormGroup
  viewModel$: Observable<AIKnowledgeVectorDbDetailsViewModel>
  headerActions$: Observable<Action[]>
  headerLabels$: Observable<ObjectDetailItem[]>
  displayContexts$: Observable<{ label: string; value: AIContext }[]>

  constructor(
    private store: Store,
    private breadcrumbService: BreadcrumbService
  ) {
    this.viewModel$ = this.store.select(selectAIKnowledgeVectorDbDetailsViewModel)
    this.headerLabels$ = this.viewModel$.pipe(
      map(() => {
        const labels: ObjectDetailItem[] = []
        return labels
      })
    )

    this.headerActions$ = this.viewModel$.pipe(
      map((vm) => {
        const actions: Action[] = [
          {
            titleKey: 'AI_KNOWLEDGE_BASE_DETAILS.GENERAL.BACK',
            labelKey: 'AI_KNOWLEDGE_BASE_DETAILS.GENERAL.BACK',
            show: 'always',
            disabled: !vm.backNavigationPossible,
            icon: PrimeIcons.ARROW_LEFT,
            conditional: true,
            permission: 'AI_KNOWLEDGE_BASE#BACK',
            showCondition: !vm.editMode,

            actionCallback: () => {
              this.goBack()
            }
          },
          {
            titleKey: 'AI_KNOWLEDGE_VECTOR_DB_DETAILS.GENERAL.EDIT',
            labelKey: 'AI_KNOWLEDGE_VECTOR_DB_DETAILS.GENERAL.EDIT',
            show: 'always',
            icon: PrimeIcons.PENCIL,
            conditional: true,
            showCondition: !vm.editMode,
            actionCallback: () => {
              this.edit()
            }
          },
          {
            titleKey: 'AI_KNOWLEDGE_BASE_DETAILS.GENERAL.CANCEL',
            labelKey: 'AI_KNOWLEDGE_BASE_DETAILS.GENERAL.CANCEL',
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
            titleKey: 'AI_KNOWLEDGE_BASE_DETAILS.GENERAL.SAVE',
            labelKey: 'AI_KNOWLEDGE_BASE_DETAILS.GENERAL.SAVE',
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
            titleKey: 'AI_KNOWLEDGE_BASE_DETAILS.GENERAL.DELETE',
            labelKey: 'AI_KNOWLEDGE_BASE_DETAILS.GENERAL.DELETE',
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

    this.displayContexts$ = this.viewModel$.pipe(
      map(({ details, contexts }) => {
        if (details?.aiContext) return this.getContextFormValue([...contexts, details.aiContext])
        else return this.getContextFormValue(contexts)
      })
    )

    this.formGroup = new FormGroup({
      id: new FormControl('', [Validators.maxLength(255)]),
      name: new FormControl('', [Validators.maxLength(255)]),
      description: new FormControl('', [Validators.maxLength(255)]),
      vdb: new FormControl('', [Validators.maxLength(255)]),
      vdbCollection: new FormControl('', [Validators.maxLength(255)]),
      aiContext: new FormControl({ label: '', value: {} })
    })
    this.formGroup.disable()

    combineLatest([this.viewModel$, this.displayContexts$]).subscribe(([vm, contexts]) => {
      if (!vm.editMode) {
        const matchedContext = contexts.find((context: any) => context.value.id === vm.details?.aiContext?.id) ?? null
        this.formGroup.patchValue({
          id: vm.details?.id ?? '',
          name: vm.details?.name ?? '',
          description: vm.details?.description,
          vdb: vm.details?.vdb,
          vdbCollection: vm.details?.vdbCollection,
          aiContext: matchedContext
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
        titleKey: 'AI_KNOWLEDGE_VECTOR_DB_DETAILS.BREADCRUMB',
        labelKey: 'AI_KNOWLEDGE_VECTOR_DB_DETAILS.BREADCRUMB',
        routerLink: '/ai-knowledge-vector-db'
      }
    ])
  }

  getContextFormValue(contexts: AIContext[]) {
    return contexts.map((context) => ({ label: `${context.id}:${context.name}`, value: context }))
  }

  edit() {
    this.store.dispatch(AIKnowledgeVectorDbDetailsActions.editButtonClicked())
  }

  goBack() {
    this.store.dispatch(AIKnowledgeVectorDbDetailsActions.navigateBackButtonClicked())
  }

  cancel() {
    this.store.dispatch(AIKnowledgeVectorDbDetailsActions.cancelButtonClicked({ dirty: this.formGroup.dirty }))
  }
  save() {
    this.store.dispatch(
      AIKnowledgeVectorDbDetailsActions.saveButtonClicked({
        details: { ...this.formGroup.value, aiContext: this.formGroup.value.aiContext.value }
      })
    )
  }
  delete() {
    this.store.dispatch(AIKnowledgeVectorDbDetailsActions.deleteButtonClicked())
  }
}
