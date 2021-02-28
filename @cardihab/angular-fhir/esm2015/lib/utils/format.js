import moment from 'moment';
export function formatAddress(organisation, types) {
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
export function formatFhirName(value, args = { noTitle: false, capitaliseLastName: false, firstNameFirst: false }) {
    if (value && value.length > 0) {
        const preferredName = value.reduce((best, name, idx, names) => {
            if (name.use === 'usual') {
                return name;
            }
            else if (!best) {
                return name;
            }
            else {
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
    }
    else {
        return '<No Name>';
    }
}
export function formatDOB(date, includeAge = false) {
    const mDate = moment(date);
    const age = ` (${moment().diff(mDate, 'years')} ys)`;
    return `${mDate.format('DD-MMM-YYYY')}${includeAge ? age : ''}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGNhcmRpaGFiL2FuZ3VsYXItZmhpci8iLCJzb3VyY2VzIjpbImxpYi91dGlscy9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBUTVCLE1BQU0sVUFBVSxhQUFhLENBQUMsWUFBK0IsRUFBRSxLQUFnQjtJQUM3RSxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU87UUFDeEMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO1FBQ3RFLE9BQU8sRUFBRSxDQUFDO0tBQ1g7SUFFRCxLQUFLLEdBQUcsS0FBSyxJQUFJLEVBQUUsQ0FBQztJQUNwQixJQUFJLE9BQU8sR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0UsT0FBTyxHQUFHLE9BQU8sSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTdDLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxPQUFPLENBQUMsQ0FBQztJQUUvRSxPQUFPO1FBQ0wsR0FBRyxZQUFZLENBQUMsSUFBSSxHQUFHO1FBQ3ZCLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUc7UUFDNUIsT0FBTyxDQUFDLElBQUk7UUFDWixPQUFPLENBQUMsS0FBSztRQUNiLE9BQU8sQ0FBQyxVQUFVO1FBQ2xCLFdBQVc7S0FDWixDQUFDLElBQUksQ0FBQyxHQUFH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QUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM3RywyQ0FBMkM7UUFDM0MsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDeEw7U0FBTTtRQUNMLE9BQU8sV0FBVyxDQUFDO0tBQ3BCO0FBQ0gsQ0FBQztBQUVELE1BQU0sVUFBVSxTQUFTLENBQUMsSUFBWSxFQUFFLGFBQXNCLEtBQUs7SUFDakUsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNCLE1BQU0sR0FBRyxHQUFHLEtBQUssTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQ3JELE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNsRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQnO1xuXG5pbnRlcmZhY2UgSU5hbWVGb3JtYXRBcmdzIHtcbiAgbm9UaXRsZT86IGJvb2xlYW47XG4gIGNhcGl0YWxpc2VMYXN0TmFtZT86IGJvb2xlYW47XG4gIGZpcnN0TmFtZUZpcnN0PzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdEFkZHJlc3Mob3JnYW5pc2F0aW9uOiBmaGlyLk9yZ2FuaXphdGlvbiwgdHlwZXM/OiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIGlmICghb3JnYW5pc2F0aW9uIHx8ICFvcmdhbmlzYXRpb24uYWRkcmVzcyB8fFxuICAgICFBcnJheS5pc0FycmF5KG9yZ2FuaXNhdGlvbi5hZGRyZXNzKSB8fCAhb3JnYW5pc2F0aW9uLmFkZHJlc3MubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgdHlwZXMgPSB0eXBlcyB8fCBbXTtcbiAgbGV0IGFkZHJlc3MgPSBvcmdhbmlzYXRpb24uYWRkcmVzcy5maW5kKGl0ZW0gPT4gdHlwZXMuaW5kZXhPZihpdGVtLnR5cGUpID4gLTEpO1xuICBhZGRyZXNzID0gYWRkcmVzcyB8fCBvcmdhbmlzYXRpb24uYWRkcmVzc1swXTtcblxuICBjb25zdCBwaG9uZU51bWJlciA9IG9yZ2FuaXNhdGlvbi50ZWxlY29tLmZpbmQoaXRlbSA9PiBpdGVtLnN5c3RlbSA9PT0gJ3Bob25lJyk7XG5cbiAgcmV0dXJuIFtcbiAgICBgJHtvcmdhbmlzYXRpb24ubmFtZX0sYCxcbiAgICBgJHthZGRyZXNzLmxpbmUuam9pbignICcpfSxgLFxuICAgIGFkZHJlc3MuY2l0eSxcbiAgICBhZGRyZXNzLnN0YXRlLFxuICAgIGFkZHJlc3MucG9zdGFsQ29kZSxcbiAgICBwaG9uZU51bWJlclxuICBdLmpvaW4oJyAnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvVmFsdWVTdHJpbmcoaXRlbSkge1xuICAvLyBBIGhhY2sgZm9yIHBsdXJhbGlzaW5nIHNvbWUgdW5pdCBuYW1lc1xuICBjb25zdCBmb3JtYXRVbml0ID0gKHVuaXQsIHZhbHVlKSA9PiB7XG4gICAgaWYgKHZhbHVlICE9PSAxKSB7XG4gICAgICBpZiAodW5pdCA9PT0gJ3NlcnZpbmcnKSB7XG4gICAgICAgIHJldHVybiBgJHt1bml0fXNgO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5pdDtcbiAgfTtcblxuICByZXR1cm4gaXRlbS52YWx1ZVN0cmluZyA/IGl0ZW0udmFsdWVTdHJpbmcgOlxuICAgIGl0ZW0udmFsdWVSZWZlcmVuY2UgPyBpdGVtLnZhbHVlUmVmZXJlbmNlIDpcbiAgICBpdGVtLnZhbHVlQ29kaW5nID8gaXRlbS52YWx1ZUNvZGluZyA6XG4gICAgaXRlbS52YWx1ZVVyaSA/IGl0ZW0udmFsdWVVcmkgOlxuICAgIGl0ZW0udmFsdWVCb29sZWFuID8gaXRlbS52YWx1ZUJvb2xlYW4gOlxuICAgIGl0ZW0udmFsdWVBZGRyZXNzID8gaXRlbS52YWx1ZUFkZHJlc3MgOlxuICAgIGl0ZW0udmFsdWVBZ2UgPyBpdGVtLnZhbHVlQWdlIDpcbiAgICBpdGVtLnZhbHVlQW5ub3RhdGlvbiA/IGl0ZW0udmFsdWVBbm5vdGF0aW9uIDpcbiAgICBpdGVtLnZhbHVlQXR0YWNobWVudCA/IGl0ZW0udmFsdWVBdHRhY2htZW50IDpcbiAgICBpdGVtLnZhbHVlQmFzZTY0QmluYXJ5ID8gaXRlbS52YWx1ZUJhc2U2NEJpbmFyeSA6XG4gICAgaXRlbS52YWx1ZUNvZGUgPyBpdGVtLnZhbHVlQ29kZSA6XG4gICAgaXRlbS52YWx1ZUNvZGVhYmxlQ29uY2VwdCA/IGl0ZW0udmFsdWVDb2RlYWJsZUNvbmNlcHQgOlxuICAgIGl0ZW0udmFsdWVDb250YWN0UG9pbnQgPyBpdGVtLnZhbHVlQ29udGFjdFBvaW50IDpcbiAgICBpdGVtLnZhbHVlQ291bnQgPyBpdGVtLnZhbHVlQ291bnQgOlxuICAgIGl0ZW0udmFsdWVEYXRlID8gaXRlbS52YWx1ZURhdGUgOlxuICAgIGl0ZW0udmFsdWVEZWNpbWFsID8gaXRlbS52YWx1ZURlY2ltYWwgOlxuICAgIGl0ZW0udmFsdWVEdXJhdGlvbiA/IGl0ZW0udmFsdWVEdXJhdGlvbiA6XG4gICAgaXRlbS52YWx1ZUh1bWFuTmFtZSA/IGl0ZW0udmFsdWVIdW1hbk5hbWUgOlxuICAgIGl0ZW0udmFsdWVJZCA/IGl0ZW0udmFsdWVJZCA6XG4gICAgaXRlbS52YWx1ZURhdGVUaW1lID8gaXRlbS52YWx1ZURhdGVUaW1lIDpcbiAgICBpdGVtLnZhbHVlRGlzdGFuY2UgPyBpdGVtLnZhbHVlRGlzdGFuY2UgOlxuICAgIGl0ZW0udmFsdWVJbnRlZ2VyID8gaXRlbS52YWx1ZUludGVnZXIgOlxuICAgIC8vIHRvZG8gYWRkIGFkZGl0aW9uYWwgdmFsdWVbeF0gdHlwZXNcbiAgICBpdGVtLnZhbHVlUXVhbnRpdHkgPyBgJHtpdGVtLnZhbHVlUXVhbnRpdHkudmFsdWV9ICR7Zm9ybWF0VW5pdChpdGVtLnZhbHVlUXVhbnRpdHkudW5pdCwgaXRlbS52YWx1ZVF1YW50aXR5LnZhbHVlKX1gIDogJyc7XG59XG5cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRGaGlyTmFtZSh2YWx1ZTogZmhpci5IdW1hbk5hbWVbXSwgYXJnczogSU5hbWVGb3JtYXRBcmdzID0ge25vVGl0bGU6IGZhbHNlLCBjYXBpdGFsaXNlTGFzdE5hbWU6IGZhbHNlLCBmaXJzdE5hbWVGaXJzdDogZmFsc2V9KSB7XG4gIGlmICh2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgcHJlZmVycmVkTmFtZSA9IHZhbHVlLnJlZHVjZSgoYmVzdCwgbmFtZSwgaWR4LCBuYW1lcykgPT4ge1xuICAgICAgaWYgKG5hbWUudXNlID09PSAndXN1YWwnKSB7XG4gICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgfSBlbHNlIGlmICghYmVzdCkge1xuICAgICAgICByZXR1cm4gbmFtZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChuYW1lLnVzZSA9PT0gJ29mZmljaWFsJykge1xuICAgICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYmVzdDtcbiAgICB9KTtcbiAgICBpZiAocHJlZmVycmVkTmFtZS50ZXh0KSB7XG4gICAgICByZXR1cm4gcHJlZmVycmVkTmFtZS50ZXh0O1xuICAgIH1cblxuICAgIGNvbnN0IGZhbWlseSA9IChhcmdzLmNhcGl0YWxpc2VMYXN0TmFtZSA/IHByZWZlcnJlZE5hbWUuZmFtaWx5LnRvVXBwZXJDYXNlKCkgOiBwcmVmZXJyZWROYW1lLmZhbWlseSkgfHwgJyc7XG4gICAgY29uc3QgdGl0bGVzID0gKHByZWZlcnJlZE5hbWUucHJlZml4IHx8IFtdKS5sZW5ndGggPiAwID8gYCAoJHsocHJlZmVycmVkTmFtZS5wcmVmaXggfHwgW10pLmpvaW4oJyAnKX0pYCA6ICcnO1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgICByZXR1cm4gYXJncy5maXJzdE5hbWVGaXJzdCA/IGAke2FyZ3Mubm9UaXRsZSA/ICcnIDogdGl0bGVzfSAkeyhwcmVmZXJyZWROYW1lLmdpdmVuIHx8IFtdKVswXX0gJHtmYW1pbHl9YCA6IGAke2ZhbWlseX0sICR7KHByZWZlcnJlZE5hbWUuZ2l2ZW4gfHwgW10pWzBdfSR7YXJncy5ub1RpdGxlID8gJycgOiB0aXRsZXN9YDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJzxObyBOYW1lPic7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdERPQihkYXRlOiBzdHJpbmcsIGluY2x1ZGVBZ2U6IGJvb2xlYW4gPSBmYWxzZSkge1xuICBjb25zdCBtRGF0ZSA9IG1vbWVudChkYXRlKTtcbiAgY29uc3QgYWdlID0gYCAoJHttb21lbnQoKS5kaWZmKG1EYXRlLCAneWVhcnMnKX0geXMpYDtcbiAgcmV0dXJuIGAke21EYXRlLmZvcm1hdCgnREQtTU1NLVlZWVknKX0ke2luY2x1ZGVBZ2UgPyBhZ2UgOiAnJ31gO1xufVxuXG4iXX0=