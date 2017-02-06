import $ from "jquery";

/*
 * Shitty templating(?) engine
 * Like Handlebars, but if a dictator came along and ruined it
 */
const Chaplin = {
    replaceTemplateStrings: function(element, data) {
        var template = typeof element === 'string' ? element : $(element).html();
        var search = /\{\{.+?\}\}/g;

        return template.replace(search, function(str) {
            var unwrapped = str.slice(2, -2);

            return data.hasOwnProperty(unwrapped) ? data[unwrapped] : unwrapped;
        });
    }
}

export default Chaplin;