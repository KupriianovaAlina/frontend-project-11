const parseData = (data, link, type = 'load') => {
  const domParser = new DOMParser();
  const dataDOM = domParser.parseFromString(data.contents, 'application/xml');
  const parserError = dataDOM.querySelector('parsererror');

  if (parserError && type === 'load') {
    const error = new Error(parserError.textContent);
    error.isParserError = true;
    throw error;
  }

  const title = dataDOM.querySelector('title');
  const description = dataDOM.querySelector('description');

  const descriptionText = (description) ? description.textContent : '';

  const feedData = {
    title: title.textContent,
    description: descriptionText,
    link,
  };

  const posts = dataDOM.querySelectorAll('item');
  const postsData = [];
  posts.forEach((post) => {
    const postTitle = post.querySelector('title');
    const postDescription = post.querySelector('description');
    const postLink = post.querySelector('link');
    postsData.push({
      title: postTitle.textContent,
      description: postDescription.textContent,
      link: postLink.textContent,
    });
  });

  return [feedData, postsData];
};

export default parseData;
