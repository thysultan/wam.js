const Wam = require('../src/application.js');
const Dio = require('../../dio.js/dio.js');

const app = new Wam();


// on the fly compression i.e json requests
// app.use(app.compress());


// serve static files, cahced and compressed
app.use(app.static('examples/public'));


// component architecture v1 (directory)
app.use(app.components('examples/views', Dio));


// component architecture v2 (custom mappings)
// app.use(
// 	app.components({
// 		'examples/views/index.js': 'index'
// 	}, Dio)
// )


// middleware
// app.use((context, next) => {})


// routes
// app.use('/user/:id', 'get', (context, next) => { context.params.id === ':id' })


// start server
app.listen(3000);

// or do it by hand
// http.createServer(app.callback()).listen(3000);
