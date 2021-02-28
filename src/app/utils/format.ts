import * as moment from 'moment';
import { isEmpty } from 'lodash';
import { ObservationValuePipe } from '@cardihab/angular-fhir';


interface INameFormatArgs {
  noTitle?: boolean;
  capitaliseLastName?: boolean;
  firstNameFirst?: boolean;
}

export function formatAddress(organisation: fhir.Organization, types?: string[]): string {
  if (!organisation || !organisation.address ||
    !Array.isArray(organisation.address) || !organisation.address.length) {
    return '';
  }

  types = types || [];
  let address = organisation.address.find(item => types.indexOf(item.type) > -1);
  address = address || organisation.address[0];

  const phoneNumber = (organisation.telecom || []).find(item => item.system === 'phone') as fhir.ContactPoint;
  const phoneNumberValue = phoneNumber ? phoneNumber.value : '';

  return [
    `${organisation.name},`,
    `${(address.line || []).join(' ')},`,
    address.city,
    address.state,
    address.postalCode,
    phoneNumberValue
  ].join(' ');
}

export function formatAddressOnly(addresses: fhir.Address[], types?: string[]): string {
  if (!addresses || !Array.isArray(addresses) || !addresses.length) {
    return '';
  }

  types = types || [];
  let address = addresses.find(item => types.indexOf(item.type) > -1);
  address = address || addresses[0];

  if (isEmpty(address)) { return ''; }

  return [
    `${(address.line || []).join(' ')},`,
    address.city,
    address.state,
    address.postalCode,
  ].join(' ');
}

export function toValueString(item) {
  // A hack for pluralising some unit names
  const formatUnit = (unit, value) => {
    if (value !== 1) {
      if (unit === 'serving') {
        return ` ${unit}s`;
      }
    }
    return unit === 'N/A' ? '' : ` ${unit || ''}` || '';
  };

  const valueType = getValueType(item);
  switch (valueType.type) {
    case 'CodeableConcept':
      if (valueType.value && valueType.value.coding && valueType.value.coding.length > 0) {
        return `${valueType.value.coding[0].display || ''} (${valueType.value.coding[0].code})`;
      } else {
        return '';
      }
    case 'String':
    case 'Reference':
    case 'Coding':
    case 'Uri':
    case 'Boolean':
    case 'Address':
    case 'Age':
    case 'Annotation':
    case 'Attachment':
    case 'Base64Binary':
    case 'Code':
    case 'ContactPoint':
    case 'Count':
    case 'Date':
    case 'Decimal':
    case 'Duration':
    case 'HumanName':
    case 'Id':
    case 'DateTime':
    case 'Distance':
    case 'Integer':
    case 'Time':
      return valueType.value;
    // todo add additional value[x] types
    case 'Quantity':
      if (
        item?.code?.coding?.length > 0 &&
        item?.code?.coding[0]?.code?.toLowerCase() === 'intensity' &&
        item?.valueQuantity?.code) {
        return `${item.valueQuantity.code}`;
      } else if (item?.valueQuantity?.code &&
        item?.valueQuantity?.code?.toLowerCase() === 'standard drinks') {
        return `${item.valueQuantity.value + ' '}${formatUnit(item.valueQuantity.unit, item.valueQuantity.value)}`;
      } else if (
        item?.code?.coding?.length > 0 &&
        item?.code?.coding[0]?.display?.toLowerCase() === 'quality of sleep' &&
        item?.valueQuantity?.unit &&
        item?.valueQuantity?.value) {

        switch (item.valueQuantity.value) {
          case 0:
            return 'VERY POOR';
            break;
          case 1:
            return 'POOR';
            break;
          case 2:
            return 'FAIR';
            break;
          case 3:
            return 'GOOD';
            break;
          case 4:
            return 'VERY GOOD';
            break;
          default:
            return `${item.valueQuantity.value + ' '}${formatUnit(item.valueQuantity.unit, item.valueQuantity.value)}`;
        }
      } else if (item?.valueQuantity?.value) {
        return `${item.valueQuantity.value || ''}${formatUnit(item.valueQuantity.unit, item.valueQuantity.value)}`;
      } else if (item?.valueQuantity?.code) {
        return `${item.valueQuantity.code}`;
      } else {
        return '';
      }
    default:
      return '';
  }
}

export function getValueType(obj): { value: any, type: string } {
  const valueKey = Object.keys(obj).find(key => key.indexOf('value') === 0);
  if (valueKey) {
    return {
      value: obj[valueKey],
      type: valueKey.substring(5)
    };
  } else {
    return {
      value: undefined,
      type: undefined
    };
  }
}

export function formatFhirName(value: fhir.HumanName[],
  args: INameFormatArgs = { noTitle: false, capitaliseLastName: false, firstNameFirst: false }) {
  if (value && value.length > 0) {
    const preferredName = value.reduce((best, name, idx, names) => {
      if (name.use === 'usual') {
        return name;
      } else if (!best) {
        return name;
      } else {
        if (name.use === 'official') {
          return name;
        }
      }
      return best;
    });
    if (preferredName.text) {
      return preferredName.text;
    }
    const family = (args.capitaliseLastName ? preferredName.family.toUpperCase() : preferredName.family) || '';
    const prefixes = (preferredName.prefix || []).filter(p => !!p);
    const titles = prefixes.length > 0 ? ` (${prefixes.join(' ')})` : '';
    const givenName = preferredName.given?.join(' ');
    return args.firstNameFirst ? `${args.noTitle || !titles ? '' : titles} ${(givenName !== '') ? givenName : ''} ${family}` : `${family}, ${(givenName !== '') ? givenName : ''}${args.noTitle ? '' : titles}`;
  } else {
    return '<No Name>';
  }
}

export function formatDOB(date: string, includeAge: boolean = false, noDashes: boolean = false) {
  const mDate = moment(date);
  const age = ` (${moment().diff(mDate, 'years')} ys)`;
  return `${mDate.format(`DD${noDashes ? ' ' : '-'}MMM${noDashes ? ' ' : '-'}YYYY`)}${includeAge ? age : ''}`;
}

export const ISO8601_DURATION_PATTERN = /R(\d*)\/(?:(.+)\/)?(P.+)/;

export const iso8601Duration = ({ count, period, frequency, at }) => {
  let delay = '';
  if ((at || '').length > 0) {
    const [, hours, minutes] = at.match(/(\d\d)\:(\d\d)/) || [null, null, null];
    delay = `/PT${hours}H${minutes !== '00' ? minutes + 'M' : ''}`;
  }
  return `R${count > 0 ? count : ''}${delay}/P${period}${frequency}`;
};
