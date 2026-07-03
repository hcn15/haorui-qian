


// 使用IE浏览器提示
// function hiUpgrade() {
//     window.AESKey = '';
//     // 判断浏览器是否支持placeholder属性
//     function isSupportPlaceholder() {
//         var input = document.createElement('input');
//         return 'placeholder' in input;
//     };
//     //判断是否是IE浏览器，包括Edge浏览器
//     function IEVersion() {
//         //取得浏览器的userAgent字符串
//         var userAgent = navigator.userAgent;
//         //判断是否IE浏览器
//         var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1;
//         if (isIE) {
//             // ie10及以下
//             var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
//             reIE.test(userAgent);
//             var fIEVersion = parseFloat(RegExp["$1"]);
//             if (fIEVersion <= 10 || !isSupportPlaceholder()) {
//                 return true;
//             }
//         } else if (!!window.ActiveXObject || "ActiveXObject" in window) {
//             // ie11
//             return true;
//         } else {
//             return false;
//         }
//     }
//     var tpl = '<div id="hi-upgrade"><div class="hi-wrap"><p class="hi-title">无法正常浏览本网站！</p><div class="hi-close">继续浏览</div><div class="hi-text1"><p>1、您的浏览器版本过低，请升级您的浏览器。</p><p>2、如果您的浏览器是最新版本，请<span>切换到极速模式</span>访问。</p><p>3、您使用的是IE浏览器，请<span>使用主流浏览器</span>访问。</p></div><p class="hi-text2"><span>主流浏览器下载</span></p><ul class="hi-list"><li><a href="https://www.google.cn/intl/zh-CN/chrome/" target="_blank"><div class="hi-ico1"></div><p>谷歌浏览器</p></a></li><li><a href="http://www.firefox.com.cn/download/" target="_blank"><div class="hi-ico2"></div><p>火狐浏览器</p></a></li><li><a href="http://browser.360.cn" target="_blank"><div class="hi-ico3"></div><p>UC浏览器</p></a></li><li><a href="https://www.uc.cn" target="_blank"><div class="hi-ico4"></div><p>360浏览器</p></a></li><li><a href="https://browser.qq.com" target="_blank"><div class="hi-ico5"></div><p>QQ浏览器</p></a></li><li><a href="https://ie.sogou.com" target="_blank"><div class="hi-ico6"></div><p>搜狗浏览器</p></a></li></ul></div></div>';
//     if (IEVersion()) {
//         document.write(tpl);
//     }
// }
// hiUpgrade();


// 刷新页面直接回到顶部
// if (history.scrollRestoration) {
//     history.scrollRestoration = 'manual';  //auto刷新在当前位置  manual刷新在头部位置
// }

// localStorage(关闭浏览器或者设置时间初始化)
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}


function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name) == 0) { return c.substring(name.length, c.length); }
	}
	return "";
}

var tyys = getCookie("tyys");
	if (tyys != "") {
		$("#c-home-tips").fadeOut();
	} else {
		$("#c-home-tips").fadeIn();
	}
		
	$("#c-home-tips .c-close").click(function() {
		$("#c-home-tips").fadeOut();
		setCookie("tyys", 1);
});

// 数字跳动
$('.counter').countUp({
	delay: 10,
	time: 1000
});

// 右侧浮窗
$(".pop_a:last-child").click(function(){
	$('body,html').animate({scrollTop:0},300);
	$('nav').removeClass('nav1_none');
});

$(window).scroll(function() {
	
	if ($(window).scrollTop() > $(window).height()/2) {
	
			$('.gpop').fadeIn(250);
	} else {
			$('.gpop').fadeOut(250);
	}
		
});

$(".pop_a").hover(function(){
	$(this).addClass('on')
},function(){
	$(this).removeClass('on')
}
);



// 设置:root变量
function setRootDefault(name,key){
    document.documentElement.style.setProperty(name,key);
}
function setAllRoot(){
    setRootDefault("--color",'#005CE6');
    setRootDefault("--vh",$(window).height()+'px');
};
setAllRoot();
$(window).resize(function() {
    setAllRoot();
})


function tjl(e,d){
	$(e).click(function(){
		$(this).toggleClass(d).siblings().removeClass(d);
		
	});
}
tjl('.proBox_con .proBox_db','on')

// 导航
xxkc('.pro_nav3 .pro_nav3_tnav .container2 .g_tBox .item','.pro_nav3 .pro_nav3_box .conItem')


function headNav() {
    var oBody = $("body");
    var oHead = $("#c-header");
    var oNav = $("#c-header .c-nav");
    var oBtn = $("#c-header .c-switch");
    var oL = $("#c-header .c-nav>li");
    var oTitle = $("#c-header .c-nav2 li .c-title-box");
    var num = 0;
    var i = 0;
    var oP = $("#c-placeholder");
    var b = true;
    var t = null;

    // 窗口重置隐藏手机端导航
    $(window).resize(function() {
        
        if ($(window).width()>991) {
            oBody.removeClass('c-open');
        }
    });

    // 手机端导航栏目下拉
    oTitle.click(function() {
        $(this).next().stop().slideToggle();
        $(this).toggleClass("on");
    });

    // 鼠标移入导航样式
    oHead.hover(function() {
        $(this).addClass("c-style2");
    }, function() {
        if ($(window).scrollTop() <= oHead.outerHeight() && oP.length == 0 && !oBody.hasClass("c-open")) {
            oHead.removeClass("c-style2");
        } else if ($(window).scrollTop() > oHead.outerHeight()) {
            oHead.addClass("c-style2");
        } else if ($(window).scrollTop() <= oHead.outerHeight() && oP.length != 0) {
            oHead.addClass("c-style2");
        }
    });

    // 手机端导航显示
    oBtn.click(function() {
        if (b) {
            b = false;
            // t = $(window).scrollTop();
            oBody.addClass('c-open');
            // oBody.css("top", -t);
        } else {
            b = true;
            oBody.removeClass('c-open');
            // oBody.css("top", "0");
            // $(window).scrollTop(t);
        }
    });

    // 导航显示及样式
    function fn2() {
        if ($(window).scrollTop() - i > 0 && $(window).scrollTop() > 100 && !oBody.hasClass("c-open")) {
            i = $(window).scrollTop();
    		
            // 向下滚
            $('nav').addClass('nav1_none');
            $('.about_tab,.act_tab').removeClass('nav2_none');
            $('.prod_nav').addClass('prod_nav2');
            
            // 粘性布局调整
            $('.buiNav,.proNav').addClass('sticky_top');
    		
        } else if ($(window).scrollTop() - i <= 0) {
            i = $(window).scrollTop();
    		
            // 向上滚
            $('nav').removeClass('nav1_none');
            $('.about_tab,.act_tab').addClass('nav2_none');
            $('.prod_nav').removeClass('prod_nav2');
            
            // 粘性布局调整
            $('.buiNav,.proNav').removeClass('sticky_top');
    		
            // if ($(window).scrollTop() <= 20 && oP.length == 0 && !oBody.hasClass("c-open")) {
            //     oHead.removeClass("c-style2");
            // } else if ($(window).scrollTop() > 20) {
            //     oHead.addClass("c-style2");
            // } else if ($(window).scrollTop() <= 20 && oP.length != 0) {
            //     oHead.addClass("c-style2");
            // }
        }
    }
    fn2();
    $(window).scroll(function() {
        fn2();
    });

    // pc导航动画
    oL.each(function() {
        if ($(this).hasClass("on")) {
            num = $(this).index();
        }
        $(this).hover(function() {
                oL.eq(num).removeClass("on");
                $(this).children("ul").stop().slideDown();
            },
            function() {
                oL.eq(num).addClass("on");
                $(this).children("ul").stop().slideUp();
            });
    });
}
headNav();

// 顶部搜索
function headSearch() {
    var obj = $("#c-header form");
    var oBox = obj.find(".c-box");
    obj.hover(function() {
        oBox.stop().fadeIn();
    }, function() {
        oBox.stop().fadeOut();
    });
    obj.submit(function(){
        if(!$(this).find("input").val()){
            layer.msg('请输入搜索的关键词！', {
                icon: 7
            });
            return false;
        }
    });
}
headSearch();

// 首页轮播
function homeBanner() {
    var swiper = new Swiper(".c-home-banner", {
        // effect : 'fade',
        loop: true,
        speed: 1000,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        // breakpoints: {
        //     767: {
        //         slidesPerView: 3,
        //         spaceBetween: 20,
        //     }
        // }
    });
    // 设置全屏
    HiSetClientHeight($(".c-home-banner .swiper-slide img"));
}
homeBanner();

// 可视化数据滚动
function visualData(obj) {
	
	
    $(window).ready(function() {
        obj.each(function() {
            var h = Number($(this).html());
            var t = "";
            var n = Math.ceil(h / 20);
            var a = true;
            var This = $(this);
            if ($(this).length != 0) {
                t = $(this).offset().top;
            }
            This.html(0);
            fn1();
            $(window).scroll(function() {
                fn1();
            });

            function fn1() {
                var wT = $(window).scrollTop();
                if (wT > t - $(window).height() + 50 && wT < t - 50 && a == true) {
                    a = false;
                    var y = 0;
                    var timer2 = setInterval(function() {
                        if (y >= h) {
                            y = h;
                            clearInterval(timer2);
                        }
                        This.html(y);
                        y += n;
                    }, 100);
                }
            }
        });
    });
}
visualData($(".c-num-move"));


// 侧边栏显示隐藏
function sidePop() {
    var obj = $("#c-go-top");
    function fn1() {
        if ($(window).scrollTop() > $(window).height()) {
            obj.fadeIn();
        } else {
            obj.fadeOut();
        }
    }
    fn1();
    $(window).scroll(function() {
        fn1();
    });
}
sidePop();

// 页面回到顶部
function goTop() {
    $("html,body").animate({ scrollTop: 0 }, 500);
}

// 底部导航
function footerNav() {
    var aList = $("#c-footer .c-list-box");
    aList.each(function() {
        var This = $(this);
        $(this).find(".c-title-box").click(function() {
            if ($(window).width() < 768) {
                This.toggleClass("on");
                This.find(".c-list").stop().slideToggle();
            }
        });
    });
}
footerNav();

// 二维码弹窗
function codePop() {
    var b = $("#c-footer .c-code-btn");
    var w = $("#c-code-pop");
    var c = w.find(".c-close");
    var d = w.find(".c-img-box");
    var oImg = w.find(".c-img-box>img");
    b.click(function() {
        oImg.attr("src",$(this).data("img-src"));
        w.stop().fadeToggle();
        
    });
    d.click(function() {
        return false;
    });
    w.click(function() {
        w.stop().fadeToggle();
    });
    c.click(function() {
        w.stop().fadeToggle();
    });
}
codePop();


// 项目 S
$(function() {
	
	// 按钮
	$('.com_btn,.com_btn2').hover(function(){
		$(this).addClass('on')
	},function(){
		$(this).removeClass('on')
	})
	
	// 底部icon
	$(".foot_t_r_box").hover(function(){
		$(this).addClass('on')
	},function(){
		$(this).removeClass('on')
	}
	);
	
	
});
// 项目 E

// 滚动导航
if ($(window).scrollTop() > 100) {
	$('nav').addClass('nav_on')
}
function scr(){
	if ($(window).scrollTop() > 100) {
			$('nav').addClass('nav_on')
			$('nav').addClass('nav_on2')
			$('.h_banner').addClass('on')
			
		} else {
			
			$('nav').removeClass('nav_on')
			$('nav').removeClass('nav_on2')
			$('.h_banner').removeClass('on')
		}
}
$(window).scroll(function() {
	scr()
});
//选项卡
function xxkh(dj,x_id){
	$(x_id).hide();
	$(x_id).eq(0).show();
	// $(x_id).removeClass('on');
	// $(x_id).eq(0).addClass('on');
	$(dj).hover(function(){
		$(this).addClass('on').siblings().removeClass('on');
		$(x_id).hide();
		$(x_id).eq($(this).index()).show();
		// $(x_id).removeClass('on');
		// $(x_id).eq($(this).index()).addClass('on');
	})
}
function xxkc(dj,x_id){
	$(x_id).hide();
	$(x_id).eq(0).show();
	// $(x_id).removeClass('on');
	// $(x_id).eq(0).addClass('on');
	$(dj).click(function(){
		$(this).addClass('on').siblings().removeClass('on');
		$(x_id).hide();
		$(x_id).eq($(this).index()).show();
		// $(x_id).removeClass('on');
		// $(x_id).eq($(this).index()).addClass('on');
	})
}


// 滚动栏目
function HiScrollNav(sClass, obj1, obj2, obj3,obj4) {
		// 设置减去元素的高度
		var obj3Height = 0;
		var obj4Height = 0;
		if (obj3.length != 0) {
				obj3Height = obj3.outerHeight();
		}
		if (obj4.length != 0) {
				obj4Height = obj4.outerHeight();
		}
		// 点击定位
		obj1.each(function() {
				$(this).click(function() {
						$("html,body").animate({
								"scrollTop": obj2.eq($(this).index()).offset().top - obj3Height - obj4Height+ 1
						}, 500);
				});
		});
		// 滚动定位
		$(window).scroll(function() {
				hiDefault();
		});

		// 默认
		function hiDefault() {
				obj2.each(function() {
						if ($(window).scrollTop() >= $(this).offset().top - obj3Height - obj4Height) {
								obj1.eq($(this).index()).addClass(sClass).siblings().removeClass(sClass);
						}
				});
		}
		hiDefault();
}

// pc导航
function navPc(){
	
	
	$('.navbox>ul>li').hover(function(){
		$(this).find('.pro_nav2').stop().slideDown(250);
		$(this).find('.pro_nav3').stop().slideDown(250);
		
	},function() {
		$(this).find('.pro_nav2').stop().slideUp(250);
		$(this).find('.pro_nav3').stop().slideUp(250);
		
	})	
	
	$('.pro_nav3 .pro_nav3_tnav .container2 .g_del').click(function(){
		$('.pro_nav3').stop().slideUp(250);
		
		// $('html').css('overflow-y', 'auto');
		// $('nav').css('padding-right', 0);
		setTimeout(function(){
			$('nav').css('transition', 'all 0.6s');
		},600);
		
	})
	
	// $('.navbox>ul>li.on2').hover(function(){
	// 	$('html').css('overflow-y', 'hidden');
	// 	$('nav').css('padding-right', 5);
	// 	$('nav').css('transition', 'all 0s');
	// },function() {
	// 	$('html').css('overflow-y', 'auto');
	// 	$('nav').css('padding-right', 0);
	// 	setTimeout(function(){
	// 		$('nav').css('transition', 'all 0.6s');
	// 	},600);
		
	// })
	
	
	
	$('nav').hover(function(){
		$(this).addClass('nav_on')
	},function() {
		$(this).removeClass('nav_on')
		// $('.nav_r').removeClass('ssxs');
	})	
	
	// 搜索
	$('.search_box>img').click(function(){
		$('.nav_r').addClass('ssxs');
	})
	
	$('.search .sc').click(function(){
		$('.nav_r').removeClass('ssxs');
	})
	
	// 语言
	$('.nav_lan').hover(function () {
		$('.nav_lan_sel').stop().slideDown();
	}, function () {
		$('.nav_lan_sel').stop().slideUp();
	});
	// 移动端导航
	
	$('.c-title-box').click(function(){
		$(this).parent().toggleClass('on').siblings().removeClass('on');
		$(this).parent().find('.c-title-con').slideToggle();
		$(this).parent().siblings().find('.c-title-con').slideUp()
	})
	
	// 二级
	$('.nav_two_tit').click(function(){
		$(this).parent().find('.nav_three').stop().slideToggle();
		$(this).parent().siblings().find('.nav_three').stop().slideUp()
	})
	
}
navPc()	

// 移动端导航
function cNav() {
    var oMask = $("#c-mask");
    var oBody = $("body");
    var oHead = $("#g-header");
    var oNav = $("#g-header .c-nav");
    var oBtn = $("#g-header .c-switch");
    var oL = $("#g-header .c-nav>li");
    var oTitle = $("#g-header .c-nav2 li .c-title-box");
    var num = 0;
    var i = $(window).scrollTop();
    var oP = $("#c-placeholder");
    var b = true;
    var t = null;
    // 手机端导航显示
    oBtn.click(function() {
        if (b) {
            b = false;
            oBody.addClass('c-open');
            oMask.stop().fadeIn();
        } else {
            b = true;
            oBody.removeClass('c-open');
            oMask.stop().fadeOut();
        }
    });
    // oHead.hover(function() {}, function() {
    //     b = true;
    //     oBody.removeClass('c-open');
    //     oMask.stop().fadeOut();
    // });

    // 窗口重置隐藏手机端导航
    $(window).resize(function() {
        if ($("#g-header .c-nav").css("display") == "block") {
            oBody.removeClass('c-open');
        }
    });

    // 手机端导航栏目下拉
    // oTitle.click(function() {
    //     $(this).next().stop().slideToggle();
    // });

    // 鼠标移入导航样式
    oHead.hover(function() {
        $(this).addClass("c-style2");
    }, function() {
        if (i <= oHead.outerHeight() && oP.length == 0) {
            $(this).removeClass("c-style2");
        } else {
            $(this).addClass("c-style2");
        }
    });

    // 导航显示及样式
    function fn1() {
        if ($(window).scrollTop() - i > 0 && $(window).scrollTop() > oHead.outerHeight()) {
            i = $(window).scrollTop();
            oHead.addClass("c-head-move");
            oHead.addClass("c-style2");
        } else if ($(window).scrollTop() - i < 0) {
            i = $(window).scrollTop();
            oHead.removeClass("c-head-move");
            if ($(window).scrollTop() <= oHead.outerHeight() && oP.length == 0 && !oBody.hasClass("c-open")) {
                oHead.removeClass("c-style2");
            } else if ($(window).scrollTop() > oHead.outerHeight()) {
                oHead.addClass("c-style2");
            } else if ($(window).scrollTop() <= oHead.outerHeight() && oP.length != 0) {
                oHead.addClass("c-style2");
            }
        }
    }
    fn1();
    $(window).scroll(function() {
        fn1();
    });

    
}
cNav();

// 移动端底部导航

if ($(window).width() < 767) {
	$('.foot_nav .a_tit').click(function() {
		
		$(this).toggleClass('on');
		$(this).parent().siblings().find('.a_tit').removeClass('on');
		
		$('.foot_nav ul').stop().slideUp(250);
		$(this).parent().find('ul').stop().slideToggle(250);
		
	})
}


// 导航搜索


$('.nav_search').click(function () {
	$('.navSearch').stop().slideDown()
	
})
$('.navSearch_del').click(function () {
	$('.navSearch').stop().slideUp()
})



$("body").click(function (e) {
	if (!$(e.target).closest(".navSearch,.nav_search").length) {
		$('.navSearch').stop().slideUp()
		
	}
})


// 图片效果
// $(window).scroll(function() {
//     $('.public-img img:not(.animated)').each(function() { 
//         var top_of_element = $(this).offset().top;
//         var bottom_of_element = $(this).offset().top + $(this).outerHeight() / 4;  
//         var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
//         var top_of_screen = $(window).scrollTop();

//         if ((bottom_of_screen > bottom_of_element) && (top_of_screen < bottom_of_element)){
            
//             $(this).addClass('scale-down');
//             $(this).addClass('animated');  
//         }
//     });
// });








/* ------------------------- */
/* 产品特性 */
function innerProDisplay() {
    let divBox = document.getElementById('innerProDisplay');
    if(!divBox) return;
    /* ------------- */
    let pager = divBox.querySelector('.pager');
    new Swiper(divBox, {
        speed: 1000, effect : 'fade', fadeEffect: {crossFade: true},
        pagination: {el: pager, clickable: true, bulletActiveClass: 'active'},
    });
}
innerProDisplay();
/* ------------------------- */
function innerProductParameter() {
    let divBox = document.getElementById('innerProductParameter');
    if (!divBox) return;
    /* -------------- */
    let swiperBox = divBox.querySelector('.swiper-box'),
        prev = divBox.querySelector('.prev'),
        next = divBox.querySelector('.next');

    new Swiper(swiperBox, {
        speed: 1000, slidesPerView: 4, spaceBetween: 40, 
        navigation: {nextEl: next, prevEl: prev},
        breakpoints: {
            1600: {spaceBetween: 30},
            1280: {slidesPerView: 3, spaceBetween: 20},
            991: {slidesPerView: 2, spaceBetween: 20},
            767: {slidesPerView: 1, spaceBetween: 20},
        }
    });
}
innerProductParameter();
/* ------------------------- */
/* 产品详情 */
function innerProDetails() {
    let divBox = document.getElementById('innerProDetails');
    if (!divBox) return;
    /* -------------- */
    let tabs = divBox.querySelector('.tabs-box'),
        swiperBox = divBox.querySelector('.swiper-box');

    let swiper = new Swiper(swiperBox, {
        speed: 1000, effect : 'fade', fadeEffect: {crossFade: true,},
        on:{
            init(){
                swiperAnimateCache(this);
                swiperAnimate(this);
            }, 
            slideChangeTransitionEnd(){ 
                swiperAnimate(this);
            } 
        }
    })
    Array.from(tabs.children).forEach((tab, idx) => tab.onclick = function() {
        tabs.querySelector('.active').classList.remove('active');
        this.classList.add('active');
        swiper.slideTo(idx);
    } )

    
}
innerProDetails();
/* ------------------------- */
/* 行业应用系列产品 */
function innerProApplications() {
    let divBox = document.getElementById('innerProApplications');
    if (!divBox) return;
    /* -------------- */
    let swiperBox = divBox.querySelector('.swiper-box'),
        prev = divBox.querySelector('.prev'),
        next = divBox.querySelector('.next');

    new Swiper(swiperBox, {
        speed: 1000, slidesPerView: 3, spaceBetween: 30, loop: true,
        navigation: {nextEl: next, prevEl: prev},
        breakpoints: {
            1600: {spaceBetween: 24},
            991: {slidesPerView: 2, spaceBetween: 20},
            768: {slidesPerView: 1.2, spaceBetween: 20},
        }
    })
}
innerProApplications();
/* ------------------------- */
/* 相关案例 */
function innerRelatedCases() {
    let divBox = document.getElementById('innerRelatedCases');
    if (!divBox) return;
    /* -------------- */
    let swiperBox = divBox.querySelector('.swiper-box'),
        prev = divBox.querySelector('.prev'),
        next = divBox.querySelector('.next');

    new Swiper(swiperBox, {
        speed: 1000, slidesPerView: 4, spaceBetween: 40, 
        navigation: {nextEl: next, prevEl: prev},
        breakpoints: {
            1600: {spaceBetween: 30},
            1280: {slidesPerView: 3, spaceBetween: 20},
            991: {slidesPerView: 2, spaceBetween: 20},
            767: {slidesPerView: 1, spaceBetween: 20},
        }
    })
}
innerRelatedCases();
/* ------------------------- */
/* 产品质量认证 - logo滚动 */
function innerProScroll() {
    let divBox = document.getElementById('innerProScroll');
    if (!divBox) return;
    /* -------------- */
    [...divBox.querySelectorAll('.slide-logo')].forEach(slide => divBox.appendChild(slide.cloneNode(true)));
    let slides = [...divBox.querySelectorAll('.slide-logo')]

    gsap.to(slides, {
        duration: slides.length / 2 * 5,
        ease: 'none',
        xPercent: -100 * (slides.length / 2),
        repeat: -1
    });
}
innerProScroll();
/* ------------------------- */
/* FAQ */
function innerFaq() {
    let divBox = document.getElementById('innerFaq');
    if (!divBox) return;
    /* -------------- */
    function getHiddenElementHeight(element) {
        const originalDisplay = element.style.display;  
        const originalVisibility = element.style.visibility;  
        element.style.display = 'block';  
        element.style.visibility = 'hidden';
        const height = element.offsetHeight;
        element.style.display = originalDisplay;  
        element.style.visibility = originalVisibility;
        return height;  
    } 
    let isClick = true;
    [...divBox.querySelectorAll('.item')].forEach(slide => {
        slide.onclick = function() {
            if (isClick) {
                isClick = false;
                let content = slide.querySelector('.content'),
                    cH = getHiddenElementHeight(content);
                if (!slide.classList.contains('active')) {
                    slide.classList.add('active');
                    gsap.to(content, {onStart() {
                        content.style.display = 'block';
                    }, height: cH, marginTop: 20, onComplete() {isClick = true}})
                } else {
                    slide.classList.remove('active');
                    gsap.to(content, {height: 0, marginTop: 0, onComplete() {
                        content.style = '';
                        isClick = true;
                    }})
                }
            }
        }
    })
}
innerFaq();
/* ------------------------- */
function onNoWheel(event) {  
    var target = event.target;  
    while (target && target !== document.body) {  
        if (target.classList && target.classList.contains('allow-wheel')) {  
            return;  
        }  
        target = target.parentNode;  
    }  
    event.preventDefault();  
}
function alertContact() {
    let btn = document.getElementById('alertContactBtn'),
        box = document.getElementById('alertContactBox');

    if (!btn) return;
    if (!box) return;
    /* ------------------- */
    let close = box.querySelector('.close');

    btn.onclick = function() {
        box.classList.add('active');
        gsap.to(box, {duration: .5, autoAlpha: 1})
        document.addEventListener('wheel', onNoWheel, {passive: false})
    }
    close.onclick = function() {
        box.classList.remove('active');
        gsap.to(box, {duration: .5, autoAlpha: 0})
        document.removeEventListener('wheel', onNoWheel)
    }
    
}
alertContact();

// 右侧浮窗
$(".pop_a:last-child").click(function(){
	$('body,html').animate({scrollTop:0},300);
	$('nav').removeClass('nav1_none');
});

$(window).scroll(function() {
	
	if ($(window).scrollTop() > $(window).height()/2) {
	
			$('.gpop').fadeIn(250);
	} else {
			$('.gpop').fadeOut(250);
	}
		
});

$(".pop_a").hover(function(){
	$(this).addClass('on')
},function(){
	$(this).removeClass('on')
}
);