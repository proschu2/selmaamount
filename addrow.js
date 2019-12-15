const http = require('http');
var options = {
    host: 'selmaamount.herokuapp.com',
    path: '/add',
    method: 'GET'
};
http.get(options)