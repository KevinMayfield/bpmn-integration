import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

export default function(element) {

  return [
    {
      id: 'custom',
      element,
      component: Custom,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'customprsb',
      element,
      component: CustomPRSB,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'customopenehr',
      element,
      component: CustomOpenEHR,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function Custom(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return element.businessObject.custom || '';
  }

  const setValue = value => {
    return modeling.updateProperties(element, {
      custom: value
    });
  }

  const title = translate('Custom property');
  const description = translate('Business Model')
  return new TextFieldEntry({
    id,
    element,
    getValue,
    setValue,
    debounce,
    title,
    description
  });


}

function CustomPRSB(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return element.businessObject.custom || '';
  }

  const setValue = value => {
    return modeling.updateProperties(element, {
      custom: value
    });
  }

  const title = translate('Custom property');
  const description = translate('Part of PRSB Standard')
  return new TextFieldEntry({
    id,
    element,
    getValue,
    setValue,
    debounce,
    title,
    description
  });


}

function CustomOpenEHR(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return element.businessObject.custom || '';
  }

  const setValue = value => {
    return modeling.updateProperties(element, {
      custom: value
    });
  }

  const title = translate('Custom property');
  const description = translate('openEHR Template')
  return new TextFieldEntry({
    id,
    element,
    getValue,
    setValue,
    debounce,
    title,
    description
  });


}
