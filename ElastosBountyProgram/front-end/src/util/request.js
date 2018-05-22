import _ from 'lodash';

/*
* request api method
*
* @param
* opts.path
* opts.method
* opts.header
* opts.data
* opts.cache
* opts.success
* opts.error
*
*
* */
export const api_request = (opts = {})=>{
    const apiToken = sessionStorage.getItem('api-token');
    const headers = {};
    if(apiToken){
        headers['api-token'] = apiToken;
    }

    let server_url = process.env.SERVER_URL;
    opts = _.extend({
        method : 'get',
        headers,
        cache: 'no-cache',
        data : {},
        success : null,
        error : null,
        path : ''
    }, opts);
    server_url += opts.path;

    const method = opts.method.toLowerCase();
    const option = {
        headers : {
            'Content-Type': 'application/json',
            ...opts.headers
        },
        cache: opts.cache,
        method : opts.method,
        mode: 'cors'
    };
    if(method !== 'get' && method !== 'head'){
        option.body = JSON.stringify(opts.data);
    }
    else{
        server_url += '?';
        _.each(opts.data, (value, key)=>{
            server_url += `${key}=${encodeURIComponent(value)}&`
        });
        server_url = server_url.replace(/&$/, '');
    }

    return fetch(server_url, option).then((response)=>{
        if(response.status === 200){
            // fetch success
            return response.json();
        }
        else{
            throw new Error(response.statusText);
        }
    }).then((data)=>{
        if(data.code > 0){
            // return data correct
            opts.success && opts.success(data.data, data);
            return data.data;
        }
        else{
            opts.error && opts.error(data);
            throw new Error(data.error);
        }
    });
}