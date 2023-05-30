/* eslint-disable import/no-extraneous-dependencies */
import * as _ from 'lodash';

export default (elements, i18nextInstance) => {
  const renderError = (error) => {
    let feedbackElement = elements.example.nextElementSibling;

    // если есть контейнер ошибки или подсказки, удаляем его
    if (feedbackElement) {
      feedbackElement.remove();
    }

    // если текущей ошибки нет, очищаем стили и выходим
    if (_.isEmpty(error)) {
      if (elements.input.classList.contains('is-invalid')) elements.input.classList.remove('is-invalid');
      return;
    }

    feedbackElement = document.createElement('p');
    feedbackElement.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-danger');
    feedbackElement.textContent = error.message;
    elements.input.classList.add('is-invalid');
    elements.example.after(feedbackElement);
  };

  const renderSuccesHint = () => {
    const feedbackElement = document.createElement('p');
    feedbackElement.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-success');
    feedbackElement.textContent = i18nextInstance.t('hint.success');
    elements.example.after(feedbackElement);
  };

  const handleProcessState = (processState) => {
    switch (processState) {
      case 'sending':
        elements.button.disabled = true;
        break;

      case 'sent':
        elements.form.reset();
        elements.input.focus();
        renderSuccesHint();
        break;

      default:
        throw new Error(`Unknown process state: ${processState}`);
    }
  };

  const render = (path, value, prevValue) => {
    switch (path) {
      case 'error':
        renderError(value);
        break;
      case 'processState':
        handleProcessState(value);
        break;
      default:
        throw new Error('Something went wrong in render');
    }
  };

  return render;
};
