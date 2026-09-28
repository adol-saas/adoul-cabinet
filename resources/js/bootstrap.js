import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const token = document.head ? document.head.querySelector('meta[name="csrf-token"]') : null;
if (token && token.content) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}
