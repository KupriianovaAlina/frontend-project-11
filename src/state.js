export default () => {
  const state = {
    processState: 'filling',
    processError: null,
    error: null,
    feeds: ['https://buzzfeed.com/world.xml'],
    posts: [],
  };

  return state;
};
