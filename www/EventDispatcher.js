/* EventDispatcher */
(function EventDispatcherModule() {
	var SERIAL = -1;
	window.EventDispatcher = function EventDispatcher() {
		var _id = SERIAL++;
		var _events = {};
		
		function stopPropagation() {
			this.cancel = true;
		};

		this.addEventListener = function(event, callback) {
			var rry = _events[event];
			if (!rry)
				rry = _events[event] = new Array();
			if (!callback.EventDispatcher_ID)
				callback.EventDispatcher_ID = {};
			callback.EventDispatcher_ID[_id] = rry.length;
			rry[rry.length] = callback;
		};

		this.removeEventListener = function(event, callback) {
			var _idee = _id;
			var rry = _events[event];
			var id = callback.EventDispatcher_ID[_idee];
			if (!rry || (!id && id !== 0))
				return;
			if (!rry[id])
				return;

			rry.splice(id, 1);

			var length = rry.length;
			if (!length) {
				delete _events[event];
				delete callback.EventDispatcher_ID[_idee];
				return;
			}
			for (var i = 0; i < length; i++)
				rry[i].EventDispatcher_ID[_idee] = i;
		};

		this.dispatchEvent = function(event, data) {
			var rry = _events[event];
			if (!rry)
				return;
			var length = rry.length;
			for (var i = 0; i < length; i++) {
				var diff = length - rry.length;
				if (diff > 0) {
					length -= diff;
					i -= diff;
				}
				if (!data) data = {};
				data.stopPropagation = stopPropagation.bind(data);
				var out = rry[i](data);
				if (data.cancel || out === false)
					return;
			}
		};

		this.removeEventListeners = function(event) {
			if (event)
				delete _events[event];
			else
				_events = {};
		};
	};
})();