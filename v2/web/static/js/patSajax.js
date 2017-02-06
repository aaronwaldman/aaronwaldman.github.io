/* 
 * PatSajax Ajax Dependency loader
 *
 * Loads Third-party or any other type of script not available to this server.
 */

export const PatSajax = {
	Shows: function() {
        return $.ajax({
            method: 'GET',
            url: 'https://dl.dropboxusercontent.com/u/102907239/aaron_waldman/events.json',
            dataType: 'json'
        });
    },

    Booking: function() {
        var promise = $.Deferred();

        if (!window.Clipboard) {
            window.Clipboard = null;

            var iterations = 0;
            var MAX_ITERATIONS = 100;
            var clipboardInterval = setInterval(function() {
                iterations++;

                if (typeof window.Clipboard === 'function') {
                    promise.resolve(window.Clipboard);
                    window.clearInterval(clipboardInterval);
                }
                if (iterations > MAX_ITERATIONS) {
                    promise.reject("Timed out while waiting for Clipboard.js library to load");
                    window.clearInterval(clipboardInterval);
                }
            }, 100);

            return promise.promise();
        }

        return promise.resolve(window.Clipboard);
    }
}

export default PatSajax;