/**
 * 公共JS文件
 * 包含网站全局通用功能：Cookie操作、数字动画、导航交互、轮播组件、侧边栏等
 */

/**
 * 设置Cookie
 * @param {string} cname - Cookie名称
 * @param {string} cvalue - Cookie值
 * @param {number} exdays - 过期天数
 */
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

/**
 * 获取Cookie值
 * @param {string} cname - Cookie名称
 * @returns {string} Cookie值，不存在则返回空字符串
 */
function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name) == 0) { return c.substring(name.length, c.length); }
	}
	return "";
}

/**
 * 首页提示条控制逻辑
 * 根据Cookie判断是否显示提示条，用户关闭后设置Cookie
 */
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

// 数字跳动动画 - 使用countUp插件实现数字递增效果
$('.counter').countUp({
	delay: 10,
	time: 1000
});

// 右侧浮窗回到顶部功能
$(".pop_a:last-child").click(function(){
	$('body,html').animate({scrollTop:0},300);
	$('nav').removeClass('nav1_none');
});

// 滚动时右侧浮窗显示/隐藏
$(window).scroll(function() {
	if ($(window).scrollTop() > $(window).height()/2) {
		$('.gpop').fadeIn(250);
	} else {
		$('.gpop').fadeOut(250);
	}
});

// 右侧浮窗悬停效果
$(".pop_a").hover(function(){
	$(this).addClass('on')
},function(){
	$(this).removeClass('on')
});

/**
 * 设置CSS根变量
 * @param {string} name - 变量名
 * @param {string} key - 变量值
 */
function setRootDefault(name,key){
    document.documentElement.style.setProperty(name,key);
}

/**
 * 初始化所有根变量
 * 设置主题色和视口高度
 */
function setAllRoot(){
    setRootDefault("--color",'#005CE6');
    setRootDefault("--vh",$(window).height()+'px');
};
setAllRoot();
$(window).resize(function() {
    setAllRoot();
})

/**
 * 选项卡切换功能（点击切换）
 * @param {string} e - 触发元素选择器
 * @param {string} d - 激活状态的class名
 */
function tjl(e,d){
	$(e).click(function(){
		$(this).toggleClass(d).siblings().removeClass(d);
	});
}
tjl('.proBox_con .proBox_db','on')

// 导航选项卡切换
xxkc('.pro_nav3 .pro_nav3_tnav .container2 .g_tBox .item','.pro_nav3 .pro_nav3_box .conItem')

/**
 * 顶部导航栏交互逻辑
 * 包含：移动端导航切换、滚动时导航样式变化、PC端导航下拉菜单等功能
 */
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

    // 窗口重置时隐藏手机端导航
    $(window).resize(function() {
        if ($(window).width()>991) {
            oBody.removeClass('c-open');
        }
    });

    // 手机端导航栏目下拉展开
    oTitle.click(function() {
        $(this).next().stop().slideToggle();
        $(this).toggleClass("on");
    });

    // 鼠标移入导航栏时添加样式
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

    // 手机端导航显示/隐藏切换按钮
    oBtn.click(function() {
        if (b) {
            b = false;
            oBody.addClass('c-open');
        } else {
            b = true;
            oBody.removeClass('c-open');
        }
    });

    // 滚动时导航栏显示及样式调整
    function fn2() {
        if ($(window).scrollTop() - i > 0 && $(window).scrollTop() > 100 && !oBody.hasClass("c-open")) {
            i = $(window).scrollTop();
            // 向下滚动时隐藏导航
            $('nav').addClass('nav1_none');
            $('.about_tab,.act_tab').removeClass('nav2_none');
            $('.prod_nav').addClass('prod_nav2');
            // 粘性布局调整
            $('.buiNav,.proNav').addClass('sticky_top');
        } else if ($(window).scrollTop() - i <= 0) {
            i = $(window).scrollTop();
            // 向上滚动时显示导航
            $('nav').removeClass('nav1_none');
            $('.about_tab,.act_tab').addClass('nav2_none');
            $('.prod_nav').removeClass('prod_nav2');
            // 粘性布局调整
            $('.buiNav,.proNav').removeClass('sticky_top');
        }
    }
    fn2();
    $(window).scroll(function() {
        fn2();
    });

    // PC端导航下拉菜单动画
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

/**
 * 顶部搜索框交互
 * 鼠标悬停显示搜索框，提交时验证输入内容
 */
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

/**
 * 首页轮播图初始化
 * 使用Swiper插件实现轮播效果，支持自动播放、分页、导航按钮
 */
function homeBanner() {
    var swiper = new Swiper(".c-home-banner", {
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
    });
    // 设置全屏高度
    HiSetClientHeight($(".c-home-banner .swiper-slide img"));
}
homeBanner();

/**
 * 可视化数据滚动动画
 * 当元素进入可视区域时，数字从0递增到目标值
 * @param {jQuery} obj - 需要动画的元素集合
 */
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

/**
 * 侧边栏显示/隐藏控制
 * 滚动超过一屏高度时显示回到顶部按钮
 */
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

/**
 * 页面回到顶部
 * 使用jQuery动画实现平滑滚动到页面顶部
 */
function goTop() {
    $("html,body").animate({ scrollTop: 0 }, 500);
}

/**
 * 底部导航交互
 * 移动端点击标题展开/收起导航列表
 */
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

/**
 * 二维码弹窗控制
 * 点击按钮显示二维码弹窗，支持点击遮罩层或关闭按钮关闭
 */
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

/**
 * 项目交互效果
 * 包含按钮悬停效果、底部icon悬停效果
 */
$(function() {
    // 按钮悬停效果
    $('.com_btn,.com_btn2').hover(function(){
        $(this).addClass('on')
    },function(){
        $(this).removeClass('on')
    })
    
    // 底部icon悬停效果
    $(".foot_t_r_box").hover(function(){
        $(this).addClass('on')
    },function(){
        $(this).removeClass('on')
    });
});

/**
 * 滚动导航样式控制
 * 滚动超过100px时添加导航栏激活样式
 */
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

/**
 * 选项卡切换功能（悬停切换）
 * @param {string} dj - 触发元素选择器
 * @param {string} x_id - 内容区域选择器
 */
function xxkh(dj,x_id){
    $(x_id).hide();
    $(x_id).eq(0).show();
    $(dj).hover(function(){
        $(this).addClass('on').siblings().removeClass('on');
        $(x_id).hide();
        $(x_id).eq($(this).index()).show();
    })
}

/**
 * 选项卡切换功能（点击切换）
 * @param {string} dj - 触发元素选择器
 * @param {string} x_id - 内容区域选择器
 */
function xxkc(dj,x_id){
    $(x_id).hide();
    $(x_id).eq(0).show();
    $(dj).click(function(){
        $(this).addClass('on').siblings().removeClass('on');
        $(x_id).hide();
        $(x_id).eq($(this).index()).show();
    })
}

/**
 * 滚动导航定位功能
 * 点击导航项滚动到对应区域，滚动时自动高亮对应导航项
 * @param {string} sClass - 高亮状态的class名
 * @param {jQuery} obj1 - 导航项集合
 * @param {jQuery} obj2 - 内容区域集合
 * @param {jQuery} obj3 - 需要减去高度的元素（如固定头部）
 * @param {jQuery} obj4 - 额外需要减去高度的元素
 */
function HiScrollNav(sClass, obj1, obj2, obj3, obj4) {
    // 设置减去元素的高度
    var obj3Height = 0;
    var obj4Height = 0;
    if (obj3.length != 0) {
        obj3Height = obj3.outerHeight();
    }
    if (obj4.length != 0) {
        obj4Height = obj4.outerHeight();
    }
    // 点击导航项滚动定位
    obj1.each(function() {
        $(this).click(function() {
            $("html,body").animate({
                "scrollTop": obj2.eq($(this).index()).offset().top - obj3Height - obj4Height + 1
            }, 500);
        });
    });
    // 滚动时自动定位导航项
    $(window).scroll(function() {
        hiDefault();
    });

    // 默认定位导航项
    function hiDefault() {
        obj2.each(function() {
            if ($(window).scrollTop() >= $(this).offset().top - obj3Height - obj4Height) {
                obj1.eq($(this).index()).addClass(sClass).siblings().removeClass(sClass);
            }
        });
    }
    hiDefault();
}

/**
 * PC端导航交互
 * 包含：下拉菜单、搜索框、语言切换、移动端导航等功能
 */
function navPc(){
    // 导航项悬停展开子菜单
    $('.navbox>ul>li').hover(function(){
        $(this).find('.pro_nav2').stop().slideDown(250);
        $(this).find('.pro_nav3').stop().slideDown(250);
    },function() {
        $(this).find('.pro_nav2').stop().slideUp(250);
        $(this).find('.pro_nav3').stop().slideUp(250);
    })
    
    // 关闭产品导航3
    $('.pro_nav3 .pro_nav3_tnav .container2 .g_del').click(function(){
        $('.pro_nav3').stop().slideUp(250);
        setTimeout(function(){
            $('nav').css('transition', 'all 0.6s');
        },600);
    })
    
    // 导航栏悬停效果
    $('nav').hover(function(){
        $(this).addClass('nav_on')
    },function() {
        $(this).removeClass('nav_on')
    })
    
    // 搜索框展开/收起
    $('.search_box>img').click(function(){
        $('.nav_r').addClass('ssxs');
    })
    $('.search .sc').click(function(){
        $('.nav_r').removeClass('ssxs');
    })
    
    // 语言切换下拉菜单
    $('.nav_lan').hover(function () {
        $('.nav_lan_sel').stop().slideDown();
    }, function () {
        $('.nav_lan_sel').stop().slideUp();
    });
    
    // 移动端导航标题点击展开
    $('.c-title-box').click(function(){
        $(this).parent().toggleClass('on').siblings().removeClass('on');
        $(this).parent().find('.c-title-con').slideToggle();
        $(this).parent().siblings().find('.c-title-con').slideUp()
    })
    
    // 二级导航点击展开三级导航
    $('.nav_two_tit').click(function(){
        $(this).parent().find('.nav_three').stop().slideToggle();
        $(this).parent().siblings().find('.nav_three').stop().slideUp()
    })
}
navPc();

/**
 * 移动端导航交互
 * 包含：导航显示/隐藏、滚动时导航样式变化等功能
 */
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
    
    // 手机端导航显示/隐藏切换按钮
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

    // 窗口大小变化时隐藏移动端导航
    $(window).resize(function() {
        if ($("#g-header .c-nav").css("display") == "block") {
            oBody.removeClass('c-open');
        }
    });

    // 鼠标移入导航栏时添加样式
    oHead.hover(function() {
        $(this).addClass("c-style2");
    }, function() {
        if (i <= oHead.outerHeight() && oP.length == 0) {
            $(this).removeClass("c-style2");
        } else {
            $(this).addClass("c-style2");
        }
    });

    // 滚动时导航栏样式变化
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

/**
 * 移动端底部导航交互
 * 点击标题展开/收起导航列表（仅在屏幕宽度小于767px时生效）
 */
if ($(window).width() < 767) {
    $('.foot_nav .a_tit').click(function() {
        $(this).toggleClass('on');
        $(this).parent().siblings().find('.a_tit').removeClass('on');
        $('.foot_nav ul').stop().slideUp(250);
        $(this).parent().find('ul').stop().slideToggle(250);
    })
}

/**
 * 导航搜索框交互
 * 点击搜索按钮展开搜索框，点击关闭按钮或其他区域收起搜索框
 */
$('.nav_search').click(function () {
    $('.navSearch').stop().slideDown()
});
$('.navSearch_del').click(function () {
    $('.navSearch').stop().slideUp()
});

// 点击页面其他区域收起搜索框
$("body").click(function (e) {
    if (!$(e.target).closest(".navSearch,.nav_search").length) {
        $('.navSearch').stop().slideUp()
    }
});

/* ==================== 产品详情页面组件 ==================== */

/**
 * 产品特性展示组件
 * 使用Swiper实现淡入淡出切换效果
 */
function innerProDisplay() {
    let divBox = document.getElementById('innerProDisplay');
    if(!divBox) return;
    
    let pager = divBox.querySelector('.pager');
    new Swiper(divBox, {
        speed: 1000,
        effect: 'fade',
        fadeEffect: {crossFade: true},
        pagination: {el: pager, clickable: true, bulletActiveClass: 'active'},
    });
}
innerProDisplay();

/**
 * 产品参数展示组件
 * 使用Swiper实现多卡片横向滑动，支持响应式布局
 */
function innerProductParameter() {
    let divBox = document.getElementById('innerProductParameter');
    if (!divBox) return;
    
    let swiperBox = divBox.querySelector('.swiper-box'),
        prev = divBox.querySelector('.prev'),
        next = divBox.querySelector('.next');

    new Swiper(swiperBox, {
        speed: 1000,
        slidesPerView: 4,
        spaceBetween: 40,
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

/**
 * 产品详情展示组件
 * 使用Swiper实现带选项卡的详情切换，支持入场动画
 */
function innerProDetails() {
    let divBox = document.getElementById('innerProDetails');
    if (!divBox) return;
    
    let tabs = divBox.querySelector('.tabs-box'),
        swiperBox = divBox.querySelector('.swiper-box');

    let swiper = new Swiper(swiperBox, {
        speed: 1000,
        effect: 'fade',
        fadeEffect: {crossFade: true},
        on:{
            init(){
                swiperAnimateCache(this);
                swiperAnimate(this);
            }, 
            slideChangeTransitionEnd(){ 
                swiperAnimate(this);
            } 
        }
    });
    
    // 选项卡点击切换
    Array.from(tabs.children).forEach((tab, idx) => tab.onclick = function() {
        tabs.querySelector('.active').classList.remove('active');
        this.classList.add('active');
        swiper.slideTo(idx);
    });
}
innerProDetails();

/**
 * 行业应用系列产品组件
 * 使用Swiper实现多卡片循环滚动
 */
function innerProApplications() {
    let divBox = document.getElementById('innerProApplications');
    if (!divBox) return;
    
    let swiperBox = divBox.querySelector('.swiper-box'),
        prev = divBox.querySelector('.prev'),
        next = divBox.querySelector('.next');

    new Swiper(swiperBox, {
        speed: 1000,
        slidesPerView: 3,
        spaceBetween: 30,
        loop: true,
        navigation: {nextEl: next, prevEl: prev},
        breakpoints: {
            1600: {spaceBetween: 24},
            991: {slidesPerView: 2, spaceBetween: 20},
            768: {slidesPerView: 1.2, spaceBetween: 20},
        }
    });
}
innerProApplications();

/**
 * 相关案例展示组件
 * 使用Swiper实现多卡片横向滑动
 */
function innerRelatedCases() {
    let divBox = document.getElementById('innerRelatedCases');
    if (!divBox) return;
    
    let swiperBox = divBox.querySelector('.swiper-box'),
        prev = divBox.querySelector('.prev'),
        next = divBox.querySelector('.next');

    new Swiper(swiperBox, {
        speed: 1000,
        slidesPerView: 4,
        spaceBetween: 40,
        navigation: {nextEl: next, prevEl: prev},
        breakpoints: {
            1600: {spaceBetween: 30},
            1280: {slidesPerView: 3, spaceBetween: 20},
            991: {slidesPerView: 2, spaceBetween: 20},
            767: {slidesPerView: 1, spaceBetween: 20},
        }
    });
}
innerRelatedCases();

/**
 * 产品质量认证logo滚动组件
 * 使用GSAP实现无限循环滚动效果
 */
function innerProScroll() {
    let divBox = document.getElementById('innerProScroll');
    if (!divBox) return;
    
    // 复制logo实现无缝滚动
    [...divBox.querySelectorAll('.slide-logo')].forEach(slide => divBox.appendChild(slide.cloneNode(true)));
    let slides = [...divBox.querySelectorAll('.slide-logo')];

    gsap.to(slides, {
        duration: slides.length / 2 * 5,
        ease: 'none',
        xPercent: -100 * (slides.length / 2),
        repeat: -1
    });
}
innerProScroll();

/**
 * FAQ手风琴组件
 * 使用GSAP实现平滑展开/收起动画
 */
function innerFaq() {
    let divBox = document.getElementById('innerFaq');
    if (!divBox) return;
    
    // 获取隐藏元素的真实高度
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
                    gsap.to(content, {
                        onStart() { content.style.display = 'block'; },
                        height: cH,
                        marginTop: 20,
                        onComplete() { isClick = true; }
                    });
                } else {
                    slide.classList.remove('active');
                    gsap.to(content, {
                        height: 0,
                        marginTop: 0,
                        onComplete() {
                            content.style = '';
                            isClick = true;
                        }
                    });
                }
            }
        }
    });
}
innerFaq();

/**
 * 禁止页面滚动事件
 * 在弹窗打开时阻止页面滚动，允许特定元素滚动
 */
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

/**
 * 联系我们弹窗组件
 * 点击按钮显示弹窗，支持平滑显示/隐藏动画，阻止背景滚动
 */
function alertContact() {
    let btn = document.getElementById('alertContactBtn'),
        box = document.getElementById('alertContactBox');

    if (!btn) return;
    if (!box) return;
    
    let close = box.querySelector('.close');

    btn.onclick = function() {
        box.classList.add('active');
        gsap.to(box, {duration: .5, autoAlpha: 1});
        document.addEventListener('wheel', onNoWheel, {passive: false});
    };
    
    close.onclick = function() {
        box.classList.remove('active');
        gsap.to(box, {duration: .5, autoAlpha: 0});
        document.removeEventListener('wheel', onNoWheel);
    };
}
alertContact();

// 右侧浮窗回到顶部（重复定义，保持兼容性）
$(".pop_a:last-child").click(function(){
    $('body,html').animate({scrollTop:0},300);
    $('nav').removeClass('nav1_none');
});

// 滚动时右侧浮窗显示/隐藏（重复定义，保持兼容性）
$(window).scroll(function() {
    if ($(window).scrollTop() > $(window).height()/2) {
        $('.gpop').fadeIn(250);
    } else {
        $('.gpop').fadeOut(250);
    }
});

// 右侧浮窗悬停效果（重复定义，保持兼容性）
$(".pop_a").hover(function(){
    $(this).addClass('on')
},function(){
    $(this).removeClass('on')
});