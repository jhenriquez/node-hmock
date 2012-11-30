var url = require('url')
	, http = require('http')
	, MockedRequest = require('./mockedRequest')
	, MockedResponse = require('./mockedResponse');

/**
 * hmock
 */
function hmock() {
	var self = this;

	// hold the mocked requests
	http._mocks = {
			get: {}
		, post: {}
	};

	// save the original
	http._request = http.request;

	/**
	 * Override http.request
	 *
	 * DISCLAIMER: I know most people think this is a horrible
	 * 						 practice; I agree, but at the end of the day
	 * 						 this gets the job done and it is only meant 
	 * 						 to be used during unit testing anyway.
	 */
	http.request = function(options, callback) {
		if (typeof options === 'string') {
			options = url.parse(options);
		}

		var hostname = ((options.hostname || options.host) || 'localhost').toLowerCase()
			, port = options.port || 80
			, path = options.path || '/'
			, method = (options.method ? options.method.toLowerCase() : 'get');

		var href = 'http://'.concat(hostname).concat(':').concat(port).concat(path);

		if (http._mocks[method] && http._mocks[method][href]) {
			return new MockedRequest(http._mocks[method][href], callback);
		} 

		return http._request(options, callback);
	};

	/**
	 * Creates a mocked GET request/response.
	 *
	 * @param {String} url
	 * @param {Object} res
	 * @api public
	 */
	this.get = function(url, res) {
		self.mock('GET', url, res);
	};

	/**
	 * Creates a mocked POST request/response.
	 *
	 * @param {String} url
	 * @param {Object} res
	 * @api public
	 */
	this.post = function(url, res) {
		self.mock('POST', url, res);
	};

	/**
	 * Adds the specified mock request/response.
	 *
	 * @param {String} method
	 * @param {String} url
	 * @param {Object} res
	 * @api public
	 */
	this.mock = function(method, url, res) {
		http._mocks[method.toLowerCase()][url.toLowerCase()] = res;
	};
};

/**
 * Expose
 */
module.exports = hmock;