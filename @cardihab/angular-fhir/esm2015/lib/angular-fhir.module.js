import { NgModule } from '@angular/core';
import { FhirService } from './services/fhir.service';
import { RegionalConfigService } from './services/regional.service';
import { LoaderComponent } from './loader/loader.component';
import { LoaderService } from './services/loader.service';
import { CommonModule } from '@angular/common';
import { FhirCodingPipe } from './pipes/fhir-coding.pipe';
import { FhirUsualNamePipe } from './pipes/fhir-usual-name.pipe';
import { AgePipe } from './pipes/age.pipe';
import { ObservationValuePipe } from './pipes/observation-value.pipe';
import * as i0 from "@angular/core";
export class AngularFhirModule {
}
AngularFhirModule.ɵmod = i0.ɵɵdefineNgModule({ type: AngularFhirModule });
AngularFhirModule.ɵinj = i0.ɵɵdefineInjector({ factory: function AngularFhirModule_Factory(t) { return new (t || AngularFhirModule)(); }, providers: [
        FhirService,
        RegionalConfigService,
        LoaderService
    ], imports: [[
            CommonModule
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(AngularFhirModule, { declarations: [FhirCodingPipe,
        FhirUsualNamePipe,
        AgePipe,
        ObservationValuePipe,
        LoaderComponent], imports: [CommonModule], exports: [FhirCodingPipe,
        FhirUsualNamePipe,
        AgePipe,
        ObservationValuePipe,
        LoaderComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(AngularFhirModule, [{
        type: NgModule,
        args: [{
                declarations: [
                    FhirCodingPipe,
                    FhirUsualNamePipe,
                    AgePipe,
                    ObservationValuePipe,
                    LoaderComponent
                ],
                imports: [
                    CommonModule
                ],
                exports: [
                    FhirCodingPipe,
                    FhirUsualNamePipe,
                    AgePipe,
                    ObservationValuePipe,
                    LoaderComponent
                ],
                providers: [
                    FhirService,
                    RegionalConfigService,
                    LoaderService
                ]
            }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1maGlyLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BjYXJkaWhhYi9hbmd1bGFyLWZoaXIvIiwic291cmNlcyI6WyJsaWIvYW5ndWxhci1maGlyLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN0RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNwRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDakUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDOztBQTBCdEUsTUFBTSxPQUFPLGlCQUFpQjs7cURBQWpCLGlCQUFpQjtpSEFBakIsaUJBQWlCLG1CQU5qQjtRQUNULFdBQVc7UUFDWCxxQkFBcUI7UUFDckIsYUFBYTtLQUNkLFlBZFE7WUFDUCxZQUFZO1NBQ2I7d0ZBY1UsaUJBQWlCLG1CQXRCMUIsY0FBYztRQUNkLGlCQUFpQjtRQUNqQixPQUFPO1FBQ1Asb0JBQW9CO1FBQ3BCLGVBQWUsYUFHZixZQUFZLGFBR1osY0FBYztRQUNkLGlCQUFpQjtRQUNqQixPQUFPO1FBQ1Asb0JBQW9CO1FBQ3BCLGVBQWU7a0RBUU4saUJBQWlCO2NBeEI3QixRQUFRO2VBQUM7Z0JBQ1IsWUFBWSxFQUFFO29CQUNaLGNBQWM7b0JBQ2QsaUJBQWlCO29CQUNqQixPQUFPO29CQUNQLG9CQUFvQjtvQkFDcEIsZUFBZTtpQkFDaEI7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLFlBQVk7aUJBQ2I7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLGNBQWM7b0JBQ2QsaUJBQWlCO29CQUNqQixPQUFPO29CQUNQLG9CQUFvQjtvQkFDcEIsZUFBZTtpQkFDaEI7Z0JBQ0QsU0FBUyxFQUFFO29CQUNULFdBQVc7b0JBQ1gscUJBQXFCO29CQUNyQixhQUFhO2lCQUNkO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRmhpclNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL2ZoaXIuc2VydmljZSc7XG5pbXBvcnQgeyBSZWdpb25hbENvbmZpZ1NlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL3JlZ2lvbmFsLnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9hZGVyQ29tcG9uZW50IH0gZnJvbSAnLi9sb2FkZXIvbG9hZGVyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBMb2FkZXJTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9sb2FkZXIuc2VydmljZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgRmhpckNvZGluZ1BpcGUgfSBmcm9tICcuL3BpcGVzL2ZoaXItY29kaW5nLnBpcGUnO1xuaW1wb3J0IHsgRmhpclVzdWFsTmFtZVBpcGUgfSBmcm9tICcuL3BpcGVzL2ZoaXItdXN1YWwtbmFtZS5waXBlJztcbmltcG9ydCB7IEFnZVBpcGUgfSBmcm9tICcuL3BpcGVzL2FnZS5waXBlJztcbmltcG9ydCB7IE9ic2VydmF0aW9uVmFsdWVQaXBlIH0gZnJvbSAnLi9waXBlcy9vYnNlcnZhdGlvbi12YWx1ZS5waXBlJztcblxuQE5nTW9kdWxlKHtcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgRmhpckNvZGluZ1BpcGUsXG4gICAgRmhpclVzdWFsTmFtZVBpcGUsXG4gICAgQWdlUGlwZSxcbiAgICBPYnNlcnZhdGlvblZhbHVlUGlwZSxcbiAgICBMb2FkZXJDb21wb25lbnRcbiAgXSxcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZVxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgRmhpckNvZGluZ1BpcGUsXG4gICAgRmhpclVzdWFsTmFtZVBpcGUsXG4gICAgQWdlUGlwZSxcbiAgICBPYnNlcnZhdGlvblZhbHVlUGlwZSxcbiAgICBMb2FkZXJDb21wb25lbnRcbiAgXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgRmhpclNlcnZpY2UsXG4gICAgUmVnaW9uYWxDb25maWdTZXJ2aWNlLFxuICAgIExvYWRlclNlcnZpY2VcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBBbmd1bGFyRmhpck1vZHVsZSB7IH1cbiJdfQ==