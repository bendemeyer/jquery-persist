(function($) {
	$.fn.extend({
		//one method to dynamically apply the best available persistent event handler
		persist: function (event,select,data,handler) {
		//save the object that calls the method for use inside functions
		var $this = this;
			//if $(...).on() is available, arrange the arguments properly and use it
			if ($.fn.on) {
				this.on(event,select,data,handler);
			}
			//if $(...).delegate() is available, arrange the arguments properly and use it
			else if ($.fn.delegate) {
				this.delegate(select,event,data,handler);
			}
			//if neither are available (and since "$(...).live() wouldn't really work in this context), build a custom handler
			else {
				//jQuery.cache will hold our data. It didn't exist in the first few versions of jQuery, so create it if it's not there
				//We're using it to store the state of each custom handler created, so we can deactivate it if $(...).unpersist() is called.
				if (!$.cache) {
					$.cache = {};
				}
				//Our custom property on jQuery.cache needs to be created if it hasn't been already. It's an array.
				if (!$.cache.persist) {
					$.cache.persist = [];
				}
				//This object will be added to the jQuery.cache.persist array
				var eventObject = {};
				eventObject.active = true;
				eventObject.elem = this;
				eventObject.event = event;
				eventObject.select = select;
				//if the function was called without data, set the handler as the 3rd argument
				eventObject.handler = handler || data;
				$.cache.persist[$.cache.persist.length] = eventObject;
				//if the function was called without data, set the handler as the 3rd argument, and set data as null
				handler = handler || data;
				data = handler == data ? null : data;
				//if jQuery 1.0.* manually handle event data because it doesn't support event data naitivly
				//put a "bind" handler on the object that called the $(...).persist() method
				//call a custom function that will determine if each event matches the selector, and run the handler if it does
				if ($.macros) {
					this.bind(event,function(e) { bindHandle(e,this,data) });
				}
				//does support event data naitivly
				else {
					this.bind(event,data,function(e) { bindHandle(e,this) });
				}
				//the custom persistent binding function, accepts 3 arguments
				//the event Object
				//the element on which the "bind" method was called
				//event data, for jQuery 1.0.* which does not support event data
				function bindHandle(e,t,d) {
					//if event data has been passed as an argument, attach it to the event object
					if (d) {
						e.data = d;
					}
					//assume the attached action should be carried out
					var active = true;
					//determine whether or not it should by looping through each entry in jQuery.cache.persist
					//for each matching entry, set the local "active" variable accordinly
					//the most recent matching entry will determine if the event should be fired
					for (var i = 0; i < $.cache.persist.length; i++) {
						if ($.cache.persist[i].elem.index(t) != -1 &&
							($.cache.persist[i].event == event || !$.cache.persist[i].event) &&
							($.cache.persist[i].select == select || !$.cache.persist[i].select) &&
							($.cache.persist[i].handler == handler || !$.cache.persist[i].handler))
						{
							active = $.cache.persist[i].active;
						}
					}
					//if the event hasn't been cancelled by $(...).unpersist()
					if (active) {
						//get the loweset element in the tree targeted by the event
						var elem = e.target;
						//check if that element fits the selector, and is a child of the object that originally called the method
						//if so, run the handler and pass it the event object
						if ($(elem).is(select) && $this.find(elem)) {
							handler(e);
						}
						//if not, check each successive parent element to see if it matches the selector, while still being a child of the original object
						//if it is, run the handler and break out of the loop
						//if it's not a child of the original element, or if we reach the top of the document tree without matching the selector,
						//	exit the loop withour running the handler
						else {
							while (elem = elem.parentElement && $this.find(elem)) {
								if ($(elem).is(select)) {
									handler(e);
									break;
								}
							}
						}
					}
				}
			}
		},
		//a method to remove handlers dynamically, as they were applied by $(...).persist()
		unpersist: function (event,select,handler) {
			//if $(...).off() is available, then $(...).persist() should have used $(...).on() to apply handlers
			//so use $(...).off() to remove them
			if ($.fn.off) {
				this.off(event,select,handler);
			}
			//if $(...).undelegate() is available, then $(...).persist() should have used $(...).delegate() to apply handlers
			//so use $(...).undelegate() to remove them
			else if ($.fn.undelegate) {
				//$(...).undelegate() doesn't work if you pass it all undefined arguments, so we have to call it empty
				if (!arguments.length) {
					this.undelegate();
				}
				//works fine if only some elements are undefined
				else {
					this.undelegate(select,event,handler);
				}
			}
			//if niether $(...).off() nor $(...).undelegate() are available, then the the custom function would have been used to attach handlers
			//add a new item to the jQuery.cache.persist array with the details passed in $(...).unpersist()
			//set "active" to false
			//if this is the most recent matching entry for a handler attached with the custom function, it won't run.
			else {
				if (!$.cache) {
					$.cache = {};
				}
				if (!$.cache.persist) {
					$.cache.persist = [];
				}
				var eventObject = {};
				eventObject.active = false;
				eventObject.elem = this;
				eventObject.event = event;
				eventObject.select = select;
				eventObject.handler = handler;
				$.cache.persist[$.cache.persist.length] = eventObject;
			}
		}
	});
})(jQuery);