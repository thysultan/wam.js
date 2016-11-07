/**
 * -----------------------------------------------------------
 * 
 * delegate, creates delegates
 * 
 * -----------------------------------------------------------
 */


'use strict';


/**
 * delagate, methods/getters/setters
 * 
 * @return {Delegate}
 */
function Delegate (destination, target) {
	// support instantiation with or without new keyword
	if (!(this instanceof Delegate)) {
		return new Delegate(destination, target);
	}

	this.destination = destination;
	this.target = target;
}


/**
 * delegate prototype
 * 
 * @type {Object}
 */
Delegate.prototype = {
	// delegate method
	method: function method (name) {
		var target = this.target;

		this.destination[name] = function () {
			return this[target][name].apply(this[target], arguments);
		};

		return this;
	},
	// delegate getter
	getter: function getter (name) {
		var target = this.target;

		this.destination.__defineGetter__(name, function () {
  			return this[target][name];
		});

		return this;
	},
	// delegate setter
	setter: function setter (name) {
		var target = this.target;

		this.destination.__defineSetter__(name, function (value) {
  			return this[target][name] = value;
		});

		return this;
	},
	// delegate both getters and setters
	access: function access (name) {
		return this.getter(name).setter(name);
	}
};


/**
 * -----------------------------------------------------------
 * 
 * exports
 * 
 * -----------------------------------------------------------
 */


module.exports = Delegate;
