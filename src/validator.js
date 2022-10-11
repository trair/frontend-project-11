import * as yup from 'yup';

const validateLink = (link, feeds) => {
    const urls = feeds.map((url) => url);
    const schema = yup.string().url().notOneOf(urls);

    try {
        schema.validateSync(link);
        return null;
    } catch (e) {
        return e.message;
    };
};

const handleAddLink = (e, state) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const link = formData.get('url');
    state.field = link;
    const errors = validateLink(state.field, state.feeds);
    state.form.errors = errors;

    console.log(errors);

    if (!errors) {
        state.feeds.push(link);
        state.form.proccessState = 'success';
    } else {
        state.form.proccessState = 'failed';
    }
};

export default handleAddLink;