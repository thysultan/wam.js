# wam.js

Wam is a koa and next.js inspired middleware for node the following block of code
is a quick run down on what Wam supports out of the box. 
Following that i will try to explain the details of it all.

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

when you execute `new Wam()` a new application is created.
this application object is the main point of entry for communicating with Wam api's.
The following is the object returned by `new Wam()`;

```javascript
{
	use, listen, callback, create, error, static, compress, router, components, statuses, mimes
}
```

## Use

`app.use` is used to push a middleware to the stack where context is
the object exposing the request and response objects and next is a 
function that is used to jump to the next middlware in the chain.

```javascript
app.use(function (context, next) {
	// we will cover in full detail what the context object contains
	// but if you have used Koa before this should be all to similar
	context.response.body === context.body === this.body;
	context.request.url = context.url === this.url;

	// where req and res represent the default request and response object from node
	this.req === context.req === context.response.req;
	this.res === context.res === context.response.res;

	// if there is another middlware this will execute that
	// if this is the last middlware the response will finnally end
	next();

	// anything after next() call will execute after all middlwares in the chain
	// have resolved but before the response has been sent

	console.log('hello world');
});
```

Since routes are just middlwares as well the `app.use` function 
doubles as a route register when the first argument is a String/RegExp

```javascript
app.use('/user/:name', function (ctx, next) {
	// where the .params property hold the variables
	// found in the url from the defined route
	ctx.params.name;
});
```

As you may have notices i have not specified if this is handling a `GET` or `POST`
request. When left blank the method resolves to handling all methods of that route
but you could also be explicit about it and do the following

```javascript
app.use('/user/:name', 'ALL' function (ctx, next) {
	// where `ALL` could be `GET` or `POST` or any method
});
```

If you wanted to be very explicit with routes you could also do the following,
which is how Wam handles this under the hood.

```javascript
app.use(app.route('/user/:name', 'ALL', function (ctx, next) {
	// ...
}))
```

## Listen

Creates a server and start listening for requests on the port 3000

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

First it will resolve to the folder and create a tree
of all the assets that reside there in the process
this will also gzip any compressible assets using the 
file type and filesize as an indicator.
the results of the above are cached - *paths, file stats,
and gzip payloads*.

When a request is received if the static middlware is added
before other middlwares it will try to determine if the 
request is for a static asset, if it is and the resource
is available, and the body has not been set 
it will serve the compressed asset as a stream
and assign all the necessary headers.

note that following this flow middlewares after 
the static middleware will be bypassed
if a static file is being served.

Note that in `development`(non-production) enviroment the static files
are watched for changes and updated as needed.


## Components

Creates a middleware for all the components/files found in 
the specified directory, calling the returned function
with `context` as the `this` and passing any dependencies/data
passed.

```javascript
// index.js
app.use(app.components('examples/views', {id: 1}));

// examples/views/index.js
module.exports = function ({id}) {
	this.body = id;
}

// when a request is made to `/` the function
// returned in `examples/views/index.js` will handle it.
// the step of calling next is handled internally.
```

You could also be more specific and pass an object of the files - route
matches to be used, for example...

```javascript
app.use(app.components({'examples/views': '/'}, {id: 1}));
```

## Compress

Creates a middleware that provides on the fly(non cached) compression
for example for json requests. If you want to server static content
use `Static` instead since it uses caching and streaming that is faster
to first byte and async.

```javascript
app.use(app.compress());
```

## Context

The `context` object and `next` function are the two 
arguments passed to every middlware function. 
We will start with context and what you can do with it,
though if you've used [Koa](https://github.com/koajs/koa) 
before you probably know all of this.

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

The `next` function is a central piece that connects the pieces
that are middlewares together, though unlike `Koa` the next
function accepts an optional argument that is used internally
but tha you could make use of when needed. Imagine the following


```javascript
app.use((ctx, next) => {
	// 1. if i pass 0 to next(0)
	// this will immediatly bypass all the middelwares
	// next up in the chain and diverge straight to sending
	// out the response
	next();
});

app.use((ctx, next) => {
	// 2. if i pass 1 to next(1)
	// this will do the above plus opt out of the built
	// in response handling
	next();
});

app.use((ctx) => {
	// 3. if i don't define the next argument
	// next() will automatically run at the end of this function
	// this is behaviour different from Koa
});
```

## Under The Hood

1. Wam checks if a stream has a _type property to determine and set the response type
if it has one.

2. Stores caches for the `.static` middlware in the directory provided
within a `.cache` folder. This cache is updated as needed i.e if an asset is removed
its gzipped cache resource is also removed, of course this syncing
is only in place when not in `production` mode.

3. If your filesystem supports the `/` characters in filenames then you
can probably create a routing solution with just `app.components()` 


### Intergration

Wam can be used as a general solution with the above listed api's
but really shines when coupled with [Dio.js](https://github.com/thysultan/dio.js) and
the `app.components()`, in part inspired by [next.js](https://github.com/zeit/next.js).

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
```
