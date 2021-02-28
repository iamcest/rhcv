/// <reference types="fhir" />
interface INameFormatArgs {
    noTitle?: boolean;
    capitaliseLastName?: boolean;
    firstNameFirst?: boolean;
}
export declare function formatAddress(organisation: fhir.Organization, types?: string[]): string;
export declare function toValueString(item: any): any;
export declare function formatFhirName(value: fhir.HumanName[], args?: INameFormatArgs): string;
export declare function formatDOB(date: string, includeAge?: boolean): string;
export {};
