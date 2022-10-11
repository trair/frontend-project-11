import * as yup from 'yup';

const validateLink = (link, feeds) => {
    const urls = feeds.map((url) => url);
    const schema = yup.string().url().notOneOf(urls);

    try {
        schema.validateSync(link);
        return null;
    } catch (e) {
        switch (e.message) {
            case 'this must be a valid URL':
                return 'invalidUrl';
            case 'RSS is already exist':
                return 'existedUrl';
            default:
                return e.message;
        }
    };
};

const handleAddLink = (e, state, i18nInstance) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const link = formData.get('url');
    state.field = link;
    const error = validateLink(state.field, state.feeds);
    state.form.error = i18nInstance.t(`errors.${error}`);

    console.log(error);

    if (!error) {
        state.feeds.push(link);
        state.form.proccessState = 'success';
    } else {
        state.form.proccessState = 'failed';
    }
};

export default handleAddLink;