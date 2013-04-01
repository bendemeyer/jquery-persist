#jQuery.persist()

###A plugin for graceful degradation of jQuery persistent event handlers across multiple versions.

Dynamically selects `$().on()` or `$().delegate()` depending on the version of jQuery in use. For versions of jQuery below 1.4.2 (when `$().delegate()` was introduced), a custom handler is used that mimics the behavior of `$().on()` and `$().delegate()`. `$().live()` is not used in this project because its behavior is inconsistent with that of `$().on()` and `$().delegate()`, so the custom handler is used instead.

More information can be found in this blog post:

http://www.bendemeyer.com/2013/03/19/graceful-degradation-of-jquery-event-handlers/
