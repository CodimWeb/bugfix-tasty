"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var url = document.location.toString();

var lang = "ru";
if (url.match('/en'))
    var lang = "en";

var translate_dict = {};

if(typeof lang !== "undefined")
    if(lang === "en")
        $.getJSON('/js/en.json?v=2', function(data) {
            translate_dict = data;
          //console.log("translate_dict", translate_dict);
        });

var translate = function(s){
    var res = s;

    if(typeof lang !== "undefined")
        if(lang === "en")
            if(typeof translate_dict[s] !== "undefined")
                res = translate_dict[s];

    return res;
}

var change_currency = function(amount){
    if(typeof lang !== "undefined")
        if(lang === "en")
            amount = (amount / currrate).toFixed(2);
    
    return amount;
}

/**
 * Created by EnSiStudio
 */
var cases = [],
    play = false,
	movie_prev = 1000,
    leave = false;

wsinit();
function wsinit() {
    var socket = new WebSocket("wss://ws.tastydrop.ru:2053");

    socket.onerror = function (ev) {};

    socket.onclose = function (ev) {
        //console.log("onclose");
        setTimeout(function () {
            wsinit();
        }, 10000);
    };

    socket.onmessage = function (msg) {
        if (msg.data.length == 0) return;

        var data = JSON.parse(msg.data);
		//console.log(data);
        if (data.event == "opened") {
            $('#opened').text(data.msg);
            $('#opened2').text(data.msg);
        }

        if (data.event == "online") {
            $('#online').text(data.msg);
            $('#online2').text(data.msg);
        }

        if (data.event == "users") {
            $('#users').text(data.msg);
            $('#users2').text(data.msg);
        }

        if (data.event == "arcanes") {
            $('#arcanes').text(data.msg);
            $('#arcanes2').text(data.msg);
        }

        //console.log('eventtype', data.event);

        if (data.event == "lastwinner") {
            data = JSON.parse(data.msg);

			if(data.casetype == 'movie2')
			{	
				var mleftop = data.leftop - 1;
				console.log(data.leftop + ' ' + mleftop + ' ' + movie_prev);
				if(mleftop > movie_prev) 
				{ 
					//location.reload(); 
					$.post('/ajax/moviecase', {'cid':data.caseid}, function(d){
						if(d.status == true)
						{
							var m = d.mcase;
							///console.log(m.id);
							var base = $('a.movie');
			
							base.attr('data-hover', m.hover_img);
							base.attr('href', '/open/' + m.name);
							base.attr('data-img', m.img);
							base.attr('data-caseid', m.id);
							base.children('.case__img_layout').children('.cim').attr('src', m.img);
							base.children('.case__img_layout').children('.unhovered').attr('src', m.hover_img);
							base.children('h3').text(m.disp_name);
							base.children('.case__price').children('.case__price-old').children('span').children('span').text(m.discount);
							base.children('.case__price').children('.case__price-current').children('span').text(m.price); 
						}
						else
						{
							console.log('ups');
						}
					});
					
				}
				else
				{		
					$('span#movie_leftop').text(mleftop + ' ' + num2str(mleftop, ['ОТКРЫТИЕ', 'ОТКРЫТИЯ', 'ОТКРЫТИЙ']));
					$('.movie_leftop').attr('data-transitiongoal', mleftop); 
					
					if(mleftop < 1)
						location.reload();
				}
				movie_prev = mleftop; 
			}

            $('#opened').text(parseInt($('#opened').text()) + 1);
            $('#opened2').text(parseInt($('#opened2').text()) + 1);

            if (data.var == 'pisos' && data.caseid) {
                var leftop = parseInt($("[data-caseid=" + data.caseid + "] .leftop").text()) - 1;
				
                if (leftop > 0) {
                    $("[data-caseid=" + data.caseid + "] .leftop").text(leftop);
                    $("[data-caseid=" + data.caseid + "] .progress-bar").progressbar();

                    $("[data-caseid=" + data.caseid + "] .progress-bar").attr("data-transitiongoal", leftop);
                    $("[data-caseid=" + data.caseid + "] .progress-bar").attr("data-valuenow", leftop);
                }

                if (leftop == 1) {
                    $("[data-caseid=" + data.caseid + "]").addClass("noactive");
                    $("[data-caseid=" + data.caseid + "] .case__remainder").hide();
                }
            }

            if ($('#toplivedrop').hasClass('ld')) {

                //console.log('data.msg lastwinner2', data);

                if ($('[data-item="' + data.id + '"]').length == 0 && data.site != 'airdropz.ru') {
                    $('.items-inner').prepend($('<a>').attr('href', '/user/' + data.userid + '')/*.attr('data-item', data.id)*/.addClass('item-history').append('<img src="' + data.image + '" class="item-history-pic" alt="'+ translate('Дроп') +'">').append('<div class="rarity ' + data.type + '"></div>').append('<div class="history-weapon-hover"> <img src="' + data.caseimg + '"><b>' + data.username + '</b></div>').css('display', 'none').fadeIn(600));
                    $(".items-inner a:nth-last-child(1)").remove();
                }
            }
        }

        if (data.event == "topdrop") {
            if (!$('#toplivedrop').hasClass('ld')) {
                data = JSON.parse(data.msg);
                //console.log('data.msg', data);
                if ($('[data-item="' + data.id + '"]').length == 0 && data.site != 'airdropz.ru') {
                    $('.items-inner').prepend($('<a>').attr('href', '/user/' + data.userid + '')/*.attr('data-item', data.id)*/.addClass('item-history').append('<img src="' + data.image + '" class="item-history-pic" alt="'+ translate('Дроп') +'">').append('<div class="rarity ' + data.type + '"></div>').append('<div class="history-weapon-hover"> <img src="' + data.caseimg + '"><b>' + data.username + '</b></div>').css('display', 'none').fadeIn(600));
                    $(".items-inner a:nth-last-child(1)").remove();
                    $('#opened').text(parseInt($('#opened').text()) + 1);
                }
            }
        }

        if (data.event == "message") {
            data = JSON.parse(data.msg);
          //console.log('data.msg', data);


            if(data.type == "pa_bet") {
                setTimeout(function () {
                    lotsGrid();
                    lotsSort($(".filter.active").length > 0 ? $(".filter.active").attr('data-sort-by') : 'main');
                }, 50);
            }

            if(data.type == "pa_bet" ){

                //console.log("pa_bet data", data);

                var lot = $("div[data-lotid=" + data.id + "]");
                lot.find('.bet_price').text(change_currency(data.price));
                var timer = lot.find('.dtend');
                var dtend = Date.now() + parseInt(data.dt);
                timer.attr("data-time", dtend);
                timer.countdown(dtend, {elapse: true});
                lot.find('.filtration-content .dtend').text(dtend);
                lot.find('.filtration-content .main').text(dtend);

                if(user_id > 0){
                    if(data.user == user_id){
                        lot.find('.auction-item__bet').removeClass("lb").addClass("mb");
                        lot.find('.filtration-content .mybet').text(0);

                        var myAudio = new Audio();
                        myAudio.src = "/sound/trade.wav";
                        myAudio.play();
                        noty(translate("Вашу ставку на лот")+" "+data.msg+" "+translate("перебил другой пользователь"), false, 'success');
                    }
                }

            }

            if(data.type == "pa_winner"){
              //console.log("data", data);

                var lot = $("div[data-lotid=" + data.id + "]");
                $('.grid').isotope( 'remove', lot ).isotope( 'layout');

              //console.log("removelot", lot);

                if(data.user == user_id){
                    var myAudio = new Audio();
                    myAudio.src = "/sound/trade.wav";
                    myAudio.play();
                    noty(translate("Поздравляем! Вы выиграли лот") + " " + data.msg, false, 'success');
                }
            }


            if(data.type == "pa_addlot"){
              //console.log("data pa_addlot", data);

                var newlot = jQuery.parseJSON(data.msg);
              //console.log("data newlot", newlot);

                setTimeout(function () {
                    var lotElem = $(".auction-item").last().clone()
                        .attr("data-lotid", newlot.id)
                        .appendTo(".grid");

                  //console.log("data lotElem", lotElem);

                    lotElem.find(".panel_name span").text(newlot.name);
                    lotElem.find(".auction-item__img img").attr("src", newlot.img);
                    lotElem.find(".price").text(change_currency(newlot.price));
                    lotElem.find(".bet_price").text(change_currency(newlot.price));
                    lotElem.find(".itemprice").text(change_currency(newlot.itemprice));
                    lotElem.find(".auction-item__bet").removeClass("lb").addClass("mb");
                    lotElem.find(".auction-item__img").attr('class', 'auction-item__img '+newlot.quality.toLowerCase());
                    lotElem.find(".bet-timer").attr('data-time', newlot.dtend).removeClass('warning');
                    lotElem.find(".main").text("1700000000000");
                    lotElem.find(".makeBet").attr("data-lotid", newlot.id);

                    bettimer(lotElem.find(".bet-timer"));

                    lotsGrid();
                    lotsSort($(".filter.active").length > 0 ? $(".filter.active").attr('data-sort-by') : 'main');
                }, 1500);
            }


            if (typeof user_id !== 'undefined' && data.user == user_id) {
                switch (data.type) {
                    case 'error':
                        noty(data.msg, false, 'error');
                        break;
                    case 'success':
                        noty(data.msg, false, 'success');
                        break;
                }
            }
        }
        if (data.event == "statechange") {
            data = JSON.parse(data.msg);

            if (typeof user_id !== 'undefined' && data.user == user_id) {
                switch (data.type) {
                    case 'send':
                        var myAudio = new Audio();
                        myAudio.src = "/sound/trade.wav";
                        myAudio.play();
                        //$('#accept')[0].volume = 0.2;
                        //$('#accept')[0].play();
                        noty(translate('Предмет отправлен'), false, 'success');
                        $("[data-item='" + data.item + "']").find('a.status').removeClass('sends').attr('href', 'https://steamcommunity.com/tradeoffer/' + data.offer + '/').attr('target', '_blank').html('<i class="fas fa-arrow-down" aria-hidden="true"></i> '+translate('Получить трейд'));
                        break;
                    case 'before':
                        $("[data-item='" + data.item + "']").find('a.status').removeClass('sends').html('<i class="fas fa-arrow-down" aria-hidden="true"></i> ' + translate('Ожидание'));
                        break;
                    case 'accept':
                        var myAudio = new Audio();
                        myAudio.src = "/sound/trade.wav";
                        myAudio.play();
                        if (data.it_type == 3) {
                            noty(translate("Средства успешно доставлены на Ваш Steam-аккаунт"), false, 'success');
                            $("[data-item='" + data.item + "']").find('a.status').removeClass('sends').attr('title', '').attr('data-original-title', '').attr('href', 'https://store.steampowered.com/account/history/').attr('target', '_blank').html('<i class="fas fa-arrow-down" aria-hidden="true"></i> ' + translate('Деньги отправлены'));
                        }
                        else if (data.it_type == 9) {
                            noty(translate("Яйцо вылупилось!"), false, 'success');
                            $("[data-item='" + data.item + "']").remove();
                        } else {
                            $("[data-item='" + data.item + "']").find('a.status').remove();
                            noty(translate("Предмет успешно передан"), false, 'success');
                        }
                        break;
                    case 'cencel':
                        $("[data-item='" + data.item + "']").find('a.status').remove();
                        break;
                    case 'notfound':
                        $("[data-item='" + data.item + "']").find('a.status').remove();
                        $("[data-item='" + data.item + "']").find('.ii-status').prepend('<div class="escrow" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="'+translate('На данный момент предметы закончились')+'!"> <i class="fa fa-exclamation"></i> </div>');
                        break;
                    case 'escrow':
                        $("[data-item='" + data.item + "']").find('a.status').html('<i class="fas fa-arrow-down" aria-hidden="true"></i> ' + translate('Забрать'));
                        $("[data-item='" + data.item + "']").find('.ii-status').prepend('<div class="escrow" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="' + translate('Проблема с обменами Steam или аутентификатором. Изучите FAQ #3, исправьте и попробуйте ещё раз') + '!"> <i class="fa fa-exclamation"></i> </div>');
                        break;
                    case 'canceled':
                        var myAudio = new Audio();
                        myAudio.src = "/sound/trade.wav";
                        myAudio.play();

                        var stbtns = '<button data-id="' + data.item + '" class="btn btn-sale btn-item sell" data-toggle="tooltip" data-placement="top" title="'+translate('Продать')+'">'+translate('Продать')+'</button> ' + '<a data-id="' + data.item + '" class="sends status btn btn-pickup btn-item" ids="' + data.item + '" data-toggle="tooltip" data-placement="top"  title="'+translate('Забрать предмет')+'">'+translate('ЗАБРАТЬ')+'</a>';
                        $("[data-item='" + data.item + "']").find('.stbtns').html(stbtns);

                        if (data.it_type == 3) {
                            noty(translate("Ошибка! Возможно Вы указали неверный steam-логин, проверьте и попробуйте еще раз. Code: 3003"), false, 'error');
                        } else noty(translate("Ошибка вывода! Попробуйте через 10 минут. Code: 1001"), false, 'error');
                        break;
                    case 'err3001':
                        var myAudio = new Audio();
                        myAudio.src = "/sound/trade.wav";
                        myAudio.play();
                        var stbtns = '<button data-id="' + data.item + '" class="btn btn-sale btn-item sell" data-toggle="tooltip" data-placement="top" title="'+translate('Продать')+'">'+translate('Продать')+'</button>' + '<a data-id="' + data.item + '" class="sends status btn btn-pickup btn-item" ids="' + data.item + '" data-toggle="tooltip" data-placement="top"  title="'+translate('Забрать предмет')+'">'+translate('ЗАБРАТЬ')+'</a>';
                        $("[data-item='" + data.item + "']").find('.stbtns').html(stbtns);
                        noty(translate("Ошибка! Похоже, у Вас заблокированы обмены в Steam. Смотрите FAQ, #3. Code: 1002."), false, 'error');

                }
            }
        }
    };
}

var noty = function noty(message, title, type, position) {
    toastr.options = {
        "closeButton": true,
        "debug": true,
        "newestOnTop": true,
        "progressBar": true,
        "positionClass": "toast-bottom-left",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };
    if (title) toastr[type](title, message);else toastr[type](message);
};

function nextpudgelevel(){	
	$.post('/ajax/pudgegame_play', ({'type':'check'}), function (data) {
		console.log('pudge check data', data);
		if (data.status === true) {
			//alert(data.game.game.level);
			$('#bonus').modal('hide');
			$('#bonus').css('display','none');
			if(data.game.game.level > 4 && !data.game.game.paid) {
                $('#mustpay').modal('show');
            }
			location.reload();
			$('.progress_bar').html(data.items);

            /*$('.fiarst-tree ').each(function () {
                $(this).css({opacity: '1', visibility: 'visible'})
            });
            $('body').css({ overflow: 'auto' });
            $('.guess').fadeIn();
            $('.bonus-tittl').fadeOut();*/
		}
	});
}

function num2str(n, text_forms) {  
    n = Math.abs(n) % 100; var n1 = n % 10;
    if (n > 10 && n < 20) { return text_forms[2]; }
    if (n1 > 1 && n1 < 5) { return text_forms[1]; }
    if (n1 == 1) { return text_forms[0]; }
    return text_forms[2];
}

function checkTop100(oid)
{
	$.post('/ajax/offersshopmodal', {'oid':oid}, function(dt){
			console.log(dt.status);
		if(dt.status === true)
		{
			$('#osmodal').html(dt.msg);
		
			setTimeout(function(){
				$('#obm_wrapper').fadeIn(0);
				$('#offer__box-modal').modal('show');
				//$('#modaltrigger').click();
			}, 100);
		} 
	});
}

jQuery(document).ready(function () {
	// if(window.location.href.indexOf('pudgegame/play') != -1)
	// {
		// $.post('/ajax/pudgegame_play', ({'type':'check'}), function (data) {
			// console.log('pudge check data', data.game.game);
			// if (data.status === true) 
			// {
				// if(data.game.game.level > 4)
					// $('#mustpay').modal('show');	
			// }
		// });
	// }

    /*
    $(".fiarst-tree").on('click', function (e) {
        e.preventDefault();

		if($(this).data('win') == 'win')
		{
			$.post('/ajax/pudgegame_play', ({'type':'win'}), function (data) {
				console.log('pudge play data', data);
	
				if (data.success === true) {				
					$('#bimg').attr('src', data.item.img);
					$('#bprice').text(data.item.price);
					$('.bname').text(data.item.item);
                    $('#bname_quality').attr("class", "name " + data.item.quality);
                    $('#bimg_quality').attr("class", "picture " + data.item.quality);
				} else {
					noty(data.msg, false, 'error');
                    return false;
				}
			});
		}

        return true;
    });
    */
	
	$('#onemoretime').click(function(){		
		$('#tray').css('display','none');
	});

    $('body').on('click', '.modal-backdrop', function () {
        $(this).remove();
        $("#author_football").hide();
        $("#author_pudge").modal('hide');
        return false;
    });

    SliderReviews.init();
    $(".go_event").click(function () {
        $('html, body').animate({
            scrollTop: $(".go_to").offset().top
        }, 2000);
    });
    $('.addmoney').click(function () {
        $(".paysum").keyup();
    });

    $('body').on('click', 'a[href="/login/steam"]', function () {
        steam_popup();
        return false;
    });

    $('body').on('click', '.social-likes a', function () {
        var ss = $(this).attr('class');
        $.post('ajax/socref', {'ss' : ss});
        share_popup($(this).attr("href"));
        return false;
    });

    $('body').on('click', 'a.modal-link', function () {
        var redirecturl = window.location.href;
        $.cookie('champurl', redirecturl);
    });

    $('.slider').each(function () {
        var $this = $(this);
        var $group = $this.find('.slide_group');
        var $slides = $this.find('.slide');
        var bulletArray = [];
        var currentIndex = 0;
        var timeout;

        function move(newIndex) {
            var animateLeft, slideLeft;
            advance();
            if ($group.is(':animated') || currentIndex === newIndex) {
                return;
            }
            bulletArray[currentIndex].removeClass('active');
            bulletArray[newIndex].addClass('active');

            if (newIndex > currentIndex) {
                slideLeft = '100%';
                animateLeft = '-100%';
            } else {
                slideLeft = '-100%';
                animateLeft = '100%';
            }
            $slides.eq(newIndex).css({
                display: 'block',
                left: slideLeft
            });
            $group.animate({
                left: animateLeft
            }, function () {
                $slides.eq(currentIndex).css({
                    display: 'none'
                });
                $slides.eq(newIndex).css({
                    left: 0
                });
                $group.css({
                    left: 0
                });
                currentIndex = newIndex;
            });
        }

        function advance() {
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                if (currentIndex < $slides.length - 1) {
                    move(currentIndex + 1);
                } else {
                    move(0);
                }
            }, 5000);
        }

        $.each($slides, function (index) {
            var $button = $('<a class="slide_btn"></a>');

            if (index === currentIndex) {
                $button.addClass('active');
            }
            $button.on('click', function () {
                move(index);
            }).appendTo('.slide_buttons');
            bulletArray.push($button);
        });
        advance();
    });
    $('.ticker').each(function (i, obj) {
        $(obj).countdown($(obj).data('time'), {
            elapse: true
        }).on('update.countdown', function (event) {
            var $this = $(this);
            var tpl = '<div class="countdown"> <div class="digits">%H</div><span class="delimiter" style="opacity: 1;">:</span> <div class="digits">%M </div><span class="secs delimiter" style="opacity: 1;">:</span> <div class="secs digits"> %S </div></div>';

            if (!event.elapsed) {
                $this.html(event.strftime(tpl));
            }
        });
    });


    var url = document.location.toString();

    if (url.match('profile')) {
        var tokenname = $("[id^=ttok_]").attr("name");
        var tokenval = $("[id^=ttok_]").val();

        if (tokenname != undefined && tokenval != undefined)
            localStorage.setItem('profile', JSON.stringify({tokenname, tokenval}));
    }
    else if (url.match('open')) {
        var tokenname = $("[id^=ttok_]").attr("name");
        var tokenval = $("[id^=ttok_]").val();

        if (tokenname != undefined && tokenval != undefined)
            localStorage.setItem('copen', JSON.stringify({tokenname, tokenval}));
    }else if (url.match('pennyauction')) {
        window.addEventListener('focus', function() {
            setTimeout(function () {
                lotsGrid();
                lotsSort($(".filter.active").length > 0 ? $(".filter.active").attr('data-sort-by') : 'main');
            }, 1000);
        }, false);
    }

    if (url.match('bigbabytape')) {
        //console.log("$.cookie('case_sound')", $.cookie('case_sound'));

        window.myAudio = new Audio();
        window.myAudio.src = "/sound/play1.mp3";

        if($.cookie('case_sound') == 1 || !$.cookie('case_sound'))
            $("#soundbutton").addClass("active");
    }

    if (url.match('santamiracle')) {
        //console.log("$.cookie('case_sound')", $.cookie('case_sound'));

        window.myAudio = new Audio();
        window.myAudio.src = "/sound/new_year2.mp3";

        if($.cookie('case_sound') == 1 || !$.cookie('case_sound'))
            $("#soundbutton").addClass("active");
    }

    if (url.match('#') && url.match('faq')) {
        $('.main-width #' + url.split('#')[1]).addClass('active').find('.accordeon-content').css('height', '60px');
    } else if (url.match('open')) {
        window.dataLayer = window.dataLayer || [];
        $.post('/ajax/getcase', { case: currentCase }, function (data) {
          //console.log("data", data);

            if (data.status) {
                var itemsBlock = '';
                cases = [];
                $.each(JSON.parse(data['inventory']), function (itemWithPrice, index) {
                    //console.log(index);

                    if (index['type'] == '570') {
                        //var img = (typeof index['img_local'] != 'undefined')? index['img_local'] : index['img'] + '/135fx90f';
                        var search = (index['it_type'] != 3)? 'http://steamcommunity.com/market/listings/570/' + index['item'] + '?l=russian' : '';
                    } else if (index['type'] == '730') {
                        //var img = (typeof index['img_local'] != 'undefined')? index['img_local'] : index['img'] + '/135fx90f';
                        var search = (index['it_type'] != 3)? 'http://steamcommunity.com/market/listings/730/' + index['item'] + '?l=russian' : '';
                    } else {
                        var search = '';
                    }
                    var img = index['img'];

                    index['item'] = cut_text(index['item'], 25);
                    if(index['rare'] != 1)
                        itemsBlock += '<a href="' + search + '" data-quality="' +  index['quality'] + '" class="iteamblock type'+index['it_type']+'" target="_blank" style="text-decoration: none;">' + '<span class="price"> ' + index['price'] + '<i class="fas fa-'+data.currency+'-sign"></i></span>' + '<div class="picture ' + index['quality'] + '">' + '<img src="' + img + '" alt="'+translate('Дроп')+'">' + '</div>' + '<div class="name ' + index['quality'] + '">' + '<span>' + index['item'] + '</span>' + '</div>' + '</div></a>';

                    var iteam = [index['name'], index['name'], index['quality'], img, index['it_type']];
                    for (var i = 0; i <= 20; i++) {
                        cases.push(iteam);
                    }
                });
                fillCarusel(function (items) {
                    //$('#casesCarusel').css("margin-left", "-4%");
                    $('#casesCarusel').html(items);
                    $(".loader").hide();
                    $("#cont").css("transition", "All 1s ease").show();
                    $(".loader").hide();
                });

                $('.opencase-drops').html(itemsBlock);
            } else noty(data.msg, false, 'error');
        });
    }
    $('#friday_scroll').click(function () {
        $('html, body').animate({ scrollTop: $('#friday_top').offset().top }, 1000);
        return false;
    });
    $("#spin_spinner").click(function () {
        if (play) {
            noty(translate('Дождитесь открытия кейса'), false, 'error');
			$.post('/ajax/dblclicklog', ({'ccase':currentCase}));
        } else {
            play = true;
            $.post('/ajax/play', { case: currentCase }, function (data) {
                if (data.status) {
                    $('.header__profile-balance .balance').html(data.user.money);
                    var css = '';
                    switch (data.case.name) {
                        case 'bitch case':
                            css = 'one';
                            break;
                        case 'golden case':
                            css = 'three';
                            break;
                        case 'exclusive case':
                            css = 'two';
                            break;
                    }
                    $('.spinner').addClass('spined ' + css);
                    setTimeout(function () {
                        $.post('/ajax/getcase', { case: data.case.name }, function (caser) {
                            if (caser.status) {
                                var itemsBlock = '';
                                cases = [];
                                $.each(JSON.parse(data['inventory']), function (itemWithPrice, index) {
                                    var img = index['img'];
                                    if (index['type'] == '570') {
                                        var search = 'http://steamcommunity.com/market/listings/570/' + index['item'];
                                    } else if (index['type'] == '730') {
                                        var search = 'http://steamcommunity.com/market/listings/730/' + index['item'];
                                    } else {
                                        var search = '';
                                    }

                                    itemsBlock += '<a href="' + search + '" class="iteamblock" target="_blank" style="text-decoration: none;">' + '<span class="price"> ' + index['price'] + '<i class="fas fa-ruble-sign"></i></span>' + '<div class="picture ' + index['quality'] + '">' + '<img src="' + img + '" alt="'+translate('Дроп')+'">' + '</div>' + '<div class="name ' + index['quality'] + '">' + '<span>' + index['item'] + '</span>' + '</div>' + '</div></a>';
                                    var iteam = [index['name'], index['name'], index['quality'], img];
                                    for (var i = 0; i <= 20; i++) {
                                        cases.push(iteam);
                                    }
                                });
                                fillCarusel(function (items) {
                                    //$('#casesCarusel').css("margin-left", "0px");
                                    $('#casesCarusel').html(items);
                                    $(".box_spinner").slideToggle('slow');
                                    $("#scrollerContainer").slideToggle('slow');
                                    $('.spinner').removeClass('spined ' + css);
                                    setTimeout(function () {
                                        var weapon = data.weapon;
                                        $("[data-id=96]").find('.name').removeClass('Arcana Immortal Legendary Mythical Rare Uncommon').addClass(weapon.type).html('<span>' + weapon.name + '</span>');
                                        $("[data-id=96]").find('.picture img').attr("src", weapon.image);
                                        $('#casesCarusel').addClass('rolling');
                                        setTimeout(function () {
                                            $('#start').hide();
                                            $('.win_item').html('<div class="picture ' + weapon.type + '"><img src="' + weapon.image + '" alt="'+translate('Дроп')+'"></div><div class="title-and-price"><div class="name ' + weapon.type + '"></div><div class="balance__adv"><span class="bonus bonus__coin">1234 </span><span class="bonus-curr bonus-curr__coin"></span><a href="" class="bonus-info"></a></div></div>');
                                            $('.casewin__btns-sell').html('<a href="#" data-id="' + weapon.id + '" class="btn sell">'+translate("Продать за")+' ' + (weapon.price * 1).toFixed(2) + ' <i class="fas fa-ruble-sign" aria-hidden="true"></i></a><a data-dismiss="modal" href="#" class="btn">'+translate('Попробовать снова')+'</a>');
                                            $('#sendrew').attr('data-id', weapon.id);
                                            $('#casewin').modal('show');
                                            setTimeout(function () {
                                                $('#casesCarusel').removeClass('rolling');
                                                fillCarusel(function (items) {
                                                    //$('#casesCarusel').css("margin-left", "0px");
                                                    $('#casesCarusel').html(items);
                                                    $(".box_spinner").slideToggle('slow');
                                                    $("#scrollerContainer").slideToggle('slow');
                                                });
                                                play = false;
                                            }, 1000);
                                        }, 15000);
                                    }, 1000);
                                });
                                $('.secret-drops').html(itemsBlock);
                            } else noty(data.msg, false, 'error');
                        });
                    }, 11000);
                } else {
                    play = false;
                    if (data.type == 'no_link') $('#trade_url').modal('show');
                    noty(data.msg, false, 'error');
                }
            });
        }
    });
    $('body').on('click', ".event_modal #start_secret", function () {
        var casec = $(this).data('case');
        if (play) {
            noty(translate('Дождитесь открытия кейса'), false, 'error');
			$.post('/ajax/dblclicklog', ({'ccase':currentCase}));
        } else $.post('/ajax/play', { case: casec }, function (data) {
            if (data.status) {
                play = true;
                $('.header__profile-balance .balance').html(data.user.money);
                var weapon = data.weapon;
                $("[data-caser='" + casec + "'] [data-id=96]").find('.name').removeClass('Arcana Immortal Legendary Mythical Rare Uncommon').addClass(weapon.type).html('<span>' + weapon.name + '</span>');
                $("[data-caser='" + casec + "'] [data-id=96]").find('.picture img').attr("src", weapon.image);
                $('#casesCarusel[data-caser="' + casec + '"]').addClass('rolling');
                setTimeout(function () {
                    $('#start').hide();
                    $('.win_item').html('<div class="picture ' + weapon.type + '"><img src="' + weapon.image + '" alt="' +translate('Дроп')+ '"></div><div class="title-and-price"><div class="name ' + weapon.type + '">' + weapon.name + '</div><div class="balance__adv"><span class="bonus bonus__coin">1234 </span><span class="bonus-curr bonus-curr__coin"></span><a href="" class="bonus-info"></a></div></div>');
                    $('.buttonswin').html('<a href="#" data-id="' + weapon.id + '" class="btn sell">' +translate('Продать за')+ ' ' + (weapon.price * 1).toFixed(2) + ' <i class="fas fa-ruble-sign" aria-hidden="true"></i></a><a data-dismiss="modal" href="#" class="btn">' + translate('Попробовать снова') + '</a>');
                    $('#sendrew').attr('data-id', weapon.id);
                    $('#casewin').modal('show');
                    setTimeout(function () {
                        $('#casesCarusel.secret_case_carusel').removeClass('rolling');
                        fillCarusel(function (items) {
                            //$('#casesCarusel.secret_case_carusel').css("margin-left", "0px");
                            $('#casesCarusel.secret_case_carusel').html(items);
                        });
                        play = false;
                    }, 1000);
                }, 15000);
            } else {
                if (data.type == 'no_link') $('#trade_url').modal('show');
                noty(data.msg, false, 'error');
            }
        });
    });
    $('body').on('click', "[data-case]", function () {
        var caser = $(this).data('case');
        $.post('/ajax/getcase', { case: caser }, function (data) {
            if (data.status) {
                var itemsBlock = '';
                cases = [];
                $.each(JSON.parse(data['inventory']), function (itemWithPrice, index) {
                    var img = index['img'];
                    if (index['type'] == '570') {
                        var search = 'http://steamcommunity.com/market/listings/570/' + index['item'];
                    } else if (index['type'] == '730') {
                        var search = 'http://steamcommunity.com/market/listings/730/' + index['item'];
                    } else {
                        var search = '';
                    }

                    itemsBlock += '<a href="' + search + '" class="iteamblock" target="_blank" style="text-decoration: none;">' + '<span class="price"> ' + index['price'] + '<i class="fas fa-ruble-sign"></i></span>' + '<div class="picture ' + index['quality'] + '">' + '<img src="' + img + '" alt="' +translate('Дроп')+ '">' + '</div>' + '<div class="name ' + index['quality'] + '">' + '<span>' + index['item'] + '</span>' + '</div>' + '</div></a>';
                    var iteam = [index['name'], index['name'], index['quality'], img];
                    for (var i = 0; i <= 20; i++) {
                        cases.push(iteam);
                    }
                });
                fillCarusel(function (items) {
                    //$('#casesCarusel.secret_case_carusel').css("margin-left", "0px");
                    $('#casesCarusel.secret_case_carusel').html(items);
                });
                $('.secret-drops').html(itemsBlock);
            } else noty(data.msg, false, 'error');
        });
    });
    $('.accordeon-item .heading').click(function () {
        if ($(this).parent().is('.active')) {
            $(this).parent().find('.accordeon-content').height(0);
            $(this).parent().removeClass('active');
        } else {
            $(this).parent().find('.accordeon-content').height($(this).parent().find('.accordeon-text').height() + 20);
            $(this).parent().addClass('active');
        }
    });
    $.post('/ajax/livedrop', function (data) {
        data = data.reverse();
        $('.items-inner').html('');
        $.each(data, function (_, data) {
            $('.items-inner').prepend($('<a>').attr('href', '/user/' + data.user + '')/*.attr('data-item', data.id)*/.addClass('item-history').append('<img src="' + data.img + '" class="item-history-pic" alt="' +translate('Дроп')+ '">').append('<div class="rarity ' + data.type + '"></div>').append('<div class="history-weapon-hover"> <img src="' + data.imgcase + '"><span class="item-history__user">' + data.name + '</span></div>').css('display', 'none').fadeIn(600));
        });
    });
	$.post('/ajax/topweekwinner', function (data) {
		//console.log(data);
        if(data.status == true)
		{
			$('.twitname').text(data.item.prize.name);
			$('.twitimg').attr('src', data.item.prize.img);
			$('#myModal').modal('show');
		}
		
    });
	$.post('/ajax/tdtriggers', function (data) {
		//console.log(data);
        if(data.status == true)
		{
			console.log(data.offer);
			if(data.offer > 0)
				checkTop100(data.offer);
		}
		else
			console.log('trigger ups');
    });
    $('body').on('click', "#tradesave", function () {
        if ($("#trade_url").data('bs.modal') && $("#trade_url").data('bs.modal').isShown) var link = $('#trade_url #url').val();else var link = $('.profile__tradelink-info #url').val();

        var postdata = { trade_link: link };
        postdata = pushtokenTo(postdata);

        $.post('/ajax/savetrade', postdata, function (data) {
            if (data.status) {
                noty(data.msg, false, 'success');
                if (data.old_link == 'f') {
                    window.dataLayer = window.dataLayer || [];
                    dataLayer.push({
                        'event': 'TradeUrl',
                        'TradeUrl': link
                    });
                }

                $('#trade_url').modal('hide');
            } else noty(data.msg, false, 'error');
        });
        return false;
    });

    $('body').on('click', "#sendrew", function () {
        var iid = $(this).attr('data-id');
        $.post('/ajax/send_review', { review: $('#reviews_text').val(), inventory: iid }, function (data) {
            if (data.status) {
                noty(data.msg, false, 'success');
                $('#casewin').modal('hide');
            } else noty(data.msg, false, 'error');
        });
        return false;
    });
    $('body').on('click', "#level_list", function () {
        $('.level_list').slideToggle("slow");
        return false;
    });
    $('body').on('click', "#refs_list", function () {
        $('.refs_list').slideToggle("slow");
        return false;
    });
    var caseArray = [];
    $('.select_case option').each(function () {
        var img = $(this).attr("data-thumbnail");
        var text = this.innerText;
        var value = $(this).val();
        var item = '<li data-case="' + value + '"><img src="' + img + '" alt=""/><span>' + text + '</span></li>';
        if ($(this).is(':selected')) {
            $('.btn-select').html(item);
        } else {
            caseArray.push(item);
        }
    });
    $('#itemlist').html(caseArray);
    $('#itemlist li').click(function () {
        var img = $(this).find('img').attr("src");
        var value = $(this).find('img').attr('value');
        var text = this.innerText;
        var item = '<li><img src="' + img + '" alt="" /><span>' + text + '</span></li>';
        $('.btn-select').html(item);
        $('.btn-select').attr('value', value);
        $(".list").toggle();
        $(location).attr('href', '/open/' + $(this).data('case'));
    });
    $(".btn-select").click(function () {
        $(".list").toggle();
    });

    $('body').on('click', "#startgame, #startgame_gift, #startgame_test", function () {
		$(".hell-egg").fadeOut(0);
        if ($(this).data("testmode") === true) {
            var testmode = true;
            var openevent = 'OpenFreeCase';
        } else {
            var testmode = false;
            var openevent = 'OpenCase';
        }
        if (play) {
            noty(translate('Дождитесь открытия кейса'), false, 'error');
			$.post('/ajax/dblclicklog', ({'ccase':currentCase}));
        } else {
            var postdata = { case: currentCase, testmode: testmode };
            postdata = pushtokenTo(postdata, "caseopen");
            play = true;
            $.post('/ajax/play', postdata, function (data) {
                if (data.status) {
					//console.log("data", data);
					$('.header__profile-balance .balance').html(data.user.money);
					$('.header__profile-balance .bonus').html(Math.round(data.user.tastycoin));
					
                    if (url.match('bigbabytape')) {
                        window.myAudio.pause();
                        window.myAudio = new Audio();
                        window.myAudio.src = "/sound/play1.mp3";
                        window.myAudio.play();

                        if( $.cookie('case_sound') != 1 && $.cookie('case_sound'))
                            window.myAudio.muted = 1;
                    }

                  //console.log("data1", data);
                    var weapon = data.weapon;
                    var price = weapon.price;
                    var pricetd = (price * 1).toFixed(2);
                    var pricest = (weapon.pricest * 1).toFixed(2);
                    var tout = data.tout;
                    var sgametext = $('#startgame').text();

                    $("[data-id=96]").find('.name').removeClass('Arcana Immortal Legendary Mythical Rare Uncommon').addClass(weapon.type).html('<span>' + weapon.name + '</span>');
                    $("[data-id=96]").find('.picture img').attr("src", weapon.image);
                    $('#winpic').attr("src", weapon.image);
                    $('#winname').text(weapon.name);
                    $('#winname').removeClass('Arcana Immortal Legendary Mythical Rare Uncommon').addClass(weapon.type);
                    $('#winpic').parent().removeClass('Arcana Immortal Legendary Mythical Rare Uncommon').addClass(weapon.type);
                    $('#winsell').text(pricetd);

                    setTimeout(function () {
                        $('#winpricetd').text(pricetd);
                    }, 1000);
                    $('#winpricest').text(pricest);

                    //if (tout > 1)
                    $('#casesCarusel').addClass('rolling');

                    var bcontent = $('#startgame').html();
                    $('#startgame').html(translate('Идет открытие...'));
                    setTimeout(function () {
                        $('#start').hide();
                        //console.log("data", data);

                        $('.win_item').html('<div class="picture ' + weapon.type + '"><img width="90" src="' + weapon.image + '" alt="' +translate('Дроп')+ '"></div></div>');
                        $('#sellbtn').attr('data-id', weapon.id);
                        $('#sendrew').attr('data-id', weapon.id);

                        if (weapon.casename == 'gift_case') testmode = false;

                        $('.casewin__title').html(testmode ? translate('В демо-режиме Вы выиграли') : translate('Вы выиграли'));
                        if (!testmode) {

                            $(".egg .btn").show();
                            $(".egg .sell").html('Продать за '+weapon.price+' <i class="fas fa-ruble-sign" aria-hidden="true"></i>');

                            if (tout == 1) $('.casewin__title').html(translate('Вы уже выиграли приз'));
                            //console.log(typeof user_id);
                            if (weapon.it_type != 6 || typeof user_id !== 'undefined') {

                                if (weapon.it_type == 6) {

                                    $('#startgame').hide();
                                    $('.casewin__review-info').hide();
                                    $('.casewin__btns').addClass('mgt15').html('<p>' +translate('Предмет можно забрать в профиле в течение часа')+ '</a></div><a href="/profile" data-id="' + weapon.id + '" class="btn casewin__btns-sell regWin">' +translate('Перейти в профиль')+ '</i></a>');
                                } else if (data.user.landuser == 'Y' || tout == 1) {
                                    $('#startgame').hide();
                                    $('.casewin__btns').html('<p>' +translate('При продаже Вы также получите')+ ' <div class="balance__adv"><span class="bonus__coin">' + weapon.tastycoin + '</span> <span class="bonus-curr bonus-curr__coin"></span><a href="" class="bonus-info"></a></div><a href="#" data-id="' + weapon.id + '" class="btn casewin__btns-sell sell">' + translate('Продать за') + ' ' + (weapon.price * 1).toFixed(2) + ' <i class="fas fa-ruble-sign" aria-hidden="true"></i></a>');
                                } else $('.casewin__btns').html('<p>' + translate('При продаже Вы также получите') + ' <div class="balance__adv"><span class="bonus__coin">' + weapon.tastycoin + '</span> <span class="bonus-curr bonus-curr__coin"></span><a href="" class="bonus-info"></a></div><a href="#" data-id="' + weapon.id + '" class="btn casewin__btns-sell sell">' + translate('Продать за') + ' ' + (weapon.price * 1).toFixed(2) + ' <i class="fas fa-ruble-sign" aria-hidden="true"></i>' + '</a><div class="try-again"><a data-dismiss="modal" href="#" class="btn btn-border casewin__btns-again">' + translate('Попробовать снова') + '</a><div id="btn-gift" class="send-gift"></div></div>');

                                if (weapon.it_type == 1)
                                    $('.casewin__review-info').hide();

                                $('.casewin__btns-sell').attr('data-id', weapon.id);
                            } else {
                                $('.casewin__review.closerew span').html(translate("Предмет можно забрать в профиле в течение часа,<br/> для этого необходимо авторизироваться."));
                                $('.casewin__btns').html('<div class="casewin__btns login_btns"><div class="mt-4  btns__login flex-column  mb-4"> ' + ' <a href="/login/vk" class="btn mb-2 d-flex  btn-primary btn-vklogin"><i class="fab fa-vk"></i>&nbsp;|&nbsp;' + translate('Войти через') + ' VK </a> ' + ' <a href="/login/steam" class="btn btn-primary btn-steamlogin"><i class="fab fa-steam"></i>&nbsp;|&nbsp;' + translate('Войти через') + ' Steam </a> ' + ' </div></div>');
                            }

                          //console.log("weapon", weapon);
                            if (weapon.it_type == 9) {
								$('.sell').attr('data-id', weapon.id);
                                $(".hell-egg").attr("class", "hell-egg "+weapon.type.toLowerCase()).fadeIn(0);
                                //alert(weapon.type.toLowerCase());
                            }
                        } else {
                            $('.casewin__review').hide();
                            $('.casewin__btns').html('<div class="try-again"><a data-dismiss="modal" href="#" class="btn btn-border casewin__btns-again">' + translate('Попробовать снова') + '</a></div><p class="casewin__text-info">' + translate('Демо-режим является симуляцией <br>игрового процесса на сайте') + ' Tastydrop.ru</p>');
                        }
                        // Send Gift friends
                        $('#btn-gift').click(function () {
                            $('.send-gift__content').show();
                            $('.casewin__review').hide();
                            $('.casewin__btns-sell').hide();
                            $('.try-again').hide();
                            $('.casewin__review-content').hide();
                        });
                        $('#gift-sendfoff').click(function () {
                            $('.send-gift__content').hide();
                            $('.casewin__review').show();
                            $('.casewin__btns-sell').show();
                            $('.try-again').show();
                        });
                        // Info Coin Case
                        $(".bonus-info").click(function (e) {
                            e.preventDefault();
                            $(".casewin .bonus-info__content").fadeIn();
                        });
                        $(".bonus-info__close").click(function (e) {
                            e.preventDefault();
                            $(".casewin .bonus-info__content").fadeOut();
                        });

                        //$('.header__profile-balance .bonus').html(Math.round(data.user.tastycoin));
                        //$('.header__profile-balance .balance').html(data.user.money);

                        $('.iteamblock .bonus').html(weapon.tastycoin);

                        $('#casewin').modal('show');
						console.log(data.triggers);

						if(data.triggers > 0)
						{
							$("#casewin").on("hidden.bs.modal", function () {
								checkTop100(data.triggers);						
							});
						}
						
                        //console.log("data.challenge", data.challenge);
                        if(data.challenge.html !== false){
                            updateChallenge(data.challenge.html, data.challenge.challenge_title, data.challenge.challenge_progress);
                        }

                        if(data.challenge.done) {
                            noty(data.challenge.message, false, 'success');
                        }

                        setTimeout(function () {
                            $('#casesCarusel').removeClass('rolling');
                            fillCarusel(function (items) {
                                //$('#casesCarusel').css("margin-left", "0px");
                                $('#casesCarusel').html(items);
                                $("#cont").css("transition", "All 1s ease").show();
                            });
                            play = false;

                            //console.log("data.case.freelevel", data.case.freelevel);
                            if (data.case.type == 'roshan') {
                                currentCase = "roshan_lvl" + data.result.cur.level;
                                nameCase2 = "roshan_lvl" + data.result.cur.level;
                                $('#rosh_lvl').text(data.result.cur.level);
                                $('header .bonus__coin').text(data.result.cur.tastycoins);
                                $('.roshan__img').attr('src', "/img/roshan/case/rosh-case" + data.result.cur.level + ".png");
                                $('#rosh_pl').text(data.result.cur.tastycoins + '/' + data.result.cur.nextPrice);
                                var pb_width = data.result.cur.tastycoins / data.result.cur.nextPrice * 100;
                                $('.progress-bar').css('width', pb_width + '%');
                                $('.roshan__level').removeClass('roshan__level' + (data.result.cur.level - 1)).addClass('roshan__level' + data.result.cur.level);
                                $('.roshan').removeClass('roshan__level' + (data.result.cur.level - 1)).addClass('roshan__level' + data.result.cur.level);
                                $('.carousel__roshan').removeClass('roshan__level' + (data.result.cur.level - 1)).addClass('roshan__level' + data.result.cur.level);
                                if (data.result.cur.tastycoins >= 600) $('#startgame').html('Открыть за <span class="balance__adv"><span class="bonus bonus__coin">' + data.result.cur.price + '</span><span class="bonus-curr bonus-curr__coin"></span></span>');else $('#startgame').html('Недостаточно <div class="balance__adv"><span class="bonus bonus__coin">' + (data.result.cur.tastycoins - 600).toFixed(0) + '</span><span class="bonus-curr bonus-curr__coin"></span>');
                            } else {
                                if (data.case.freelevel == 'y' && testmode === false)
                                    $('#startgame').html('Открыть бесплатно');
                                else if (testmode === true || data.offer === true)
                                    $('#startgame').html(sgametext);
                                else
                                    $('#startgame').html(translate('Открыть кейс за') + ' ' + data.case.price);

                                if (data.case.freedata && !testmode) {
                                    $('#caseimg').attr('src', '/img/dota/dota_inactive' + data.case.freedata.level + '.png');
                                    $('.progress p').text(data.case.freedata.progressbar_text);

                                    $("#progress-bar").css('width', data.case.freedata.progress + '%');
                                }
                            }

                        }, 1000);
                        /*
                         if(data.case.type == 'roshan'){
                         $("#tmp").load('/open/roshan2018 #roshan');
                         $("#roshan.case-wrap").html("");
                         $(".container .case-wrap").html( $("#tmp #roshan").html() );
                         //$("#tmp #roshan").html("");
                         //location.reload();
                         }
                         */
                    }, 15000);

                    if (data.case.type == 'seledcase') {
                        $(this).show();
                        $(".card-body > div").addClass("row").addClass("row no-gutters");
                        var end = Date.now() + 60 * 60 * 24 * 1000;
                        $('.case__count.ticker').show().countdown(end, {
                            elapse: true
                        }).on('update.countdown', function (event) {
                            var $this = $(this);
                            if (!event.elapsed) {
                                $this.html(event.strftime('<div class="countdown"> <div class="digits">%H</div><span class="delimiter" style="opacity: 1;">:</span> <div class="digits">%M </div><span class="secs delimiter" style="opacity: 1;">:</span> <div class="secs digits"> %S </div></div>'));
                            }
                        });
                    }

                    window.dataLayer = window.dataLayer || [];
                    dataLayer.push({
                        'event': openevent,
                        'CaseName': nameCase2,
                        'NumbersOfOpens': 1
                    });
                } else {
                    play = false;
                    if (data.type == 'no_link') $('#trade_url').modal('show');
                    noty(data.msg, false, 'error');
                }
            });
        }
    });

    $('.ticker_r').each(function(){
        var that = $(this);
        var end = that.data('time');
        that.show().countdown(end, {
            elapse: true
        }).on('update.countdown', function (event) {
            var $this = $(this);
            if (!event.elapsed) {
                $this.html(event.strftime('<div class="countdown"><div class="digits">%D </div>Д <div class="digits">%H</div><span class="delimiter" style="opacity: 1;">:</span> <div class="digits">%M </div><span class="secs delimiter" style="opacity: 1;">:</span> <div class="secs digits"> %S </div></div>'));
            }
        });

    });

    $('body').on('click', ".coin__cases > div", function () {
        var nameCase2 = $(this).find(".coin__case-title").text();
        var imgCase2 = $(this).find(".caseimg").data("img");
        $(".modal .coin__case-title").html(nameCase2);
        $(".modal .freecoin__casewin-heading img").attr("src", imgCase2);

        if (play) {
            noty(translate('Дождитесь открытия кейса'), false, 'error');
			$.post('/ajax/dblclicklog', ({'ccase':currentCase}));
            $(".modal").hide();
        } else {
            //var currentCase = "random immortal";
            var currentCase = $(this).data("casename");

            window.dataLayer = window.dataLayer || [];
            //$(".loader").show();

            $("#scrollerContainer").show();
            $(".freecoin__casewin-heading").show();
            $(".freecoin__casewin-result").hide();

            $.post('/ajax/getcase', { case: currentCase }, function (data) {
                if (data.status) {
                    var itemsBlock = '';
                    cases = [];
                    $.each(JSON.parse(data['inventory']), function (itemWithPrice, index) {
                        var img = index['img'];
                        if (index['type'] == '570') {
                            var search = 'http://steamcommunity.com/market/listings/570/' + index['item'];
                        } else if (index['type'] == '730') {
                            var search = 'http://steamcommunity.com/market/listings/730/' + index['item'];
                        } else {
                            var search = '';
                        }

                        itemsBlock += '<a href="' + search + '" class="iteamblock" target="_blank" style="text-decoration: none;">' + '<span class="price"> ' + index['price'] + '<i class="fas fa-ruble-sign"></i></span>' + '<div class="picture ' + index['quality'] + '">' + '<img src="' + img + '" alt="' + translate('Дроп') + '">' + '</div>' + '<div class="name ' + index['quality'] + '">' + '<span>' + index['item'] + '</span>' + '</div>' + '</div></a>';
                        var iteam = [index['name'], index['name'], index['quality'], img];
                        for (var i = 0; i <= 20; i++) {
                            cases.push(iteam);
                        }
                    });
                    fillCarusel(function (items) {
                        $('#casesCarusel').html(items);
                        $("#cont").css("transition", "All 1s ease").show();
                        $(".loader").hide();
                    });

                    setTimeout(function () {
                        play = true;
                        $.post('/ajax/play', { case: currentCase }, function (data) {
                            if (data.status) {
                                var weapon = data.weapon;
                                $("[data-id=96]").find('.name').removeClass('Arcana Immortal Legendary Mythical Rare Uncommon').addClass(weapon.type).html('<span>' + weapon.name + '</span>');
                                $("[data-id=96]").find('.picture img').attr("src", weapon.image);

                                $('#casesCarusel').addClass('rolling');
                                setTimeout(function () {
                                    setTimeout(function () {
                                        $('#casesCarusel').removeClass('rolling');
                                        fillCarusel(function (items) {
                                            $('#casesCarusel').html(items);
                                            $("#cont").css("transition", "All 1s ease").show();
                                        });
                                        $("#scrollerContainer").hide();
                                        $(".freecoin__casewin-heading").hide();

                                        $('.win_item').html('<div class="picture Mythical"><img src="' + weapon.image + '" alt="' + translate('Дроп') + '"></div><div class="title-and-price"><div class="name ' + weapon.type + '">' + weapon.name + '</div></div>');

                                        $(".freecoin__casewin-result").show();
                                        $(".profile.bonus").html(data.user.tastycoin);
                                        $(".casewin__btns .amount").html(weapon.price);
                                        $(".sell").data("id", weapon.id);

                                        $('.freecoin__casewin-title').html(weapon.price > 0 ? translate('Вы выиграли') : translate('Мы сожалеем'));

                                        $('.casewin__btns .bonus-curr__rub').hide();
                                        $('.casewin__btns .bonus-curr__coin').hide();

                                        if (weapon.it_type == 4 || weapon.it_type == 5) {
                                            $('.sell').hide();
                                            $('.casewin__btns .balance__adv').show();
                                        } else {
                                            $('.sell').show();
                                            $('.casewin__btns .balance__adv').hide();
                                        }

                                        if (weapon.it_type == 4 && weapon.price > 0) {
                                            $('.casewin__btns .bonus-curr__rub').show();
                                            $('.casewin__btns .balance__adv').attr("class", "balance__adv balance__adv-ruble");
                                        }

                                        if (weapon.it_type == 5 || weapon.price == 0) {
                                            $('.casewin__btns .bonus-curr__coin').show();
                                            $('.casewin__btns .balance__adv').attr("class", "balance__adv balance__adv-tastycoin");
                                        }

                                        play = false;
                                    }, 1000);
                                }, 15000);

                                window.dataLayer = window.dataLayer || [];
                                dataLayer.push({
                                    'event': 'OpenCase',
                                    'CaseName': nameCase2,
                                    'NumbersOfOpens': 1
                                });
                                //console.log(window.dataLayer);
                            } else {
                                play = false;
                                $('#freecoin__casewin').modal('hide');
                                if (data.type == 'no_link') $('#trade_url').modal('show');
                                noty(data.msg, false, 'error');
                            }
                        });
                    }, 1);
                } else noty(data.msg, false, 'error');
            });
        }
    });

    $('body').on('click', ".promoact", function (e) {
        e.preventDefault();
        $.post('/ajax/promo', { name: $('#promocode').val() }, function (data) {
            if (data && data['status']) {
                noty(data.msg, false, 'success');
                $(".paybag__promocode-active").hide();
                $(".paybag__promocode-activated").show();
                $('#promo_name').text(data.promo);
                $('#promo_percent').text('(' + data.percent + '%)');
                $("#promocode").val(' ');
                $(".bpercent").val(data.percent);
                $(".paysum").keyup();
            } else {
                noty(data.msg, false, 'error');
                //$(".paybag__promocode-inactive").show();
                //$(".paybag__promocode-active").hide();
                $("#promocode").val(' ');
            }
        });
    });
	
    $('body').on('click', "#voucheract", function () {
        $.post('/ajax/voucher', { name: $('#voucher').val() }, function (data) {
            if (data && data['status']) noty(data.msg, false, 'success');else noty(data.msg, false, 'error');
        });
    });
    var stitems = [];
    $('body').on('click', ".sending", function () {
        var that = $(this);
        var it = that.data('id');
        //console.log(it);
        //console.log(stitems);
        if(stitems.indexOf(it) == -1)
            noty(translate('После вывода предыдущей вещи, нужно подождать минуту. Code:4004'), false, 'error');
        else
            noty(translate('Предмет в процессе отправки. Code:4008'), false, 'error');
    });
    $('body').on('click', ".sends", function () {
		$.post('/ajax/sendfirst', {'send':'first'}, function (data) {
            if(data.status === true)
				$('#modal-warning').modal('show');
        });
        var item = $(this);
        stitems.push(item.data('id'));
        $('.status').removeClass('sends').addClass('sending');
        setTimeout(function () {
            $('.status').each(function () {
                var that = $(this);
                var it = that.data('id');
                if (stitems.indexOf(it) == -1) that.removeClass('sending').addClass('sends');
            });
        }, 1000 * 120);

        item.html(translate('Готовим к отправке'));
        var sellb = item.parent().children('.sell');
        sellb.fadeOut(0);

        var postdata = { id: $(this).data('id') };
        postdata = pushtokenTo(postdata, "tastyqiwi");
        $.post('/ajax/senditem', postdata, function (data) {
            //console.log(data);
            if (data && data['status']) {
                //noty('Предмет отправлен!', false, 'success');
                item.parent().find(".sell").hide();
                //socket.emit('SandTrade', {id: data.id});
                if (data['status'] == "ok") item.html(translate('В очереди на отправку'));
                if (data['status'] == "accepted") {
                    $('#' + item.data('id')).detach();
                    item.html('');
                }

                $('#i' + item.data('id')).detach();
                $('.sd' + item.data('id')).detach();
                $('.sl' + item.data('id')).detach();
                // $('.sl' + item.data('id')).removeClass('sell').addClass('completed');
                // $('.sl' + item.data('id')).parent().parent().children('.item__status').text('В очереди');
                $('.st' + item.data('id')).html('<div class="selled" data-toggle="tooltip" data-placement="top" title="' + translate('В очереди') + '">' + translate('В очереди') + '</div>');

                if (data.msg) {
                    noty(data.msg, false, 'success');
                }
            } else if (data.type == 'no_link') {
                $('#trade_url').modal('show');
                noty(data.msg, false, 'error');
            } else if (data.type == 'no_steamlogin') {
                $('#steam_login').modal('show');
                noty(data.msg, false, 'error');
            } else {
                item.html(translate('Забрать'));
                item.addClass('sends').removeClass('sending');
                sellb.fadeIn(0);
                noty(data.msg, false, 'error');
                $('.status').each(function () {
                    var that = $(this);
                    var it = that.data('id');
                    if (stitems.indexOf(it) == -1) that.removeClass('sending').addClass('sends');
                });
            }
        });

        return false;
    });

    $('body').on('click', "#steamloginsave", function () {
        if ($("#steam_login").data('bs.modal') && $("#steam_login").data('bs.modal').isShown) var login = $('#steam_login #steamlogin').val();else var login = $('.steamlogin_block #steamlogin').val();

        var postdata = { steamlogin: login };
        postdata = pushtokenTo(postdata);
        $.post('/ajax/savesteamlogin', postdata, function (data) {
            if (data.status) {
                noty(data.msg, false, 'success');
                if (data.old_steamlogin == 'f') {
                    window.dataLayer = window.dataLayer || [];
                    dataLayer.push({
                        'event': 'SteamLogin',
                        'TradeUrl': login
                    });
                }

                $('#steam_login').modal('hide');
            } else noty(data.msg, false, 'error');
        });
        return false;
    });

    $('body').on('click', ".loadmore", function () {
      //console.log("HERE");
        var page = $(this).data('page');
        var nextpage = parseInt(page) + 1;
        var user = $(this).data('user');
        var target = $(this).data('target');
        var type = $(this).data('type');
        var button_id = $(this).attr('id');
        var mode = $(this).data('mode');

        getmoreiteams(parseInt(page) + 1, user, mode, target, type, button_id);
        $(this).data('page');
    });

    $('body').on('click', "#copy_code", function () {
        var urlField = document.querySelector('#ref_code');
        urlField.select();
        document.execCommand('copy');
        noty(translate('Код скопирован в буфер!'), false, 'success');
    });
    $('body').on('click', "#save_code", function () {
        $.post('/ajax/refcode', { code: $('#ref_code').val() }, function (data) {
            if (data.status) noty(data.msg, false, 'success');else noty(data.msg, false, 'error');
        });
    });
    $('body').on('click', "#model_event", function () {
        var caser = $(this).data('caser');
        $.post('/ajax/eventJoin', { case: caser }, function (data) {
            if (data.status) noty(data.msg, false, 'success');else noty(data.msg, false, 'error');
            $('.join_modal').modal('hide');
        });
    });
    $('body').on('click', "#active_code", function () {
        $.post('/ajax/active_code', { code: $('#code_act').val() }, function (data) {
            if (data.status) noty(data.msg, false, 'success');else noty(data.msg, false, 'error');
        });
    });
    $('#pay').on('shown.bs.modal', function (e) {
        ///
    });
    $('#pay').on('hidden.bs.modal', function () {
        ///
    });
    $('body').on('click', ".sell, .to_sell", function (e) {
        var evt = e ? e : window.event;
        var item = $(this);
        var postdata = { id: $(this).data('id') };
        postdata = pushtokenTo(postdata , "tastyqiwi");

        $.post('/ajax/sellitem', postdata, function (data) {
            if (data.status) {
                //console.log('sellitemdata', data);
				console.log(data.offer + ' ' + data.top100rank);
                $('.header__profile-balance .balance').html(data.money);
                $('#profmoney').html(data.money);
                $('.header__profile-balance .bonus__coin').html(data.utastycoin);
                item.removeClass('sell').addClass('selled').hide();
                $('*[data-id="' + item.data('id') + '"].sends').remove();
                // $('.header__profile-data .bonus').html(data.anvils);
                //$('#anvstat').html(data.anvils);
                noty(data.msg, false, 'success');
                $('#casewin').modal('hide');
                $('.sl' + item.data('id')).detach();
                $('.sd' + item.data('id')).detach();
                $('#capsell' + item.data('id')).html('');
                $('.st' + item.data('id')).html('<div class="selled" data-toggle="tooltip" data-placement="top" title="' + translate('Продано') + '">' + translate('Продано') + '</div>');
                // $.post('/ajax/gettopnumber', ({'anvils':data.uanvils}), function(r){
                // if(r.status == 'ok')
                // {
                // $('#topnumber').text(r.number);
                // $('#topnumber2').text(r.number);
                // $('.user__widget .e-units__money').html(data.diffanvils);
                // }
                // });
				if(data.offer > 0)
					checkTop100(data.offer);						


                if (-1 !== window.location.href.indexOf('roshan2018')) {
                    location.reload();
                }

                if(typeof currentCase !== 'undefined')
                    if(currentCase == 'santamiracle')
                        location.reload();

                (evt.preventDefault) ? evt.preventDefault() : evt.returnValue = false;
                return false;

                //console.log("window.location.href", window.location.href);

                //console.log(window.location.href.indexOf('roshan2018'));
            } else noty(data.msg, false, 'error');
        });

        (evt.preventDefault) ? evt.preventDefault() : evt.returnValue = false;
        return false;
    });
    $('body').on('click', ".sell-all", function () {
        $.post('/ajax/sellall', { user_id: user_id }, function (data) {
            if(data.done) {
                $('.sell, .sends, .loadmore, .sell-all').each(function() {
                    $(this).hide();
                });
                $('.header__profile-balance .balance').html(data.money);
                $('#profmoney').html(data.money);
                $('.header__profile-balance .bonus__coin').html(data.utastycoin);
                var a_count = Number($('#a_count').text()) - data.total_sold;
                var na_count = Number($('#a_count').text()) + data.total_sold;
                $('#a_count').text(a_count);
                $('#na_count').text(na_count);
                noty(data.message, false, 'success');
                $("#profile_inventory_block").html(data.result_block);
            } else {
                noty(data.message, false, 'error');
            }
        });
    });

    $('body').on('click', "#sellall_pudgegame", function () {
        var button = $(this);
        $.post('/ajax/sellall', { user_id: user_id, casename: caseName }, function (data) {
            if(data.done) {
                noty(data.message, false, 'success');
                button.hide();
				$('#pudgegetinprofile').text('Перейти на сайт').attr('src', '/');
                //setTimeout(function(){noty(translate('Перезапускаем игру!'), false, 'success');}, 1500);
                //setTimeout(function(){location.reload()}, 3000);
            } else {
                noty(data.message, false, 'error');
            }
        });
    });

	$('body').on('click', ".to_upEgg", function (e) {
        var iid = $(this).data('id');
        $.post('/ajax/upgreevil', ({'iid':iid}), function (data) {
            if (data.status) {
				noty(data.msg, false, 'success');

				////console.log("data", data);
				var item = $("[data-item=" + iid + "]");
                item.find(".picture img").attr("src", data.img);
                item.find(".name span").text(data.quality);
                item.attr("class", "iteamblock case-egg "+data.quality.toLowerCase());
                item.find(".timer_eggs").attr("data-time", data.timer);
                item.find(".bonus__coin").text(data.up_price);
                item.find(".money").text(data.price+" ₽");

                var timerobj = item.find(".timer_eggs");
                timerobj.attr("data-time", data.timer);

                $(timerobj).countdown(data.timer, {
                    elapse: true
                }).on('update.countdown', function (event) {
                    var $this = $(this);
                    var tpl = `
                        <div class="countdown">
                            <span class="digits">%H</span>
                                <span class="delimiter" style="opacity: 1;">:</span>
                            <span class="digits">%M </span>
                                <span class="secs delimiter" style="opacity: 1;">:</span>
                            <span class="secs digits"> %S </span>
                        </div>`;

                    if (!event.elapsed) {
                        $this.html(event.strftime(tpl));
                    }
                });

                if(data.quality == 'Arcana')
                    item.find(".to_upEgg, .upgrading, .coins").hide();

				//location.reload();
			}
			else{
				noty(data.msg, false, 'error');
			}

		});
	});

    $('[data-toggle="tooltip"]').hover(function (e) {
        $('[data-toggle="tooltip"]').tooltip();
    });
    if (typeof window.localStorage.banner == 'undefined') localStorage.setItem('banner', true);
    if (localStorage.getItem('banner') != 'false') $('.banner1').show();else $('.banner1').hide();

    $(".caseblock, .miracle").hover(function () {
        $(this).find('.case__img').toggleClass('unhovered');
    });

    $("#miracle").on('click', function () {
        var button = $(this);

        var postdata = { case: currentCase };
        postdata = pushtokenTo(postdata, "caseopen");

        $.post('/ajax/newyear_play', postdata, function (data) {
            if (data.status) {
               // console.log('ny play data', data);
                button.fadeOut(1000);
                $(".gifts").addClass('active');
                $('.header__profile-balance .balance').html(data.user_money);

                window.myAudio.pause();
                window.myAudio = new Audio();
                window.myAudio.src = "/sound/new_year2.mp3";
                window.myAudio.play();

                if( $.cookie('case_sound') != 1 && $.cookie('case_sound'))
                    window.myAudio.muted = 1;

            } else {
                noty(data.msg, false, 'error');
            }
        });
    });

    function setGiftWin(button, weapon_gift){
        var img = weapon_gift.img_local ? weapon_gift.img_local : weapon_gift.img;

        button.find('img').attr('src', img ? img : weapon_gift.image);
        button.find('.name').addClass(weapon_gift.quality);
        button.find('.picture').addClass(weapon_gift.quality);
        button.find('.name span').text(weapon_gift.name);
        button.find('.price .number').text(weapon_gift.price);
    }

    $("#gift-case .gifts .gift-wrap").on('click', function (e) {
        var button = $(this);
        var gift = $('.gift-item');

        e.preventDefault();

        // ВЗРЫВ при клике НГ кейс
        button.find('.gift-wrap__item').prepend('<div id="boom"><canvas width="600" height="500" id="fireworks-canvas"></canvas></div>');

        var firework = JS_FIREWORKS.Fireworks({
            id : 'fireworks-canvas',
            hue : 240, // насыщенность
            particleCount : 500, // на сколько частей разбивается
            delay : 0,
            minDelay : 20,
            maxDelay : 40,
            boundaries : { // of respawn and target
                top: 150,
                bottom: 300,
                left: 100,
                right: 490
            },
            fireworkSpeed : 5,
            fireworkAcceleration : 1.05,
            particleFriction : .95, // продолжительность лучей
            particleGravity : .5 // направление лучей
        });
        setTimeout(firework.start(), 1000);

        var postdata = { case: currentCase };
        postdata = pushtokenTo(postdata, "caseopen");

        // убираем крышку
        button.find('.gift-cover').fadeOut();
        // button.prepend('<div class="giff"><img src="img/gift-case/giff.gif" alt=""></div>');

        // вклюючаем гифку
        // setTimeout(function() {$('.giff').fadeOut()}, 2180);

        $.post('/ajax/play', postdata, function (data) {
            if (data.status) {

                var weapon_gift = data.weapon;
                var weapon_ext1 = weapon_gift.ext[0];
                var weapon_ext2 = weapon_gift.ext[1];

                gift.find('img').attr('src', weapon_gift.image);
                gift.find('.name').addClass(weapon_gift.quality);
                gift.find('.picture').addClass(weapon_gift.quality);
                gift.find('.name span').text(weapon_gift.name);
                $('.itemprice').text(weapon_gift.price);

                $(".sell").data("id", weapon_gift.id);

                var exts = $('.gift-content .gifts .gift').not(button.closest('.gift')[0]);

                setGiftWin(button.find('.gift-wrap__item'), weapon_gift);
                setGiftWin($(exts[0]), weapon_ext1);
                setGiftWin($(exts[1]), weapon_ext2);

                //console.log('n2y play data', data);
                button.addClass('clicked');
                // покажем что в других кейсах
                setTimeout(function(){
                    $('.gifts .gift-wrap').addClass('clicked');
                }, 3500);


                // появляется кнопка сыграть еще раз
                // setTimeout(function(){
                //     $('#one-more-time').fadeIn();
                // }, 1000);
                //

                showGifts();
            } else {
                play = false;
                noty(data.msg, false, 'error');

                if(typeof data.code !== 'undefined')
                    if(data.code == 60020)
                        location.reload();
            }
        });

    });
    function showGifts() {
        // открываем выгрыш
        setTimeout(function(){
           $('.step .choose').removeClass('active');
           $('.wrapper .step.winner').fadeIn(2000).addClass('active');
           $('.choose_text').hide();
        }, 1500);

    };

    /*if( $('#gift-case .gift-content .step.active .gift').css('top', '32%') ) {
        console.log('top 32%')
    }*/

    $(".offers-store .offer__box.col").hover(function () {
        $(this).find('.offerimg').toggleClass('img_hover');
    });
    /*$(".caseblock").hover(function () {
        img.find('.case__img').attr('src', img.data('img')).fadeOut(1500);
        setTimeout(function() {
          //console.log('появилась')
            img.find('.case__img').attr('src', img.data('hover')).fadeIn(1500);
        }, 1990);
    }, function () {
        $(this).find('.case__img').attr("src", $(this).data('img'));
    });*/

    if (typeof user_id !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        dataLayer.push({
            'event': 'setUserId',
            'UserID': user_id
        });
    }
    $(document).on({
        mouseenter: function mouseenter() {
            $(this).find('.case-image').css({
                opacity: 1
            });
        },
        mouseleave: function mouseleave() {
            $(this).find('.case-image').css({
                opacity: 0
            });
        }
    }, ".item-incase");
    $(".banner1").click(function () {
        $('.banner1').hide();
        localStorage.setItem('banner', false);
    });

    $(".opencase-bottom-open-free.ok").click(function () {
        sharefree();
    });
    /* Modal Pay */

    $('#pay .paybag__pay').click(function () {
        var cid_m = $.cookie('cid_m'); //yaCounter42202889.getClientID();
        window.location.href = '/payment/pay?sum=' + $('.paysum').val();
        var url = location.href;
        var paycase = $(this).attr('data-case');
        setCookie('paycase', paycase, 1800);
        setCookie('payurl', url, 1800);
        //setCookie('cid_m', cid_m, 3600);
        $.post('/ajax/setcidm', { 'cid_m': cid_m });
        $(".paysum").val(500);
    });

    $(".paybag__promocode-active").hide();
    if ($("#promo_name").text().length < 1) $(".paybag__promocode-activated").hide();
    $(".paybag__promocode-inactive .promoinact").click(function (event) {
        event.preventDefault();
        $(".paybag__promocode-inactive").hide();
        $(".paybag__promocode-active").show();
    });

    $(".paybag__promocode-activated .promoactivated").click(function (event) {
        event.preventDefault();
        $(".paybag__promocode-activated").hide();
        $(".paybag__promocode-active").show();
    });

    $(".paysum").keyup(function () {
        var paysum = $(this).val();
        $('.paysum').val(paysum);
        
        var tasty_promo_test = ($(".bpercent").val() * paysum / 100).toFixed(0);
        $('.paybag__get-promo span').html(tasty_promo_test);
        var bonus = 0;

        //console.log("tasty_promo_test", tasty_promo_test);

        if (paysum >= 5000) bonus = $('.paysum').val() * 15 / 100;else if (paysum >= 3000) bonus = $('.paysum').val() * 10 / 100;else if (paysum >= 1000) bonus = $('.paysum').val() * 5 / 100;

        //console.log("bonus", bonus);


        $('.payget').html((parseFloat(bonus) + parseFloat(paysum) + parseFloat(tasty_promo_test)).toFixed(0));
        $('.paybag__get-bonus span').html(bonus.toFixed(0));
    });

    $('.menu1 .refilla').click(function () {
        window.location.href = '/payment/pay?sum=' + $('.paysum').val();
        var url = location.href;
        var paycase = $(this).attr('data-case');
        setCookie('paycase', paycase, 1800);
        setCookie('payurl', url, 1800);
    });
    $('#pay .paybag__skins').click(function () {
        window.location.href = '/payment/sp';
    });
    $('.skins .payskin').click(function () {
        window.location.href = '/payment/sp';
    });

    if(!$.cookie('leaveViewed')) {
        var _ouibounce = ouibounce(document.getElementById('ouibounce-modal'), {
            callback: function () {
                $.cookie('leaveViewed', true, { expires: 1 });
                var end = Date.now() + 60 * 3 * 1000;
                $('.leave_timer').countdown(end, {
                    elapse: true
                }).on('update.countdown', function (event) {
                    var $this = $(this);
                    if (!event.elapsed) {
                        $this.html(event.strftime('%M:%S'));
                    }

                    if (event.offset.minutes <= 0 && event.offset.seconds <= 1) {
                        $('#ouibounce-modal').modal('hide');
                    }
                    else {
                        $this.html(event.strftime('%M:%S'));
                        $('.leave_bar').css('width', Math.ceil((parseInt(event.strftime('%M'))*60 + parseInt(event.strftime('%S')))*100/180) + '%');
                    }
                });
            }
        });
    }

    $('#ouibounce-modal .underlay').on('click', function() {
        $('#ouibounce-modal').hide();
    });


    $('.getbonus').click(function () {
        if ($(this).hasClass('close_this')) {
            $('#land_modal').modal('hide');
        } else if (!$(this).hasClass('addmoney')) location.assign('https://tastydrop.ru/payment/pay?land=y&sum=' + $('.paysum').val());else {
            $('#land_modal').modal('hide');
            $('a.purse.addmoney').click();
        }
    });

    $('#cancelbonus').click(function () {
        var action = $(this).attr('action');
        $.post('/ajax/cancelbonus', { 'action': action }, function (r) {
            if (r.status == 'y') {
                $('#land_modal').modal('hide');
            }
        });
    });
    $('select[name=flakes_week]').change(function () {
        var tstart = $(this).val();

        $.post('/topweek', { 'tstart': tstart }, function (r) {
            if (r.status == 'y') {
                $('#flakes_week').html(r.flakes_week);
                $('.cprize').text(r.cap);
            }
        });
    });

    $('.tdsw').click(function () {
        var that = $(this);
        if (!that.hasClass('active')) {
            var type = that.attr('type');
            $('.items-inner').removeClass('td').removeClass('ld').addClass(type);
            $('.active_drop').addClass('disable_drop').removeClass('active_drop').removeClass('active');
            that.removeClass('disable_drop').addClass('active_drop').addClass('active');
            $.post('/ajax/livedrop', { 'type': type }, function (data) {
                data = data.reverse();
                $('.items-inner').html('');
                $.each(data, function (_, data) {
                    $('.items-inner').prepend($('<a>').attr('href', '/user/' + data.user + '')/*.attr('data-item', data.id)*/.addClass('item-history').append('<img src="' + data.img + '" class="item-history-pic" alt="' + translate('Дроп') + '">').append('<div class="rarity ' + data.type + '"></div>').append('<div class="history-weapon-hover"> <img src="' + data.imgcase + '"><span class="tem-history__user">' + data.name + '</span></div>').css('display', 'none').fadeIn(600));
                });
            });
        }
        // $( window ).unload(function() {

        // });
    });

    $('body').on('click', "#startcooldown", function () {
        $.post('/ajax/cooldown', {}, function (data) {
            if (data.status) {
                noty(data.msg, false, 'success');
                $(".bonus__coin.profile").html(data.result.user.tastycoin);
                $("#startcooldown").hide();
                $('.freecoin__card-timer').show();
                $('.freecoin_bar').show();
                $('.freecoin__card-timer').on('update.countdown', function (event) {
                    $(this).html(event.strftime('' + '<span id="hour">%H</span> ' + '<span id="minutes">%M</span> ' + '<span id="seconds">%S</span> '));
                    $('.freecoin_bar').css('width', Math.ceil((parseInt(event.strftime('%H')) * 60 + parseInt(event.strftime('%M'))) * 100 / 120) + '%');
                });
                $('.freecoin__card-timer').countdown(data.result.nextcooldown);
                $('.freecoin__card-counter').removeClass('off');
            } else {
                noty(data.msg, false, 'error');
            }
        });
    });

    //initiate timer for topflakes page
    var url = document.location.toString();
    if (url.match('topweek')) {
        var tend = 1513544399;
        var a = new Date(tend * 1000);
        updater(document.getElementById("days"), document.getElementById("hours"), document.getElementById("minutes"), document.getElementById("seconds"), [a.getFullYear(), a.getMonth(), a.getDate(), a.getHours(), a.getMinutes(), a.getSeconds()]);
    }

    /*
     $('.ticker').each(function (i, obj) {
     $(obj).countdown($(obj).data('time'), {
     elapse: true
     }).on('update.countdown', function (event) {
     var $this = $(this);
     var tpl = '<div class="countdown"> <div class="digits">%H</div><span class="delimiter" style="opacity: 1;">:</span> <div class="digits">%M </div><span class="secs delimiter" style="opacity: 1;">:</span> <div class="secs digits"> %S </div></div>';
     if (!event.elapsed) {
     $this.html(event.strftime(tpl));
     }
     });
     });
     */
    $('.football__counter-timer').each(function (i, obj) {
        $(obj).countdown($(obj).data('dtend'), function (event) {
            if (event.strftime('%-d') > 0) $(this).html(event.strftime('%-dД %H:%M:%S'));else $(this).html(event.strftime('%H:%M:%S'));
        });
    });;

    /*$(".offer__box").hover(function () {
        $(this).find('.offerimg').attr("src", $(this).data('hover'));
    }, function () {
        $(this).find('.offerimg').attr("src", $(this).data('img'));
    });*/

    $('.offer__box-counter').each(function (i, obj) {
        var end = $(this).data('end')*1000;

        if(!isNaN(end)){
            $(obj).countdown(end, function (event) {
                $(this).html(event.strftime(''
                    + '<span id="hours">%H :</span> '
                    + '<span id="minutes">%M :</span> '
                    + '<span id="seconds">%S</span> '));
            });
        }

    });

    $('body').on('click', "#soundbutton", function () {
        if($(this).hasClass("active")){
            $.cookie('case_sound', 0);
            if(typeof window.myAudio != 'undefined')
                window.myAudio.muted = true;
        }
        else{
            $.cookie('case_sound', 1);
            if(typeof window.myAudio != 'undefined')
                window.myAudio.muted = false;
        }
        $(this).toggleClass("active");

        return false;
    });

    $('body').on('click', ".startchallenge", function () {
        var challengeid = $(this).data('id');
        var level = $(this).data('level');
        //console.log("challengeid", challengeid);

        var postdata = { challengeid: challengeid };
        postdata = pushtokenTo(postdata);
        $.post('/ajax/startchallenge', postdata, function (data) {
            //console.log("data", data);
            if (data.status) {
                noty(data.msg, false, 'success');
                var block = $(data.html);
                var items = block.html();
                $("#challenge_container").html('').append(items);
                initOwl();

                updateChallenge(data.html, data.challenge_title, data.challenge_progress);

            } else noty(data.msg, false, 'error');
        });
        return false;
    });

    $('body').on('click', ".getreward", function () {
        var challengeid = $(this).data('id');
        //console.log("challengeid", challengeid);
        var postdata = { challengeid: challengeid };
        postdata = pushtokenTo(postdata);
        $.post('/ajax/getreward', postdata, function (data) {
            //console.log("data", data);
            if (data.done) {
                if (typeof skiptesting !== "undefined")
                    skiptesting = true;

                noty(data.msg, false, 'success');

                var block = $(data.html);
                var items = block.html();
                $("#challenge_container").html('').append(items);
                initOwl();
                $('header .bonus__coin').text(data.user.tastycoin);

                updateChallenge(data.html, data.challenge_title, data.challenge_progress);

            } else noty(data.msg, false, 'error');
        });
        return false;
    });

    function updateChallenge(html, challenge_title, challenge_progress){
      //console.log(html, challenge_title, challenge_progress);
        if(challenge_title !== null && challenge_progress !== null){

            if(challenge_title.length > 1)
                $("body > .challenge__ticker").css("visibility", "visible");
            else
                $("body > .challenge__ticker").css("visibility", "hidden");

            $(".chall__box-progress marquee").html(challenge_title);
            $(".chall__box-progress .progress-bar").width(challenge_progress + "%");
        }else{
            $("body > .challenge__ticker").css("visibility", "hidden");
        }
        localStorage.setItem('cplay', JSON.stringify({html, challenge_title, challenge_progress}));
    }

    $('body').on('click', ".testchallenge", function () {
        if (typeof testchallenge !== 'undefined') {
            var button = $(this);
            var postdata = {};
            postdata = pushtokenTo(postdata);
            $.post('/ajax/testchallenge', postdata, function (data) {
                //console.log("data", data);
                var challengeid = $(this).data('id');
                var level = $(this).data('level');
                if (data.done) {

                    if (typeof skiptesting !== "undefined")
                        skiptesting = true;

                    noty(data.message, false, 'success');
                    button.closest(".card").find(".back .swiper-slide").removeClass("current-call").removeClass("testchallenge").addClass("getreward").addClass("done").find(".chall__box-status").text("Забрать");
                    button.closest(".card").find(".front .swiper-slide").removeClass("current-call").removeClass("testchallenge").addClass("getreward").addClass("done").find(".chall__box-status").text("Выполнено")

                } else noty(data.message, false, 'error');
            });
            return false;
        }
    });


    $('body').on('click', ".cancelchallenge", function () {
        var postdata = {};
        postdata = pushtokenTo(postdata);
        $.post('/ajax/cancelchallenge', postdata, function (data) {
          //console.log("data", data);
            if (data.status) {
                var block = $(data.html);
                var items = block.html();
                $("#challenge_container").html('').append(items);
                initOwl();
            } else noty(data.message, false, 'error');
        });
        $('.close').click();
        return false;
    });

    $('.closech').click(function () {
        $('.close').click();
    });

    initOwl();

    /*setTimeout(function(){
     var height = parseInt($("#challenge_container").outerHeight());
     $("#challenge_container").css("height", height);
     }, 1000);*/

    $('<br />').insertAfter('.reward .bonus-curr__coin');

    $('#cont').on('click', ".iteamblock.type9", function (e) {
        var evt = e ? e : window.event;

        var quality = $(this).data("quality").toLowerCase();
        //window.location.href = '/greevil/' + quality + '_about';
        window.open('/greevil/' + quality + '_about', '_blank');

        (evt.preventDefault) ? evt.preventDefault() : evt.returnValue = false;
        return false;
    });

    $( "#payform" ).submit(function( e ) {
        var eggpromo = ['Spooky4','DirayTide','TIKOVKA','Halloween2018M','Halloween2018P','VolvoGiveDiretide','HallowAnt','AntHallow','DireTrash','HellCore','GhostCore','IMBAFEAR','OMG_DROP','VolvoGiveMeMana','VERTIDE','EZHelloween','DireTommy','FURY_HALLOWEEN','gabegivediretide','hell31','DirePECHKA','gomunkul','DIRETIDESA1','DireMagna','MetaDire','DiretidePanda','DirePechka','DMPR_1','DMPR_2','DMPR_3','DMPR_4','DMPR_5','NKPR_1','NKPR_2','NKPR_3','NKPR_4','NKPR_5','ANPR_1','ANPR_2','ANPR_3','ANPR_4','ANPR_5','VLPR_1','VLPR_2','VLPR_3','VLPR_4','VLPR_5','VRPR_1','VRPR_2','VRPR_3','VRPR_4','VRPR_5','VLRP_1','VLRP_2','VLRP_3','VLRP_4','VLRP_5','VLADPRO_1','VLADPRO_2','VLADPRO_3','VLADPRO_4','VLADPRO_5','VALPRO_1','VALPRO_2','VALPRO_3','VALPRO_4','VALPRO_5','DIMPRO_1','DIMPRO_2','DIMPRO_3','DIMPRO_4','DIMPRO_5','VRPRO_1','VRPRO_2','VRPRO_3','VRPRO_4','VRPRO_5','NIKPRO_1','NIKPRO_2','NIKPRO_3','NIKPRO_4','NIKPRO_5','ANPRO_1','ANPRO_2','ANPRO_3','ANPRO_4','ANPRO_5'];

        var promo = $("#promo_name").text();
        var sum = parseInt($(".paysum").val());

        if(eggpromo.indexOf(promo) !== -1 && sum < 10){
            var evt = e ? e : window.event;
            event.preventDefault();
            noty(translate('Минимальная сумма пополнения с данным промокодом 10 рублей'), false, 'error');
            return false;
        }

    });

    var current_lot_id;
    $('body').on('click', ".bet", function(e){
        var lot_id = $(this).attr("data-lotid");
      //console.log("lot_id1", lot_id);
        var button = $(this);

        var postdata = { lot_id: lot_id };
        postdata = pushtokenTo(postdata);

        $.post('/ajax/pa_bet', postdata, function (data) {

          //console.log("lot_id", lot_id);
          //console.log(data);

            if (data && data['status']) {
                noty(data.msg, false, 'success');

                var lot = $("div[data-lotid=" + lot_id + "]");
              //console.log("lot", lot);

                var timer = lot.find('.dtend');
                timer.attr("data-time", data.lot.dtend);

                var dtend = Date.now() + parseInt(data.lot.left);
                timer.countdown(dtend, {elapse: true});

              //console.log("lot.find('.bet_price')", lot.find('.bet_price'));
                lot.find('.bet_price').text(change_currency(data.lot.bet_price));
                lot.find('.auction-item__bet').removeClass("mb").addClass("lb");
                lot.find('.mybet').text(1);
                lot.find('.filtration-content .main').text(parseInt(data.lot.dtend) - 1000000000);

                $('.header__profile-balance .balance').html(data.money);
                $("#auction_modal").modal("hide");

                setTimeout(function(){
                    lotsGrid();
                    lotsSort($(".filter.active").length > 0 ? $(".filter.active").attr('data-sort-by') : 'main');
                }, 100);
            } else {
                if(typeof data.code !== "undefined"){
                    if(data.code == 20001){
                        $("#author_football").show();
                        $("<div class='modal-backdrop fade show'></div>").appendTo("body");
                    }
                    if(data.code == 20903){
                        $("#auction_modal").modal("hide");
                        $('#pay').modal('show');
                    }
                }

                noty(data.msg, false, 'error');
            }
        });
    });

    $('body').on('click', ".bet_auth", function(e){
        var auction_item = $(this).closest(".auction-item");

        var bet_price = auction_item.find(".bet-price").html();
        var item_name = auction_item.find(".panel_name span").text();
        var lot_id = $(this).attr("data-lotid");

        $("#auction_modal .item-price").html(bet_price);
        $("#auction_modal .item-name").text(item_name);
        $("#auction_modal .bet").attr("data-lotid", lot_id);

    });

});

window.addEventListener('storage', function (event) {
  //console.log(11);
    if(event.key == 'profile'){
        var profile = JSON.parse(localStorage.getItem('profile'));
        //console.log(event.key, event.newValue);

        $("#ttok_tastyqiwi").val(profile.tokenval);
        $("#ttok_tastyqiwi").attr("name", profile.tokenname);
    }
    else if(event.key == 'copen'){
        var copen = JSON.parse(localStorage.getItem('copen'));
        //console.log(event.key, event.newValue);

        $("#ttok_caseopen").val(copen.tokenval);
        $("#ttok_caseopen").attr("name", copen.tokenname);
    }else if(event.key == 'cplay'){
      //console.log(event.key, event.newValue);
        var cplay = JSON.parse(localStorage.getItem('cplay'));
      //console.log("cplay", cplay);

        if (document.location.toString().match('challenge')) {
            var block = $(cplay.html);
            var items = block.html();
            $("#challenge_container").html('').append(items);
            initOwl();
        }

        if(cplay.challenge_title !== null && cplay.challenge_progress !== null){
            if(cplay.challenge_title.length > 1)
                $("body > .challenge__ticker").css("visibility", "visible");
            else
                $("body > .challenge__ticker").css("visibility", "hidden");

            $(".chall__box-progress marquee").html(cplay.challenge_title);
            $(".chall__box-progress .progress-bar").width(cplay.challenge_progress + "%");
        }else{
            $("body > .challenge__ticker").css("visibility", "hidden");
        }

    }

});

function updater(d, h, m, s) {
    var dn = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [0, 0, 0, 0, 0, 0];

    // День сброса - 27 сентября 2015 года (и далее каждые три дня)
    var baseTime = new Date(dn[0], dn[1], dn[2], dn[3], dn[4], dn[5]);
    // Период сброса — 3 дня
    var period = 7 * 24 * 60 * 60 * 1000;

    function update() {
        var cur = new Date();
        // сколько осталось миллисекунд
        var diff = period - (cur - baseTime) % period;
        // сколько миллисекунд до конца секунды
        var millis = diff % 1000;
        diff = Math.floor(diff / 1000);
        // сколько секунд до конца минуты
        var sec = diff % 60;
        if (sec < 10) sec = "0" + sec;
        diff = Math.floor(diff / 60);
        // сколько минут до конца часа
        var min = diff % 60;
        if (min < 10) min = "0" + min;
        diff = Math.floor(diff / 60);
        // сколько часов до конца дня
        var hours = diff % 24;
        if (hours < 10) hours = "0" + hours;
        var days = Math.floor(diff / 24);
        d.innerHTML = days;
        h.innerHTML = hours;
        m.innerHTML = min;
        s.innerHTML = sec;

        // следующий раз вызываем себя, когда закончится текущая секунда
        setTimeout(update, millis);
    }
    setTimeout(update, 0);
}

function gofree() {
    $.get('/ajax/openfree/' + currentCase, function (data) {
        if (data && data['status'] != true) noty(data.msg, false, 'error');else {
            noty(data.msg, false, 'success');
            $(".opencase-bottom-open-free.ok").removeClass('ok').addClass('inactive').text(translate('Зарегистрированы'));
            //console.log('data', data);
            var end = data.dateend > 0 ? data.dateend * 1000 : Date.now() + 60 * 60 * 3 * 1000;
            $('.case__count.ticker').show().countdown(end, {
                elapse: true
            }).on('update.countdown', function (event) {
                var $this = $(this);
                if (!event.elapsed) {
                    $this.html(event.strftime('<div class="countdown"> <div class="digits">%H</div><span class="delimiter" style="opacity: 1;">:</span> <div class="digits">%M </div><span class="secs delimiter" style="opacity: 1;">:</span> <div class="secs digits"> %S </div></div>'));
                }
            });
        }
    });
    return true;
}
var closedwindow = function closedwindow(window, cb) {
    var a = true;
    try {
        if (window.closed) {
            a = false;
            cb && cb();
        }
    } catch (e) {
        //console.log(e);
    }
    if (a) {
        setTimeout(function () {
            closedwindow(window, cb);
        }, 1000);
    }
};
function share(img) {
    var url = 'http://vkontakte.ru/share.php?';
    url += 'url=' + 'http://tastydrop.ru/';
    url += '&title=' + 'Самый вкусный дроп!';
    url += '&description=' + 'Вот что мне прилетело на tastydrop.ru :) А вы уже пробовали открывать бесплатные кейсы по Дотке?';
    url += '&image=' + img;
    url += '&noparse=true';
    window.open(url, '', 'toolbar=0,status=0,width=626,height=436');
}
function sharefree() {
    var url = 'http://vkontakte.ru/share.php?';
    url += 'url=' + 'http://tastydrop.ru/';
    url += '&title=' + 'Открывай кейсы вместе со мной!';
    url += '&description=' + 'Бесплатный кейс раздаёт здесь вещи каждые 3 часа — tastydrop.ru';
    url += '&image=http://tastydrop.ru' + $('.content_vfreecase_block_case img').attr('src');
    url += '&noparse=true';
    var win = window.open(url, '', 'toolbar=0,status=0,width=626,height=436');
    closedwindow(win, gofree);
}

function getmoreiteams(page, userid) {
    var mode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'norm';

    var postdata = { page: page, user: userid, mode: mode };
    postdata = pushtokenTo(postdata);

    $.post('/ajax/loadmore', postdata , function (data) {
        //console.log("data", data);
        if (data.status) {
            var iteamsblock = '';
            $.each(data['paginate']['items'], function (itemWithPrice, index) {
                var iimg = index['type'] == 3 ? index['img'] + '?' : index['img'];
                iteamsblock += '<a class="iteamblock" data-item="' + index['id'] + '">';

                iteamsblock += '<div class="picture ' + index['quality'] + ' ">  ' + '<img src="' + iimg + '" width="135px" alt="Дроп" class="drop-image"/>  ' + '</div>  ' + '<div class="name ' + index['quality'] + ' "><span>' + index['item'] + '</span></div>' + '<span class="price" data-toggle="tooltip" data-placement="top" title="Цена предмета для продажи">' + +index['price'] + '<i class="fas fa-' + data.currency + '-sign"></i></span>  ' + '</span>  ';

                if (index['type'] == 2 || index['type'] == 0 && userid == user_id) {
                    if (index['status'] == "progress" || index['status'] == "escrow" || index['status'] == "support") iteamsblock += '<button data-id="' + index['id'] + '" class="btn btn-sale btn-item sell" data-toggle="tooltip" data-placement="top" title="' + translate("Продать за") + ' ' + (index['price'] * 1).toFixed(2) + ' P">' + translate("Продать за") + ' ' + (index['price'] * 1).toFixed(2) + ' P</button>' + '<button data-id="' + index['id'] + '" class="sends status btn btn-pickup btn-item" ids="' + index['id'] + '" data-toggle="tooltip"data-placement="top" title="' + translate("Забрать предмет") + '">' + translate("Забрать") + '</button>';else if (index['status'] == "completed") iteamsblock += ' <button class="status btn btn-pickup btn-item" href="https://steamcommunity.com/tradeoffer/' + index['offerid'] + '/" target="_blank" data-toggle="tooltip" data-placement="top" title="' + translate("Забрать предмет") + '">' +  translate("Получить трейд") + '</button>';else if (index['status'] == "before") iteamsblock += '<button class="status btn btn-pickup btn-item" data-toggle="tooltip" data-placement="top" title="Ожидание подтверждение ботом">  ' + 'Ожидание' + '</button>';else if (index['status'] == "send") iteamsblock += '<button class="status btn btn-pickup btn-item" data-toggle="tooltip" data-placement="top" title="Предмет находится в очереди на отправку">  ' + 'В очереди на отправку' + '</button>';else if (index['status'] == "canceled") iteamsblock += '<a data-id="' + index['id'] + '" class="sends status btn btn-pickup btn-item" ids="' + index['id'] + '" data-toggle="tooltip" data-placement="top" title="' + translate("Забрать предмет") + '">'  + translate("Забрать") + '</button>';
                }
                if (index['status'] == "completed") iteamsblock += '<span class="status completed " data-toggle="tooltip" data-placement="top" title="Отправлено">  ' + ' <i class="fas fa-arrow-down"></i>  ' + '</span> ';else if (index['status'] == "before") iteamsblock += '<span class="status completed" data-toggle="tooltip" data-placement="top" title="Ожидает подтверждения ботом">  ' + '<i class="fas fa-arrow-down"></i>  ' + '</span>';else if (index['status'] == "accepted") iteamsblock += '<span class="status completed" data-toggle="tooltip" data-placement="top" title="' + translate("Принято") + '">  ' + '<i class="fas fa-arrow-down"></i>  ' + '</span>';else if ((index['status'] == "progress" || index['status'] == "support") && index['type'] != 2 && userid == user_id) iteamsblock += '<span data-id="' + index['id'] + '" class="status sell" data-toggle="tooltip" data-placement="top" title="' + translate("Продать за") + ' ' + (index['price'] * 1).toFixed(2) + ' P">' + '<i class="fas fa-' + data.currency + '-sign"></i>  ' + '</span>';else if (index['status'] == "canceled" && index['type'] != 2 && userid == user_id) iteamsblock += ' <span data-id="' + index['id'] + '" class="status sell" data-toggle="tooltip" data-placement="top" title="' + translate("Продать за") + ' ' + (index['price'] * 1).toFixed(2) + ' P">' + '<i class="fas fa-' + data.currency + '-sign"></i>  ' + '</span>';else if (index['status'] == "selled") iteamsblock += '<span class="status selled" data-toggle="tooltip" data-placement="top" title="Продано">' + '<i class="fas fa-' + data.currency + '-sign" aria-hidden="true"></i>' + '</span>';else if (index['status'] == "notfound" && userid == user_id) iteamsblock += '<span class="status sell" data-id="' + index['id'] + '" data-toggle="tooltip" data-placement="top" title="Продать за ' + (index['price'] * 1).toFixed(2) + ' P">  ' + '<i class="fas fa-' + data.currency + '-sign" aria-hidden="true"></i>  ' + '</span>' + '<span class="status escrow" data-toggle="tooltip" data-placement="bottom" title="Предмет закончился">  ' + '<i class="fas fa-arrow-down" aria-hidden="true"></i>  ' + '</span>';else if (index['status'] == "send") iteamsblock += '<span class="status completed" data-toggle="tooltip" data-placement="top" title="В ожидании на отправку">  ' + '<i class="fas fa-arrow-down"></i>  ' + '</span>';else if (index['status'] == "escrow" && userid == user_id) iteamsblock += '<span class="status escrow" data-toggle="tooltip" data-placement="bottom" title="' + index['err'] + '">  ' + '<i class="fa fa-exclamation"></i>  ' + '</span>  ' + '<span class="status sell" data-id="' + index['id'] + '" data-toggle="tooltip" data-placement="top" title="Продать за ' + (index['price'] * 1).toFixed(2) + ' P">  ' + '<i class="fas fa-' + data.currency + '-sign" aria-hidden="true"></i>  ' + '</span>';else if (index['status'] == "err") iteamsblock += '<span class="status notcompleted" data-toggle="tooltip" data-placement="top" title="Ошибка стима">  ' + '<i class="fa fa-exclamation"></i>' + '</span>';else iteamsblock += '<span class="status notcompleted" data-toggle="tooltip" data-placement="top" title="Ошибка стима">' + '<i class="fas fa-arrow-down" aria-hidden="true"></i>' + '</span>';
                '</a>';
            });

            var all = data['paginate']['total_items'];
            var left = all - data['paginate']['limit'] * data['paginate']['current'];

            if (mode == 'norm') {
                $('#all_items-desctop .items').append(iteamsblock);
                $('#loadmore').data('page', data['paginate']['current']);
                $('#loadmore').text(' ↓ ' + translate("Загрузить еще") + ' ' + left + ' ' + translate("предметов") + ' ↓');
            } else {
                $('#all_items-desctop_act .items').append(iteamsblock);
                $('#loadmore_act').data('page', data['paginate']['current']);
                $('#loadmore_act').text(' ↓ ' + translate("Загрузить еще") + ' ' + left + ' ' + translate("предметов") + ' ↓');
            }
            if (data['paginate']['current'] == data['paginate']['total_pages']) {
                if (mode == 'norm') $('#loadmore').detach();else $('#loadmore_act').detach();
            }
        }
    });


}

var declOfNum = (function(){
    var cases = [2, 0, 1, 1, 1, 2];
    var declOfNumSubFunction = function(number, titles){
        number = Math.abs(number);
        return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
    }
    return function(_titles) {
        if ( arguments.length === 1 ){
            return function(_number){
                return declOfNumSubFunction(_titles, _number)
            }
        }else{
            return declOfNumSubFunction.apply(null,arguments)
        }
    }
})()


Array.prototype.shuffle = function () {
    var o = this;
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {}
    return o;
};
Array.prototype.mul = function (k) {
    var res = [];
    for (var i = 0; i < k; ++i) {
        res = res.concat(this.slice(0));
    }return res;
};
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var SliderReviews = function () {
    var pb = {};
    pb.el = $('.reviews');
    pb.items = {
        panels: pb.el.find('.block_rew')
    };
    var SliderInterval,
        currentSlider = 0,
        nextSlider = 1,
        lengthSlider = pb.items.panels.length;
    pb.init = function (settings) {
        this.settings = settings || { duration: 8000 };
        var items = this.items,
            lengthPanels = items.panels.length,
            output = '';
        for (var i = 0; i < lengthPanels; i++) {
            if (i == 0) {
                output += '<li class="active"></li>';
            } else {
                output += '<li></li>';
            }
        }
        $('#control-buttons').html(output);
        $('#control-buttons').on('click', 'li', function (e) {
            var $this = $(this);
            if (!(currentSlider === $this.index())) {
                changePanel($this.index());
            }
        });
    };
    var changePanel = function changePanel(id) {
        clearInterval(SliderInterval);
        var items = pb.items,
            controls = $('#control-buttons li');
        if (id >= lengthSlider) {
            id = 0;
        } else if (id < 0) {
            id = lengthSlider - 1;
        }
        controls.removeClass('active').eq(id).addClass('active');
        items.panels.eq(currentSlider).hide('fade', 'left', 300, function () {
            items.panels.eq(id).show('fade', 'left', 300);
        });
        currentSlider = id;
        nextSlider = id + 1;
        activateSlider();
        return false;
    };
    return pb;
}();
function fillCarusel(callback) {
    var a1 = cases.filter(function (weapon) {
        return weapon[2] == 'Arcana';
    }).slice(0).mul(5).shuffle();
    var a2 = cases.filter(function (weapon) {
        return weapon[2] == 'Immortal';
    }).slice(0).mul(5).shuffle();
    var a3 = cases.filter(function (weapon) {
        return weapon[2] == 'Legendary';
    }).slice(0).mul(4).shuffle();
    var a4 = cases.filter(function (weapon) {
        return weapon[2] == 'Mythical';
    }).slice(0).mul(4).shuffle();
    var a5 = cases.filter(function (weapon) {
        return weapon[2] == 'Rare';
    }).slice(0).mul(2).shuffle();
    var a6 = cases.filter(function (weapon) {
        return weapon[2] == 'Uncommon';
    }).slice(0).mul(2).shuffle();
    var a7 = cases.filter(function (weapon) {
        return weapon[2] == 'Common';
    }).slice(0).mul(1).shuffle();
    var iteams = a1.concat(a2, a3, a4, a5, a6, a7).shuffle().shuffle().shuffle();
    var items = '';
    for (var i = 0; i < iteams.length; ++i) {
        if (i >= 150) break;
      //console.log("iteams[i]", iteams[i]);
        items += '<div data-id="' + i + '" data-quality="' +  iteams[i][2] + '" class="iteamblock type' +  iteams[i][4] + '">' + '<div class="picture">' + '<img src="' + iteams[i][3] + '"/>' + '</div>' + '<div class="weaponblockinfo"></div>' + '<div class="name ' + iteams[i][2] + '">' + '<span>' + cut_text(iteams[i][1], 25) + '</span>' + '</div>' + '</div>';
    }
    return callback(items);
}
(function ($) {
    "use strict";

    function centerModal() {
        $(this).css('display', 'block');
        var $dialog = $(this).find(".modal-dialog"),
            offset = ($(window).height() - $dialog.height()) / 2,
            bottomMargin = parseInt($dialog.css('marginBottom'), 10);
        // Make sure you don't hide the top part of the modal w/ a negative margin if it's longer than the screen height, and keep the margin equal to the bottom margin of the modal
        if (offset < bottomMargin) offset = bottomMargin;
        $dialog.css("margin-top", offset);
    }

    $(document).on('show.bs.modal', '.modal', centerModal);
    $(window).on("resize", function () {
        $('.modal:visible').each(centerModal);
    });
})(jQuery);

// /* Loadmore Items */
// $('body').on('click', "#loadmore", function () {
// var page = $(this).data('page');
// var user = $(this).data('user');
// getmoreiteams(parseInt(page) + 1, user);
// });

// $('body').on('click', "#loadmore-mobile", function () {
// var page = $(this).data('page');
// var user = $(this).data('user');
// getmoreiteamsMobile(parseInt(page) + 1, user);
// });


/* TastyDrop JS 2018 */

$(document).ready(function () {

    var url = document.location.toString();
    if (url.match('#') && url.match('topup')) {
        //console.log("user_id", user_id);

        var urlParams = new URLSearchParams(window.location.search);

        if(typeof user_id == "undefined"){
            $("#author_football").show();
            $("<div class='modal-backdrop fade show'></div>").appendTo("body");
            $.cookie('topup', 1);
            if(urlParams.has('promo'))
                $.cookie('topup_promo', urlParams.get('promo'));
        }else {
            if (urlParams.has('promo')) {
                $(".promoinact").click();
                $("#promocode").val(urlParams.get('promo'));
                $(".promoact").click();
                $.cookie('topup_promo', null);
            }
        }

        $(".addmoney").click();
    }

    var topup = $.cookie('topup');
    if(typeof topup != "undefined") {
        if (topup == 1 && typeof user_id != "undefined") {
            $(".addmoney").click();
            $.cookie('topup', 0);
            var topup_promo = $.cookie('topup_promo');
            if(typeof topup_promo != "undefined"){
                $(".promoinact").click();
                $("#promocode").val(topup_promo);
                $(".promoact").click();
                $.cookie('topup_promo', null);
            }

        }
    }

    if (url.match('pudgegame')) {
        var topup_pudgegame = $.cookie('topup_pudgegame');
        if (typeof topup_pudgegame != "undefined") {
            setTimeout(function () {
                if (topup_pudgegame == 1 && typeof user_id != "undefined") {
                    osmark(pudgegame_id, user_id);
                    $('#author_pudge').modal('hide');
                    $('#almost').hide();
                    $.cookie('topup_pudgegame', 0, { path: '/' });
                }
            }, 500);
        }
    }
    
    $(".referal .profile__username").text(function (i, text) {

        if (text.length >= 15) {
            text = text.substring(0, 15);
            var lastIndex = text.lastIndexOf(" "); // позиция последнего пробела
            text = text.substring(0, 15) + '...'; // обрезаем до последнего слова
        }

        $(this).text(text);
    });

    document.addEventListener("DOMContentLoaded", function () {
        var inputs = document.querySelectorAll('[readonly]');
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('keydown', function (e) {
                var key = e.which || e.keyCode || 0;
                if (key === 8) {
                    e.preventDefault();
                }
            });
        }
    });

    /* Back to Top */
    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
            $('.scrollToTop').fadeIn();
        } else {
            $('.scrollToTop').fadeOut();
        }
    });

    //Click event to scroll to top
    $('.scrollToTop').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 800);
        return false;
    });

    // Dropdown Menu
    $(".header__menu .dropdown").hover(function () {
        $('.dropdown-menu').fadeIn(100);
    }, function () {
        $('.dropdown-menu').fadeOut(100);;
    });
});
$(document).ready(function(){
    if(typeof pagetype !== 'undefined' && pagetype == "farmcase")
    {
        $('.amount-item').click(function(){
            $(".amount-self__input").val('');
            $(".amount-self__form, .amount-self__link").removeClass('open');
            $('.amount-item').removeClass('active');
            $(this).addClass('active');
            var times = $(this).attr('times');
            $('.amount-self__form').removeClass('open');
            $('.amount-self__link').removeClass('open');
            $(".amount-self__input").val('');
            enough(times, priceCase, userMoney);
        });
    }

    $('body').on('click', ".sg", function () {
        $('.startmgame').removeClass('sg');
        var times = $('.inittimes').text();
        var mode = $(this).attr('mode');
        var t = $(this).attr('t');
        if (play) {
            noty(translate('Дождитесь открытия кейса'), false, 'error');
			$.post('/ajax/dblclicklog', ({'ccase':currentCase}));
        } else {
            play = true;
            var postdata = {'case': currentCase, 'times':times, 't':t};
            postdata = pushtokenTo(postdata, "caseopen");

            $.post('/ajax/mplay', postdata , function (data) {
                //console.log(data);
                if(data.status == 'ok') {
                    $('.farmcase-opening').show();
                    $('.farmcase').css("display","none");
                    if(mode == 'fast')
                    {
                        $('.farmcase__btn-try').fadeIn(100);
                        $('.header__profile-balance .balance').html(data.oresult.user.money);
                        $('.balance__adv .bonus__coin').html(data.oresult.user.tastycoin);
                        //$('.profile_money2').html(data.oresult.flakes);
                        $('#open_total').text(data.oresult.win_cnt);
                        $('#itselled').text(data.oresult.selled_amt);
                        $('#itwin').text(data.oresult.win_amt);
                    }
                    // var weapon = data.weapon;

                    var items = document.querySelector('.farmcase-items'), i = -1;
                    return function () {
                        var iopen = 0;
                        var tselled = 0;
                        var tprice = 0;
                        data.oresult.result.forEach(function(currentValue, index, arr) {
                            //if(currentValue['selled'] == 0)
                            //{
                            var dropdiv = (currentValue['selled'] == 0)? '<div id="i'
                                + currentValue.inventory_id + '" class="drop-action stbtns"><button data-id="'
                                + currentValue.inventory_id + '" class="sends status btn btn-pickup btn-item" data-placement="top" data-original-title="' + translate('Забрать предмет') + '" data-toggle="tooltip" >' + translate('Забрать') + '</button><button data-id="' + currentValue.inventory_id + '" onclick="sellitem(' + currentValue.inventory_id + ', ' + currentValue.weapon.price + ')" data-toggle="tooltip" data-placement="top" data-original-title="' + translate('Продать за') + ' ' + currentValue.weapon.price + ' P" class="btn btn-sale btn-item sell">' + translate('Продать за') + ' ' + (currentValue.weapon.price * 1).toFixed(2) + ' P</button></div>' : '';

                            var fastclass = (mode == 'fast')? "item rotated_item" : "item";
                            var typeclass = (mode == 'fast')? currentValue.weapon.type : "";

                            var item = document.createElement('div');
                            var item2 = document.createElement('div');
                            item.className = "item-container iteamblock " + " " + typeclass;
                            item2.className = fastclass;
                            item2.setAttribute("id", "id" + iopen);
                            item2.setAttribute("selled", currentValue.selled);
                            item2.setAttribute("price", currentValue.weapon.price);
                            item2.setAttribute("cls", currentValue.weapon.type);

                            item2.innerHTML = '<div class="side"><img src="../img/farmcase/farm-logo.png"></div>'
                                + '<div class="side back"> <span class="price"> ' + currentValue.weapon.price +  '<i class="fas fa-ruble-sign"></i></span><div class="name '
                                + currentValue.weapon.type
                                + '"><span>'
                                + currentValue.weapon.name
                                + '</span></div><img title="'
                                + '" src="'
                                + currentValue.weapon.image
                                + '">' + dropdiv;
                            items.appendChild(item);
                            item.appendChild(item2);
                            // setInterval(function () {
                            // items.firstChild.classList.add("rarity");
                            // }, 2000);
                            iopen++;
                            //}
                        });

                        //var amountToOpen = Math.floor(Math.random() * itemsArr.length) + 1;
                        //console.log('amount: ' + iopen);
                        if(iopen > 0 && mode != 'fast')
                        {
                            var index = 0;
                            var loop = setInterval(function () {
                                if (index < iopen) {
                                    rotateImage(index);
                                    $('#open_total').text(index + 1);
                                    index++;
                                } else {
                                    clearInterval(loop)
                                    $('.farmcase__btn-try').fadeIn(100);
                                    $('.header__profile-balance .balance').html(data.oresult.user.money);
                                    $('.balance__adv .bonus__coin').html(data.oresult.user.tastycoin);
                                    //$('.profile_money2').html(data.oresult.flakes);
                                    $('#open_total').text(data.oresult.win_cnt);
                                    $('#itselled').text(data.oresult.selled_amt);
                                    $('#itwin').text(data.oresult.win_amt);
                                }
                            }, 600);
                        }
                        window.dataLayer = window.dataLayer || [];
                        dataLayer.push({
                            'event': 'OpenFarmCase',
                            'CaseName': nameCase2,
                            'NumbersOfOpens': times
                        });
                        //console.log(window.dataLayer);

                        function rotateImage(index) {
                            document.getElementById("id" + index).className = "item rotated_item";

                            var cls = $("#id" + index).attr('cls');
                            $("#id" + index).parent().addClass(cls);

                            tselled += $("#id" + index).attr('selled') * 1;
                            tprice += $("#id" + index).attr('price') * 1;

                            $('#itselled').text(tselled.toFixed(2));
                            $('#itwin').text(tprice.toFixed(2));
                        }
                    }();
                } else {
                    play = false;
                    if (data.type == 'no_link')
                        $('#trade_url').modal('show');
                    noty(data.msg, false, 'error');
                }
            });
        }
    });
    var self_value = $('.inittimes').text();
    if(typeof pagetype !== 'undefined' && pagetype == "farmcase")
        enough(self_value, priceCase, userMoney);
});
/* Counter */
// var a = new Date(tend * 1000);
// var d = new Date();
// d.setDate(d.getDate() + (7 + 1 - d.getDay() - 1) % 7 +1);
// d.setHours(0, 0, 0, 0);
// $('.timer').countdown(d).on('update.countdown', function(event) {
// $(this).html(event.strftime(''
// + '<span id="days">%-d</span> '
// + '<span id="hours">%-H</span> '
// + '<span id="minutes">%-M</span> '));
// });
function enough(tms, priceCase, userMoney) {
    if (tms * priceCase > userMoney) {
        $('#lipei').text((tms * priceCase - userMoney).toFixed(2));
        $('.farmcase-header__nomoney').show();
        $('.farmcase-header__opencase').hide();
    } else {
        var gol = ['открытие', 'открытия', 'открытий'];
        var oprice = priceCase * tms;
        var otkr = n2w(tms, gol);
        $('#otkr').text(otkr);
        $('.qual-available').text(tms);
        $('#pricen').text(oprice);
        $('.farmcase-header__nomoney').hide();
        $('.farmcase-header__opencase').show();
    }
}
function sellitem(elid, price) {
    //alert(price + ' ' + elid);
    $('#msell').attr('data-id', elid);
    $('#msellamnt').text(price);
    $('#mselltrigger').click();
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function n2w(n, w) {
    n %= 100;

    if(n > 19)
        n %= 10;

    switch(n)
    {
        case 1:
            return translate(w[0]);

        case 2:
        case 3:
        case 4:
            return translate(w[1]);

        default:
            return translate(w[2]);
    }
}

$(document).ready(function () {
    /* Header drops Buttons */
    $(".drophistory__btns a").click(function (e) {
        e.preventDefault();
        $(".drophistory__btns a").removeClass('active');
        $(this).addClass('active');
    });

    /* Main Slider */
    $('#main-slider').carousel();

    /* Farm Case */
    $(".amount-self__link").click(function (e) {
        e.preventDefault();
        $('.amount-self__form').addClass('open');
        $('.amount-self__link').addClass('open');
    });

    var gol = ['открытие', 'открытия', 'открытий'];
    $(".amount-self__btn").click(function (e) {
        e.preventDefault();
        var self_value = $(".amount-self__input").val();
        if(self_value > 500)
        {
            self_value = 500;
            $(".amount-self__input").val(500);
            noty(translate('Максимально допустимое число открытий за раз 500'), false, 'error');
        }
        if (self_value * priceCase > userMoney) {
            $('#lipei').text((self_value * priceCase - userMoney).toFixed(2));
            $('.farmcase-header__nomoney').show();
            $('.farmcase-header__opencase').hide();
        } else {
            var oprice = priceCase * self_value;
            $('.qual-available').text(self_value);
            var otkr = n2w(self_value, gol);
            $('#otkr').text(otkr);
            $('#pricen').text(oprice);
            $('.farmcase-header__nomoney').hide();
            $('.farmcase-header__opencase').show();
            $('.amount-item').removeClass('active');
            $('.amount-item').each(function () {
                if ($(this).attr('times') == self_value) $(this).addClass('active');
            });
        }
    });
});

// $(".amount-self__link").click(function(e) {
// e.preventDefault();
// $('.amount-self__form').addClass('open');
// $('.amount-self__link').addClass('open');
// });

// $(".amount-self__btn").click(function(e) {
// e.preventDefault();
// var self_value = document.querySelector(".amount-self__input").value;
// if (self_value > 48) {
// $('.farmcase-header__nomoney').show();
// $('.farmcase-header__opencase').hide();
// }
// else {
// $('.farmcase-header__nomoney').hide()
// $('.farmcase-header__opencase').show();
// }
// });


// var amountToOpen = Math.floor(Math.random() * itemsArr.length) + 1;
// //console.log('amount: ' + amountToOpen);
// var index = 0;
// var loop = setInterval(function () {
// if (index < amountToOpen) {
// rotateImage(index);
// index++;
// } else {
// clearInterval(loop)
// }
// }, 1000);

// function rotateImage(index) {
// document.getElementById("id" + index).className = "item rotated_item";
// }

// }();
// })();
// });
// var itemsArr = [
// {
// "name": 'Ascendant Bounty Hun',
// "preview": 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcU2uxpaQ0LvTOqk0MfHHF9mJAdSpKmaPw5t1vfacDpN4uO6lZKMkrmmMOrQx2oHsZ0h3O3D9NjwjgzgrhJkZW71LdKRJ1NvN1vT_wDtk-bsm9bi63jilaHB',
// },
// {
// "name": 'Ascendant Bounty Hun',
// "preview": 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcU2uxpaQ0LvTOqk0MfHHF9mJAdSpKmaPw5t1vfacDpN4uO6lZKMkrmmMOrQx2oHsZ0h3O3D9NjwjgzgrhJkZW71LdKRJ1NvN1vT_wDtk-bsm9bi63jilaHB',
// },
// {
// "name": 'Ascendant Bounty Hun',
// "preview": 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcU2uxpaQ0LvTOqk0MfHHF9mJAdSpKmaPw5t1vfacDpN4uO6lZKMkrmmMOrQx2oHsZ0h3O3D9NjwjgzgrhJkZW71LdKRJ1NvN1vT_wDtk-bsm9bi63jilaHB',
// },
// {
// "name": 'Ascendant Bounty Hun',
// "preview": 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcU2uxpaQ0LvTOqk0MfHHF9mJAdSpKmaPw5t1vfacDpN4uO6lZKMkrmmMOrQx2oHsZ0h3O3D9NjwjgzgrhJkZW71LdKRJ1NvN1vT_wDtk-bsm9bi63jilaHB',
// },
// {
// "name": 'Ascendant Bounty Hun',
// "preview": 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcU2uxpaQ0LvTOqk0MfHHF9mJAdSpKmaPw5t1vfacDpN4uO6lZKMkrmmMOrQx2oHsZ0h3O3D9NjwjgzgrhJkZW71LdKRJ1NvN1vT_wDtk-bsm9bi63jilaHB',
// },
// {
// "name": 'Ascendant Bounty Hun',
// "preview": 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcU2uxpaQ0LvTOqk0MfHHF9mJAdSpKmaPw5t1vfacDpN4uO6lZKMkrmmMOrQx2oHsZ0h3O3D9NjwjgzgrhJkZW71LdKRJ1NvN1vT_wDtk-bsm9bi63jilaHB',
// },
// {
// "name": 'Ascendant Bounty Hun',
// "preview": 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcU2uxpaQ0LvTOqk0MfHHF9mJAdSpKmaPw5t1vfacDpN4uO6lZKMkrmmMOrQx2oHsZ0h3O3D9NjwjgzgrhJkZW71LdKRJ1NvN1vT_wDtk-bsm9bi63jilaHB',
// },
// {
// "name": 'Ascendant Bounty Hun',
// "preview": 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcU2uxpaQ0LvTOqk0MfHHF9mJAdSpKmaPw5t1vfacDpN4uO6lZKMkrmmMOrQx2oHsZ0h3O3D9NjwjgzgrhJkZW71LdKRJ1NvN1vT_wDtk-bsm9bi63jilaHB',
// },
// {
// "name": 'Ascendant Bounty Hun',
// "preview": 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcU2uxpaQ0LvTOqk0MfHHF9mJAdSpKmaPw5t1vfacDpN4uO6lZKMkrmmMOrQx2oHsZ0h3O3D9NjwjgzgrhJkZW71LdKRJ1NvN1vT_wDtk-bsm9bi63jilaHB',
// }
//
function setAuthRedirect()
{
	var redirecturl = window.location.href;
	setCookie('authredirect', redirecturl, 1800);
	return true;
}


function steam_popup() {
    var screenX = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
        screenY = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
        outerWidth = typeof window.outerWidth != 'undefined' ? window.outerWidth : document.body.clientWidth,
        outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : document.body.clientHeight - 22,
        width = 800,
        height = 600,
        left = parseInt(screenX + (outerWidth - width) / 2, 10),
        top = parseInt(screenY + (outerHeight - height) / 2.5, 10),
        features = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;

    var sessionId = document.cookie.match(/PHPSESSID=[^;]+/i).toString().substring(10);
    var otoken = CryptoJS.MD5(sessionId);
    var w = window.open('http://tdrop.me/auth/steam?otoken=' + otoken + '&origin=' + location.host, 'steam_oauth', features);

    var uri_regex = new RegExp('u_tm=');
    var watch_timer = setInterval(function () {
        try {
            if (uri_regex.test(w.location)) {
                clearInterval(watch_timer);

                setTimeout(function () {
                    w.close();
                    document.location.assign(w.location);
                }, 500);
            }
        } catch (e) {}
    }, 100);
    return false;
}

function share_popup(url) {
    var screenX = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
        screenY = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
        outerWidth = typeof window.outerWidth != 'undefined' ? window.outerWidth : document.body.clientWidth,
        outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : document.body.clientHeight - 22,
        width = 800,
        height = 600,
        left = parseInt(screenX + (outerWidth - width) / 2, 10),
        top = parseInt(screenY + (outerHeight - height) / 2.5, 10),
        features = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;

    var w = window.open(url, 'share', features);
    return false;
}

$(document).ready(function () {

    $('.case_notavailable .close').on('click', function (event) {
        event.preventDefault();
        $(".case_notavailable").fadeOut("slow", function () {});
    });

    $('.casewin__tasty button.close').on('click', function () {
        if (-1 !== window.location.href.indexOf('roshan2018')) {
            location.reload();
        }
    });

    $('.modal_content_close').on('click', function (event) {
        event.preventDefault();
        $(".modal_container.stock_popup").fadeOut("slow", function () {});
    });

    $(".order_timer .order-timer-btn").on("click", function () {
        $(".stock_popup").fadeIn();
    });
    var answers = {};
    $(".answer_btn").on("click", function () {
        var that = $(this);
        var qcnt = that.attr('qcnt');
        var an = [];

        var cur = that.attr('cur');
        answers[cur] = $('input[name=' + cur + ']:checked').val();
        if (answers[cur] == undefined) alert('Ответь на вопрос');else if (cur == qcnt) {
            $.post('/ajax/quiz', { 'data': answers }, function (r) {
                if (r.status == 'error') alert(r.msg);else location.assign(location.protocol + '//' + location.host + '/newbloom2018/' + r.token);
                //alert('правильных ответов: ' + r.good + "\n\n" + r.cap + "\n\n" + r.msg);
            });

            // $(".test_title").fadeOut(350, function() {
            // $(".test_result").fadeIn();
            // });
        } else {
            var curint = parseInt(cur);
            var p = 1 + curint;
            $('.pnts').removeClass('active');
            $('.p' + p).addClass('active');
            $('.qwst').slideUp(300);
            $('.q' + p).slideDown(300);
        }
        //console.log(answers);
        //console.log(qcnt, cur);

    });

    $(".feature").on("click", function () {
        if ($(this).hasClass("no_active")) {
            $(this).removeClass("no_active");
        }
        $(this).addClass("active");
        $(this).siblings().removeClass("active").addClass("no_active");
    });

    $('.offerselect').click(function () {
        var offer = '';
        var offers = [199, 499, 2499];
        offer = $(this).attr('offer');
        location.assign(location.protocol + '//' + location.host + '/payment/pay?land=newbloom' + offer + '&sum=' + offers[offer - 1]);
        //console.log(offer);
    });

    $('.offerselect_gift').click(function () {
        var offer = '';
        var offers = [199, 299, 599, 999];
        offer = $(this).attr('offer');
        location.assign(location.protocol + '//' + location.host + '/payment/pay?land=gift' + offer + '&sum=' + offers[offer - 1]);
        //console.log(offer);
    });

    $('.offerselect_gift_item').click(function () {
        var offer = '';
        var offers = [99, 199, 199, 299, 299, 499, 499, 299, 499, 999, 2499];
        offer = $(this).attr('offer');
        var item = $(this).attr('item');
        location.assign(location.protocol + '//' + location.host + '/payment/pay?land=gift' + offer + '&sum=' + offers[offer - 1]);
        //console.log(offer);
    });
});

/* Accordion */
$('.feature_title').click(function (e) {
    e.preventDefault();

    var $this = $(this);

    if ($this.next().hasClass('open')) {
        $this.next().removeClass('open');
        $this.next().slideUp(350);
    } else {
        $this.parent().parent().find('.feature .feature-open').removeClass('open');
        $this.parent().parent().find('.feature .feature-open').slideUp(350);
        $this.next().toggleClass('open');
        $this.next().slideToggle(350);
    }
});

/* Counter */
$('.timer').countdown('2018/02/24').on('update.countdown', function (event) {
    $(this).html(event.strftime('' + '<span id="days">%d</span> <span class="sep">:</span> ' + '<span id="hours">%H</span> <span class="sep">:</span> ' + '<span id="minutes">%M</span> '));
});

var d = new Date();
d.setDate(d.getDate() + (7 + 1 - d.getDay() - 1) % 7 + 1);
d.setHours(0, 0, 0, 0);
$('.top__counter-timer').countdown(d).on('update.countdown', function (event) {
    $(this).html(event.strftime('' + '<span id="days">%d</span> ' + '<span id="hours">%H</span> ' + '<span id="minutes">%M</span> '));
});

var d = new Date(parseInt($('.freecoin__card-timer').data("timer")));
$('.freecoin_bar').show();

$('.freecoin__card-timer').countdown(d).on('update.countdown', function (event) {
    $('.freecoin_bar').css('width', Math.ceil((parseInt(event.strftime('%H')) * 60 + parseInt(event.strftime('%M'))) * 100 / 120) + '%');

    ////console.log("event", event);
    if (event.offset.hours <= 0 && event.offset.minutes <= 0 && event.offset.seconds <= 1) {
        $('.freecoin__card-timer').hide();
        $('.freecoin__card-counter').addClass('off');
        $('#startcooldown').show();
    }

    $(this).html(event.strftime('' + '<span id="hour">%H</span> ' + '<span id="minutes">%M</span> ' + '<span id="seconds">%S</span> '));
});

/* Menu
 window.onresize = navigationResize;
 navigationResize();

 function navigationResize() {
 $('.menuheader li.more').before($('#overflow > li'));

 var $navItemMore = $('.menuheader > li.more'),
 $navItems = $('.menuheader > li:not(.more)'),
 navItemMoreWidth = navItemWidth = $navItemMore.width(),
 headerWidth = $(window).width() - $('#part_profile').width() - 650,
 navItemMoreLeft, offset, navOverflowWidth;

 $navItems.each(function() {
 navItemWidth += $(this).width();
 });

 navItemWidth > headerWidth ? $navItemMore.show() : $navItemMore.hide();

 var count = 0;

 while (navItemWidth > headerWidth) {
 count++;
 navItemWidth -= $navItems.last().width();
 $navItems.last().prependTo('#overflow');
 $navItems.splice(-1,1);
 if($navItems.length < 4) {
 break;
 }
 if($(window).width() < 1666 & $(window).width() > 1500 || $(window).width() < 1500 & $(window).width() > 1330  ) {
 $navItems.length = 3
 break;
 if ($(window).width() < 1460 & $(window).width() > 1350 || $(window).width() < 1330 & $(window).width() > 1100) {
 $navItems.length = 2
 break;
 }
 }
 }

 navItemMoreLeft = $('.menuheader .more').offset().left;
 navOverflowWidth = $('#overflow').width();
 offset = navItemMoreLeft + navItemMoreWidth - navOverflowWidth;

 $('#overflow').css({
 'left': $navItems.length
 });
 }

 */

/* Items Tabs */

$('.items-tabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
});

!function ($) {

    "use strict";

    // TABCOLLAPSE CLASS DEFINITION
    // ======================

    var TabCollapse = function TabCollapse(el, options) {
        this.options = options;
        this.$tabs = $(el);

        this._accordionVisible = false; //content is attached to tabs at first
        this._initAccordion();
        this._checkStateOnResize();

        // checkState() has gone to setTimeout for making it possible to attach listeners to
        // shown-accordion.bs.tabcollapse event on page load.
        // See https://github.com/flatlogic/bootstrap-tabcollapse/issues/23
        var that = this;
        setTimeout(function () {
            that.checkState();
        }, 0);
    };

    TabCollapse.DEFAULTS = {
        accordionClass: 'visible-xs',
        tabsClass: 'hidden-xs',
        accordionTemplate: function accordionTemplate(heading, groupId, parentId, active) {
            return '<div class="panel panel-default">' + '   <div class="panel-heading">' + '      <h4 class="panel-title">' + '      </h4>' + '   </div>' + '   <div id="' + groupId + '" class="panel-collapse collapse ' + (active ? 'in' : '') + '">' + '       <div class="panel-body js-tabcollapse-panel-body">' + '       </div>' + '   </div>' + '</div>';
        }
    };

    TabCollapse.prototype.checkState = function () {
        if (this.$tabs.is(':visible') && this._accordionVisible) {
            this.showTabs();
            this._accordionVisible = false;
        } else if (this.$accordion.is(':visible') && !this._accordionVisible) {
            this.showAccordion();
            this._accordionVisible = true;
        }
    };

    TabCollapse.prototype.showTabs = function () {
        var view = this;
        this.$tabs.trigger($.Event('show-tabs.bs.tabcollapse'));

        var $panelHeadings = this.$accordion.find('.js-tabcollapse-panel-heading').detach();

        $panelHeadings.each(function () {
            var $panelHeading = $(this),
                $parentLi = $panelHeading.data('bs.tabcollapse.parentLi');

            var $oldHeading = view._panelHeadingToTabHeading($panelHeading);

            $parentLi.removeClass('active');
            if ($parentLi.parent().hasClass('dropdown-menu') && !$parentLi.siblings('li').hasClass('active')) {
                $parentLi.parent().parent().removeClass('active');
            }

            if (!$oldHeading.hasClass('collapsed')) {
                $parentLi.addClass('active');
                if ($parentLi.parent().hasClass('dropdown-menu')) {
                    $parentLi.parent().parent().addClass('active');
                }
            } else {
                $oldHeading.removeClass('collapsed');
            }

            $parentLi.append($panelHeading);
        });

        if (!$('li').hasClass('active')) {
            $('li').first().addClass('active');
        }

        var $panelBodies = this.$accordion.find('.js-tabcollapse-panel-body');
        $panelBodies.each(function () {
            var $panelBody = $(this),
                $tabPane = $panelBody.data('bs.tabcollapse.tabpane');
            $tabPane.append($panelBody.contents().detach());
        });
        this.$accordion.html('');

        if (this.options.updateLinks) {
            var $tabContents = this.getTabContentElement();
            $tabContents.find('[data-toggle-was="tab"], [data-toggle-was="pill"]').each(function () {
                var $el = $(this);
                var href = $el.attr('href').replace(/-collapse$/g, '');
                $el.attr({
                    'data-toggle': $el.attr('data-toggle-was'),
                    'data-toggle-was': '',
                    'data-parent': '',
                    href: href
                });
            });
        }

        this.$tabs.trigger($.Event('shown-tabs.bs.tabcollapse'));
    };

    TabCollapse.prototype.getTabContentElement = function () {
        var $tabContents = $(this.options.tabContentSelector);
        if ($tabContents.length === 0) {
            $tabContents = this.$tabs.siblings('.tab-content');
        }
        return $tabContents;
    };

    TabCollapse.prototype.showAccordion = function () {
        this.$tabs.trigger($.Event('show-accordion.bs.tabcollapse'));

        var $headings = this.$tabs.find('li:not(.dropdown) [data-toggle="tab"], li:not(.dropdown) [data-toggle="pill"]'),
            view = this;
        $headings.each(function () {
            var $heading = $(this),
                $parentLi = $heading.parent();
            $heading.data('bs.tabcollapse.parentLi', $parentLi);
            view.$accordion.append(view._createAccordionGroup(view.$accordion.attr('id'), $heading.detach()));
        });

        if (this.options.updateLinks) {
            var parentId = this.$accordion.attr('id');
            var $selector = this.$accordion.find('.js-tabcollapse-panel-body');
            $selector.find('[data-toggle="tab"], [data-toggle="pill"]').each(function () {
                var $el = $(this);
                var href = $el.attr('href') + '-collapse';
                $el.attr({
                    'data-toggle-was': $el.attr('data-toggle'),
                    'data-toggle': 'collapse',
                    'data-parent': '#' + parentId,
                    href: href
                });
            });
        }

        this.$tabs.trigger($.Event('shown-accordion.bs.tabcollapse'));
    };

    TabCollapse.prototype._panelHeadingToTabHeading = function ($heading) {
        var href = $heading.attr('href').replace(/-collapse$/g, '');
        $heading.attr({
            'data-toggle': 'tab',
            'href': href,
            'data-parent': ''
        });
        return $heading;
    };

    TabCollapse.prototype._tabHeadingToPanelHeading = function ($heading, groupId, parentId, active) {
        $heading.addClass('js-tabcollapse-panel-heading ' + (active ? '' : 'collapsed'));
        $heading.attr({
            'data-toggle': 'collapse',
            'data-parent': '#' + parentId,
            'href': '#' + groupId
        });
        return $heading;
    };

    TabCollapse.prototype._checkStateOnResize = function () {
        var view = this;
        $(window).resize(function () {
            clearTimeout(view._resizeTimeout);
            view._resizeTimeout = setTimeout(function () {
                view.checkState();
            }, 100);
        });
    };

    TabCollapse.prototype._initAccordion = function () {
        var randomString = function randomString() {
            var result = "",
                possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 5; i++) {
                result += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return result;
        };

        var srcId = this.$tabs.attr('id'),
            accordionId = (srcId ? srcId : randomString()) + '-accordion';

        this.$accordion = $('<div class="panel-group ' + this.options.accordionClass + '" id="' + accordionId + '"></div>');
        this.$tabs.after(this.$accordion);
        this.$tabs.addClass(this.options.tabsClass);
        this.getTabContentElement().addClass(this.options.tabsClass);
    };

    TabCollapse.prototype._createAccordionGroup = function (parentId, $heading) {
        var tabSelector = $heading.attr('data-target'),
            active = $heading.data('bs.tabcollapse.parentLi').is('.active');

        if (!tabSelector) {
            tabSelector = $heading.attr('href');
            tabSelector = tabSelector && tabSelector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }

        var $tabPane = $(tabSelector),
            groupId = $tabPane.attr('id') + '-collapse',
            $panel = $(this.options.accordionTemplate($heading, groupId, parentId, active));
        $panel.find('.panel-heading > .panel-title').append(this._tabHeadingToPanelHeading($heading, groupId, parentId, active));
        $panel.find('.panel-body').append($tabPane.contents().detach()).data('bs.tabcollapse.tabpane', $tabPane);

        return $panel;
    };

    // TABCOLLAPSE PLUGIN DEFINITION
    // =======================

    $.fn.tabCollapse = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.tabcollapse');
            var options = $.extend({}, TabCollapse.DEFAULTS, $this.data(), (typeof option === "undefined" ? "undefined" : _typeof(option)) === 'object' && option);

            if (!data) $this.data('bs.tabcollapse', new TabCollapse(this, options));
        });
    };

    $.fn.tabCollapse.Constructor = TabCollapse;
}(window.jQuery);

$('#profile__item-tabs').tabCollapse();

var anvils = $('#topnumber').attr('anvils');
// $.post('/ajax/gettopnumber', ({'anvils':anvils}), function(r){
// if(r.status == 'ok')
// {
// $('#topnumber').text(r.number);
// $('#topnumber2').text(r.number);
// $('#uwrapper').fadeIn(300);
// }
// });


/* Trade Link Mobile */
if ($(window).width() < 991) {
    $('.profile_settings .trade_link-title').click(function () {
        $('.profile_settings .trade_link-content').toggle('slow');
        $('.profile_settings .trade_link_block').toggleClass('open');
    });
    var trade_link = $('.trade_link_block #url').val();
    if (trade_link == '') {
        $('.profile_settings .trade_link_block').addClass('empty');
        $('.profile_settings .trade_link_block').removeClass('not-empty');
    } else {
        $('.profile_settings .trade_link_block').addClass('not-empty');
        $('.profile_settings .trade_link_block').removeClass('empty');
        $('.profile_settings .trade_link-content').hide();
    }
}
/* Crop top username*/
$(".rate__name, .lastreg a .name").text(function (i, text) {

    if (text.length >= 15) {
        text = text.substring(0, 15);
        var lastIndex = text.lastIndexOf(" "); // позиция последнего пробела
        text = text.substring(0, 15) + '...'; // обрезаем до последнего слова
    }

    $(this).text(text);
});

if ($(window).width() < 460) {
    $(".lastwinner .item__name").text(function (i, text) {

        if (text.length >= 10) {
            text = text.substring(0, 10);
            var lastIndex = text.lastIndexOf(" "); // позиция последнего пробела
            text = text.substring(0, 10) + '...'; // обрезаем до последнего слова
        }

        $(this).text(text);
    });
}

$(".casewin__item-tasty .name").text(function (i, text) {

    if (text.length >= 40) {
        text = text.substring(0, 40);
        var lastIndex = text.lastIndexOf(" "); // позиция последнего пробела
        text = text.substring(0, 40) + ' ...'; // обрезаем до последнего слова
    }

    $(this).text(text);
});

jQuery(document).ready(function ($) {
    setTimeout(function () {
        $('.wr-loader').fadeOut('slow', function () {});
    }, 1000);
});

/* Back to Top */
$(document).ready(function () {

    $('#videobanner').seeThru().seeThru('play');

    /* User Widget */
    function openCLoseWidget(widget_class, open) {
        var openShift = '170px';
        if ($(window).width() < 991) {
            openShift = '180px';
        }
        if (open) {
            $(widget_class + ' .user__widget').animate({ right: openShift }, 500);
            $(widget_class + ' .user__widget').addClass('open').removeClass('close');
            $(widget_class + ' .user__widget-open').fadeOut();
        } else {
            $(widget_class + ' .user__widget').addClass('close').removeClass('open');
            $(widget_class + ' .user__widget').animate({ right: '-180px' }, 500);
            $(widget_class + ' .user__widget-open').fadeIn();
        }
    }

    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
            $('#back-to-top').fadeIn();
        } else {
            $('#back-to-top').fadeOut();
        }
    });

    //Click event to scroll to top
    $('#back-to-top').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 800);
        return false;
    });

    // Header banner Fixed
    $(window).resize(function () {
        if ($(window).width() < 992) {
            $('.header__menu').removeClass('header__menu-responsive');
            $('.header__menu .more').css('display', 'none');
        } else {
            $('.header__menu').addClass('header__menu-responsive');
        }
    });
    $(window).scroll(function () {
        if ($(this).scrollTop() > 50) {
            $('.header__banner').css('top', 110);
        } else {
            $('.header__banner').css('top', 210);
        }
    });

    // Info Coin Case
    /*
     $(".coin__case-info").click(function (e) {
     e.preventDefault();
     $(".bonus-info__content").fadeIn('slow');
     $(".bonus-info__content").show();
     });
     */
    $(".bonus-info__close").click(function (e) {
        e.preventDefault();
        $(".bonus-info__content").fadeOut('slow');
        $(".bonus-info__content").hide();
    });

    // Carousel
    $('#main-slider').carousel({
        interval: 5000,
        swipe: 30
    });

    $('#reviews-slider').carousel({
        interval: false,
        swipe: 30
    });

    $('.img_scroll').click(function () {
        $('html, body').animate({
            scrollTop: $(".sckhool").offset().top - 150
        }, 500);
    });
});

/* Crop long text*/
$("#reviews-slider .name").text(function (i, text) {

    if (text.length >= 22) {
        text = text.substring(0, 22);
        var lastIndex = text.lastIndexOf(" "); // позиция последнего пробела
        text = text.substring(0, 22) + ' ...'; // обрезаем до последнего слова
    }

    $(this).text(text);
});

// Bootstrap Progress Bar
$('.progress .progress-bar').progressbar();

// case Page responsive
if ($(window).width() < 1300) {
    var scrollerHeight = $('.card-case').height() + 40;
    $('.case-wrap #scrollerContainer').css('top', scrollerHeight);
    $('.case-wrap .btns__opencase').css('margin-top', 310);
} else {
    $('.case-wrap #scrollerContainer').css('top', 0);
    $('.case-wrap .btns__opencase').css('margin-top', 0);
}

$(window).resize(function () {
    if ($(window).width() < 1300) {
        var scrollerHeight = $('.card-case').height() + 40;
        $('.case-wrap #scrollerContainer').css('top', scrollerHeight);
        $('.case-wrap .btns__opencase').css('margin-top', 310);
    } else {
        $('.case-wrap #scrollerContainer').css('top', 0);
        $('.case-wrap .btns__opencase').css('margin-top', 0);
    }
});

// Bootstrap Progress Bar
$('.progress .progress-bar').progressbar();

// case Page responsive
if ($(window).width() < 1300) {
    var scrollerHeight = $('.card-case').height() + 40;
    $('.case-wrap #scrollerContainer').css('top', scrollerHeight);
    $('.case-wrap .btns__opencase').css('margin-top', 310);
    $('.roshan .bnts-wrap').css('margin-top', 230);
} else {
    $('.case-wrap #scrollerContainer').css('top', 0);
    $('.case-wrap .btns__opencase').css('margin-top', 0);
    $('.roshan .bnts-wrap').css('margin-top', 0);
}

$(window).resize(function () {
    if ($(window).width() < 1300) {
        var scrollerHeight = $('.card-case').height() + 40;
        $('.case-wrap #scrollerContainer').css('top', scrollerHeight);
        $('.case-wrap .btns__opencase').css('margin-top', 310);
        $('.roshan .bnts-wrap').css('margin-top', 230);
    } else {
        $('.case-wrap #scrollerContainer').css('top', 0);
        $('.case-wrap .btns__opencase').css('margin-top', 0);
        $('.roshan .bnts-wrap').css('margin-top', 0);
    }
});

// Select
$('.single_select').multiselect({
    templates: {
        li: '<li><a href="javascript:void(0);"><label class="pl-2"></label></a></li>'
    },
    buttonClass: 'btn btn-outline-primary',
    selectedClass: 'bg-light',
    onInitialized: function onInitialized(select, container) {
        // hide radio
        container.find('input[type=radio]').addClass('d-none');
    }
});

/* Menu */

$("#navbarDropdownMenuLink").click(function (e) {
    e.preventDefault();
    if ($(".dropdown-head").hasClass('show')) {
        $(".dropdown-head").removeClass('show');
        $(".header__menu .dropdown-menu").removeClass('show');
    } else {
        $(".dropdown-menu").addClass('show');
        $(".dropdown-head").addClass('show');
    }
});
$(document).ready(function () {
    var taken = $('#roshstartcooldown').attr('taken') * 1000;
    var cantake = $('#roshstartcooldown').attr('cantake');
    if (cantake == 'n') {
        $('.roshan__card-timer').countdown(taken);
        $('.roshan__card-timer').on('update.countdown', function (event) {
            $(this).html(event.strftime('' + '<span id="hour">%H</span><span>:</span> ' + '<span id="minutes">%M</span> '));
        });
        $('.roshan__card-counter').fadeIn(0);
    }
});
// Roshan counter
$("#roshstartcooldown").click(function (e) {
    grecaptcha.execute();
  //console.log();
});

function roshstartcooldown(token) {
    $.post('/ajax/cooldown', {token: token}, function (data) {
        if (data.status) {
          //console.log(data);
            noty(data.msg, false, 'success');
            if(typeof data.result.cur !== "undefined"){
                currentCase = "roshan_lvl" + data.result.cur.level;
                nameCase2 = "roshan_lvl" + data.result.cur.level;
                $('#rosh_lvl').text(data.result.cur.level);
                $('.roshan__img').attr('src', "/img/roshan/case/rosh-case" + data.result.cur.level + ".png");
                $('#rosh_pl').text(data.result.cur.tastycoins + '/' + data.result.cur.nextPrice);
                var pb_width = data.result.cur.tastycoins / data.result.cur.nextPrice * 100;
                $('.progress-bar').css('width', pb_width + '%');
                $('.roshan__level').removeClass('roshan__level' + (data.result.cur.level - 1)).addClass('roshan__level' + data.result.cur.level);
                $('.roshan').removeClass('roshan__level' + (data.result.cur.level - 1)).addClass('roshan__level' + data.result.cur.level);
                $('.carousel__roshan').removeClass('roshan__level' + (data.result.cur.level - 1)).addClass('roshan__level' + data.result.cur.level);
                $(".roshan__balance").hide();
                $('.roshan__card-counter').show();
                $("#roshstartcooldown").addClass('disable');
                $('.roshan__card-timer').on('update.countdown', function (event) {
                    $(this).html(event.strftime('' + '<span id="hour">%H</span><span>:</span> ' + '<span id="minutes">%M</span> '));
                });
                $('.roshan__card-timer').countdown(data.result.nextcooldown);
                $('.roshan__card-timer').removeClass('off');
                $('header .bonus__coin').text(data.result.user.tastycoin);
                $('.btns__opencase .bonus__coin').text(data.result.cur.price);
            }

        } else {
            noty(data.msg, false, 'error');
        }
    });
}


function copy(str) {
    var tmp = document.createElement('INPUT'),
        // Создаём новый текстовой input
        focus = document.activeElement; // Получаем ссылку на элемент в фокусе (чтобы не терять фокус)
    tmp.value = str; // Временному input вставляем текст для копирования
    document.body.appendChild(tmp); // Вставляем input в DOM
    tmp.select(); // Выделяем весь текст в input
    document.execCommand('copy'); // Магия! Копирует в буфер выделенный текст (см. команду выше)
    document.body.removeChild(tmp); // Удаляем временный input
    focus.focus(); // Возвращаем фокус туда, где был
}

$(document).ready(function () {
    $('input[name=referallink]').click(function () {
        var t = $(this).val();
        copy(t);
        noty(translate('Ваша ссылка скопирована в буфер обмена'), false, 'success');
    });
});

/*Offersshop*/
$(document).ready(function(){
    $('.offer__box').click(function(){
        if($(this).hasClass('ok'))
        {
            var oid = $(this).data('oid');
            $.post('/ajax/offersshopmodal', {'oid':oid}, function(data){
                if(data.status === true)
                    $('#osmodal').html(data.msg);
				
				setTimeout(function(){
					$('#obm_wrapper').fadeIn(0);
					$('#offer__box-modal').modal('show');
					//$('#modaltrigger').click();
				}, 100);
            });
        }
        else
            noty(translate('Ты уже воспользовался этим предложением'), false, 'error');
    });
    $('.close').click(function(){
        $('.modal-backdrop').show();
        $('#osmodal').html('');
        $('#modaltrigger').click();
    });
});
function osbuy(oid) {
    location.assign(location.protocol + '//' + location.host + '/payment/pay?land=offersshop&sum=' + oid);
}
function osmark(oid, uid) {
	setAuthRedirect();
	if(uid == 0)
	{
		$('#author_pudge').modal('show');
        $.cookie('topup_pudgegame', 1, { path: '/' });
	}
	else
		$('#pay_methods').modal('show');
}

function osbuytc(oid) {
    $.post('/ajax/offersshoposbuytc', {'oid':oid}, function(data){
		//console.log(data);

		$('.modal-backdrop').show();
		$('#osmodal').html('');
		$('#modaltrigger').click();
		//noty(data.msg, false, data.status);
    });
}

$('.chall__block-counter').countdown("2018/09/09", function(event) {
    $(this).html(event.strftime(''
        + '<p class="chall__block-counter-end">' + translate('закончится через') + ':</p> '
        + '<span id="hours">%H:</span>'
        + '<span id="minutes">%M:</span>'
        + '<span id="seconds">%S</span> '));
});


$(".offer__box").hover(function () {
    $(this).find('.offer__img').attr("src", $(this).data('hover'));
}, function () {
    $(this).find('.offer__img').attr("src", $(this).data('img'));
});

function whatClick() {
    $(document).on('click', '.challenge__banner-whatthis', function(e) {
        e.preventDefault();
        if($(this).hasClass('_opened')) {
            return false;
        } else {
            $(this).addClass('_opened');
            $(".challenge__banner__whatthis-content").slideToggle("slow");
        }
    });
}

function whatCloseClick() {
    $(document).on('click', ".challenge__banner__whatthis-content-close", function(e) {
        e.preventDefault();
        if($('.challenge__banner-whatthis').hasClass('_opened')) {
            $(".challenge__banner__whatthis-content").slideToggle("slow");
            $('.challenge__banner-whatthis').removeClass('_opened');
        }
    });
}

function  initOwl(){

    var itemsNum = 0;

    var owl = $('.owl-carousel');

    $('#table__challenge').DataTable( {
        paging: false,
        scrollY: 400,
        searching: false,
        info: false
    } );

    owl.on('initialized.owl.carousel', function(event) {
        var itemCount =  event.item.count;
        var size      = event.page.size;
        var dragLength = 100 / (itemCount/size);

        $("#range").ionRangeSlider({
            type: "single",
            min: 1,
            max: itemCount - (size - 1),
            keyboard: true,
            step: 1,
            onChange: function (data) {
                //owl.trigger('changed.owl.carousel', [???]);
                var owlTo = (data.from) - 1;
              //console.log("Позиция ползунка: " + owlTo);
                owl.trigger('to.owl.carousel', [owlTo, 500, true]);
            }
        });

        $('.irs-slider.single').css('width', dragLength + "%")

    });

    setTimeout(function(){
        // Save slider instance to var
        var ion = $("#range").data("ionRangeSlider");
        var currentitem = $('#rangediv').data('currentitem');
        currentitem = currentitem-4;

        if(ion !== undefined){
            // Change slider, by calling it's update method
            ion.update({
                from: currentitem,
                to: currentitem,
            });
        }


        owl.trigger('to.owl.carousel', [currentitem, 50, true]);
    }, 1000);

//Слайдер
    var challenge_active = 2;
    if (challenge_active == 2) {

    }

    owl.owlCarousel({
        stagePadding:0,
        margin:10,
        loop:false,
        nav:false,
        dots: false,
        slideBy:2,
        animateIn: "current",
        animateOut: "no-current",
        responsiveClass:true,
        lazyLoad: true,
        responsive:{
            0:{
                items:1
            },
            480:{
                items:2
            },
            700:{
                items:3
            },
            920:{
                items:4
            },
            1140:{
                items:5
            },
            1380:{
                items:6
            },
            1660:{
                items:6
            },
            2100:{
                items:7
            },
            2340:{
                items:8
            },
            2580:{
                items:9
            },
            2900:{
                items:10
            },
            3140:{
                items:11
            },
            3380:{
                items:12
            },
            3700:{
                items:13
            },
            4000:{
                items:14
            }
        }
    });

    owl.on('dragged.owl.carousel', function(event) {
        var itemCount =  event.item.count;
        var size      = event.page.size;
        var curItem = event.item.index + 1;
        var dragLength = 100 / (itemCount/size);
      //console.log(curItem);
        $("#range").data("ionRangeSlider").update({from: curItem});
        $('.irs-slider.single').css('width', dragLength + "%");
    });

    owl.on('resized.owl.carousel', function(event) {
        var itemCount =  event.item.count;
        var size      = event.page.size;
        var curItem = event.item.index + 1;
        var dragLength = 100 / (itemCount/size);
        $("#range").data("ionRangeSlider").update({
            max: itemCount - (size - 1),
            from: curItem
        });
        $('.irs-slider.single').css('width', dragLength + "%");

      //console.log("vis: ", e.relatedTarget.settings.items);
    });
}

function pushtokenTo( postdata, type ){

    if( type == undefined )
        var type = '';

    var tokenname = $("[id^=ttok_"+type+"]").attr("name");
    var tokenval = $("[id^=ttok_"+type+"]").val();

    //console.log("token", tokenname, tokenval);
    //console.log("token len", tokenname.length, tokenval.length);

    if(tokenname !== undefined && tokenval !== undefined)
        postdata[tokenname] = tokenval;

    //postdata["tokenname"] = tokenname;
    //postdata["tokenval"] = tokenval;
  //console.log("postdata", postdata);

    return postdata;

}
// vacancies
$('.panel').on('click', function () {
    var t = $(this);
    t.next().slideToggle();
    t.toggleClass("opened");
});

$(document).ready(function(){
    $('#closebxgbb').click(function(){
        $('#ouibounce-modal').detach();
    });
    $('.tick').each(function (i, obj) {
        $(obj).countdown($(obj).data('time'), {
            elapse: true
        }).on('update.countdown', function (event) {
            var $this = $(this);
            var tpl = `
                <div class="countdown">
                    <span class="digits">%D</span><span class="delimiter" style="opacity: 1;">Д </span>
                    <span class="digits">%H</span>
                        <span class="delimiter" style="opacity: 1;">:</span>
                    <span class="digits">%M </span>
                        <span class="secs delimiter" style="opacity: 1;">:</span>
                    <span class="secs digits"> %S </span>
                </div>`;

            if (!event.elapsed) {
                $this.html(event.strftime(tpl));
            }
        });
    });

    $('.tick_challenge').each(function (i, obj) {
        $(obj).countdown($(obj).data('time'), {
            elapse: true
        }).on('update.countdown', function (event) {
            var $this = $(this);
            var tpl = `
                <div class="countdown challenge_countdown">
                    <span class="digits">%D</span><span class="delimiter" style="opacity: 1;">Д </span>
                    <span class="digits">%H</span>
                        <span class="delimiter" style="opacity: 1;">:</span>
                    <span class="digits">%M </span>
                        <span class="secs delimiter" style="opacity: 1;">:</span>
                    <span class="secs digits"> %S </span>
                </div>`;
            if (!event.elapsed) {
                $this.html(event.strftime(tpl));
            }
        });
    });

	$('.pay_method').on('click', function() {
        $('.pay_method').removeClass("clicked");
        $(this).toggleClass("clicked");
        if ( $('.pay_method').hasClass("clicked") ) {
            $('input[name=pay_type]').val($(this).data('type'));
            $('input[name=pay_method]').val($(this).data('method'));

            $('.form__balance .paybag__btns .btn').removeAttr("disabled");
            $('.form__balance .paybag__btns .front-layout').hide();
        }
    });

    $('.form__balance .paybag__btns .btn').on('click', function() {
        if ( $('.pay_method').hasClass("clicked") ) {
            return true;
        }
    });

    $('.form__balance .paybag__btns .front-layout').on('click', function() {
        noty('Выберите метод оплаты перед оплатой', false, 'error');
    })

});


$(function(){
    $('.selling').on('click', function(){
        let opp = $(this).parent().find('.updatingEgg');
        if ( opp.hasClass('clicked') ) {
          //console.log('класс у selling есть')
            opp.toggleClass('clicked');
            opp.parent().siblings('.to_upEgg').toggleClass("on");
            opp.parent().siblings('.glow').toggleClass("upgrading")
            opp.parent().siblings('.price').find('.coins').toggleClass("on")
        }

        $(this).toggleClass('clicked');
        $(this).parent().siblings('.to_sell').toggleClass("on");
        $(this).parent().siblings('.glow').toggleClass("selling")
        $(this).parent().siblings('.price').find('.money').toggleClass("on")
    });
    $('.updatingEgg').on('click', function(){
        if($(this).closest('.iteamblock').hasClass("arcana"))
            return;

        let opp = $(this).parent().find('.selling');
        if ( opp.hasClass('clicked') ) {
          //console.log('класс у selling есть')
            opp.toggleClass('clicked');
            opp.parent().siblings('.to_sell').toggleClass("on");
            opp.parent().siblings('.glow').toggleClass("selling")
            opp.parent().siblings('.price').find('.money').toggleClass("on")
        }

        $(this).toggleClass('clicked');
        $(this).parent().siblings('.to_upEgg').toggleClass("on");
        $(this).parent().siblings('.glow').toggleClass("upgrading");
        $(this).parent().siblings('.price').find('.coins').toggleClass("on")
    });

    $('.timer_eggs').each(function (i, obj) {
        $(obj).countdown($(obj).data('time'), {
            elapse: true
        }).on('update.countdown', function (event) {
            var $this = $(this);
            var egg_tpl = `
                <div class="countdown">
                    <span class="digits">%H</span>
                        <span class="delimiter" style="opacity: 1;">:</span>
                    <span class="digits">%M</span>
                        <span class="secs delimiter" style="opacity: 1;">:</span>
                    <span class="secs digits">%S</span>
                </div>`;

            if (!event.elapsed) {
                $this.html(event.strftime(egg_tpl));
            }
        });
    });

    $('.last-ticker').each(function (i, obj) {
        $(obj).countdown($(obj).data('time'), {
            elapse: true
        }).on('update.countdown', function (event) {
            var $this = $(this);
            var tpl = `<span id="days">%-DД </span><span id="hours">%H</span><span>:</span><span id="minutes">%M</span><span>:</span><span id="seconds">%S</span>`;
            var tpl_wdays = `<span id="hours">%H</span><span>:</span><span id="minutes">%M</span><span>:</span><span id="seconds">%S</span>`;

            if (!event.elapsed) {
                if(parseInt(event.strftime('%D')) == 0) {
                    $this.html(event.strftime(tpl_wdays));
                } else {
                    $this.html(event.strftime(tpl));
                }
            }
        });
    });

    $(".banner-winners").click(function(){
        $(".participants").slideToggle();
        $(this).toggleClass('active');
    });

    $('.auction-filters .filter').on('click', function() {
        $('.auction-filters span.filter').removeClass('active');
        $(this).addClass('active');
    })

    $('#auction-page .bet-timer').each(function (i, obj) {
        bettimer(obj);
    });

    // sorting

    if ($(window).width() > 992) {
        lotsGrid();
        lotsSort("main");

        // sort items on button click
        $('.sort-by-button-group').on('click', '.filter', function() {
            var sortByValue = $(this).attr('data-sort-by');
            lotsSort(sortByValue);
        });
    }

});

$(".offers-whatthis").click(function(e){
    e.preventDefault();
    //console.log("whatthis clicked")
    $(".offers-content").toggleClass("clicked");
    $(".whatthis-content").toggleClass("active");

    if( $(this).hasClass("clicked")) {
        $(this).removeClass("clicked");
    } else {
        $(this).addClass("clicked");
    }
});

$(".whatthis-content-close").click(function(e){
    e.preventDefault();
    $(".whatthis-content").toggleClass("active");
    $(".offers-whatthis").removeClass("clicked");

    $('.pay_method').on('click', function() {
        $('.pay_method').removeClass("clicked");
        $(this).toggleClass("clicked");
        if ( $('.pay_method').hasClass("clicked") ) {
            $('input[name=pay_type]').val($(this).data('type'));
            $('input[name=pay_method]').val($(this).data('method'));

            $('.form__balance .paybag__btns .btn').removeAttr("disabled");
            $('.form__balance .paybag__btns .front-layout').hide();
        }
    });

    $('.form__balance .paybag__btns .btn').on('click', function() {
        if ( $('.pay_method').hasClass("clicked") ) {
            return true;
        }
    });

    $('.form__balance .paybag__btns .front-layout').on('click', function() {
        noty('Выберите метод оплаты перед оплатой', false, 'error');
    })

});

/* Ideas page */

function voteIdeas() {
    $('body').on('click', ' .ideas-like', function () {
        let ideaId = $(this).data('idea_id');

        $.post('/ajax/ideas/' + ideaId + '/user/' + $(this).data('user_id') + '/vote', pushtokenTo({}, 'ideaVote'))
            .done(function(data){ data.status ? $('#count-'+ ideaId).text(data.count) : noty(data.msg, false, 'error')});
    });
}

$(function () {

    voteIdeas();

    $('#ideas-pagination').click(function () {
        const self = $(this);
        const page = parseInt(self.data('page')) + 1;
        const newIdeas = new URLSearchParams(document.location.search).get("new");

        $.post('/ajax/ideas/pagination', pushtokenTo({'page' : page, 'new' : newIdeas}, 'pagination'))
            .done(function(data){
                if(!!data) {
                    let newListIdeas = '';

                    $.each(data.ideas.items, function (index, idea) {
                        newListIdeas += viewIdeas(idea, data.user);
                    });

                    $('#list-ideas').append(newListIdeas);
                    self.data('page', page);

                    if(data.ideas.total_pages == data.ideas.current) {
                        self.css({display: 'none'});
                    }
                }
            });

    });

    function viewIdeas(data, user)
    {
        return '<li style="width: 75%; display: flex; justify-content: space-between; border-bottom: 1px solid #fff; padding: 10px; 0;">' +
            '       <p style="display: flex; flex-direction: column; justify-content: space-between; width: 33%;">' +
            '           <strong>Название идеи - ' + data.ideas_name + '</strong>' + (data.ideas_description || '') +
            '       </p>' +
            '       <strong>Количество голосов: <span id="count-' + data.ideas_id + '">' + (data.sum_vote || 0) + '</span></strong>' +
            '       <i class="fa fa-thumbs-up ideas-like" data-user_id="'+ user.id + '" style="cursor: pointer"' +
            '          data-idea_id="' + data.ideas_id + '" aria-hidden="true">' +
            '        </i>' +
            '   </li>';
    }

    // User Email

    $('#email-user').click(function(e) {
        self = $(this);
        let email = self.parent().siblings('input[name=email]');

        if (email) {
            $.post('/api/pages/add-email', pushtokenTo({'email' : email.val()}, 'csrfFieldEmail'))
               .done(function(data){
                   if (!!data && data.status) {
                        let parent = self.parents('div.wrap.input-group');
                            parent.parent().append(viewEmailUser(data.user.email));
                            parent.remove();
                            $('#title_email_user').remove();
                            $('.header__profile-data .bonus__coin, .profile__units span').text(data.user.tastycoin)
                   }

                   noty(data.msg, (data.status ? 'Успех!' : 'Провал'), (data.status ? 'success' : 'error'));
               });
        }
    });
    $('#send-email').click(function(e) {
        self = $(this);
        let email = self.parent().siblings('input[name=email]');

        if (email) {
            $.post('/api/pages/send-email', pushtokenTo({'email' : email.val()}, 'csrfFieldEmail'))
                .done(function(data){
                    noty(data.msg, (data.status ? 'Успех!' : 'Провал'), (data.status ? 'success' : 'error'));
                });
        }
    });
    function viewEmailUser(email) {
        return '<div class="profile__tradelink-title"><h3>Ваша почта: ' + email + '</h3></div>';
    }
});

function lotsGrid(){
    var $grid = $('.grid').isotope({
        itemSelector: '.auction-item',
        getSortData: {
            dtend: '.dtend parseInt',
            dtadd: '.dtadd parseInt',
            popularity: '.popularity parseInt',
            mybet: '.mybet parseInt',
            main: '.main parseInt'
        }
    });
}
function lotsSort(sortByValue){
    //console.log("sortByValue", sortByValue);
    $('.grid').isotope('reloadItems');
    $('.grid').isotope({
        sortBy: sortByValue,
        sortAscending: {
            dtend: true,
            dtadd: false,
            popularity: false,
            mybet: false,
            main: true
        }
    });
}

function cut_text(s, lng) {
    if (s.length >= lng) {
        s = s.substring(0, lng);
        var lastIndex = s.lastIndexOf(" "); // позиция последнего пробела
        s = s.substring(0, lng) + '...'; // обрезаем до последнего слова
    }

    return s;
}

function bettimer(obj){
    var dtend = timerStart + parseInt($(obj).data('time'));
    $(obj).countdown(dtend, {
        elapse: true
    }).on('update.countdown', function (event) {
        var auction_item = $(obj).closest(".auction-item");
        var hours = auction_item.find('.hours');
        var minutes = auction_item.find('.minutes');
        var seconds = auction_item.find('.seconds');

        var totalHours = event.offset.totalDays * 24 + event.offset.hours;
        var tpl = '<span class="hours">'+ totalHours + '</span><span>:</span><span class="minutes">%M</span><span>:</span><span class="seconds">%S</span>';
        if (!event.elapsed) {
            $(this).html(event.strftime(tpl));
            if(totalHours == 0 && event.offset.minutes == 0){
                $(this).addClass("warning");
            }
        }else{
          //console.log("end");
        }


    })
}