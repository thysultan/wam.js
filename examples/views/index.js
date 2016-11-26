module.exports = function ({Component, renderToString, renderToStream, h, renderToCache}) {
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

	class Hello extends Component {
		stylesheet () {
			return `
				{
					font-size: 40px;
				}
			`;
		}
		render () {
			return h('h1', 'Hello World')
		}
	}

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

	var render = renderToStream();

	return (ctx) => ctx.body = renderToStream(Page);
}