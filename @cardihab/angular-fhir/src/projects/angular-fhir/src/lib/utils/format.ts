import moment from 'moment';

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

  const phoneNumber = organisation.telecom.find(item => item.system === 'phone');

  return [
    `${organisation.name},`,
    `${address.line.join(' ')},`,
    address.city,
    address.state,
    address.postalCode,
    phoneNumber
  ].join(' ');
}

export function toValueString(item) {
  // A hack for pluralising some unit names
  const formatUnit = (unit, value) => {
    if (value !== 1) {
      if (unit === 'serving') {
        return `${unit}s`;
      }
    }
    return unit;
  };

  return item.valueString ? item.valueString :
    item.valueReference ? item.valueReference :
    item.valueCoding ? item.valueCoding :
    item.valueUri ? item.valueUri :
    item.valueBoolean ? item.valueBoolean :
    item.valueAddress ? item.valueAddress :
    item.valueAge ? item.valueAge :
    item.valueAnnotation ? item.valueAnnotation :
    item.valueAttachment ? item.valueAttachment :
    item.valueBase64Binary ? item.valueBase64Binary :
    item.valueCode ? item.valueCode :
    item.valueCodeableConcept ? item.valueCodeableConcept :
    item.valueContactPoint ? item.valueContactPoint :
    item.valueCount ? item.valueCount :
    item.valueDate ? item.valueDate :
    item.valueDecimal ? item.valueDecimal :
    item.valueDuration ? item.valueDuration :
    item.valueHumanName ? item.valueHumanName :
    item.valueId ? item.valueId :
    item.valueDateTime ? item.valueDateTime :
    item.valueDistance ? item.valueDistance :
    item.valueInteger ? item.valueInteger :
    // todo add additional value[x] types
    item.valueQuantity ? `${item.valueQuantity.value} ${formatUnit(item.valueQuantity.unit, item.valueQuantity.value)}` : '';
}

// tslint:disable-next-line:max-line-length
export function formatFhirName(value: fhir.HumanName[], args: INameFormatArgs = {noTitle: false, capitaliseLastName: false, firstNameFirst: false}) {
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
    const titles = (preferredName.prefix || []).length > 0 ? ` (${(preferredName.prefix || []).join(' ')})` : '';
    // tslint:disable-next-line:max-line-length
    return args.firstNameFirst ? `${args.noTitle ? '' : titles} ${(preferredName.given || [])[0]} ${family}` : `${family}, ${(preferredName.given || [])[0]}${args.noTitle ? '' : titles}`;
  } else {
    return '<No Name>';
  }
}

export function formatDOB(date: string, includeAge: boolean = false) {
  const mDate = moment(date);
  const age = ` (${moment().diff(mDate, 'years')} ys)`;
  return `${mDate.format('DD-MMM-YYYY')}${includeAge ? age : ''}`;
}

