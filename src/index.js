/* eslint-disable no-shadow */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
import './styles.scss';
import 'bootstrap';
import axios from 'axios';
import * as yup from 'yup';
import * as _ from 'lodash';
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

const parseData = (data) => {
  const domParser = new DOMParser();
  const dataDOM = domParser.parseFromString(data.contents, 'application/xml');

  const title = dataDOM.querySelector('title');
  const description = dataDOM.querySelector('description');
  const feedId = _.uniqueId();

  const feedData = {
    title: title.textContent,
    description: '' ?? description.textContent,
    link: data.status.url,
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

const getSchema = (i8n, feedLinks) => yup.object({
  url: yup.string().url(i8n.t('error.url')).required().notOneOf(feedLinks, i8n.t('error.notOneOf')),
});

const app = async () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    button: document.querySelector('button[type="submit"]'),
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

  i18nextInstance.init({
    lng: 'ru',
    resources,
  }).then(() => {
    const render = initView(elements, i18nextInstance);
    const state = onChange(initialState, render);

    const validate = (field) => {
      const feedLinks = state.feeds.reduce((acc, feed) => [...acc, feed.link], []);
      const schema = getSchema(i18nextInstance, feedLinks);
      return schema.validate(field);
    };

    const setTimer = (feedData) => {
      const { link } = feedData;
      const DELAY = 5000;

      let timerId = setTimeout(function updateFeeds() {
        getAxiosResponse(link).then((response) => {
          const [, postsData] = parseData(response.data);
          postsData.forEach((post) => {
            if (!_.find(state.posts, { link: post.link })) state.posts.push(post);
          });
          timerId = setTimeout(updateFeeds, DELAY);
        });
      }, DELAY);
    };

    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const inputValue = elements.input.value.trim();

      state.processState = 'sending';

      validate({ url: inputValue })
        .then(() => {
          state.error = {};
          getAxiosResponse(inputValue).then((response) => {
            const [feedData, postsData] = parseData(response.data);
            state.feeds.push(feedData);
            state.posts = [...state.posts, ...postsData];
            state.processState = 'sent';
            setTimer(feedData);
          }).catch((err) => {
            state.processState = 'error';
            throw err;
          });
        }).catch((err) => {
          state.error = err;
          state.processState = 'filling';
        });
    });
  });
};

app();
