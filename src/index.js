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
import parseData from './parser';

const getAxiosResponse = (url) => {
  const allOriginsLink = 'https://allorigins.hexlet.app/get';

  const preparedURL = new URL(allOriginsLink);
  preparedURL.searchParams.set('disableCache', 'true');
  preparedURL.searchParams.set('url', url);

  return axios.get(preparedURL);
};

const getSchema = (feedLinks) => yup.object({
  url: yup.string().url().required().notOneOf(feedLinks),
});

const app = async () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    button: document.querySelector('button[type="submit"]'),
    example: document.querySelector('.text-muted'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: {
      modal: document.querySelector('.modal'),
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      link: document.querySelector('.modal').querySelector('.full-article'),
      closeButton: document.querySelector('.modal').querySelector('.btn-close'),
    },
  };

  const initialState = initState();
  const i18nextInstance = i18next.createInstance();

  i18nextInstance.init({
    lng: 'ru',
    resources,
  }).then(() => {
    yup.setLocale({
      mixed: {
        notOneOf: i18nextInstance.t('error.notOneOf'),
      },
      string: {
        url: i18nextInstance.t('error.url'),
        required: i18nextInstance.t('error.notEmpty'),
      },
    });

    const render = initView(elements, i18nextInstance);
    const state = onChange(initialState, render);

    elements.modal.modal.addEventListener('shown.bs.modal', (e) => {
      if (!state.openedPosts.includes(e.target.dataset.postId)) state.openedPosts.push(e.target.dataset.postId);
    });

    const validate = (field) => {
      const feedLinks = state.feeds.reduce((acc, feed) => [...acc, feed.link], []);
      const schema = getSchema(feedLinks);
      return schema.validate(field);
    };

    const setTimer = (feedData) => {
      const { link } = feedData;
      const DELAY = 5000;

      let timerId = setTimeout(function updateFeeds() {
        timerId = setTimeout(updateFeeds, DELAY);
        getAxiosResponse(link).then((response) => {
          const [, postsData] = parseData(response.data, 'update');
          postsData.forEach((post) => {
            if (!_.find(state.posts, { link: post.link })) state.posts.push(post);
          });
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
            state.error = (err.message === 'noRSS') ? { message: i18nextInstance.t('error.noRSS') } : { message: err.message };
            state.processState = 'filling';
          });
        }).catch((err) => {
          state.error = err;
          state.processState = 'filling';
        });
    });
  });
};

app();
