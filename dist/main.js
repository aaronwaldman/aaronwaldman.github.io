var show_upcoming_shows_only=!1,grey_past_shows=!1,max_shows_to_display=10,collapse_long_show_descriptions=!1,Dependencies=function(){return{Shows:function(){return $.ajax({method:"GET",url:"https://dl.dropboxusercontent.com/u/102907239/aaron_waldman/events.json",dataType:"json"})},Booking:function(){var e=$.Deferred();if(!window.Clipboard){window.Clipboard=null;var t=0,n=100,i=setInterval(function(){t++,"function"==typeof window.Clipboard&&(e.resolve(window.Clipboard),window.clearInterval(i)),t>n&&(e.reject("Timed out while waiting for Clipboard.js library to load"),window.clearInterval(i))},100);return e.promise()}return e.resolve(window.Clipboard)}}}(),Time=function(){return{getHumanTime:function(e){var t=e.getHours(),n=t>11,i=0===t?12:n&&12!==t?t-12:t,o=(e.getMinutes()+"0").slice(-2),a=n?"pm":"am";return i+":"+o+a},getTimezoneOffset:function(e,t){var n=e.match(t),i=parseInt(n&&n[0].replace(/w/i,""),10);return i/100},getDateFromTimestamp:function(e){var t=/-(GMT|)\d\d\d\d$/gi,n=e.replace(t,""),i=new Date(n),o=this.getTimezoneOffset(e,t),a=i.getHours()-o;return new Date(i.setHours(a))},getMonthShort:function(e){var t=["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"],n=e.getMonth();return t[n]},getTimeRange:function(e,t){return e=e||"",t=t||"",e&&t?e+" &ndash; "+t:e+t}}}(),Template=function(){return{replaceTemplateStrings:function(e,t){var n="string"==typeof e?e:$(e).html(),i=/\{\{.+?\}\}/g;return n.replace(i,function(e){var n=e.slice(2,-2);return t.hasOwnProperty(n)?t[n]:n})}}}(),Header=function(e,t){return{element:null,window:null,height:null,mobileNavToggle:null,pageLinks:null,activeState:"",changeTriggers:[],init:function(){this.window=e(t),this.element=e("#header"),this.mobileNavToggle=e("#header-links-toggle"),this.pageLinks=this.element.find(".page-link"),this.height=this.element.outerHeight(),this.setTriggerPositions(),this.setMobileMenuEvents(),this.window.scroll(this.handleScroll.bind(this)),this.handleScroll(),this.element.removeClass("noBg")},setTriggerPositions:function(){this.changeTriggers=[{klass:"homeContentOverlap",yThreshold:e("#home-container").offset().top},{klass:"showsPageOverlap",yThreshold:e("#shows").offset().top-this.height}],this.changeTriggers.sort(function(e,t){return e.yThreshold>t.yThreshold})},handleScroll:function(){var e=this.window.scrollTop(),t=null;this.changeTriggers.forEach(function(n){e>n.yThreshold&&(t=n)}),!t&&this.active?(this.element.removeClass(this.active.klass),this.active=null):t!=this.active&&(this.active&&this.element.removeClass(this.active.klass),this.active=t,this.element.addClass(t.klass))},setMobileMenuEvents:function(){e(this.mobileNavToggle).click(this.handleMobileMenuClick.bind(this)),e(this.pageLinks).click(this.hideMobileMenu.bind(this))},handleMobileMenuClick:function(e){e.stopPropagation(),this.element.is(".show-mobile-nav")?this.hideMobileMenu(e):this.showMobileMenu(e)},showMobileMenu:function(t){var n=this;this.element.addClass("show-mobile-nav"),e("body").one("click",function(e){n.handleActiveMenuClick(e)})},hideMobileMenu:function(e){this.element.removeClass("show-mobile-nav")},handleActiveMenuClick:function(t){var n=this,i=e(t.target).closest("#header").length;t.stopPropagation(),i?e("body").one("click",function(e){n.handleActiveMenuClick(e)}):n.handleMobileMenuClick(t)}}}($,window),Booking=function(e){return{Clipboard:null,bookingLink:null,bookingForm:null,phoneClipboardButton:null,emailClipboardButton:null,allClipboardButtons:null,init:function(t){this.Clipboard=t,this.bookingLink=e("#booking-trigger"),this.bookingForm=e("#booking-info"),this.phoneClipboardButton=e("#phone-clipboard"),this.emailClipboardButton=e("#email-clipboard"),this.allClipboardButtons=e(this.phoneClipboardButton).add(this.emailClipboardButton),this.phoneToCopy=this.bookingForm.find(".to-copy"),this.attachEvents()},attachEvents:function(){var t=this;this.bookingLink.one("click",function(e){t.handleBookingLinkClick(e)}),new this.Clipboard(this.emailClipboardButton[0]),new this.Clipboard(this.phoneClipboardButton[0]),this.allClipboardButtons.click(function(n){t.allClipboardButtons.removeClass("selected"),e(n.currentTarget).addClass("selected")})},handleBookingLinkClick:function(t){var n=this;this.bookingLink.addClass("active"),t.stopPropagation(),e("body").one("click",function(e){n.handleClickWhileBookingActive(e)})},handleClickWhileBookingActive:function(t){var n=this,i=e(t.target).closest("#booking-info").length;t.stopPropagation(),i?e("body").one("click",function(e){n.handleClickWhileBookingActive(e)}):(this.bookingLink.removeClass("active"),this.allClipboardButtons.removeClass("selected"),this.bookingLink.one("click",function(e){n.handleBookingLinkClick(e)}))}}}($),Shows=function(e,t){return{events:[],init:function(e){this.events=e.data,this.render(),this.attachPageLoadEvents()},formatShowData:function(n){var i={},o=n.place&&n.place.location,a="http://www.facebook.com/",s=a+"events/",l="http://www.google.com/maps/";return i.eventLink=s+n.id,i.placeName=n.place&&n.place.name||"",i.placeLink=a+n.place.id,this.getHasFullAddress(n)?(i.mapLink=l+"place/"+encodeURIComponent((i.placeName?i.placeName+", ":"")+(o.street?o.street+", ":"")+(o.city&&o.state?o.city+", ":"")+(o.city&&o.state?o.state+", ":"")+(o.zip?o.zip:"")),i.mapLink=i.mapLink.replace(/(,\s$)|(%2C%20$)/,"")):this.getHasCoordinates(n)?i.mapLink=l+"?q="+encodeURIComponent(o.latitude+","+o.longitude):i.mapLinkClass="hide",n.end_time&&(i.date=t.getDateFromTimestamp(n.end_time),i.endTime=t.getHumanTime(i.date)),n.start_time&&(i.date=t.getDateFromTimestamp(n.start_time),i.startTime=t.getHumanTime(i.date),i.startDateString=i.date.toDateString()),i.timeRange=t.getTimeRange(i.startTime,i.endTime),i.day=i.date.getDate(),i.month=t.getMonthShort(i.date),i.pastShowFlag=n.alreadyHappened&&window.grey_past_shows?"pastShow":"",i.title=n.name,i.title=n.name,e.extend({},n,i)},getHasFullAddress:function(e){return e.place&&e.place.location&&e.place.location.street&&e.place.location.state&&e.place.location.city&&e.place.location.zip&&!0},getHasCoordinates:function(e){return e.place&&e.place.location&&e.place.location.latitude&&e.place.location.longitude&&!0},getShowListHeight:function(){var t=e("#shows-components").children(),n=0;return t&&t.length&&t.each(function(t,i){n+=e(i).height()}),n},render:function(){for(var t=this.events,n=e("#showTemplate"),i=collapse_long_show_descriptions?36:9999,o=Math.min(t.length,window.max_shows_to_display),a=0;a<o;a++){var s=t[a].end_time?new Date(t[a].end_time):t[a].start_time?new Date(t[a].start_time):new Date;if(t[a].alreadyHappened=s<new Date,!window.show_upcoming_shows_only||!t[a].alreadyHappened){var l=this.formatShowData(t[a]),r=Template.replaceTemplateStrings(n.clone(),l),c=e(r);e("#shows-components").append(c);var h=this.getShowListHeight(),d=e("#shows-components").height();h<d&&e("#shows-components").addClass("no-scroll"),c.find(".eventDescription").innerHeight()>i&&c.addClass("collapsed-description"),this.attachRenderEvents(c,l)}}e("#shows-components").children()&&e("#shows-components").children().length||e("#no-shows").addClass("show")},attachRenderEvents:function(t,n){t.on("click",function(e){document.href=n.eventLink}),e("#shows-components").on("scroll",function(t){e(t.currentTarget).scrollTop()>10?e(t.currentTarget).parent().addClass("scrolledShows"):e(t.currentTarget).parent().removeClass("scrolledShows")})},attachPageLoadEvents:function(){e("body").on("click",".description-more, .eventDescription",function(t){e(t.currentTarget).parents(".showItem").removeClass("collapsed-description")})}}}($,Time);$(document).ready(function(){var e={Header:Header,Shows:Shows,Booking:Booking};for(var t in e)try{var n=e[t];if("function"==typeof window.Dependencies[t]){var i=window.Dependencies[t]();i.then(e[t].init.bind(n))}else n&&"function"==typeof e[t].init?e[t].init():console.warn("Uhh what happened to "+t+"?")}catch(e){console.error("Error initializing module: "+t+" - Msg:",e)}});