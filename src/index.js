/* eslint-disable max-len */
import './styles.scss';
import 'bootstrap';
import axios from 'axios';
import * as yup from 'yup';
import _, { result } from 'lodash';
import onChange from 'on-change';
import i18next from 'i18next';
import initState from './state';
import initView from './view';
import resources from './locales/index';

const getAxiosResponse = (url) => {
  const allOriginsLink = 'https://allorigins.hexlet.app/get';

  const preparedURL = new URL(allOriginsLink);
  preparedURL.searchParams.set('disableCache', 'true');
  preparedURL.searchParams.set('url', url);

  return axios.get(preparedURL);
};

const parseData = async (link) => {
  const response = await getAxiosResponse(link);
  const domParser = new DOMParser();
  const dataDOM = domParser.parseFromString(response.data.contents, 'application/xml');

  const title = dataDOM.querySelector('title');
  const description = dataDOM.querySelector('description');
  const feedId = _.uniqueId();
  const feedData = {
    title: title.textContent,
    description: description.textContent,
    link,
    feedId,
  };

  const posts = dataDOM.querySelectorAll('item');
  const postsData = [];
  posts.forEach((post) => {
    const title = post.querySelector('title');
    const description = post.querySelector('description');
    const link = post.querySelector('link');
    const postId = _.uniqueId();
    postsData.push({
      title: title.textContent,
      description: description.textContent,
      link: link.textContent,
      feedId,
      postId,
    });
  });

  return [feedData, postsData];
};

const getSchema = (i8n, initialState) => yup.object({
  url: yup.string().url(i8n.t('error.url')).required().notOneOf(initialState.feeds.reduce((acc, feed) => [...acc, feed.link], []), i8n.t('error.notOneOf')),
});

// .notOneOf(feeds.reduce((feed) => feed.link, []), i8n.t('error.notOneOf')

const app = async () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    button: document.querySelector('button'),
    example: document.querySelector('.text-muted'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: document.querySelector('.modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.modal').querySelector('.full-article'),
    modalCloseButton: document.querySelector('.modal').querySelector('.btn-close'),
  };

  const initialState = initState();

  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: 'ru',
    resources,
  });

  const render = initView(elements, i18nextInstance);
  const state = onChange(initialState, render);

  const validate = (field, initialState) => {
    try {
      const schema = getSchema(i18nextInstance, initialState);
      schema.validateSync(field);
      return {};
    } catch (e) {
      console.log(e);
      return e;
    }
  };

  elements.form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const inputValue = elements.input.value.trim();
    state.error = validate({ url: inputValue }, initialState);

    if (!_.isEmpty(state.error)) return;
    state.processState = 'sending';

    try {
      const [feedData, postsData] = await parseData(inputValue);
      state.feeds.push(feedData);
      state.posts.push(postsData);

      state.processState = 'sent';
    } catch (err) {
      console.log(err);
      state.form.processState = 'error';
      state.form.processError = i18nextInstance.t('error.network');
      throw err;
    }
  });
};

app();
