import ExtendableError from './utils/ExtendableError';

const ERROR_BASE_URL = 'https://mediamonks.github.io/react-redux-component-init/errors/';

class PrepareValidationError extends ExtendableError {
  constructor(message, errorId, meta) {
    super(message);

    if (errorId && meta) {
      const metaString = Object
        .entries(meta)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join('&');

      this.message += `\nFor more information see: \n${ERROR_BASE_URL}${errorId}.html#${metaString}`;
    }
  }
}

export default PrepareValidationError;
