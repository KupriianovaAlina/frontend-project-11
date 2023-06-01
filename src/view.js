/* eslint-disable import/no-extraneous-dependencies */
import * as _ from 'lodash';

export default (elements, i18nextInstance) => {

  const renderErrorHint = (error) => {
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

  const renderInitialContainer = (path) => {
    const text = (path === 'feeds') ? 'Фиды' : 'Посты';

    const container = document.createElement('div');
    container.classList.add('card', 'border');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    container.append(cardBody);

    const title = document.createElement('h2');
    title.classList.add('card-title', 'h4');
    title.textContent = text;
    cardBody.append(title);

    const feedsList = document.createElement('ul');
    feedsList.classList.add('list-group', 'border-0', 'rounded-0');
    container.append(feedsList);

    return container;
  };

  const renderFeed = (path, value, prevValue) => {
    if (_.isEmpty(prevValue)) {
      const container = renderInitialContainer(path);
      elements.feeds.append(container);
    }

    const [newFeed] = _.difference(value, prevValue);
    const feedList = elements.feeds.querySelector('ul');

    const feed = document.createElement('li');
    feed.classList.add('list-group-item', 'border-0', 'border-end-0');

    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = newFeed.title;
    feed.append(title);

    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = newFeed.description;
    feed.append(description);

    feedList.append(feed);
  };

  const openModal = (post) => () => {
    elements.modalTitle.textContent = post.title;
    elements.modalBody.textContent = post.description;
    elements.modalLink.href = post.link;
    elements.modalCloseButton.disabled = false;
  };

  const renderPosts = (path, value, prevValue) => {
    if (_.isEmpty(prevValue)) {
      const container = renderInitialContainer(path);
      elements.posts.append(container);
    }

    const [newPosts] = _.difference(value, prevValue);
    const postsList = elements.posts.querySelector('ul');

    newPosts.forEach((post) => {
      const postEl = document.createElement('li');
      postEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

      const link = document.createElement('a');
      link.classList.add('fw-bold');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.dataset.id = post.postId;
      link.href = post.link;
      link.textContent = post.title;
      postEl.append(link);

      const button = document.createElement('button');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.dataset.id = post.postId;
      button.target = 'modal';
      button.dataset.bsToggle = 'modal';
      button.dataset.bsTarget = '#modal';
      button.textContent = 'Просмотр';
      button.addEventListener('click', openModal(post));
      postEl.append(button);

      postsList.append(postEl);
    });
  };

  const render = (path, value, prevValue) => {
    switch (path) {
      case 'error':
        renderErrorHint(value);
        break;
      case 'processState':
        handleProcessState(value);
        break;
      case 'feeds':
        renderFeed(path, value, prevValue);
        break;
      case 'posts':
        renderPosts(path, value, prevValue);
        break;
      default:
        throw new Error('Something went wrong in render');
    }
  };

  return render;
};
