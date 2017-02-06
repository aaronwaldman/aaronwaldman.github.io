import $ from "jquery";

const Booking = {

    Clipboard: null,

    bookingLink: null,

    bookingForm: null,

    phoneClipboardButton: null,
    emailClipboardButton: null,
    allClipboardButtons: null,

    loadDependencies: function() {
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
    },

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

    handleBookingLinkClick: function(event) {
        var self = this;
        this.bookingLink.addClass("active");
        event.stopPropagation();

        $('body').one("click", function(newEvent) {
            self.handleClickWhileBookingActive(newEvent);
        });
    },

    handleClickWhileBookingActive: function(event) {
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

export default Booking;
