export default () => {
  const state = {
    processState: 'filling',
    processError: null,
    error: null,
    feeds: [],
    posts: [],
    openedPosts: [],
    isUpdating: false,
  };

  return state;
};
