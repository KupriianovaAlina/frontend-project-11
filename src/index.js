import './styles.scss';
import 'bootstrap';
import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';
import onChange from 'on-change';
import i18next from 'i18next';
import initState from './state';
import initView from './view';
import resources from './locales/index';

const app = async () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    button: document.querySelector('button'),
    example: document.querySelector('.text-muted'),
  };

  const initialState = initState();

  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: 'ru',
    resources,
  });

  const render = initView(elements, i18nextInstance);
  const state = onChange(initialState, render);

  const schema = yup.object({
    url: yup.string().url(i18nextInstance.t('error.url')).required().notOneOf(state.feeds, i18nextInstance.t('error.notOneOf')),
  });

  const validate = (field) => {
    try {
      schema.validateSync(field);
      return {};
    } catch (e) {
      console.log(e.type);
      return e;
    }
  };

  elements.form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const inputValue = elements.input.value;
    state.error = validate({ url: inputValue });

    if (!_.isEmpty(state.error)) return;

    state.processState = 'sending';
    state.processState = 'sent';

    try {
      // const response = await axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(inputValue)}`);
      const response = await axios.get(inputValue); // выдаст ошибку
      console.log(response);

      // state.form.processState = 'sent';
    } catch (err) {
      console.log(err);
    }
  });
};

app();
