jQuery(function () {
  var ticket = 'e40e7004-4c8a-4963-8564-31271a8337d8';
  if (location.host.indexOf('club.lenovo') > -1) {
    ticket = '6eb69994-0885-46e2-8b20-b5b35e10822a';
  } else if (location.host.indexOf('b.lenovo') > -1) {
    ticket = '50690e2e-bf8e-4aeb-a8b1-7a03537d1927';
  } else if (
    location.host.indexOf('biz.lenovo') > -1 ||
    location.host.indexOf('sol.lenovo') > -1 ||
    location.host.indexOf('xcloud.lenovo.com') > -1 ||
    location.host.indexOf('ics-home.earth.xpaas.lenovo.com') > -1
  ) {
    ticket = 'fd99c0db-0720-4512-a570-5bfaae21557a';
  } else if (location.host.indexOf('learningcenter.lenovo') > -1 || location.host.indexOf('lglc.lenovo') > -1) {
    ticket = '336ee7ea-ad9a-4c85-842c-aa96cf6c694d';
  } else {
    ticket = 'e40e7004-4c8a-4963-8564-31271a8337d8';
  }
  var isBizSol = window.location.href.indexOf('biz.lenovo') > -1 || window.location.href.indexOf('sol.lenovo') > -1;
  var isBiz = window.location.href.indexOf('biz.lenovo') > -1;

  var userIsLogin = window.passport && window.passport.isLogin();
  var papiDomainPlus = 'https://b.lenovo.com.cn';
  var shopDomain = 'https://shop.lenovo.com.cn';
  var isProduction = true;
  var bDomain = 'https://b.lenovo.com.cn';

  // 解决方案嵌入乐享，指定页面直接显示侧边栏
  var isSpecialPage = letask && letask.isCurrentUrlInList(true);
  // biz下购物车链接
  var bizShoppingCartUrl = 'https://biz.lenovo.com.cn/cart/index.html';
  // biz下个人中心链接  &&  头像
  var bizUserCenterUrl = 'https://biz.lenovo.com.cn/membercenter/userInfo/index.html?sts=' + ticket;
  // biz下优惠券链接
  var bizCouponUrl = 'https://biz.lenovo.com.cn/membercenter/mycoupon/index.html';
  // biz下累计消费链接 && 我的订单
  var bizOrderUrl = 'https://biz.lenovo.com.cn/order/index.html';
  if (window.location.href.indexOf('lenovouat') != -1) {
    bizShoppingCartUrl = 'https://biz.lenovouat.com/cart/index.html';
    bizUserCenterUrl = 'https://biz.lenovouat.com/membercenter/userInfo/index.html?sts=' + ticket;
    bizCouponUrl = 'https://biz.lenovouat.com/membercenter/mycoupon/index.html';
    bizOrderUrl = 'https://biz.lenovouat.com/order/index.html';
    shopDomain = 'https://shop.lenovouat.com';
    papiDomainPlus = 'https://b.lenovouat.com';
    isProduction = false;
    bDomain = 'https://b.lenovouat.com';
  } else {
    shopDomain = 'https://shop.lenovo.com.cn';
    papiDomainPlus = 'https://b.lenovo.com.cn';
    isProduction = true;
    bDomain = 'https://b.lenovo.com.cn';
  }

  if (isBizSol) {
    // 处理导航购物车跳转biz
    jQuery('.ul_r_2018 .car a').attr('href', bizShoppingCartUrl);
    jQuery('.ul_r_2018 .car a').attr('latag', 'latag_pc_header_mycenter_null_购物车_' + bizShoppingCartUrl);
  }

  var curDomain = window.location.href;
  // 判断是否为详情页b和item
  var isItemOrBProduct =
    curDomain.indexOf('b.lenovo.com.cn/product') != -1 ||
    curDomain.indexOf('b.lenovouat.com/product') != -1 ||
    curDomain.indexOf('biz.lenovo.com.cn/solution') != -1 ||
    curDomain.indexOf('biz.lenovouat.com/solution') != -1 ||
    curDomain.indexOf('biz.lenovo.com.cn/pd') != -1 ||
    curDomain.indexOf('biz.lenovouat.com/pd') != -1 ||
    curDomain.indexOf('item.lenovo.com.cn/product') != -1 ||
    curDomain.indexOf('item.lenovouat.com/product') != -1;
  var isBrand = curDomain.indexOf('brand.lenovo') != -1 || window.location.host.indexOf('activity') != -1;

  /**
   * 获取url中的查询参数
   * @param name
   * @returns {*}
   */
  function queryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return decodeURIComponent(r[2]);
    }
    return null;
  }
  // 修改 Logo 链接

  if (isProduction) {
    if (window.location.host == 's.lenovo.com.cn') {
      switch (queryString('source')) {
        case 'qyg':
          jQuery('#public_head_logo a').attr('href', 'https://b.lenovo.com.cn/');
          break;
        case 'fromwww':
          jQuery('#public_head_logo a').attr('href', 'https://www.lenovo.com.cn/');
          break;
        default:
          jQuery('#public_head_logo a').attr('href', 'https://shop.lenovo.com.cn/');
      }
    }
  } else {
    if (window.location.host == 's.lenovouat.com') {
      switch (queryString('source')) {
        case 'qyg':
          jQuery('#public_head_logo a').attr('href', 'https://b.lenovouat.com/');
          break;
        case 'fromwww':
          jQuery('#public_head_logo a').attr('href', 'https://www.lenovouat.com/');
          break;
        default:
          jQuery('#public_head_logo a').attr('href', 'https://shop.lenovouat.com/');
      }
    }
  }

  function getuserimg() {
    var lenovoid = passport.cookie.lenovoId;
    for (var i = passport.cookie.lenovoId.length; i < 20; i++) {
      lenovoid = '0' + lenovoid;
    }
    var userherf = window.location.href.indexOf('lenovouat') > -1 || window.location.href.indexOf('lglc.lenovo.com') > -1 ? '//i.lenovouat.com' : '//i.lenovo.com.cn';
    var url =
      'https://i.app.lefile.cn/uc_server/data/avatar' +
      '/' +
      lenovoid.substring(0, 5) +
      '/' +
      lenovoid.substring(5, 10) +
      '/' +
      lenovoid.substring(10, 15) +
      '/' +
      lenovoid.substring(15, lenovoid.length) +
      '_profilehead.w50' +
      '.jpg';
    // jQuery(".uer_img").attr("src", url);
    // 兼容联想智学页面使用
    var targetUrl = '';
    if (window.location.host == 'learningcenter.lenovo.com') {
      targetUrl = 'https://learningcenter.lenovo.com/api/getUserNameAndUserLevel?lenovoId=' + passport.cookie.lenovoId + '&sts=e40e7004-4c8a-4963-8564-31271a8337d8';
    } else {
      targetUrl = 'https:' + userherf + '/mcenter/getUserNameAndUserLevel.jhtml?lenovoId=' + passport.cookie.lenovoId + '&sts=e40e7004-4c8a-4963-8564-31271a8337d8';
    }
    jQuery.ajax({
      //用户id 和昵称等级请求
      url: targetUrl,
      type: 'get',
      dataType: 'jsonp',
      async: false,
      jsonp: 'callback',
      success: function (data) {
        if (data.ret) {
          jQuery('.uer_img').attr('src', data.data.image);
          jQuery('.user').find('.userNameNav').html(data.data.username);
          jQuery('.user_id').find('.noName').html(data.data.username);
          var userLeveSrc = 'https://p3.lefile.cn/product/adminweb/2019/01/22/f1d4b5d5-b229-4bb5-93f4-7f0e64b274fe.png';
          if (passport.cookie.isLenovo == '1') {
            // userLeveSrc = 'https://p2.lefile.cn/product/adminweb/2020/10/13/b228d9fc-3e4c-4ab4-8552-c054a39081b8.png'
            userLeveSrc = 'https://p2.lefile.cn/fes/cms/2022/10/18/diamondWhite.png';
          } else {
          }

          jQuery('.user').find('.userLeve').attr('src', userLeveSrc);
          jQuery('.myCenter').find('.img_vp').attr('src', userLeveSrc);
          // jQuery(".myCenter").find(".user_vp").html(userName);

          // 加载页面时，修改智能推荐轮播图中会员卡片头像和名称(企业购相关)
          //头像
          jQuery('.banner-user-info').find('.user-head-img').attr('src', data.data.image);
          //名字
          jQuery('.banner-user-info').find('.right-user-info-name').html(data.data.username);
          // 隐藏等级
          // jQuery(".right-user-info-level").hide();
        }
      },
      error: function (e) {
        console.log(e);
      },
    });

    //先判断下有没有横条组件,没有横条组件不请求数据
    if (jQuery('.top-out-box20200914').length > 0 || jQuery('.banner-user-info').length > 0) {
      // 获取会员信息
      enterpriseCenter();
    }
    jQuery('.user').hover(function () {
      if (hoveruser) {
        enterpriseCenter();
      }
    });

    function getMsgCountInfo() {
      //显示是否有消息
      var msgherf = window.location.href.indexOf('lenovouat') > -1 || window.location.href.indexOf('lglc.lenovo.com') > -1 ? '//i.lenovouat.com' : '//i.lenovo.com.cn';
      if (window.passport && window.passport.isLogin() && window.passport.cookie) {
        jQuery.ajax({
          url: msgherf + '/internal/msg/getUnReadMsg.jhtml?sts=e40e7004-4c8a-4963-8564-31271a8337d8',
          dataType: 'jsonp',
          type: 'get',
          jsonpCallback: 'defaultcallback',
          success: function (res) {
            if (res.ret) {
              if (res.count && res.count > 0) {
                jQuery('.msg_heaer').find('img').attr('src', 'https://p1.lefile.cn/product/adminweb/2018/12/29/bc5a12fe-f9fc-40ca-b92f-08bf3d8e9ae5.png');
              }
            }
          },
          error: function (a, b, c) {},
        });
      } else {
        return;
      }
    }

    // getMsgCountInfo();
  }
  var leovoBbs = false;
  if (window.location.href.indexOf('club.lenovo.com.cn') != -1 || window.location.href.indexOf('bbs.thinkpad.com') != -1) {
    leovoBbs = true;
  }
  //初始化登录
  passport.init({
    ticket: ticket,
    drawUserInfo: function () {
      jQuery('.hd-login-regist').hide();
      jQuery('.hd-login-show').show();
      getuserimg();
    },
    login: function () {
      window.location.replace(document.URL);
      if (leovoBbs) {
        loginsucess_club();
      }
    },
    logout: function () {
      // window.location.replace(document.URL)
      history.go(0);
      if (leovoBbs) {
        logoutsucess_club();
      }
    },
  });
  jQuery('body')
    .delegate('.login', 'click', function () {
      passport.show();
    })
    .delegate('.logout', 'click', function () {
      passport.doLogout();
    });
  // .delegate('.regist_btn_plat', 'click', function () {
  //     window.open('_blank').location= iDomain + '/auth/v1/regist?ru=' + window.location + '&ticket=e40e7004-4c8a-4963-8564-31271a8337d8';
  // })

  //老版兼容代码
  function openlogin(url) {
    logobj.showlogin(function () {
      window.location.href = url;
    });
  }

  var logobj = {
    showlogin: function (fn) {
      passport.show();
      if (typeof fn == 'function') {
        console.log('您在不恰当的位置设置了登陆后的跳转,为了保证安全，页面将会对您的设置进行延迟跳转(2s)');
        passport.login = function () {
          setTimeout(fn, 2000);
        };
      }
    },
  };

  var hoveruser = true;
  // 气泡送XX
  function giveGiftFnHead() {
    var giveGiftUrl = window.location.href.indexOf('lenovouat') > -1 || window.location.href.indexOf('lglc.lenovo.com') > -1 ? '//i.lenovouat.com' : '//i.lenovo.com.cn';
    jQuery.ajax({
      //用户id 和昵称等级请求
      url: giveGiftUrl + '/regist/selectRegistAll.jhtml?sts=' + ticket,
      type: 'get',
      dataType: 'jsonp',
      jsonpCallback: 'qcallback',
      success: function (res) {
        if (res.result.principalBubble) {
          jQuery('.songledou').text(res.result.principalBubble);
          jQuery('.songledou').css('visibility', 'visible');
        } else {
          jQuery('.songledou').css('visibility', 'hidden');
        }
      },
      error: function (e) {
        console.log(e);
      },
    });
  }
  //  判断展示企业会员卡片数据还是普通会员卡片数据
  function enterpriseCenter() {
    // 气泡推送
    giveGiftFnHead();
    var enterpriseherf = window.location.href.indexOf('lenovouat') > -1 || window.location.href.indexOf('lglc.lenovo.com') > -1 ? '//i.lenovouat.com' : '//i.lenovo.com.cn';

    let targetUrl = '';
    if (window.location.host == 'learningcenter.lenovo.com') {
      targetUrl = 'https://learningcenter.lenovo.com/api/getEnterpriseUserAssetsInfo?lenovoId=' + passport.cookie.lenovoId + '&sts=e40e7004-4c8a-4963-8564-31271a8337d8';
    } else {
      targetUrl = 'https:' + enterpriseherf + '/mcenter/getEnterpriseUserAssetsInfo.jhtml?lenovoId=' + passport.cookie.lenovoId + '&sts=e40e7004-4c8a-4963-8564-31271a8337d8';
    }
    jQuery.ajax({
      //用户优惠券等数量请求
      url: targetUrl,
      type: 'get',
      dataType: 'jsonp',
      jsonpCallback: 'callback',
      success: function (data) {
        if (data.res) {
          // 设置背景
          if (data.data.blackMemberInfo) {
            switch (data.data.blackMemberInfo.level) {
              case '110':
                // 白银
                jQuery('.ul_r_2018 .myCenter').addClass('bg_sliver');
                jQuery('.ul_r_2018 .blackgold-title-icon').addClass('sliver_icon');
                break;
              case '120':
                // 黄金
                jQuery('.ul_r_2018 .myCenter').addClass('bg_gold');
                jQuery('.ul_r_2018 .blackgold-title-icon').addClass('gold_icon');
                break;
              case '130':
                // 铂金
                jQuery('.ul_r_2018 .myCenter').addClass('bg_patinum');
                jQuery('.ul_r_2018 .blackgold-title-icon').addClass('patinum_icon');
                break;
              case '140':
                jQuery('.ul_r_2018 .myCenter').addClass('bg_drill');
                jQuery('.ul_r_2018 .blackgold-title-icon').addClass('drill_icon');
                break;
              default:
                jQuery('.ul_r_2018 .myCenter').css('background', 'url(https://p2.lefile.cn/fes/cms/2022/08/01/card_sliver_1.png)');
                jQuery('.ul_r_2018 .blackgold-title-icon').css({
                  background: 'url(https://p1.lefile.cn/fes/cms/2022/08/01/pc-card-by.png.png) no-repeat center center',
                  'background-size': '100%',
                });
                break;
            }
            jQuery('.ul_r_2018 .blackgold-title-icon').show();
          }

          bindEnterpriseData(data.data);
          hoveruser = false;
        }
      },
      error: function (e) {
        console.log(e);
      },
    });
  }

  // 金额处理，大于1万显示万元，取两位小数向上取整
  function moneyUnit(num) {
    // var numInit = Number(num);
    // if (numInit < 10000) {
    //     return (Math.ceil(numInit * 100, 2) / 100) + "元";
    // } else {
    //     return (Math.ceil((numInit / 10000) * 100, 2) / 100) + "万";
    // }
    return Math.ceil(num) + '元';
  }

  function bindEnterpriseData(data) {
    // 成长值
    var myUserGrowthValue = data.blackMemberInfo && data.blackMemberInfo.userGrowthValue ? data.blackMemberInfo.userGrowthValue : 0;
    // 会员卡面（是企业会员）
    if ('1' == data.memberType) {
      var enterpriseLeveSrc = 'https://p2.lefile.cn/fes/cms/2022/10/18/diamondWhite.png';
      jQuery('.user').find('.userLeve').attr('src', enterpriseLeveSrc);
      // 展示蓝色卡面，企业名称
      if (data.enterpriseName) {
        //公共头、 横条数据增加公司名称、智能推荐轮播图组件-企业会员卡片增加名称
        jQuery('.company-info').html(data.enterpriseName);
        jQuery('.banner-user-info .user-level').html(data.currentLevel ? data.currentLevel : '企业会员');
        // 公共头卡片、增加企业乐豆、优惠券、 待支付订单、 待收货订单。
        jQuery('.userledouBox .userledou').html(data.ledou ? data.ledou : '--');
        jQuery('.usercouponBox .usercoupon').html(data.coupon ? data.coupon : '--');
        jQuery('.enterpriseCenter .usernopayorder-count').html(data.unPayCount ? data.unPayCount : '--');
        jQuery('.enterpriseCenter .userunreceive-count').html(data.unReceiveCount ? data.unReceiveCount : '--');

        // 智能推荐轮播图组件-企业会员卡片增加优惠券
        jQuery('.user-level-info-box .rmb-total').html(data.currentDiscount ? data.currentDiscount : '--');
        jQuery('.user-level-info-box .usercoupon').html(data.coupon ? data.coupon : '--');
        jQuery('.right-user-info .right-user-info-level').show();
        jQuery('.right-user-info .go-up-level').hide();
      }
      // data.currentLevel == '三级会员' || data.currentLevel == '钻石会员'
      if (data.isAllowApplyDiamond == true || data.isAllowApplyDiamond == 'true') {
        // 卡片
        jQuery('.applyVip').show();
        jQuery('.applyVip').on('click', function () {
          window.location.replace(bDomain + '/membercenter/diamond/index.html?sts=e40e7004-4c8a-4963-8564-31271a8337d8');
        });
        // 企业购横条
        jQuery('.companyPlus').show();
        jQuery('.companyPlus').on('click', function () {
          window.location.replace(papiDomainPlus + '/membercenter/diamond/index.html?sts=e40e7004-4c8a-4963-8564-31271a8337d8');
        });
        // 智能推荐轮播图
        jQuery('.levelPlus').show();
        jQuery('.levelPlus').on('click', function () {
          window.location.replace(papiDomainPlus + '/membercenter/diamond/index.html?sts=e40e7004-4c8a-4963-8564-31271a8337d8');
        });
      } else {
        // 卡片
        jQuery('.applyVip').hide();
        jQuery('.companyPlus').hide();
        jQuery('.levelPlus').hide();
      }

      // 在对应组 &&  是否有规则（折扣）
      if (data.validate && data.haveLevel) {
        // 卡片数据三块数据
        jQuery('.userScoreBox  .companyScoreName').html('累计消费(元)');
        if (data.currentDiscount != null && data.currentDiscount != '' && data.currentDiscount != undefined) {
          // 横条数据处理
          var _nextCount = '<div class="have-next-discount"><span>累计消费</span><span>' + moneyUnit(data.currentDiscount) + '</span></div>';
          jQuery('.next-discount-info').html(_nextCount);
          // 横条卡片数据添加
          jQuery('.userScoreBox .companyScore').html(Math.ceil(data.currentDiscount));
        } else {
          jQuery('.userScoreBox .companyScore').html(0);
        }

        // 卡片数据四块数据
        if (data.currentLevel != null && data.currentLevel != '' && data.currentLevel != undefined) {
          // 卡片第四块数据
          jQuery('.userGrowthBox .companyGrowth').html(data.currentLevel);
          //横条第二块数据
          jQuery('.discount-info .discount-number').html(data.currentLevel);
        } else {
          // 卡片第四块数据
          jQuery('.userGrowthBox .companyGrowth').html('-');
          // 横条数据第二块数据
          jQuery('.discount-info .discount-number').html('-');
        }

        jQuery('.userScoreBox .company-box').show().siblings().hide();
        jQuery('.userGrowthBox .company-box').show().siblings().hide();
      } else {
        // 卡片-展示权益
        jQuery('.userGrowthBox .name').html('成长值');
        jQuery('.userGrowthBox .userGrowth').html(myUserGrowthValue);
        jQuery('.userScoreBox .name').html('消费积分');
        jQuery('.userScoreBox .userScore').html(data.userScore);

        // 横条成长值消费积分
        var curDiscount = '<span class="discount-name">成长值：</span><span class= "discount-number" >' + myUserGrowthValue + '</span > ';
        var _nextCount = '<div class="highest-discount"><span>消费积分：' + data.userScore + '</span></div>';
        jQuery('.discount-info').html(curDiscount);
        jQuery('.next-discount-info').html(_nextCount);

        //隐藏卡片消费积分
        jQuery('.userScoreBox').hide();
        //隐藏横条组件消费积分
        jQuery('.next-discount-info').hide();
      }

      var tag = true;
      var cardTime = 60;
      // 倒计时
      var getRandomCode = function () {
        if (cardTime == 0) {
          cardTime = 60;
          clearInterval(timer);
          jQuery('.down-time').hide();
          jQuery('.send-mail').css('display', 'inline-block');
          tag = true;
          return;
        } else {
          cardTime--;
          jQuery('.down-time').html('已发送 ' + cardTime);
        }
        var timer = setTimeout(function () {
          getRandomCode();
        }, 1000);
      };

      // 点击卡片发给送发送邮件
      jQuery(document).on('click', '.send-mail', function () {
        var url = window.location.href.indexOf('lenovouat') > -1 || window.location.href.indexOf('lglc.lenovo.com') > -1 ? '//i.lenovouat.com/' : '//i.lenovo.com.cn/';
        if (tag) {
          tag = false;
          jQuery.ajax({
            type: 'GET',
            url: url + 'info/sendEnterprisePrincipalEmailJsonp.jhtml',
            data: {
              sts: ticket,
            },
            dataType: 'jsonp',
            jsonp: 'callback',
            success: function (data) {
              if (data.ret == 1) {
                alert(data.msg);
                jQuery('.send-mail').css('display', 'inline-block');
                jQuery('.down-time').hide();
                tag = true;
                return;
              }

              getRandomCode();
              jQuery('.send-mail').hide();
              jQuery('.down-time').css('display', 'inline-block');
            },
            error: function (jqXHR, textStatus, errorThrown) {
              alert(errorThrown);
            },
          });
        }
      });

      jQuery('.right-img').on('click', function () {
        window.open('https://help.lenovo.com.cn/b/qycgfzr.html');
      });

      //点击认证企业采购负责人
      jQuery('.rz-btn-outer,.modify-btn').on('click', function () {
        var url = window.location.href.indexOf('lenovouat') > -1 || window.location.href.indexOf('lglc.lenovo.com') > -1 ? 'https://b.lenovouat.com/' : 'https://b.lenovo.com.cn/';
        window.location.href = url + 'sep/rediret.jhtml?sts=50690e2e-bf8e-4aeb-a8b1-7a03537d1927';
      });

      jQuery('.enterpriseCenter').show();
      jQuery('.top-out-box20200914').show();
      jQuery('.myCenter').hide();

      // 采购负责人没有在对应组
      if (!data.validate) {
        // 卡片隐藏认证企业采购负责人入口按钮
        jQuery('.rz-btn-outer').hide();
        // 隐藏横条
        jQuery('.top-out-box20200914').hide();
      } else {
        // 是否为企业用户
        if (data.isPrincipal) {
          if ('1' == data.approvalStatus) {
            // 企业负责人是否激活。1 是 0否
            if ('1' == data.isAcvicated) {
              //激活显示认证成功状态
              jQuery('.success-btn-box').siblings().hide();
              jQuery('.success-btn-box').show();
            } else {
              //未激活-发送邮件去认证
              jQuery('.mail-btn-box').siblings().hide();
              jQuery('.mail-btn-box').show();
            }
          } else if ('0' == data.approvalStatus) {
            // 展示审批中
            jQuery('.sh-btn').siblings().hide();
            jQuery('.sh-btn').show();
          } else {
            // 展示认证企业采购负责人
            jQuery('.rz-btn-outer').siblings().hide();
            jQuery('.rz-btn-outer').show();
          }
        } else {
          // 展示认证企业采购负责人
          jQuery('.rz-btn-outer').siblings().hide();
          jQuery('.rz-btn-outer').show();
        }
      }

      if (data.currentLevel == '钻石Plus' || data.currentLevel == '钻石plus') {
        jQuery('.user_id .user_vp').html('钻石Plus会员');
        jQuery('.user_id').find('.img_vp').attr('src', 'https://p4.lefile.cn/fes/cms/2022/10/18/diamondYellow.png');
        jQuery('.right-user-info').find('.level-img').attr('src', 'https://p4.lefile.cn/fes/cms/2022/10/18/diamondYellow.png');
      }

      jQuery('.userledou')
        .html(data.qyScore)
        .siblings('span')
        .html('企业积分')
        .parent()
        .attr('href', bDomain + '/membercenter/intergral/index.html');

      if (isBizSol) {
        // 卡片隐藏企业采购负责人信息
        jQuery('.principal-info').html(`<div class="discount-more">
                        <span class="discount-name">惠享值：</span>
                        <span class="discount-info">${data.benefitEnjoyScore}</span>
                        <a  target="_blank" href="${
                          window.location.href.indexOf('lenovouat') > -1
                            ? 'https://biz.lenovouat.com/membercenter/benefit-value/index.html'
                            : 'https://biz.lenovo.com.cn/membercenter/benefit-value/index.html'
                        }" class="more-btn" latag="latag_pc_header_mycenter_0_获取更多_https://biz.lenovo.com.cn/membercenter/benefit-value/index.html">获取更多</a>
                       </div>`);
        jQuery('.discount-box .discount').html(data.benefitEnjoyFund);
        jQuery('.discount-box').show();

        // 卡片隐藏申请钻石Plus按钮
        jQuery('.applyVip').hide();
        // 卡片隐藏企业积分
        jQuery('.userledouBox').hide();
        // 卡片隐藏当前等级
        jQuery('.userGrowthBox').hide();

        if (isBiz) {
          // 卡片显示专属客服
          jQuery('.customer-service').hide();
          jQuery('.usernopayorder').show();
          jQuery('.userunreceiveorder').show();
          jQuery('.userledouBox').hide();
          jQuery('.userScoreBox').hide();
          jQuery('.userGrowthBox').hide();
          jQuery('.customer-service').hide();
          jQuery('.customer-service').hide();
        } else {
          // 卡片显示专属客服
          jQuery('.customer-service').show();
        }

        // 卡片点击头像 && 会员中心跳转biz
        jQuery('.enterpriseCenter .biz-tag').attr('href', bizUserCenterUrl);
        jQuery('.enterpriseCenter .biz-tag').attr('latag', 'latag_pc_header_mycenter_null_个人信息_' + bizUserCenterUrl);
        jQuery('.enterpriseCenter .bottom .user-center a').attr('href', bizUserCenterUrl);
        jQuery('.enterpriseCenter .bottom .user-center a').attr('latag', 'latag_pc_header_mycenter_null_会员中心_' + bizUserCenterUrl);
        // 卡片点击优惠券跳转biz
        jQuery('.enterpriseCenter .usercouponBox a').attr('href', bizCouponUrl);
        jQuery('.enterpriseCenter .usercouponBox a').attr('latag', 'latag_pc_header_mycenter_null_优惠券_' + bizCouponUrl);
        // 卡片点击累计消费、我的订单跳转biz
        jQuery('.enterpriseCenter .userScoreBox a').attr('href', bizOrderUrl);
        jQuery('.enterpriseCenter .userScoreBox a').attr('latag', 'latag_pc_header_mycenter_null_累计消费_' + bizOrderUrl);
        jQuery('.enterpriseCenter .my-order a').attr('href', bizOrderUrl);
        jQuery('.enterpriseCenter .my-order a').attr('latag', 'latag_pc_header_mycenter_null_我的订单_' + bizOrderUrl);
      }
    } else {
      // 展示之前的黄色卡面
      jQuery('.userledou').html(data.ledou);
      jQuery('.usercoupon').html(data.coupon);
      jQuery('.userScore').html(data.userScore);
      jQuery('.userGrowth').html(myUserGrowthValue);
      hoveruser = false;
      jQuery('.enterpriseCenter').hide();
      jQuery('.top-out-box20200914').hide();
      // 黑金会员样式调整
      var domain = getDomain(window.location.href);
      isBlackGold(domain);
      jQuery('.myCenter').show();

      // 已登录、不是企业会员,展示咨询热线，隐藏优惠券等信息
      jQuery('.user-level-info-box').hide();
      jQuery('.user-level-tel-box').show();

      // 展示升级为企业会员按钮，隐藏登录注册
      jQuery('.banner-user-info .right-user-info-level').hide();
      jQuery('.banner-user-info .go-up-level').show();
    }

    if (window.location.href.indexOf('b.lenovo') > -1) {
      // 修改卡片中工作台，发票管理，专属客服
      jQuery('.enterpriseCenter .bottom .work-platform a').attr('href', bDomain + '/membercenter/workbentch/index.html');
      jQuery('.enterpriseCenter .bottom .invoice-mgm a').attr('href', bDomain + '/membercenter/invoice/index.html');
      jQuery('.enterpriseCenter .bottom .personalservice a').attr('href', 'https://lecs.lenovo.com.cn/chat.html?ttc=1&skc=30127');
    }
  }

  function getDomain(url) {
    var domain = /\/\/([^\/]+)/.exec(url)[1];
    var arr = domain.split('.').slice(-3);
    if (arr.length == 2) {
      return domain;
    } else {
      if (arr[1] == 'com') {
        return arr.join('.');
      } else {
        return arr[1] + '.' + arr[2];
      }
    }
  }

  //获取是否黑金用户
  function isBlackGold(domain) {
    jQuery.ajax({
      type: 'get',
      async: true,
      // 改为调用首页列表banner数据的接口
      url: 'https://i.' + domain + '/blackMember/query.jhtml',
      data: {
        lenovoId: passport.cookie.lenovoId,
        sts: 'e40e7004-4c8a-4963-8564-31271a8337d8',
      },
      dataType: 'jsonp',
      jsonp: 'callback',
      // jsonpCallback: "flightHandlers",
      success: function (data) {
        var isProEnv = window.location.href.indexOf('lenovouat') > -1 || window.location.href.indexOf('lglc.lenovo.com') > -1;
        if (data != null) {
          // 判断是否黑金用户
          var isBlackGoldMember = data['payMember'];
          var isYogaMember = data['yogaMember'];
          // 黑金会员
          if (isBlackGoldMember || isYogaMember) {
            // 显示黑金卡
            jQuery('.my-black-card').show();
          } else {
            // 显示去认证黑金
            // jQuery('.mycard-subtitle-link').show()
          }
        }
      },
      error: function (e) {
        console.log(e);
      },
    });
  }
  jQuery('body').on('click', '.my-black-card', function () {
    jQuery('.black-gold-cover-erweima').show();
    jQuery('.blackgold-erweima-img-uat').show();
  });
  jQuery('body').on('click', '.blackgold-erweima-close', function () {
    jQuery('.black-gold-cover-erweima').hide();
  });

  function getCookie() {
    var jsCookie = {};
    var cookie = document.cookie;
    if (cookie === '') {
      return jsCookie;
    }
    //cookie是以分号和一个空格隔开的一系列键值对
    var cookieList = cookie.split('; ');
    for (var i = 0; i < cookieList.length; i++) {
      //取出一个cookie数组中的元素
      var item = cookieList[i];
      //找出每一个元素中“=”所在的位置
      var index = item.indexOf('=');
      //以下分开“=”前后作为key和value
      var name = item.substring(0, index);
      //解码
      name = decodeURIComponent(name);
      var value = item.substring(index + 1);
      value = decodeURIComponent(value);
      //写入jsCookie对象中，自动添加新增
      jsCookie[name] = value;
    }
    return jsCookie;
  }

  function sendExposure() {
    // 大数据埋点，检测留资入口曝光度
    jQuery.ajax({
      type: 'GET',
      url: 'https://click.lenovo.com/re',
      data: {
        CUC: getCookie()['LA_C_C_Id'],
        UN: window.passport && window.passport.cookie && window.passport.cookie.lenovoId,
        PS: window.location.host,
        PU: window.location.href,
        PMF: '',
        FLAG: 'bizimpdata',
      },
      dataType: 'jsonp',
      jsonp: 'jsonpCallback',
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      timeout: 5000,
      error: function (err, status) {},
      success: function (data) {},
    });
  }
  var isSendMsg = false;

  function navTop() {
    //监听导航
    var texthtml = jQuery('.ul_r_2018');
    var sortIndex = 0;
    var siteHeaderDataType = jQuery('.header_2018').attr('siteHeaderDataType');
    // 在activity.lenovo.com.cn域名下，直接展示登录等信息
    if (siteHeaderDataType == 22) {
      jQuery('.header_nav').hide();
      jQuery('.ul_r_box').html(texthtml);
      jQuery('.header_box').addClass('header_min');
      jQuery('.header_2018').css('position', 'fixed');
      // jQuery(".header_2018 #lenovo_logo").css("top", "0");
      jQuery('hold_header').css('height', '50px');
      jQuery('.search').hide();
      jQuery('.search_btn').show();
      jQuery('.header_box .search').css('margin-top', '22px');
      jQuery('.resou-box ').css({
        width: '660px',
        left: '-620px',
        top: '25px',
      });
      jQuery('.header_2018  .pull_bg').css('top', '60px');
      jQuery('.hold_header').show();
      jQuery('.ul_nav').hide();
      jQuery('.userNameNav').css('color', '#000');
      jQuery('.ul_r_2018 .hd-login-regist').css('line-height', '60px');
      jQuery('.ul_r_2018 .phone').css('margin-top', '11px');
      jQuery('#head_bubble').css('top', '42px');
      jQuery('.hd-login-show >ul').css('margin-top', '9px');
      // jQuery('.search_btn').css('margin-top', '6px')
      if (window.passport.isLogin()) {
        jQuery('.user').hover(function () {
          if (hoveruser) {
            enterpriseCenter();
          }
        });
      }
    } else {
      if ((isItemOrBProduct && !isBrand) || isSpecialPage) {
        if (!isSendMsg) {
          isSendMsg = true;
          sendExposure();
        }
        jQuery('.sort').addClass('show-table');
        if (sortIndex == 0) {
          sortIndex = 2;
          setTimeout(function () {
            jQuery('.sort .hover').find('.webh').hide(200);
            jQuery('.sort').find('.hover').removeClass('hover');
          }, 5000);
        }
      } else {
        isSendMsg = false;
        jQuery('.sort').removeClass('show-table');
      }
      jQuery(window).scroll(function () {
        //开始监听滚动条
        var top = jQuery(window).scrollTop();
        if (top > 40) {
          jQuery('.header_nav').hide();
          jQuery('.ul_r_box').html(texthtml);
          jQuery('.header_box').addClass('header_min');
          jQuery('.header_2018').css('position', 'fixed');
          // jQuery(".header_2018 #lenovo_logo").css("top", "0");
          jQuery('hold_header').css('height', '50px');
          jQuery('.search').hide();
          jQuery('.search_btn').show();
          jQuery('.header_box .search').css('margin-top', '22px');
          jQuery('.resou-box ').css({
            width: '660px',
            left: '-620px',
            top: '25px',
          });
          jQuery('.header_2018  .pull_bg').css('top', '60px');
          jQuery('.hold_header').show();
          jQuery('.ul_nav').hide();
          jQuery('.userNameNav').css('color', '#000');
          jQuery('.ul_r_2018 .hd-login-regist').css('line-height', '60px');
          jQuery('.ul_r_2018 .phone').css('margin-top', '11px');
          jQuery('#head_bubble').css('top', '42px');
          jQuery('.hd-login-show >ul').css('margin-top', '9px');
          jQuery('.search_btn').css('margin-top', '6px');
          if (window.passport.isLogin()) {
            jQuery('.user').hover(function () {
              if (hoveruser) {
                enterpriseCenter();
              }
            });
          }
          // 企业购横条组件吸顶
          jQuery('.top-out-box20200914').css({
            position: 'fixed',
            top: '60px',
          });

          // 有概述页头
          if (jQuery('.overview-page-nav-outer').length > 0) {
            jQuery('.overview-page-nav-outer').css({
              position: 'fixed',
              top: '0',
              width: '100%',
              'z-index': 9999,
            });
            jQuery('#head_bubble').hide();
          }
        } else {
          jQuery('.ur_r_html').html(texthtml);
          jQuery('.header_nav').show();
          jQuery('.ul_r_box').html('');
          jQuery('.header_box').removeClass('header_min');
          jQuery('.header_2018').css('position', 'static');
          // jQuery(".header_2018 #lenovo_logo").css("top", "40px");
          jQuery('hold_header').css('height', 50 - top + 'px');
          jQuery('.search').show();
          jQuery('.search_btn').hide();
          jQuery('.header_box .search').css('margin-top', '13px');
          jQuery('.resou-box ').css({
            width: '100%',
            left: '0',
            top: '35px',
          });
          jQuery('.header_2018  .pull_bg').css('top', '100px');
          jQuery('.hold_header').hide();
          jQuery('.ul_nav').show();
          jQuery('.ul_r_2018 .hd-login-regist').css('line-height', '40px');
          jQuery('.ul_r_2018 .phone').css('margin-top', '0px');
          jQuery('#head_bubble').css('top', '32px');
          jQuery('.hd-login-show >ul').css('margin-top', '0px');
          jQuery('.userNameNav').css('color', '#fffff6');
          if (window.passport.isLogin()) {
            jQuery('.user').hover(function () {
              if (hoveruser) {
                enterpriseCenter();
              }
            });
          }

          // 企业购横条组件吸顶
          jQuery('.top-out-box20200914').css({
            position: 'relative',
            top: '0',
          });

          jQuery('.overview-page-nav-outer').css({
            position: 'relative',
            'z-ndex': 10,
          });
          jQuery('#head_bubble').show();
        }

        //右侧导航显示>100 && 不是品牌站点
        if (!isItemOrBProduct && !isSpecialPage) {
          if (top > 100 && !isBrand) {
            if (!isSendMsg) {
              isSendMsg = true;
              sendExposure();
            }
            jQuery('.sort').addClass('show-table');
            if (sortIndex == 0) {
              sortIndex = 2;
              setTimeout(function () {
                jQuery('.sort .hover').find('.webh').hide(200);
                jQuery('.sort').find('.hover').removeClass('hover');
              }, 5000);
            }
          } else {
            isSendMsg = false;
            jQuery('.sort').removeClass('show-table');
          }
        }
      });
    }
  }
  navTop();

  // 划过购买显示固定弹窗
  jQuery(document).on('mouseover', '.shoping_url', function () {
    jQuery(this).children('.arrow-bottom-box').show();
    jQuery(this).find('.shop-arrow-bottom').attr('src', 'https://p1.lefile.cn/fes/cms/2021/09/16/mgodklk63vux9v9sabnlppp1a6s54w855728.png');
    jQuery(this).css('color', '#f1f1f1');
  });
  jQuery(document).on('mouseout', '.shoping_url', function () {
    jQuery(this).children('.arrow-bottom-box').hide();
    jQuery(this).find('.shop-arrow-bottom').attr('src', 'https://p4.lefile.cn/fes/cms/2021/09/16/yg30afr1f8iqyhhyx06r6dj9mqq6jn413059.png');
    jQuery(this).css('color', '#b5b5b5');
  });

  var hdccliTitle = jQuery('.header_box .lis');
  var loginDiv = jQuery('.ul_r_box');
  var isAnimateFinish = true;
  var titleIndex = 0;
  // 开启搜索
  jQuery('.search_btn').click(function () {
    jQuery('.search').addClass('search_center');
    jQuery('body').css('overflow-y', 'hidden');
    if (!isAnimateFinish) return false;
    isAnimateFinish = false;
    hdccliTitle.animate(
      {
        opacity: 0,
      },
      300
    );

    jQuery('.serch_box_img').css({
      marginRight: -500,
    });
    loginDiv.fadeOut(400, function () {
      jQuery('.search').show();
      hdccliTitle.addClass('close').removeClass('open');
      isAnimateFinish = true;
      jQuery('.search_btn').hide();
      jQuery('.serch_box_img').animate(
        {
          marginRight: 225,
        },
        400,
        function () {
          jQuery('.search_colse').show();
        }
      );

      jQuery('.search_box').find('input').val('');
      setTimeout(function () {
        jQuery('.search_box').find('input')[0].focus();
        jQuery('.header_min').find('.ul').hide();
      }, 500);
    });
    // hdccliTitle.addClass('hd-title-scale');
  });
  // 关闭搜索
  jQuery('.search_colse').click(function () {
    jQuery('.header_min').find('.ul').show();
    jQuery('.search').hide();
    jQuery('.serch_box_img').animate({
      marginRight: 0,
    });
    jQuery('.search').removeClass('search_center');
    jQuery('body').css('overflow-y', 'auto');
    closeSearchAnimate();
  });

  function closeSearchAnimate() {
    jQuery('.search_colse').fadeOut(200, function () {
      // jQuery('.hd-config-container').show();
      siv = setInterval(function () {
        hdccliTitle.eq(titleIndex).animate(
          {
            opacity: 1,
          },
          64,
          'linear',
          function () {
            jQuery(this).addClass('open').removeClass('close');
          }
        );
        // hdccliTitle.eq(titleIndex).removeClass('hd-title-scale');
        loginDiv.fadeIn(200);

        if (++titleIndex == hdccliTitle.length) {
          clearInterval(siv);
          isAnimateFinish = true;
          titleIndex = 0;
        }
      }, 32);
    });
    jQuery('.search_btn').show();
  }

  var timeIdex, setcls, escod, esindex, timestamp;

  jQuery('.header_box .lis').each(function () {
    jQuery(this).hover(
      function (e) {
        var els = jQuery(this);
        clearTimeout(setcls);
        timestamp = new Date().getTime();
        setcls = setTimeout(function () {
          if (timeIdex == els.index()) return;
          jQuery('.nav3-box').hide();
          if (window.location.href.indexOf('b.lenovo') > -1) {
            jQuery('.header_box .lis').removeClass('qyg_active');
            jQuery('.header_box .lis').find('.qyg_active').removeClass('qyg_active');
            els.addClass('qyg_active');
          } else {
            jQuery('.header_box .lis').removeClass('s_active');
            jQuery('.header_box .lis').find('.s_active').removeClass('s_active');
            els.addClass('s_active');
          }

          jQuery('.pull_bg').hide();
          els.siblings().find('.pull').hide();
          // 判断是不是有三级导航
          var havePUll = els.find('.pull');
          // 有三级导航
          if (havePUll.length != 0) {
            // 显示子集并且默认选中子集第一个
            jQuery('.pull_bg').show();
            havePUll.fadeIn(300);

            if (window.location.href.indexOf('b.lenovo') > -1) {
              jQuery('.pull_title').removeClass('qyg_pull_title_active');
              havePUll.find('.pull_title').eq(0).addClass('qyg_pull_title_active');
            } else {
              jQuery('.pull_title').removeClass('pull_title_active');
              havePUll.find('.pull_title').eq(0).addClass('pull_title_active');
            }

            // 判断子第二级导航有没有数据，有就显示出来
            var haveNav3box = els.find('.pull_title').eq(0).find('.nav3-box');
            if (haveNav3box.length != 0) {
              els.find('.pull_title').eq(0).find('.nav3-box').show();

              if (window.location.href.indexOf('b.lenovo') > -1) {
                // 取消默认状态
                els.find('.pull_title').eq(0).find('.nav3-box .nav3_left_li').removeClass('qyg_left_li_active');
                els.find('.pull_title').eq(0).find('.nav3-box .nav3_left_li').eq(0).addClass('qyg_left_li_active');
                // 隐藏所有右侧  .nav3-right-ul
                els.find('.pull_title').eq(0).find('.nav3-box .nav3_left_li').find('.nav3-right-ul').hide();
                // 打开选中状态下的右侧内容  .nav3-right-ul
                els.find('.pull_title').eq(0).find('.nav3-box .nav3_left_li.qyg_left_li_active').find('.nav3-right-ul').show();
              } else {
                // 取消默认状态
                els.find('.pull_title').eq(0).find('.nav3-box .nav3_left_li').removeClass('left_li_active');
                // 判断是否有纵向导航数据，有的话显示第一级
                els.find('.pull_title').eq(0).find('.nav3-box .nav3_left_li').eq(0).addClass('left_li_active');
                // 隐藏所有右侧  .nav3-right-ul
                els.find('.pull_title').eq(0).find('.nav3-box .nav3_left_li').find('.nav3-right-ul').hide();
                // 打开选中状态下的右侧内容  .nav3-right-ul
                els.find('.pull_title').eq(0).find('.nav3-box .nav3_left_li.left_li_active').find('.nav3-right-ul').show();
              }
            }
          }
          timeIdex = els.index();
        }, 150);
      },
      function (e) {
        var timel = timestamp - timestamp;
        if (timel < 150) {
          clearTimeout(setcls);
        } else {
          var els = jQuery(this);
          setTimeout(function () {
            if (timeIdex == els.index()) return;
            els.removeClass('active');
            els.find('.active').removeClass('active');
            jQuery('.nav3-box').hide();
            jQuery('.pull_bg').hide();
            jQuery('.pull').hide();
            if (window.location.href.indexOf('b.lenovo') > -1) {
              jQuery('.nav2_li').removeClass('qyg_active');
            } else {
              jQuery('.nav2_li').removeClass('s_active');
            }
            esindex = -1;
          }, 150);
        }
      }
    );
  });

  //三级导航事件
  jQuery('.pull_box .pull_title').hover(
    function () {
      timestamp = new Date().getTime();
      var els = jQuery(this);
      clearTimeout(escod);
      escod = setTimeout(function () {
        if (window.location.href.indexOf('b.lenovo') > -1) {
          els.siblings().removeClass('qyg_pull_title_active');
        } else {
          els.siblings().removeClass('pull_title_active');
        }

        jQuery('.nav3-box').hide();
        var cdItems = els.find('.nav3-box');
        if (window.location.href.indexOf('b.lenovo') > -1) {
          els.addClass('qyg_pull_title_active').find('.nav3-box').show();

          // 判断是否有纵向导航数据，有的话显示第一级
          els.addClass('qyg_pull_title_active').find('.nav3-box .nav3_left_li').siblings().removeClass('qyg_left_li_active');
          els.addClass('qyg_pull_title_active').find('.nav3-box .nav3_left_li').eq(0).addClass('qyg_left_li_active');
          // 隐藏所有右侧  .nav3-right-ul
          els.addClass('qyg_pull_title_active').find('.nav3-box .nav3_left_li').find('.nav3-right-ul').hide();
          // 打开选中状态下的右侧内容  .nav3-right-ul
          els.addClass('qyg_pull_title_active').find('.nav3-box .nav3_left_li.qyg_left_li_active').find('.nav3-right-ul').show();
        } else {
          els.addClass('pull_title_active').find('.nav3-box').show();
          // 判断是否有纵向导航数据，有的话显示第一级
          els.addClass('pull_title_active').find('.nav3-box .nav3_left_li').siblings().removeClass('left_li_active');
          els.addClass('pull_title_active').find('.nav3-box .nav3_left_li').eq(0).addClass('left_li_active');
          // 隐藏所有右侧  .nav3-right-ul
          els.addClass('pull_title_active').find('.nav3-box .nav3_left_li').find('.nav3-right-ul').hide();
          // 打开选中状态下的右侧内容  .nav3-right-ul
          els.addClass('pull_title_active').find('.nav3-box .nav3_left_li.left_li_active').find('.nav3-right-ul').show();
        }
        esindex = els.index();
      }, 150);
    },
    function () {
      var timel = timestamp - timestamp;
      if (timel < 150) {
        clearTimeout(escod);
      } else {
        var els = jQuery(this);
        setTimeout(function () {
          if (esindex == els.index()) return;
          if (window.location.href.indexOf('b.lenovo') > -1) {
            els.siblings().removeClass('qyg_pull_title_active');
          } else {
            els.siblings().removeClass('pull_title_active');
          }
        }, 150);
      }
    }
  );

  //纵向四级导航（统一顶部导航为一级导航）
  jQuery('.nav3-left-ul .nav3_left_li').hover(
    function () {
      var _this = jQuery(this);
      jQuery('.nav3-left-ul .nav3-right-ul').hide();
      _this.find('.nav3-right-ul').show();

      if (window.location.href.indexOf('b.lenovo') > -1) {
        jQuery(this).siblings().removeClass('qyg_left_li_active');
        jQuery(this).addClass('qyg_left_li_active');
      } else {
        jQuery(this).siblings().removeClass('left_li_active');
        jQuery(this).addClass('left_li_active');
      }
    },
    function () {}
  );

  // 关闭公共头导航按钮事件
  jQuery('.off-nav3-btn').on('click', function () {
    jQuery(this).parents('.nav3-box').fadeOut(150);
    jQuery('.pull_bg').fadeOut(150);
    jQuery('.pull').fadeOut(150);

    if (window.location.href.indexOf('b.lenovo') > -1) {
      jQuery('.nav2_li').removeClass('qyg_active');
    } else {
      jQuery('.nav2_li').removeClass('s_active');
    }
    timeIdex = -1;
  });

  jQuery('.header_box').mouseleave(function (e) {
    jQuery('.nav3-box').fadeOut(150);
    jQuery('.pull_bg').fadeOut(150);
    jQuery('.pull').fadeOut(150);
    if (window.location.href.indexOf('b.lenovo') > -1) {
      jQuery('.nav2_li').removeClass('qyg_active');
    } else {
      jQuery('.nav2_li').removeClass('s_active');
    }
    timeIdex = -1;
  });

  // 站点个性化
  function domainStyle() {
    // 企业购
    if (window.location.href.indexOf('b.lenovo') > -1) {
      // 企业购页面显示购物车图标,
      jQuery('.sort .shop-cart').show();
      jQuery('.header_2018 .shop-cart-a').attr('href', bDomain + '/cart/index.html?ticket=' + ticket);
      jQuery('.sort .shop-cart-a').attr('href', bDomain + '/cart/index.html?ticket=' + ticket);
      jQuery('.serch_box_img_btn').show();

      if (userIsLogin) {
        jQuery('.sort .shop-cart-num').css('display', 'block');
      }
    }
  }
  // 不同站点的不同样功能及样式处理
  domainStyle();
});
jQuery(function () {
  function rightBar() {
    jQuery('.sort-list>ul>li').mouseenter(function () {
      var that = jQuery(this);
      that.addClass('hover');
      that.find('ul').show();
    });
    jQuery('.sort-list>ul>li').mouseleave(function () {
      var that = jQuery(this);
      that.removeClass('hover');
      that.find('ul').hide();
    });

    jQuery('#goTop').on('click', function () {
      jQuery(window).scrollTop(0);
      setTimeout(function () {
        jQuery('#goTop').removeClass('hover').find('a').eq(1).css('display', 'none');
      }, 100);
    });
  }
  rightBar();
});

/*未注册/未登录气泡*/
jQuery(function () {
  var signInUrl = '',
    havesignInbox = jQuery('.sign-in-box').length,
    localHref = window.location.href;
  var ticket = 'e40e7004-4c8a-4963-8564-31271a8337d8';
  if (location.host.indexOf('club.lenovo') > -1) {
    ticket = '6eb69994-0885-46e2-8b20-b5b35e10822a';
  } else if (location.host.indexOf('b.lenovo') > -1) {
    ticket = '50690e2e-bf8e-4aeb-a8b1-7a03537d1927';
  } else if (
    location.host.indexOf('biz.lenovo') > -1 ||
    location.host.indexOf('sol.lenovo') > -1 ||
    location.host.indexOf('xcloud.lenovo.com') > -1 ||
    location.host.indexOf('ics-home.earth.xpaas.lenovo.com') > -1
  ) {
    ticket = 'fd99c0db-0720-4512-a570-5bfaae21557a';
  } else if (location.host.indexOf('learningcenter.lenovo') > -1 || location.host.indexOf('lglc.lenovo') > -1) {
    ticket = '336ee7ea-ad9a-4c85-842c-aa96cf6c694d';
  } else {
    ticket = 'e40e7004-4c8a-4963-8564-31271a8337d8';
  }
  //uat
  if (location.host.indexOf('lenovouat') > -1 || location.host.indexOf('ics-home.earth.xpaas.lenovo.com') > -1 || location.host.indexOf('lglc.lenovo') > -1) {
    if (location.host.indexOf('club.lenovouat.com') > -1) {
      signInUrl = 'https://reg.lenovouat.com/auth/v1/regist?ru=' + localHref + '&ticket=' + ticket;
    } else if (location.host.indexOf('b.lenovouat.com') > -1) {
      signInUrl = 'https://reg.lenovouat.com/registpage/pc/enterprisereg.html?ru=' + localHref + '&ticket=' + ticket;
    } else if (
      location.host.indexOf('biz.lenovouat.com') > -1 ||
      location.host.indexOf('sol.lenovouat.com') > -1 ||
      location.host.indexOf('ics-home.earth.xpaas.lenovo.com') > -1
    ) {
      signInUrl = 'https://reg.lenovouat.com/registpage/pc/enterprisereg.html?ru=' + localHref + '&ticket=' + ticket;
      try {
        jQuery('a[href="https://sol.lenovouat.com/contact.html?right=1"]').attr(
          'href',
          'https://sol.lenovouat.com/contact.html?right=1&channeltype=sidebar&sourcepage=' + encodeURIComponent(document.location.href)
        );
      } catch (error) {
        console.log(error);
      }
    } else if (location.host.indexOf('lglc.lenovo') > -1) {
      signInUrl = 'https://reg.lenovouat.com/user_auth/toc/#/login?ru=' + localHref + '&ticket=' + ticket;
    } else {
      signInUrl = 'https://reg.lenovouat.com/auth/v1/regist?ru=' + localHref + '&ticket=' + ticket;
    }
  } else {
    //生产
    if (location.host.indexOf('club.lenovo.com') > -1) {
      signInUrl = 'https://reg.lenovo.com.cn/auth/v1/regist?ru=' + localHref + '&ticket=' + ticket;
    } else if (location.host.indexOf('b.lenovo.com') > -1) {
      signInUrl = 'https://reg.lenovo.com.cn/registpage/pc/enterprisereg.html?ru=' + localHref + '&ticket=' + ticket;
    } else if (location.host.indexOf('biz.lenovo.com') > -1 || location.host.indexOf('sol.lenovo.com') > -1 || location.host.indexOf('xcloud.lenovo.com') > -1) {
      signInUrl = 'https://reg.lenovo.com.cn/registpage/pc/enterprisereg.html?ru=' + localHref + '&ticket=' + ticket;
      try {
        jQuery('a[href="https://sol.lenovo.com.cn/contact.html?right=1"]').attr(
          'href',
          'https://sol.lenovo.com.cn/contact.html?right=1&channeltype=sidebar&sourcepage=' + encodeURIComponent(document.location.href)
        );
      } catch (error) {
        console.log(error);
      }
    } else if (location.host.indexOf('learningcenter.lenovo') > -1) {
      signInUrl = 'https://reg.lenovo.com.cn/user_auth/toc/#/login?ru=' + localHref + '&ticket=' + ticket;
    } else {
      signInUrl = 'https://reg.lenovo.com.cn/auth/v1/regist?ru=' + localHref + '&ticket=' + ticket;
    }
  }

  // 登录链接放到公共头的自定义属性上,因为活动页面有民生银行页面也要单独记录ticket值，其他页面动态修改的也是regist_btn_new的值
  jQuery('.hd-login-regist .regist_btn_new').attr('myhref', signInUrl);

  // 关闭隐私政策
  jQuery('.privacyDialogClose').on('click', function () {
    jQuery('.privacyDialogBox').hide();
  });

  jQuery('.goToRegist').on('click', function () {
    var getAttrSignUrl = jQuery('.hd-login-regist .regist_btn_new').attr('myhref');
    if (getAttrSignUrl != '') {
      // 跳转注册
      window.open(getAttrSignUrl);
      jQuery('.privacyDialogBox').hide();
    } else {
      window.open(signInUrl);
      jQuery('.privacyDialogBox').hide();
    }
  });

  jQuery(document).on('click', '.regist_zc', function (e) {
    jQuery('.privacyDialogBox').fadeIn(200);
  });

  // 点击气泡，有引导注册，啥也不做，没有就弹出隐私弹窗
  jQuery(document).on('click', '#head_bubble', function () {
    if (havesignInbox > 0) {
      return;
    } else {
      jQuery('.privacyDialogBox').fadeIn(200);
    }
  });

  if (typeof passport == 'object') {
    if (window.passport.isLogin()) {
      jQuery('#head_bubble').fadeOut();
    } else {
      jQuery('#head_bubble').fadeIn();
    }
  }
  //购物车

  function getcartcount() {
    var carherf = window.location.href.indexOf('lenovouat') > -1 || window.location.href.indexOf('lglc.lenovo.com') > -1 ? '//buy.lenovouat.com/' : '//buy.lenovo.com.cn/';

    let targetUrl = '';
    if (window.location.host == 'learningcenter.lenovo.com') {
      targetUrl = 'https://learningcenter.lenovo.com/api/getshoppingcartcount';
    } else {
      targetUrl = carherf + 'napi/cart/getshoppingcartcount.jhtm';
    }
    jQuery.ajax({
      url: targetUrl,
      dataType: 'jsonp',
      async: false,
      type: 'get',
      jsonp: 'callbackparam',
      success: function (data) {
        if (data.success == true) {
          // 右侧导航购物车增加购物车数量

          if (data.t > 99) {
            jQuery('.shop-cart-num').text('99+');
            jQuery('.shop-cart-num').css({
              padding: '0 2px',
              'border-radius': '7px',
              width: 'auto',
            });
          } else {
            jQuery('.shop-cart-num').css({
              'border-radius': '50%',
              width: '15px',
            });
            jQuery('.shop-cart-num').text(data.t);
          }

          // 顶部导航增加购物车加购数量
          jQuery('.top_cart_count').text(data.t);
        }
      },
      error: function (a, b, c) {},
    });
  }
  if (jQuery('.hd-login-show').find('.car').length > 0) {
    getcartcount();
  }
  //pop
  jQuery(function () {
    var popDialog = function () {
      try {
        if (window.passport && passport.isLogin()) {
          var urlDomain = window.location.href.indexOf('lenovouat') > -1 || window.location.href.indexOf('lglc.lenovo.com') > -1 ? '//i.lenovouat.com' : '//i.lenovo.com.cn';
          jQuery.ajax({
            type: 'GET',
            data: {
              id: '39',
              lenovoId: passport.cookie.lenovoId,
              sts: 'e40e7004-4c8a-4963-8564-31271a8337d8',
            },
            url: urlDomain + '/growth/getGiftPackageDetails.jhtml',
            dataType: 'jsonp',
            jsonp: 'callback',
            timeout: 5000,
            error: function () {},
            success: function (res) {
              if (res.data !== null) openDialog();
            },
          });
        }
      } catch (error) {}
    };
    // 注册后权益礼包暂时不调用
    // })();

    function openDialog() {
      var htmlFragment =
        '<style>' +
        ' #dialogA {' +
        '  position: absolute;' +
        '   top: 50%;' +
        '   left: 50%;' +
        '   z-index: 99;' +
        '   margin-left: -179px;' +
        ' margin-top: -228.5px;' +
        '   width: 358px;' +
        '   height: 457px;' +
        '   font-size: 20px;' +
        '   text-decoration: none;' +
        '   color: #fff;' +
        '   display: none;' +
        ' }' +
        ' #dialogA .dialog {' +
        '   width: 358px;' +
        '   text-align: center;' +
        // '   padding: 50px 0;' +
        ' }' +
        ' #dialogA .txt {' +
        '   font-size: 25px;' +
        '   text-decoration: none;' +
        '   color: #ffffff;' +
        '   margin-bottom: 5px;' +
        ' }' +
        ' #dialogA .ditu{' +
        '   width: 358px;' +
        ' }' +
        ' .dialogShade {' +
        '   position: absolute;' +
        '   top: 50%;' +
        '   left: 50%;' +
        '   z-index: 98;' +
        '   background: #000000;' +
        ' }' +
        '.dialogShade .close {' +
        '    position: absolute;' +
        '   top: 20px;' +
        '   right: 20px;' +
        '   width: 40px;' +
        '   height: 40px;' +
        '   z-index: 98;' +
        '  }' +
        '</style>' +
        '<div id="dialogA">' +
        '<div class="dialog">' +
        '<p class="txt">恭喜您成为联想会员</p>' +
        '<a href="https://activity.lenovo.com.cn/activity/zhuanpan_190829/index.html" target="_blank"><img class="ditu" src="https://p1.lefile.cn/fes/cms/2021/12/29/s0ch5e3pcwnzpyuzviufdoly6rrn38804454.png" alt=""></a>' +
        '</div>' +
        '</div>' +
        '<div class="dialogShade">' +
        '<img class="close" src="https://p2.lefile.cn/product/adminweb/2019/08/28/c14a48d0-040d-4f60-9765-55622daa3d13.png"' +
        '" alt="" />' +
        '<a href="https://activity.lenovo.com.cn/activity/zhuanpan_190829/index.html" style="width:100%;height:91%; margin-top:63px;display: inline-block;" target="_blank"><a></div>';
      if (jQuery('#dialogA').size() <= 0) jQuery(document.body).append(htmlFragment);
      var $dialogA = jQuery('#dialogA');
      var $close = jQuery('#dialogA .close');
      var $shade = jQuery('.dialogShade');
      var width = $dialogA.width() + 200;
      var height = $dialogA.height() + 200;
      $shade.css('width', width);
      $shade.css('height', height);
      $shade.css('opacity', '0.85');
      $shade.css('display', 'block');
      $shade.css('marginLeft', -width / 2);
      $shade.css('marginTop', -height / 2);
      $dialogA.show(); //弹层显示
      $close.show(); //按钮显示
      $shade.on('click', function () {
        $dialogA.hide();
        $shade.hide();
        $close.hide();
      });
      $close.on('click', function () {
        $dialogA.hide();
        $shade.hide();
        $close.hide();
      });
    }
  });

  var setTimer = setTimeout(function () {
    if (window.location.href.indexOf('b.lenovo') != -1 && window.location.href.indexOf('customization') == -1) {
      jQuery('.kf-dialog .kf-dialog-img').attr('src', 'https://p2.lefile.cn/fes/cms/2025/07/10/yvpj8082yfs1ewlbaa5lsn8k9nswuq476999.png');
      jQuery('.kf-dialog').show();
    }
    if (window.location.href.indexOf('biz.lenovo') != -1) {
      jQuery('.kf-dialog').show();
    }
  }, 10000);

  jQuery('.off-btn').on('click', function () {
    jQuery(this).parents('.kf-dialog').hide();
    clearInterval(setTimer);
  });

  jQuery('.serch_box_img_btn').on('click', function () {
    jQuery('.serch_box_img').click();
  });

  jQuery(document).on('mouseenter', '.regist_zc,.login', function () {
    if (jQuery('.header_nav').css('display') == 'block') {
      jQuery(this).css('color', '#FFF');
    } else {
      jQuery(this).css('color', '#252525');
    }
  });
  jQuery(document).on('mouseleave', '.regist_zc,.login', function () {
    jQuery(this).css('color', '#b5b5b5');
  });
});
// jQuery(function () {
//   setTimeout(() => {
//     if (window.location.pathname.indexOf('/solution/') > -1) {
//       var kfUrl = 'https://lecs.lenovo.com.cn/chat.html'
//       var buowner = jQuery('#detail-owner').attr('buowner')
//       if (kfUrl) {
//         if (kfUrl.indexOf('?') != -1) {
//           if (buowner) {
//             jQuery('.sort-list .firstLevel')
//               .eq(0)
//               .children('.sort-list-item')
//               .attr('href', kfUrl + '&ttc=1&buc=' + buowner)
//           }
//         } else {
//           if (buowner) {
//             jQuery('.sort-list .firstLevel')
//               .eq(0)
//               .children('.sort-list-item')
//               .attr('href', kfUrl + '?ttc=1&buc=' + buowner)
//           }
//         }
//       }
//     }
//   }, 500)
// })
;
var hostname=window.location.href.indexOf("uat")>-1?"lenovouat.com":"lenovo.com.cn";jQuery(function(){jQuery(".shangyong-list").eq(0).height(550);jQuery(".list-nav-num1-ul .list-nav-num1-li").mousemove(function(){var $this=jQuery(this);$this.addClass("activ1");$this.find(".list-nav-num2-ul").show();$this.children(".list-nav-num3-ul").css("display","block");$this.siblings(".list-nav-num1-li").removeClass("activ1");$this.siblings(".list-nav-num1-li").find(".list-nav-num2-ul").hide();$this.siblings(".list-nav-num1-li").children(".list-nav-num3-ul").css("display","none")});jQuery(".list-nav-num2-ul .list-nav-num2-li").mousemove(function(){var $this=jQuery(this);$this.addClass("activ2");$this.find(".list-nav-num3-ul").show();$this.siblings(".list-nav-num2-li").removeClass("activ2");$this.siblings(".list-nav-num2-li").css("background","#f5f5f5");$this.siblings(".list-nav-num2-li").find(".list-nav-num3-ul").hide()});jQuery(".shangyong-list .list-nav-num1-li .list-nav-num2-ul .list-nav-num2-li").mousemove(function(){var $this=jQuery(this);$this.addClass("activ1");$this.find(".fangan-list").show();$this.siblings(".list-nav-num2-li").removeClass("activ1");$this.siblings(".list-nav-num2-li").find(".fangan-list").hide()});var ullength=jQuery(".list-nav-num1-ul").length;var ind=0;for(var i=0;i<ullength;i++){jQuery(".list-nav-num1-ul").eq(i).find(".list-nav-num1-li").eq(0).addClass("activ1");jQuery(".list-nav-num1-ul").eq(i).find(".list-nav-num1-li").eq(0).find(".list-nav-num2-ul").css("display","block");jQuery(".list-nav-num1-ul").eq(i).find(".list-nav-num1-li").eq(0).find(".list-nav-num2-ul").find(".list-nav-num2-li").eq(0).addClass("activ1");jQuery(".list-nav-num1-ul").eq(i).find(".list-nav-num1-li").eq(0).find(".list-nav-num2-ul").find(".list-nav-num2-li").eq(0).find(".fangan-list").css("display","block");jQuery(".list-nav-num1-ul").eq(i).find(".list-nav-num1-li").eq(1).find(".list-nav-num2-ul").find(".list-nav-num2-li").eq(0).find(".fangan-list").css("display","block");jQuery(".list-nav-num1-ul").eq(i).find(".list-nav-num1-li").eq(1).find(".list-nav-num2-ul").find(".list-nav-num2-li").eq(0).addClass("activ1")}jQuery(".sousuo-input").click(function(){if(jQuery(".re-ul").html()!=""){jQuery(".resou-box").show()}});jQuery(".sousuo-input").blur(function(){setTimeout(function(){jQuery(".resou-box").hide()},300)});jQuery(function(){var p=0,t=0;var body=jQuery("body");var header=jQuery(".header-main");var temp=50;jQuery(window).scroll(function(e){var current=jQuery(window).scrollTop();if(current>temp){jQuery(".top-nav-li.on .shangyong-list").css("top","60px").slideUp(0);jQuery(".shangyong-list").css("top","60px");header.addClass("fixTop");body.removeClass("headerBeFixed")}else{jQuery(".shangyong-list").css("top","110px");header.removeClass("fixTop");body.addClass("headerBeFixed")}p=jQuery(this).scrollTop();jQuery(".shangyong-list").css("display","none");if(p==180){jQuery(".fiex-wendow").removeClass("nav_fix")}if(t<=p){jQuery(".fiex-wendow").removeClass("nav_fix");jQuery(".big-logo-div").hide();jQuery(".mini-logo-div").show();jQuery("#l-curmbs-box.active > div").css("top","0");jQuery(".zybox-h21").css("top","0");jQuery(".zhibo-fixed").css("top","40px")}else{jQuery(".fiex-wendow").addClass("nav_fix");jQuery(".big-logo-div").show();jQuery(".mini-logo-div").hide();jQuery("#l-curmbs-box.active > div").css("top","55px");jQuery(".zybox-h21").css("top","55px");jQuery(".zhibo-fixed").css("top","100px");if(p<100){jQuery(".fiex-wendow").removeClass("nav_fix")}}setTimeout(function(){t=p},0)});if(window.location.href.indexOf("/search/")!=-1){var keyword=getQueryString("key");if(keyword){jQuery(".sousuo-input").val(decodeURI(keyword))}}getDefaultHowWord()});jQuery(".sousuo-btn").click(function(){var $this=jQuery(this);$this.parents(".shuru-input").siblings(".p-img").css("z-index",0);sousuo_btn_click()});function sousuo_btn_click(){var keyword=jQuery.trim(jQuery(".sousuo-input").val());if(keyword==null||keyword==""){keyword=jQuery(".sousuo-input").data("defaultword");keyword=encodeURI(keyword);search(keyword,"预置词")}else{search(encodeURI(keyword),"自填")}}jQuery(".sousuo-input").on("input",function(){if(jQuery.trim(jQuery(this).val())==""){getHotWord()}else{dyn_search(encodeURI(jQuery.trim(jQuery(".sousuo-input").val())))}});jQuery(".sousuo-input").keyup(function(event){if(event.keyCode==13){sousuo_btn_click()}});function dyn_search(keyword){jQuery.ajax({type:"get",url:"https://biz."+hostname+"/search/suggest?isDCG=true&shopid=12&kw="+keyword+"&plat=4&leid=1.TR6g5h%2BHO0Q&terminal=1",dataType:"jsonp",jsonp:"cb",success:function(d){if(d.rc==0){jQuery(".re-ul").empty();if(d.normal.length==0&&d.detail.length==0){jQuery(".resou-box").hide()}else{render(d.normal);jQuery(".resou-box").show()}}else{jQuery("div.resou-box").hide();return}},error:function(XMLHttpRequest,textStatus,errorThrown){console.log(err)}})}jQuery(".sousuo-input").on("focus",function(){getHotWord()});function getHotWord(){jQuery.ajax({type:"get",url:"https://biz."+hostname+"/search/getHotwordV2?terminal=2&isDCG=true&url=",dataType:"jsonp",jsonp:"cb",success:function(d){if(d.rc==0){jQuery(".re-ul").empty();if(d.data==0){jQuery(".resou-box").hide()}else{render(d.data);jQuery(".resou-box").show()}}else{jQuery("div.resou-box").hide();return}},error:function(XMLHttpRequest,textStatus,errorThrown){console.log(err)}})}function getDefaultHowWord(){jQuery.ajax({type:"get",url:"https://biz."+hostname+"/search/getDefaultHotwordV2?shopId=12&terminal=2&isDCG=true",dataType:"jsonp",jsonp:"cb",success:function(d){if(d.data){jQuery(".sousuo-input").attr("placeholder",jQuery.parseJSON(d.data).showWord).data("defaultword",jQuery.parseJSON(d.data).word)}else{jQuery(".sousuo-input").attr("placeholder","").data("defaultword","")}},error:function(err){console.log(err)}})}var curPageurl=window.location.href.split("?")[0];function search(keyword,keyType){window.location.href="https://biz."+hostname+"/search/?isDCG=true&key="+keyword+"&pageType="+encodeURI(curPageurl)+"&keyType="+encodeURI(keyType)}function render(data){var tmp=data;var html="";for(var i=0;i<tmp.length;i++){html+='<li class=\'re-li clearfix\' style="overflow: hidden;text-overflow:ellipsis;white-space: nowrap;width: 12.7em;" title="'+tmp[i].word+'">';html+='<a target="_self" style="display: block; height: 30px;" href="https://biz.'+hostname+"/search/?isDCG=true&pageType="+encodeURI(curPageurl)+"&keyType="+encodeURI("热搜词")+"&key="+encodeURI(jQuery.trim(tmp[i].word))+'">';html+="<span class='fl'>"+tmp[i].word+"</span>";html+="</a>";html+="</li>"}jQuery(".re-ul").html(jQuery(html))}function getQueryString(commonname,isDecode){var reg=new RegExp("(^|&)"+commonname+"=([^&]*)(&|$)");var r=window.location.search.substr(1).match(reg);if(r!=null){if(isDecode){return decodeURIComponent(r[2])}else{return r[2]}}else{return null}}});

