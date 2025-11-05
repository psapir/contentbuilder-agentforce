const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const bodyParser  = require('body-parser');
const app = express();
const http = require('http');
const path        = require('path');
const agentforce = require('./routes/agentforce');

var routes      = require('./routes');


var engines = require('consolidate');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });

app.use(cookieParser());


app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ type: 'application/json', limit: '50mb', extended: true }));



//Sets our app to use the handlebars engine
app.set('view engine', 'hbs');


// routes
app.post('/agentforce/getResults/',agentforce.getResults);

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use('/',express.static('dist'));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});