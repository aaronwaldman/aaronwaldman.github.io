import $ from "jquery";

const Header = {

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
            "yThreshold": $("#shows").offset().top - this.height
        }];

        this.changeTriggers.sort(function(a,b) {
            return a.yThreshold > b.yThreshold
        });
    },

    handleScroll: function() {
        var bottomPos = this.window.scrollTop();
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

export default Header;
