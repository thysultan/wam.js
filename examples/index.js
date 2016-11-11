const Wam = require('../src/application.js');
const Dio = require('../../dio.js/dio.js');

const app = new Wam();

const {Component, renderToString, DOM} = Dio;
const {button, text, h1} = DOM(['button', 'h1', 'text']);

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
	render () {
		return h1(null, [text('Hello World')])
	}
}



app.use(app.compress());
app.use(app.static('examples/public'));

app.use('/:user', 'get', function (ctx, next) {
	ctx.body = '<h1>Hello World</h1>';

	console.log(ctx.params);

	next();
});

app.use((ctx, next) => {
	ctx.body = renderToString([Heading, Button], `
		<html>
			<head>
				<title>Example</title>
				{{style}}
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

	next();
});

// start server
app.listen(3000);
