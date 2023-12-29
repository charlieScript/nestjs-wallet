import axios from 'axios';
const createAxios = (config) => {
  return axios.create({
    baseURL: `${config.baseUrl}`,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${config.secretKey}`,
      'User-Agent': `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36`,
    },
  });
};

export const paystackClient = (client) => {
  return createAxios(client);
};
