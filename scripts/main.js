// ------------ BASIC SETTINGS -----------------

var show_upcoming_shows_only = false;
var grey_past_shows = false;
var max_shows_to_display = 10;

// ------------ BASIC SETTINGS -----------------


var loadAjax = function() {
    var jsonMimeType = "application/json;charset=UTF-8";
    $.ajax({
        method: 'GET',
        url: 'https://dl.dropboxusercontent.com/u/102907239/aaron_waldman/events.json',
        dataType: 'json'
    })
    .then(function(data) {
        window.test = data;
        if (data.data) {
            Shows.updateData(data.data);
        }
        else throw new Error('Ajax load failed: ', data);
    })
    .fail(function(data) { console.log('AHHHH', data);})
};

var Time = (function(){
    return {
        getHumanTime: function(date) {
            var rawHour = date.getHours();
            var isPm = rawHour > 11;

            var hour = rawHour === 0 ? 12 : isPm && rawHour !== 12 ? rawHour - 12 : rawHour;
            var minutes = (date.getMinutes() + '0').slice(-2);
            var amPmString = isPm ? 'pm' : 'am';

            return hour + ':' + minutes + amPmString;
        },

        getTimeRange: function(start, end) {
            start = start || "";
            end   = end   || "";

            if (!start || !end) {
                return start + end
            }
            return start + " &ndash; " + end;
        }
    }
})();

var Template = (function(){
    return {
        replaceTemplateStrings: function(element, data) {
            var template = typeof element === 'string' ? element : $(element).html();
            var search = /\{\{.+?\}\}/g;

            return template.replace(search, function(str) {
                var unwrapped = str.slice(2, -2);

                return data.hasOwnProperty(unwrapped) ? data[unwrapped] : unwrapped;
            });
        }
    }
})();

var Carousel = (function($, Time) {
    return {
        init: function() {
            var carouselElement = $('#slideshow');
            carouselElement.slick({
                infinite: true,
                arrows: false,
                dots: true,
                autoplay: true,
                autoplaySpeed: 60000,
                speed: 500,
                appendDots: '.carousel-buttons'
            });
        }
    };
})($, Time);

var Shows = (function($, Time) {
    return {

        showData: [],

        init: function() {
            this.attachPageLoadEvents();
        },

        updateData: function(data){
            this.events = data;
            this.render(data);
        },

        formatShowData: function(show) {
            var data = {};
            var location = show.place && show.place.location;
            var linkRoot = "http://www.facebook.com/";
            var eventLinkRoot = linkRoot + "events/";
            var mapLinkRoot = "http://www.google.com/maps/";
            
            data.eventLink = eventLinkRoot + show.id;

            data.placeName = (show.place && show.place.name) || '';
            data.placeLink = linkRoot + show.place.id;

            if (this.getHasFullAddress(show)) {
                data.mapLink = mapLinkRoot
                    + 'place/'
                    + encodeURIComponent( (data.placeName ? data.placeName + ', ' : '')
                        + (location.street ? location.street + ', ' : '')
                        + (location.city && location.state ? location.city + ', ' : '')
                        + (location.city && location.state ? location.state + ', ' : '')
                        + (location.zip ? location.zip : '' ));

                // Remove last set of ',+' chars if any at end of url
                data.mapLink = data.mapLink.replace(/(,\s$)|(%2C%20$)/, '');
            }
            else if(this.getHasCoordinates(show)) {
                data.mapLink = mapLinkRoot
                    + '?q='
                    + encodeURIComponent( location.latitude
                        + ','
                        + location.longitude );
            }
            else {
                data.mapLinkClass = 'hide';
            }

            if (show.end_time) {
                data.date = new Date(show.end_time);
                data.endTime = Time.getHumanTime(data.date);
            }
            if (show.start_time) {
                data.date = new Date(show.start_time);
                data.startTime = Time.getHumanTime(data.date);
                data.startDateString = data.date.toDateString();
            }

            data.timeRange = Time.getTimeRange(data.startTime, data.endTime);

            data.day = data.date.getDate();
            data.month = data.date.toLocaleString("en-us", { month: "short" });

            data.pastShowFlag = show.alreadyHappened && window.grey_past_shows ? 'pastShow' : '';

            data.title = show.name;
            data.title = show.name;

            return $.extend({}, show, data);
        },

        getHasFullAddress: function(show) {
            return show.place && show.place.location
                && show.place.location.street
                && show.place.location.state
                && show.place.location.city
                && show.place.location.zip
                && true;
        },
        getHasCoordinates: function(show) {
            return show.place && show.place.location
                && show.place.location.latitude
                && show.place.location.longitude
                && true;
        },

        getShowListHeight: function() {
            var showItems = $('#shows-components').children();
            var height = 0;
            if (showItems && showItems.length) {
                showItems.each(function(i, item) { 
                    height = height + $(item).height();
                });
            }
            return height;
        },

        render: function(shows) {
            var template = $('#showTemplate');
            var descriptionMaxHeight = 36;
            var limit = Math.min(shows.length, window.max_shows_to_display);

            for (var i = 0; i < limit; i++) {
                // Check if show already happened
                var comparableTime = shows[i].end_time ? new Date(shows[i].end_time) :
                           shows[i].start_time ? new Date(shows[i].start_time) : 
                           new Date();

                shows[i].alreadyHappened = comparableTime < new Date(); 

                if (window.show_upcoming_shows_only && shows[i].alreadyHappened) {
                    continue;
                }

                var formattedData = this.formatShowData(shows[i]);
                var formattedTemplate = Template.replaceTemplateStrings(template.clone(), formattedData);
                var element = $(formattedTemplate);

                $('#shows-components').append(element);

                var totalHeight = this.getShowListHeight();
                var containerHeight = $('#shows-components').height();
                if (totalHeight < containerHeight) {
                    $('#shows-components').addClass('no-scroll');
                }

                if (element.find('.eventDescription').innerHeight() > descriptionMaxHeight) {
                    element.addClass('collapsed-description');
                }

                this.attachRenderEvents(element, formattedData);
            }
        },

        attachRenderEvents: function(element, data) {
            element.on('click', function(event) {
                document.href = data.eventLink;
            });

            $('#shows-components').on('scroll', function(event) {
                if ($(event.currentTarget).scrollTop() > 10) {
                    $(event.currentTarget).parent().addClass('scrolledShows');
                }
                else {
                    $(event.currentTarget).parent().removeClass('scrolledShows');
                }
            });
        },

        attachPageLoadEvents: function() {
            $('body').on('click', '.description-more, .eventDescription', function(event) {
                $(event.currentTarget).parents('.showItem').removeClass('collapsed-description');
            });
        }
    };
})($, Time);

$(document).ready(function(){
    var components = [Carousel, Shows];
    for (var i = 0, l = components.length; i < l; i++) {
        if (typeof components[i].init === 'function') {
            components[i].init();
        }
    }

    loadAjax();
});