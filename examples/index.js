const Wam = require('../src/application.js');
const Dio = require('../../dio.js/dio.js');

const app = new Wam();
const http = app.http;

const {Component, renderToString, renderToStream, DOM, h} = Dio;
const {button, text, h1, div} = DOM(['button', 'h1', 'text', 'div']);

class Button extends Component {
	stylesheet () {
		return `
			{
				color: black;
				border: 1px solid red;
				padding: 10px;
			}
		`
	}
	render () {
		return button(null, [text('Click Me')]);
	}
}

class Heading extends Component {
	stylesheet () {
		return `
			{
				font-size: 40px;
			}
		`;
	}
	render () {
		return h1(null, [text('Hello World')])
	}
}

class View extends Component {
	render () {
		return div(null, [Heading, Button, Button]);
	}
}

// http.createServer(function(request, response) { 
//     response.writeHeader(200, {"Content-Type": "text/html"});  
//     renderToStream(Button).pipe(response);
// }).listen(3000, '127.0.0.1');

app.use(app.compress());
app.use(app.static('examples/public'));

// app.use('/:user', 'get', function (ctx, next) {
// 	ctx.body = '<h1>Hello World</h1>';

// 	console.log(ctx.params);

// 	next();
// });

var Stream = renderToStream(null, `
		<html>
			<head>
				<title>Example</title>
			</head>
			<body hydrate>
				{{body}}

				<script>
					var prom = Promise.resolve();
					var start = performance.now();
					for (var i = 0; i < 1000; i++) {
						var next = prom instanceof Promise;
						if (next === undefined) {
							throw 'error';
						}
					}
					console.log(performance.now()-start, 'instance');

					var prom = Promise.resolve();
					var start = performance.now();
					for (var i = 0; i < 1000; i++) {
						var next = prom && typeof prom.then === 'function' && true;
						if (next === undefined) {
							throw 'error';
						}
					}
					
					console.log(performance.now()-start, 'property');
				</script>
			</body>
		</html>`);

app.use((ctx, next) => {
	// ctx.body = renderToString([Heading, Button], `
	ctx.type = 'html';
	// ctx.body = new Stream([Heading, Button]);
	// ctx.body = renderToStream(View);
	ctx.body = renderToStream([Heading, Button], `
		<html>
			<head>
				<title>Example</title>
			</head>
			<body hydrate>
				{{body}}

				<script>
					var prom = Promise.resolve();
					var start = performance.now();
					for (var i = 0; i < 1000; i++) {
						var next = prom instanceof Promise;
						if (next === undefined) {
							throw 'error';
						}
					}
					console.log(performance.now()-start, 'instance');

					var prom = Promise.resolve();
					var start = performance.now();
					for (var i = 0; i < 1000; i++) {
						var next = prom && typeof prom.then === 'function' && true;
						if (next === undefined) {
							throw 'error';
						}
					}
					console.log(performance.now()-start, 'property');
				</script>
			</body>
		</html>		
	`);

	// ctx.body = renderToString([Heading, Button], `
	// 	<html>
	// 		<head>
	// 			<title>Example</title>
	// 		</head>
	// 		<body hydrate>
	// 			{{body}}

	// 			<script>
	// 				var prom = Promise.resolve();
	// 				var start = performance.now();
	// 				for (var i = 0; i < 1000; i++) {
	// 					var next = prom instanceof Promise;
	// 					if (next === undefined) {
	// 						throw 'error';
	// 					}
	// 				}
	// 				console.log(performance.now()-start, 'instance');

	// 				var prom = Promise.resolve();
	// 				var start = performance.now();
	// 				for (var i = 0; i < 1000; i++) {
	// 					var next = prom && typeof prom.then === 'function' && true;
	// 					if (next === undefined) {
	// 						throw 'error';
	// 					}
	// 				}
	// 				console.log(performance.now()-start, 'property');
	// 			</script>
	// 		</body>
	// 	</html>		
	// `);

	next();
});

// // start server
app.listen(3000);
