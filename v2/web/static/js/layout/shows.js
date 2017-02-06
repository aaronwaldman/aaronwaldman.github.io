import $ from "jquery";
import Config from "web/static/js/layout/config";
import Chaplin from "web/static/js/common/chaplin";
import { Clock, Calendar } from "web/static/js/common/time";

const Shows = {
    events: [],

    loadDependencies: function() {
        return $.ajax({
            method: 'GET',
            url: 'https://dl.dropboxusercontent.com/u/102907239/aaron_waldman/events.json',
            dataType: 'json'
        });
    },

    init: function(response) {
        this.events = response.data;
        this.render();
        this.attachPageLoadEvents();
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
        else if (this.getHasCoordinates(show)) {
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
            data.date = Calendar.getDateFromTimestamp(show.end_time);
            data.endTime = Clock.getHumanTime(data.date);
        }
        if (show.start_time) {
            data.date = Calendar.getDateFromTimestamp(show.start_time);
            data.startTime = Clock.getHumanTime(data.date);
            data.startDateString = data.date.toDateString();
        }

        data.timeRange = Clock.getTimeRange(data.startTime, data.endTime);

        data.day = data.date.getDate();
        data.month = Calendar.getMonthShort(data.date);

        data.pastShowFlag = show.alreadyHappened && Config.grey_past_shows ? 'pastShow' : '';

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

    render: function() {
        var shows = this.events;
        var template = $('#showTemplate');
        var descriptionMaxHeight = Config.collapse_long_show_descriptions ? 36 : 9999;
        var limit = Math.min(shows.length, Config.max_shows_to_display);

        for (var i = 0; i < limit; i++) {
            // Check if show already happened
            var comparableTime = shows[i].end_time
                ? Calendar.getDateFromTimestamp(shows[i].end_time)
                : shows[i].start_time
                    ? Calendar.getDateFromTimestamp(shows[i].start_time)
                    : new Date();

            shows[i].alreadyHappened = comparableTime < new Date(); 

            if (Config.show_upcoming_shows_only && shows[i].alreadyHappened) {
                continue;
            }

            var formattedData = this.formatShowData(shows[i]);
            var formattedTemplate = Chaplin.replaceTemplateStrings(template.clone(), formattedData);
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

        if (!$("#shows-components").children() || !$("#shows-components").children().length) {
            $("#no-shows").removeClass("hide");
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

export default Shows;
