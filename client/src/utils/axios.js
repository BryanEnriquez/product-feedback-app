import axios from 'axios';

const ax = axios.create({
  withCredentials: true,
  baseURL: process.env.REACT_APP_API,
});

export default ax;
