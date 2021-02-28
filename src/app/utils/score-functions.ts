import * as moment from 'moment';

export const k10Score = (item: fhir.QuestionnaireResponseItem): fhir.ObservationComponent[] => {
    if (item && item.answer && item.answer.length === 1 && item.answer[0].valueCoding) {
        const value = item.answer[0].valueCoding;
        if (value && value.code) {
            return [{
                code: {
                    coding: [{
                        system: 'http://snomed.info/sct',
                        code: '720211004',
                        display: 'Kessler Psychological Distress Scale K10 score'
                    }]
                },
                valueQuantity: {
                    value: Number(value.code)
                }
            }];
        }
    }
    return [];
};

export const dass21Score = (item: fhir.QuestionnaireResponseItem) => {
    if (item && item.answer && item.answer.length === 1 && item.answer[0].valueCoding) {
        const value = item.answer[0].valueCoding;
        if (value && value.code) {
            const component = {
                code: {
                    coding: [{
                        system: 'http://snomed.info/sct',
                        code: undefined,
                        display: undefined
                    }]
                },
                valueQuantity: {
                    value: Number(value.code)
                }
            };
            switch (value.system) {
                case 'https://fhir-registry.cardihab.com/ValueSets/DASS21/anxiety':
                    component.code.coding[0].code = '416619008';
                    component.code.coding[0].display = 'Depression anxiety stress scales anxiety score';
                    break;
                case 'https://fhir-registry.cardihab.com/ValueSets/DASS21/depression':
                    component.code.coding[0].code = '416954004';
                    component.code.coding[0].display = 'Depression anxiety stress scales depression score';
                    break;
                case 'https://fhir-registry.cardihab.com/ValueSets/DASS21/stress':
                    component.code.coding[0].code = '416767005';
                    component.code.coding[0].display = 'Depression anxiety stress scales stress score';
                    break;
            }
            return [component];
        }
    }
    return [];
};

export const eq5D = (item: fhir.QuestionnaireResponseItem) => {
    if (item && item.answer && item.answer.length === 1) {
        if (item.answer[0].valueCoding) {
            const value = item.answer[0].valueCoding;
            if (value && value.code) {
                return [
                    {
                        code: {
                            coding: [{
                                system: 'http://snomed.info/sct',
                                code: '736534008',
                                display: 'EuroQol five dimension five level index value'
                            }]
                        },
                        valueQuantity: {
                            value: Number(value.code)
                        },
                    },
                ];
            }
        } else if (item.answer[0].valueInteger) {
            return [
                {
                    code: {
                        coding: [{
                            system: 'http://snomed.info/sct',
                            code: '736535009',
                            display: 'EuroQol visual analogue score'
                        }]
                    },
                    valueQuantity: {
                        value: Number(item.answer[0].valueInteger)
                    },
                }
            ];
        }
    }
    return [];
};

export const activeAustralia = (item: fhir.QuestionnaireResponseItem, score?: fhir.ObservationComponent[]) => {
    let duration;
    let mins;
    const components = [];

    let sufftime = 0, suffsess = 0;
    const timeComponent = (score || []).find(s => s.code.coding[0].system === 'https://fhir-registry.cardihab.com/ValueSets/active-australia' && s.code.coding[0].code === 'sufftime');
    if (timeComponent) {
        sufftime = timeComponent.valueQuantity.value;
    }

    const sessComponent = (score || []).find(s => s.code.coding[0].system === 'https://fhir-registry.cardihab.com/ValueSets/active-australia' && s.code.coding[0].code === 'suffsess');
    if (sessComponent) {
        suffsess = sessComponent.valueQuantity.value;
    }

    switch (item.linkId) {
        case 'walktime':
            duration = moment.duration(item.answer[0].valueTime);
            mins = duration.as('minutes');
            components.push({
                code: {
                    coding: [{
                        system: 'https://fhir-registry.cardihab.com/ValueSets/active-australia',
                        code: 'sufftime',
                        display: 'Sufficient activity time'
                    }]
                },
                valueQuantity: {
                    value: mins
                }
            });
            sufftime += mins;
            break;
        case 'modtime':
            duration = moment.duration(item.answer[0].valueTime);
            mins = duration.as('minutes');
            components.push({
                code: {
                    coding: [{
                        system: 'https://fhir-registry.cardihab.com/ValueSets/active-australia',
                        code: 'sufftime',
                        display: 'Sufficient activity time'
                    }]
                },
                valueQuantity: {
                    value: mins
                }
            });
            sufftime += mins;
            break;
        case 'vigtime':
            duration = moment.duration(item.answer[0].valueTime);
            mins = duration.as('minutes');
            components.push({
                code: {
                    coding: [{
                        system: 'https://fhir-registry.cardihab.com/ValueSets/active-australia',
                        code: 'sufftime',
                        display: 'Sufficient activity time'
                    }]
                },
                valueQuantity: {
                    value: mins * 2
                }
            });
            sufftime += mins * 2;
            break;
        case 'walksess':
        case 'modsess':
        case 'vigsess':
            components.push({
                code: {
                    coding: [{
                        system: 'https://fhir-registry.cardihab.com/ValueSets/active-australia',
                        code: 'suffsess',
                        display: 'Sufficient activity sessions'
                    }]
                },
                valueQuantity: {
                    value: Number(item.answer[0].valueInteger)
                }
            });
            suffsess += item.answer[0].valueInteger;
            break;
        default:
            // no impact on scoring
            return [];
    }

    // check the result of the added time/sess on suff activity calc
    let suffCode = 'sedentary';
    let suffDisplay = 'Sedentary';

    if (sufftime >= 150 && suffsess < 5) {
        suffCode = 'insufficient';
        suffDisplay = 'Insufficiently active';
    } else if (sufftime >= 150 && suffsess >= 5) {
        suffCode = 'sufficient';
        suffDisplay = 'Sufficiently active for health';
    }
    components.push({
        code: {
            coding: [{
                system: 'https://fhir-registry.cardihab.com/ValueSets/active-australia',
                code: 'sufficient',
                display: 'Sufficient activity'
            }]
        },
        valueCodeableConcept: {
            coding: [{
                system: 'https://fhir-registry.cardihab.com/ValueSets/active-australia',
                code: suffCode,
                display: suffDisplay
            }]
        }
    });
    return components;
};

export const SCORING_FUNCTIONS: {
    [code: string]: {
        scoreFunction: (item: fhir.QuestionnaireResponseItem, score?: fhir.ObservationComponent[]) => fhir.ObservationComponent[],
        initial: fhir.ObservationComponent[]
    }
} = {
    'http://snomed.info/sct/443807003': {
        scoreFunction: eq5D,
        initial: [{
            code: {
                coding: [{
                    system: 'http://snomed.info/sct',
                    code: '736534008',
                    display: 'EuroQol five dimension five level index value'
                }]
            },
            valueQuantity: {
                value: 0
            },
        }, {
            code: {
                coding: [{
                    system: 'http://snomed.info/sct',
                    code: '736535009',
                    display: 'EuroQol visual analogue score'
                }]
            },
            valueQuantity: {
                value: 0
            },
        }]
    },
    'http://snomed.info/sct/713605006': {
        scoreFunction: k10Score,
        initial: [{
            code: {
                coding: [{
                    system: 'http://snomed.info/sct',
                    code: '720211004',
                    display: 'Kessler Psychological Distress Scale K10 score'
                }]
            },
            valueQuantity: {
                value: 0
            }
        }]
    },
    'http://snomed.info/sct/1165221000168105': {
        scoreFunction: dass21Score,
        initial: [{
            code: {
                coding: [{
                    system: 'http://snomed.info/sct',
                    code: '416619008',
                    display: 'Depression anxiety stress scales anxiety score'
                }]
            },
            valueQuantity: {
                value: 0
            }
        },
        {
            code: {
                coding: [{
                    system: 'http://snomed.info/sct',
                    code: '416954004',
                    display: 'Depression anxiety stress scales depression score'
                }]
            },
            valueQuantity: {
                value: 0
            }
        },
        {
            code: {
                coding: [{
                    system: 'http://snomed.info/sct',
                    code: '416767005',
                    display: 'Depression anxiety stress scales stress score'
                }]
            },
            valueQuantity: {
                value: 0
            }
        }]
    },
    'https://fhir-registry.cardihab.com/ValueSets/active-australia/survey': {
        scoreFunction: activeAustralia,
        initial: [{
            code: {
                coding: [{
                    system: 'https://fhir-registry.cardihab.com/ValueSets/active-australia',
                    code: 'sufftime',
                    display: 'Sufficient activity time'
                }]
            },
            valueQuantity: {
                value: 0
            }
        },
        {
            code: {
                coding: [{
                    system: 'https://fhir-registry.cardihab.com/ValueSets/active-australia',
                    code: 'suffsess',
                    display: 'Sufficient activity sessions'
                }]
            },
            valueQuantity: {
                value: 0
            }
        }, {
            code: {
                coding: [{
                    system: 'https://fhir-registry.cardihab.com/ValueSets/active-australia',
                    code: 'sufficient',
                    display: 'Sufficient activity'
                }]
            },
            valueCodeableConcept: {
                coding: [{
                    system: 'https://fhir-registry.cardihab.com/ValueSets/active-australia',
                    code: 'sedentary',
                    display: 'Sedentary'
                }]
            }
        }]
    }
};
