// ------------ BASIC SETTINGS -----------------

var show_upcoming_shows_only = false;
var grey_past_shows = false;
var max_shows_to_display = 10;
var collapse_long_show_descriptions = false;

// ------------ BASIC SETTINGS -----------------


// All dependecies objects return a promise, which run the module's init function when resolved (see loadAjax function)
var Dependencies = (function() {
    return {
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
})();

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

        getTimezoneOffset: function(dateString, timezoneRegex) {
            var timezoneOffset = dateString.match(timezoneRegex);
            var timezoneRaw = parseInt(timezoneOffset && timezoneOffset[0].replace(/w/i, ""), 10);
            return timezoneRaw / 100;
        },

        getDateFromTimestamp: function(dateString) {
            var timezoneRegex = /-(GMT|)\d\d\d\d$/gi;

            var formattedDateString = dateString.replace(timezoneRegex, "");
            var date = new Date(formattedDateString);

            var timezoneHours = this.getTimezoneOffset(dateString, timezoneRegex);
            var adjustedHours = date.getHours() - timezoneHours;
            return new Date(date.setHours(adjustedHours));
        },

        getMonthShort: function(date) {
            var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
              "July", "Aug", "Sept", "Oct", "Nov", "Dec"
            ];
            var monthNum = date.getMonth();
            return monthNames[monthNum];
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

var Header = (function($, window) {

    return {

        element: null,

        window: null,

        height: null,

        mobileNavToggle: null,

        pageLinks: null,

        activeState: "",

        changeTriggers: [/* {klass: string, yThreshold: 0} */],

        init: function() {
            this.window = $(window);
            this.element = $("#header");
            this.mobileNavToggle = $('#header-links-toggle');
            this.pageLinks = this.element.find(".page-link");
            this.height = this.element.outerHeight();

            this.setTriggerPositions();

            this.setMobileMenuEvents();

            this.window.scroll(this.handleScroll.bind(this));
            this.handleScroll();
            this.element.removeClass('noBg');
        },

        setTriggerPositions: function() {
            this.changeTriggers = [{
                "klass": "homeContentOverlap",
                "yThreshold": $("#home-container").offset().top,
            }, {
                "klass": "showsPageOverlap",
                "yThreshold": $("#shows").offset().top
            }];

            this.changeTriggers.sort(function(a,b) {
                return a.yThreshold > b.yThreshold
            });
        },

        handleScroll: function() {
            var bottomPos = this.height + this.window.scrollTop();
            var active = null;

            this.changeTriggers.forEach(function(trigger) {
                if (bottomPos > trigger.yThreshold) {
                    active = trigger;
                }
            });

            if (!active && this.active) {
                this.element.removeClass(this.active.klass);
                this.active = null;
            }
            else if (active != this.active) {
                if (this.active) this.element.removeClass(this.active.klass);
                this.active = active;
                this.element.addClass(active.klass);
            }
        },

        setMobileMenuEvents: function() {
            $(this.mobileNavToggle).click(this.handleMobileMenuClick.bind(this));
            $(this.pageLinks).click(this.hideMobileMenu.bind(this));
        },

        handleMobileMenuClick: function(event) {
            event.stopPropagation();

            if (this.element.is(".show-mobile-nav")) {
                this.hideMobileMenu(event);
            }
            else {
                this.showMobileMenu(event);
            }
        },

        showMobileMenu: function(event) {
            var self = this;
            this.element.addClass("show-mobile-nav");

            $('body').one("click", function(newEvent) {
                self.handleActiveMenuClick(newEvent);
            });
        },

        hideMobileMenu: function(event) {
            this.element.removeClass("show-mobile-nav");
        },

        handleActiveMenuClick: function(event) {
            var self = this;
            var isTargetHeader = $(event.target).closest("#header").length;
            event.stopPropagation();
            if (!isTargetHeader) {
                self.handleMobileMenuClick(event);
            } else {
                $('body').one("click", function(newEvent) {
                    self.handleActiveMenuClick(newEvent);
                });
            }
        }
    };

})($, window);


var Booking = (function($) {
    return {

        Clipboard: null,

        bookingLink: null,

        bookingForm: null,

        phoneClipboardButton: null,
        emailClipboardButton: null,
        allClipboardButtons: null,

        init: function(Clipboard) {
            this.Clipboard = Clipboard;

            this.bookingLink = $("#booking-trigger");
            this.bookingForm = $("#booking-info");
            this.phoneClipboardButton = $("#phone-clipboard");
            this.emailClipboardButton = $("#email-clipboard");
            this.allClipboardButtons = $(this.phoneClipboardButton).add(this.emailClipboardButton);
            this.phoneToCopy = this.bookingForm.find('.to-copy');

            this.attachEvents();
        },

        attachEvents: function() {
            var self = this;
            this.bookingLink.one('click', function(event) {
                self.handleBookingLinkClick(event);
            });

            new this.Clipboard(this.emailClipboardButton[0]);
            new this.Clipboard(this.phoneClipboardButton[0]);
            this.allClipboardButtons.click(function(event) {
                self.allClipboardButtons.removeClass("selected");
                $(event.currentTarget).addClass("selected");
            });
        },

        handleBookingLinkClick(event) {
            var self = this;
            this.bookingLink.addClass("active");
            event.stopPropagation();

            $('body').one("click", function(newEvent) {
                self.handleClickWhileBookingActive(newEvent);
            });
        },

        handleClickWhileBookingActive(event) {
            var self = this;
            var isTargetBookingForm = $(event.target).closest("#booking-info").length;
            event.stopPropagation();
            if (!isTargetBookingForm) {
                this.bookingLink.removeClass("active");
                this.allClipboardButtons.removeClass("selected");

                this.bookingLink.one('click', function(newEvent) {
                    self.handleBookingLinkClick(newEvent);
                });
            } else {
                $('body').one("click", function(newEvent) {
                    self.handleClickWhileBookingActive(newEvent);
                });
            }
        }
    };
})($);


var Shows = (function($, Time) {
    return {

        events: [],

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
                data.date = Time.getDateFromTimestamp(show.end_time);
                data.endTime = Time.getHumanTime(data.date);
            }
            if (show.start_time) {
                data.date = Time.getDateFromTimestamp(show.start_time);
                data.startTime = Time.getHumanTime(data.date);
                data.startDateString = data.date.toDateString();
            }

            data.timeRange = Time.getTimeRange(data.startTime, data.endTime);

            data.day = data.date.getDate();
            data.month = Time.getMonthShort(data.date);

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

        render: function() {
            var shows = this.events;
            var template = $('#showTemplate');
            var descriptionMaxHeight = collapse_long_show_descriptions ? 36 : 9999;
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

            if (!$("#shows-components").children() || !$("#shows-components").children().length) {
                $("#no-shows").addClass("show");
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
    // Repetitive keys are needed for easy dependency loading
    var modules = { Header: Header, Shows: Shows, Booking: Booking };

    for (var moduleKey in modules) {
        try {
            var context = modules[moduleKey];
            if (typeof window.Dependencies[moduleKey] === 'function') {
                var loader = window.Dependencies[moduleKey]();

                loader.then(modules[moduleKey].init.bind(context));
            }
            else if (context && typeof modules[moduleKey].init === 'function') {
                modules[moduleKey].init();
            }
            else {
                console.warn("Uhh what happened to " + moduleKey + "?");
            }
        }
        catch(e) {
            console.error("Error initializing module: " + moduleKey + " - Msg:", e);
        }
    }
});