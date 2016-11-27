# wam.js

[![npm](https://img.shields.io/npm/v/wamjs.svg?style=flat)](https://www.npmjs.com/package/wamjs) [![licence](https://img.shields.io/badge/licence-MIT-blue.svg?style=flat)](https://github.com/thysultan/wam.js/blob/master/LICENSE.md) 
 ![dependencies](https://img.shields.io/badge/dependencies-none-green.svg?style=flat)

Wam is a small koa and next.js inspired middleware framework for node the following block of code is a quick run down on what Wam supports out of the box, following that i will try to explain the details of it all.

```javascript
const Wam = require('wamjs');

const app = new Wam();

// on the fly(as opposed to cached) compression i.e json requests
app.use(app.compress());

// serve static files, cached compression
app.use(app.static('examples/public'));

// component architecture v1 (directory)
app.use(app.components('examples/views', {optDependency: 1}));

// component architecture v2 (custom mappings)
app.use(app.components({'examples/views/index.js': 'index'}, {optDependency: 1}));

// middleware
app.use((context, next) => {});

// route for GET methods on /user/:id
app.use('/user/:id', 'get', (context, next) => { context.params.id === ':id' });

// route for ALL methods on /user/:id
app.use('/user/:id', (context, next) => { context.params.id === ':id' });

// start server
app.listen(3000);
```

## Application

When you execute `new Wam()` a new application is created.
This application object is the main point of entry for communicating with Wam api's. The following is the shape of the object returned by `new Wam()`;

```javascript
{
	use, listen, callback, create, error, static, 
	compress, router, components, statuses, mimes
}
```

## Use

`app.use` is used to push a middleware to the stack where context is
the object exposing the request and response objects and next is a 
function that is used to jump to the next middlware in the chain.

```javascript
app.use(function (context, next) {
	// we will cover in full detail what the context object contains
	// but if you have used Koa before this should be all to familiar
	context.response.body === context.body === this.body;
	context.request.url = context.url === this.url;

	// where req and res represent the default 
	// request and response stream object from node
	this.req === context.req === context.response.req;
	this.res === context.res === context.response.res;

	// if there is another middlware this will execute that
	// if this is the last middlware the response will end
	next();

	// anything after next() call will execute 
	// after all middlwares in the chain
	// have resolved but before the response has been sent

	console.log('hello world');
});
```

Since routes are just middlwares the `app.use` function 
doubles as a route register when the first argument is a String/RegExp

```javascript
app.use('/user/:name', function (ctx, next) {
	// where the .params property hold the variables
	// found in the url from the defined route
	ctx.params.name;
});
```

As you may have notices a method has not been specified for the request. When left blank the method resolves to handling all methods of that route
but you could also be explicit about it and do the following

```javascript
app.use('/user/:name', 'ALL' function (ctx, next) {
	// where `ALL` could be `GET` or `POST` or any method
	// or event an array ['get', 'post'] with 
	// just the methods the middlware should handle
});
```

If you wanted to be very explicit with routes you could also do the following, which is how Wam handles this under the hood.

```javascript
app.use(app.route('/user/:name', 'ALL', function (ctx, next) {
	// ...
}))
```

## Listen

Creates a server and starts listening for requests on the port 3000

```javascript
app.listen(3000);

// this is just a short hand of what is internally being handled as
http.createServer(app.callback()).listen(3000);
```

## Static

Creates a middleware that handles requests for static files

```javascript
// the following will do a couple of things
app.use(app.static('examples/public'));
```

First it will resolve to the folder and create a tree of all the assets that residing, in the process this will also gzip any compressible assets using file type and file size as an indicator. The results of the above are cached - paths, file stats, and gzip payloads.

When a request is received the middleware will try to determine if the request is for a static asset, if it is and the resource is available, and the body has not been set it will serve the compressed asset as a stream and assign all the necessary headers.

Note that following this flow successfully will result in middlewares after the Static to be bypassed when a static file is request, found and served.

When not in a production enviroment the static files are watched for changes and updated as needed.


## Components

Creates a middleware for all the components/files found in 
the specified directory and passing any dependencies if any 
the returned function is called like any other middleware when the components route is matched.

```javascript
// index.js
app.use(app.components('examples/views', {id: 1}));

// examples/views/index.js
module.exports = function ({id}) {
	return function () {
		this.body = id;
	}
}

// when a request is made to `/` the function
// returned in `examples/views/index.js` will handle it.
// the step of calling next is handled internally
// if next is not specified as an argument of the middlware.
```

You could also be more specific and pass an object of the files - to - route matches to be used, for example...

```javascript
app.use(app.components({'examples/views': '/'}, {id: 1}));
```

## Compress

Creates a middleware that provides on the fly(non cached) compression
for example for json requests. If you wanted to serve static content
use `Static` instead.

```javascript
app.use(app.compress());
```

## Context

The `context` object and `next` function are the two arguments passed to every middlware function. We will start with context and what you can do with it, though if you've used [Koa](https://github.com/koajs/koa) before you are probably familiar with this.

```javascript
{
	response: {
		// methods
		is:  (types),
		get: (name),
		set: (name, value),
		remove: (name),

		// getters and setters
		type: {(getter|setter)},
		body: {(getter|setter)},
		length: {(getter|setter)},
		message: {(getter|setter)},
		status: {(getter|setter)},
		header: {(getter)},
		lastModified: {(getter|setter)},
		socket: {getter},
		writable: {getter},
		headerSent: {getter},
		etag: {(getter|setter)},
	},

	request: {
		// methods
		is: is(types),
		get: get(name),

	 	// getters and setters
		header: {getter},
		url: {(getter|setter)},
		method: {(getter|setter)},
		path: {(getter|setter)},
		query: {(getter|setter)},
		querystring: {(getter|setter)},
		search: {(getter|setter)},
		origin: {getter},
		href: {getter},
		ext: {getter},
		socket: {getter},
		length: {getter},
		protocol: {getter},
		secure: {getter},
		type: {getter},
		host: {getter},
		ips: {getter},
	},

	// aliased to response 
	remove, set, status, message, body, length, type, 
	lastModified, etag, headerSent, writable

	// aliased to request
	accepts, get, is, querystring, socket, search, method, query, path,
	url, origin, href, protocol, host, hostname, header, secure, ext, ips
}
```

## Next

The `next` function is a central piece that connects middlewares together, though unlike `Koa` the next function accepts an optional argument that is used internally but one that you could make use of when needed.


```javascript
app.use((ctx, next) => {
	// 1. if i pass 0 to next(0)
	// this will immediatly bypass all middelwares 
	// after this middleware and send the response	next(0);
});

app.use((ctx, next) => {
	// 2. if i pass 1 to next(1)
	// this will do the above plus opt out of the built
	// in response handling
	next(1);
});

app.use((ctx) => {
	// 3. if i don't define the next argument
	// next() will automatically run at the end of this function
});
```

## Under The Hood

1. Wam checks if a stream has a _type property to determine and set the response type if it has one.

2. stores caches for the `.static` middlware in the directory provided
within a `.cache` folder. This cache is updated as needed i.e if an asset is removed its gzipped resource is also removed, though this syncing is only in place when not in `production` mode.

3. If your filesystem supports the `/` characters in filenames then you
could potentially create a routing solution with just the `app.components()` middleware.


## Intergration

Wam can be used as a general solution with the above listed api's
but really shines when coupled with [Dio.js](https://github.com/thysultan/dio.js) and the `app.components()` api, in part inspired by [next.js](https://github.com/zeit/next.js).

Note that the below will also work when used with any other vdom library 
making use of something like `renderToString/renderToStream` meaning you can do the exact following with React, Preact and Inferno
minus the `renderToCache`, and `stylesheet`.

```javascript
// views/index.js
module.exports = function ({Component, renderToStream, h, renderToCache}) {
	class Head extends Component {
		render () {
			return h('head',
				h('title', 'Hello World'),
				h('link', {rel: 'stylesheet', href: 'style.css'})
			)
		}
	}

	class Body extends Component {
		render () {
			return h('body', Hello, Button, Button);
		}
	}

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
			return h('button', 'Click Me');
		}
	}

	class Page extends Component {
		render () {
			return h('html', 
				Head,
				Body
			)
		}
	}
	
	renderToCache([Head]);

	return (ctx) => ctx.body = renderToStream(Page);
}

// index.js
const app = new require('wamjs')();

app.use(app.static('public/'));
app.use(app.components('views/', require('dio.js')));
```