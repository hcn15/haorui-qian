$(function () {
  var mySlidercaptcha = null; //滑块验证
  var $btn = $('#cjhdStart');
  var loginDomain = '';
  var iDomain = '';
  var getGiftDomain = ''; //抽奖接口地址
  var addressDomain = ''; //去查看的个人中心地址
  var captchaDomain = '';
  //需要一键复制的文本
  var copyInfo = '';
  var isMobile = false;
  var isLogin = window.passport ? window.passport.isLogin() : false;
  // 引导注册
  var countDownNumber = 60;
  var timer = null;
  var regTel = /^1[3|4|5|6|7|8|9][0-9]{9}$/;
  var timerOut = null;
  var getCodeFlag = true;
  var smVarityLock = true; //防止点击抽奖多次触发
  // var top = $(window).scrollTop();
  //获取当天日期
  var myData = new Date().getDate();
  var terminal = 1; //判断终端
  if (os().isPhone && os().isApp) {
    //ios
    terminal = 31;
  } else if (os().isAndroid && os().isApp) {
    //安卓
    terminal = 32;
  } else if (os().isPc) {
    //pc
    terminal = 1;
  } else if (os().isMiniprogramp) {
    //小程序
    terminal = 5;
  } else {
    //wap端
    terminal = 2;
  }

  //登录成功window.localStorage会增加cTime参数（创建时间）
  var isNew = window.localStorage.getItem('isNew');
  // 时间保存到全局一份

  // 存在说明登录成功了
  if (isNew == true || isNew == 'true') {
    // 先清除window.localStorage中的值
    window.localStorage.setItem('isNew', false);
    verification();
  }

  if (os().isPhone || os().isAndroid) {
    isMobile = true;
  } else {
    isMobile = false;
  }
  // 判断环境
  if (document.domain.indexOf('lenovouat') == -1) {
    if (isMobile) {
      addressDomain = '//m.lenovo.com.cn/h5-order/html/win.html';
    } else {
      addressDomain = '//shop.lenovo.com.cn/mycenter/win.html';
    }
    getGiftDomain = '//papi.lenovo.com.cn';
    captchaDomain = '//captcha.lenovo.com.cn';
    loginDomain = '//reg.lenovo.com.cn';
    iDomain = 'https://i.lenovo.com.cn';
  } else {
    if (isMobile) {
      addressDomain = '//m.lenovouat.com/h5-order/html/win.html';
    } else {
      addressDomain = '//shop.lenovouat.com/mycenter/win.html';
    }
    getGiftDomain = '//papi.lenovouat.com';
    captchaDomain = '//captcha.lenovouat.com';
    loginDomain = '//reg.lenovouat.com';
    iDomain = 'https://i.lenovouat.com';
  }
  /**
   * 获取商城设备token
   */
  async function getToken() {
    const token = await leShopTrack.getDeviceToken();
    return token;
  }

  function os() {
    var ua = navigator.userAgent,
      isWindowsPhone = /(?:Windows Phone)/.test(ua),
      isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
      isAndroid = /(?:Android)/.test(ua),
      isFireFox = /(?:Firefox)/.test(ua),
      isChrome = /(?:Chrome|CriOS)/.test(ua),
      isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
      isPhone = /(?:iPhone)/.test(ua) && !isTablet,
      isPc = !isPhone && !isAndroid && !isSymbian;
    (isLenovoAPP = /lenovomallapp/i.test(navigator.userAgent)),
      (isMiniprogramp = /miniprogram/i.test(navigator.userAgent)),
      (isLenovoOfficialApp = /lenovoofficialapp/i.test(navigator.userAgent));
    return {
      isPhone: isPhone,
      isAndroid: isAndroid,
      isPc: isPc,
      isApp: isLenovoAPP || isLenovoOfficialApp,
      isMiniprogramp: isMiniprogramp,
    };
  }

  // 修改气泡样式
  //p4.lefile.cn/fes/cms/2021/06/16/auw4nc7rk2xc7ph13lw1adntixmrm8292909.png
  function modifyBubble() {
    var bubbleUrl = $('.bubble-info').html();
    var bubbleText = $('.bubble-info').attr('imgText');
    $('.regist_btn_plat').attr('latag', 'latag_pc_导航_气泡_0_气泡内容区域_null');

    $('#head_bubble').css({
      width: '188px',
      padding: 0,
      background: 'url(' + (bubbleUrl ? bubbleUrl : '//p4.lefile.cn/fes/cms/2021/06/16/auw4nc7rk2xc7ph13lw1adntixmrm8292909.png') + ')',
      'background-size': '100%',
      height: '38px',
      'line-height': '40px',
      right: '-43px',
    });

    $('#head_bubble .regist_btn_plat')
      .html(bubbleText ? bubbleText : '立领限时福利，内含惊喜！')
      .css({
        'font-size': '12px',
        color: '#FFFFFF',
        'padding-left': '38px',
      })
      .attr({
        href: 'javascript:;',
        target: '',
      });
  }
  // 修改卡片样式及引导注册背景样式
  modifyBubble();

  // 打开
  $(document).on('click', '.regist_btn_plat', function () {
    $('.mask-laye-box').show();
    $('.sign-in-box').show();
  });

  function showSignInBox() {
    clearInterval(timerOut);
    timerOut = setTimeout(function () {
      $('.mask-laye-box').show();
      $('.sign-in-box').show();
    }, 5000);
  }

  // 关闭引导注册弹窗当天不显示
  if (!isLogin) {
    if (window.localStorage.tipsclose != myData) {
      showSignInBox();
    }
  }

  $('.off-btn').on('click', function () {
    window.localStorage.tipsclose = myData;
    $('.tip_show20181214').hide();
    $('.tip_show20181219').hide();
  });

  function mySliderInit() {
    // 判断是否抽奖使用滑块验证
    var isSlider = $btn.attr('data-isslider') == '0';
    if (isSlider) {
      // 判断是否加载二次封装js
      var intervalTimer = setInterval(() => {
        if (window.mySmcpJs == true && window.smcpJs == true) {
          clearInterval(intervalTimer);
          if (smVarityLock) {
            smVarityLock = false;
            // 每次初始化滑块传回调参数即可
            window.myInitSMCaptcha(
              function (SMCaptcha) {
                SMCaptcha.onReady(function () {
                  // 空间背景图加载完毕回调
                  var result = SMCaptcha.getResult();
                  var pass = result.pass;
                  //显示验证码的时机,通过调用verify方法启动
                  if (!pass) {
                    SMCaptcha.verify();
                  }
                });
                SMCaptcha.onClose(function () {
                  smVarityLock = true;
                });
                SMCaptcha.onSuccess(function (data) {
                  var rid = data.rid;
                  // 选对处理
                  if (data.pass) {
                    getGift(rid);
                  } else {
                    // 空间验证滑块错误
                  }
                });

                SMCaptcha.onError(function (errType, errMsg) {
                  smVarityLock = true;
                  console.log('errType------' + errType);
                  console.log('errMsg------' + errMsg);
                });
              },
              {
                organization: 'OiSyzKqqwO9gAy7AsaIP', //公司标识,,数美后台查看
                // mode: 'spatial_select',
                mode: 'slide',
                product: 'popup',
                maskBindClose: true, //popup 模式有效，遮罩层绑定关闭弹层事件
                https: 'isHttps',
                width: 330,
              }
            );
          }
        }
      }, 1000);
    } else {
      var noSliderTimer = setInterval(() => {
        if (window.mySmcpJs == true && window.smcpJs == true) {
          clearInterval(noSliderTimer);
          getGift(null);
        }
      }, 1000);
    }
  }

  // 滑块弹窗按钮
  $('#mycode .close').click(function () {
    // $("body").removeClass("body_fixed")
    $('#mycode').hide();
    mySlidercaptcha.reset();
  });

  // 中奖结果按钮
  $('.resultBtn').click(function () {
    // $("body").removeClass("body_fixed")
    $('#result').hide();
  });

  // 去查看
  $('.toGet').click(function () {
    window.location.href = addressDomain;
  });

  $('.copy_text').click(function () {
    // 判断有没有数据
    if ($('.ps_num').text() !== '') {
      copyText(copyInfo);
    } else {
      alert('活动太火爆了，稍后再试');
    }
  });

  function copyText(text) {
    // 数字没有 .length 不能执行selectText 需要转化成字符串
    var textString = text.toString();
    var input = document.querySelector('#copy-input');
    if (!input) {
      input = document.createElement('input');
      input.id = 'copy-input';
      input.readOnly = 'readOnly'; // 防止ios聚焦触发键盘事件
      input.style.position = 'absolute';
      input.style.left = '-1000px';
      input.style.zIndex = '-1000';
      document.body.appendChild(input);
    }

    input.value = textString;
    // ios必须先选中文字且不支持 input.select();
    selectText(input, 0, textString.length);
    if (document.execCommand('copy')) {
      document.execCommand('copy');
      alert('已复制到粘贴板');
    }
    input.blur();
    $(window).scrollTop(0);

    // input自带的select()方法在苹果端无法进行选择，所以需要自己去写一个类似的方法
    // 选择文本。createTextRange(setSelectionRange)是input方法
    function selectText(textbox, startIndex, stopIndex) {
      if (textbox.createTextRange) {
        //ie
        var range = textbox.createTextRange();
        range.collapse(true);
        range.moveStart('character', startIndex); //起始光标
        range.moveEnd('character', stopIndex - startIndex); //结束光标
        range.select(); //不兼容苹果
      } else {
        //firefox/chrome
        textbox.setSelectionRange(startIndex, stopIndex);
        textbox.focus();
      }
    }
  }

  // 抽奖
  function verification() {
    mySliderInit();
  }

  function SSOLoginLenovo(URL) {
    var LoginURL = loginDomain + '/auth/v1/login?ticket=b044d754-bda2-4f56-9fea-dcf3aecfe782&iswap=0&ru=' + URL;
    window.location.href = LoginURL;
  }

  // 关闭按钮跳转
  // 获得奖品
  async function getGift(rid) {
    var rotatingwheelid = $btn.attr('data-drawid');
    var param = '';
    const deviceToken = await getToken();
    if (rid === null) {
      param = {
        drawId: rotatingwheelid,
        terminal: terminal, //判断终端
        deviceId: window.deviceId_shumei || (window.SMSdk?.getDeviceId() ? window.SMSdk?.getDeviceId() : ''), //PC端直接获取
        pageUrl: window.location.href,
        pageName: document.title,
        deviceToken: deviceToken,
      };
    } else {
      param = {
        rid: rid,
        drawId: rotatingwheelid,
        terminal: terminal, //判断终端
        deviceId: window.deviceId_shumei || (window.SMSdk?.getDeviceId() ? window.SMSdk?.getDeviceId() : ''), //PC端直接获取
        pageUrl: window.location.href,
        pageName: document.title,
        deviceToken: deviceToken,
      };
    }
    //调用接口
    $.ajax({
      url: getGiftDomain + '/draw/activity/lotterydrawaddress?aa=' + new Date().getMilliseconds(),
      type: 'get',
      dataType: 'jsonp',
      data: param,
      success: function (res) {
        smVarityLock = true;
        setTimeout(function () {
          var _url = window.location.href;
          if (_url.indexOf('lenovouat') != -1) {
            var _urls = 'reg.lenovouat.com';
          } else {
            var _urls = 'reg.lenovo.com.cn';
          }
          if (_url.indexOf('b.lenovo') != -1) {
            window.open(`https://${_urls}/registpage/pc/enterprisereg.html?ru=https://b.lenovo.com.cn/&ticket=50690e2e-bf8e-4aeb-a8b1-7a03537d1927`);
          } else if (_url.indexOf('biz.lenovo') != -1) {
            window.open(`https://${_urls}/registpage/pc/enterprisereg.html?ru=https://biz.lenovo.com.cn/&ticket=50690e2e-bf8e-4aeb-a8b1-7a03537d1927`);
          } else if (_url.indexOf('sol.lenovo') != -1) {
            window.open(`https://${_urls}/registpage/pc/enterprisereg.html?ru=https://sol.lenovo.com.cn/&ticket=50690e2e-bf8e-4aeb-a8b1-7a03537d1927`);
          } else {
            console.log(1);
          }
        }, 4000);
        $('#result').hide();
        // $("body").removeClass("body_fixed")
        if (res.status == 200) {
          var msg = res.data.msg;
          //移动端
          if (isMobile) {
            if (res.data.wapurl) {
              $('.jumpTo').attr('href', res.data.wapurl);
            } else {
              $('.jumpTo').attr('href', 'javascript:;');
            }

            // 关闭跳转链接处理
            //未中奖
            if (res.data.prizetype == 0) {
              if (res.data.msg.indexOf('//') != -1) {
                //有自带未中奖的图片
                $('.box1').hide();
                $('.box2')
                  .css('backgroundImage', 'url("http:' + res.data.msg + '")')
                  .show();
              } else {
                //使用未中奖的提示语
                $('.box2').hide();
                $('.box1').show();
                $('#result .box1 .gxzj').hide();
                $('#result .box1 .giftname').hide();
                $('#result .box1 .toGet').hide();
                $('#result .box1 .copy_text').hide();
                $('#result .box1 .xxcy').html(res.data.msg).show();
              }
              //中奖了
            } else {
              //是图片ur
              if (res.data.msg.indexOf('//') != -1) {
                $('.box1').hide();
                $('.box2')
                  .css('backgroundImage', 'url("http:' + res.data.msg + '")')
                  .show();
                //是奖品文字
              } else {
                $('.box2').hide();
                $('.box1').show();
                $('#result .box1 .gxzj').show();
                $('#result .box1 .giftname').html(res.data.msg).show();
                if (res && res.data && res.data.prizetype == 1) {
                  $('#result .box1 .toGet')
                    .css({
                      width: '1rem',
                      left: '50%',
                      'margin-left': '-0.5rem',
                    })
                    .text('维护收货地址')
                    .show();
                  $('#result .box1 .copy_text').hide();
                } else if (res && res.data && res.data.prizetype == 4) {
                  msg = res.data.msg + "<br /><i class='code_text'>卡密:<i class='ps_num'>" + res.data.tpCoupon.split(':')[1].toString() + '</i></i>';
                  copyInfo = res.data.tpCoupon.split(':')[1];
                  $('.giftname').html(msg);
                  $('.box2').hide();
                  $('.box1').show();
                  $('#result .box1 .gxzj').show();
                  $('#result .box1 .toGet')
                    .css({
                      width: '0.85rem',
                      left: '25%',
                      'margin-left': '0',
                    })
                    .text('去查看')
                    .show();
                  $('#result .box1 .copy_text').show();
                } else {
                  $('#result .box1 .toGet')
                    .css({
                      width: '0.85rem',
                      left: '50%',
                      'margin-left': '-.425rem',
                    })
                    .text('去查看')
                    .show();
                  $('#result .box1 .copy_text').hide();
                }
                $('#result .box1 .xxcy').hide();
              }
            }
            $('#result').show();
            setTimeout(function () {
              $('#result').hide();
            }, 4000);
          } else {
            //PC端
            if (res.data.url) {
              $('.jumpTo').attr('href', res.data.url);
            } else {
              $('.jumpTo').attr('href', 'javascript:;');
            }

            //未中奖
            if (res.data.prizetype == 0) {
              if (res.data.msg.indexOf('//') != -1) {
                //有自带未中奖的图片
                $('.box1').hide();
                $('.box2')
                  .css('backgroundImage', 'url("http:' + res.data.msg + '")')
                  .show();
              } else {
                //使用未中奖的提示语
                $('.box2').hide();
                $('.box1').show();
                $('#result .box1 .gxzj').hide();
                $('#result .box1 .giftname').hide();
                $('#result .box1 .toGet').hide();
                $('#result .box1 .copy_text').hide();
                $('#result .box1 .xxcy').html(res.data.msg).show();
              }
              //中奖了
            } else {
              //是图片ur
              if (res.data.msg.indexOf('//') != -1) {
                $('.box1').hide();
                $('.box2')
                  .css('backgroundImage', 'url("http:' + res.data.msg + '")')
                  .show();
              } else {
                $('.box2').hide();
                $('.box1').show();
                $('#result .box1 .gxzj').show();
                $('#result .box1 .giftname').html(res.data.msg).show();
                if (res && res.data && res.data.prizetype == 1) {
                  $('#result .box1 .toGet')
                    .css({
                      width: '110px',
                      left: '50%',
                      'margin-left': '-55px',
                    })
                    .text('维护收货地址')
                    .show();
                  $('#result .box1 .copy_text').hide();
                } else if (res && res.data && res.data.prizetype == 4) {
                  msg = res.data.msg + "<br /><i class='code_text'>卡密:<i class='ps_num'>" + res.data.tpCoupon.split(':')[1].toString() + '</i></i>';
                  copyInfo = res.data.tpCoupon.split(':')[1];
                  $('.giftname').html(msg);
                  $('.box2').hide();
                  $('.box1').show();
                  $('#result .box1 .gxzj').show();
                  $('#result .box1 .toGet')
                    .css({
                      width: '85px',
                      left: '30%',
                      'margin-left': '0',
                    })
                    .text('去查看')
                    .show();
                  $('#result .box1 .copy_text').show();
                } else {
                  $('#result .box1 .toGet')
                    .css({
                      width: '85px',
                      left: '50%',
                      'margin-left': '-42.5px',
                    })
                    .text('去查看')
                    .show();

                  $('#result .box1 .copy_text').hide();
                }
                $('#result .box1 .xxcy').hide();
              }
            }
            $('#result').show();
            setTimeout(function () {
              $('#result').hide();
            }, 4000);
          }
        } else if (res.status == 401) {
          passport.show();
          return;
        } else {
          res.msg = res.msg.replace(/[<>#]/g, '');
          alert(res.msg);
          // mySlidercaptcha.reset();
        }
      },
      error: function () {
        smVarityLock = true;
        alert('系统繁忙请稍后重试');
      },
    });
  }

  //注册引导
  $('.off-btn').on('click', function () {
    $('.tel-input').val('');
    $('.code-input').val('');
    countDownNumber = 60;
    clearInterval(timer);
    $('.get-code').html('获取验证码');
    $('.mask-laye-box').hide();
    $('.sign-in-box').hide();
  });

  // 倒计时
  function countDown() {
    countDownNumber = 60;
    clearInterval(timer);
    timer = window.setInterval(function () {
      if (countDownNumber == 0) {
        getCodeFlag = true;
        clearInterval(timer);
        timer = null;
        countDownNumber = 60;
        $('.get-code').html('获取验证码');
      } else {
        countDownNumber--;
        $('.get-code').html('已发送 ' + countDownNumber);
      }
    }, 1000);
  }

  // 倒计时发送验证码
  function getCode(rid) {
    $.ajax({
      url: loginDomain + '/captcha/cansend',
      type: 'get',
      dataType: 'jsonp',
      data: {
        rid: rid,
        platForm: 1,
        shopId: 1,
        deviceId: window.deviceId_shumei || (window.SMSdk?.getDeviceId() ? window.SMSdk?.getDeviceId() : ''), //PC端直接获取
        ticket: 'e40e7004-4c8a-4963-8564-31271a8337d8',
        mobile: $.trim($('.tel-input').val()),
        slide: 'v2',
        t: new Date().getTime(),
      },
      success: function (data) {
        if (data.ret == 1) {
          $('.code-error').show().find('.error-text').html(data.msg);
          return;
        }
        // 开始倒计时
        countDown();
      },
      error: function (error) {
        console.log(error);
      },
    });
  }

  $('.get-code').on('click', function () {
    if (getCodeFlag) {
      var tel = $('.tel-input').val();
      if (tel == '') {
        $('.tel-error').show().find('.error-text').html('请输入手机号');
        return;
      } else if (!regTel.test(tel)) {
        $('.tel-error').show().find('.error-text').html('手机号码格式不正确');
        return;
      }
      $('.tel-error').hide();

      ucInit();
    }
  });

  $('.form-item-btn').on('click', function () {
    var tel = $('.tel-input').val();
    var code = $('.code-input').val();
    if (tel == '') {
      $('.tel-error').show().find('.error-text').html('请输入手机号');
      return;
    } else if (!regTel.test(tel)) {
      $('.tel-error').show().find('.error-text').html('手机号码格式不正确');
      return;
    }
    $('.tel-error').hide();
    if (code == '') {
      $('.code-error').show().find('.error-text').html('验证码不能为空');
      return;
    }
    $('.code-error').hide();

    // 注册
    $.ajax({
      url: loginDomain + '/auth/v1/fastlogin',
      type: 'post',
      dataType: 'jsonp',
      data: {
        account: $.trim($('.tel-input').val()),
        ticket: 'e40e7004-4c8a-4963-8564-31271a8337d8',
        captcha: $.trim($('.code-input').val()),
        ps: 0,
      },
      success: function (data) {
        if (data.ret == 0) {
          if (data.isNew == 'true' || data.isNew == true) {
            window.localStorage.setItem('isNew', true);
            window.location.replace(document.URL);
          } else {
            window.location.replace(document.URL);
          }
        } else {
          $('.code-error').show().find('.error-text').html(data.msg);
          return;
        }
      },
      error: function (error) {
        console.log(error);
      },
    });
  });

  function ucInit() {
    smVarityLock = false;
    // 判断是否加载二次封装js
    if (window.mySmcpJs == true && window.smcpJs == true) {
      // 每次初始化滑块传回调参数即可
      window.myInitSMCaptcha(
        function (SMCaptcha) {
          SMCaptcha.onReady(function () {
            // 空间背景图加载完毕回调
            var result = SMCaptcha.getResult();
            var pass = result.pass;
            //显示验证码的时机,通过调用verify方法启动
            if (!pass) {
              SMCaptcha.verify();
            }
          });
          SMCaptcha.onClose(function () {
            smVarityLock = true;
          });
          SMCaptcha.onSuccess(function (data) {
            var rid = data.rid;
            // 选对处理
            if (data.pass) {
              //  调用验证码或者抽奖逻辑
              getCode(rid);
            } else {
              // 空间验证滑块错误
            }
          });

          SMCaptcha.onError(function (errType, errMsg) {
            smVarityLock = true;
            console.log('errType------' + errType);
            console.log('errMsg------' + errMsg);
          });
        },
        {
          organization: 'OiSyzKqqwO9gAy7AsaIP', //公司标识,,数美后台查看
          // mode: 'spatial_select',
          mode: 'slide',
          product: 'popup',
          maskBindClose: true, //popup 模式有效，遮罩层绑定关闭弹层事件
          https: 'isHttps',
          width: 330,
        }
      );
    }
  }
});


;
$(function(){var $iconLis=$(".quick-access-li");var isOldToNew=$iconLis.parents(".oldtonew").length;if(!isOldToNew){$iconLis.each(function(index,item){$(item).on("mouseenter",function(){$(this).find(".cur-img").hide();$(this).find(".hover-img").css("display","block");$(this).animate({bottom:"5px"});$(this).addClass("box_shadow")}).on("mouseleave",function(){$(this).find(".hover-img").hide();$(this).find(".cur-img").css("display","block");$(this).animate({top:"5px"});$(this).addClass("box_shadow")})})}});
$(function(){function loadScript(url,callback){var script=document.createElement("script");script.type="text/javascript";if(typeof(callback)!="undefined"){if(script.readyState){script.onreadystatechange=function(){if(script.readyState=="loaded"||script.readyState=="complete"){script.onreadystatechange=null;callback()}}}else{script.onload=function(){callback()}}}script.src=url;document.body.appendChild(script)}if(window.location.href.indexOf("lenovouat")!=-1){var windowAdvertJs="https://m1.lenovouat.com/windowAdvert/windowAdvert.js"}else{var windowAdvertJs="https://m1.lefile.cn/windowAdvert/windowAdvert.js"}var latag=$(".latag3_4").attr("latag3_4")!=""?$(".latag3_4").attr("latag3_4"):"";loadScript(windowAdvertJs,function(){window.luckydraw(latag,1,"","")})});
/**
 * easytimer.js
 * Generated: 2019-10-31
 * Version: 4.0.2
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
    ? define(['exports'], factory)
    : ((global = global || self), factory((global.easytimer = {})));
})(this, function (exports) {
  'use strict';

  function _typeof(obj) {
    if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function leftPadding(string, padLength, character) {
    var i;
    var characters = '';
    string = typeof string === 'number' ? String(string) : string;

    if (string.length > padLength) {
      return string;
    }

    for (i = 0; i < padLength; i = i + 1) {
      characters += String(character);
    }

    return (characters + string).slice(-characters.length);
  }

  function TimeCounter() {
    this.secondTenths = 0;
    this.seconds = 0;
    this.minutes = 0;
    this.hours = 0;
    this.days = 0;
    /**
     * [toString convert the counted values on a string]
     * @param  {array} units           [array with the units to display]
     * @param  {string} separator       [separator of the units]
     * @param  {number} leftZeroPadding [number of zero padding]
     * @return {string}                 [result string]
     */

    this.toString = function () {
      var units = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['hours', 'minutes', 'seconds'];
      var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ':';
      var leftZeroPadding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
      units = units || ['hours', 'minutes', 'seconds'];
      separator = separator || ':';
      leftZeroPadding = leftZeroPadding || 2;
      var stringTime;
      var arrayTime = [];
      var i;

      for (i = 0; i < units.length; i = i + 1) {
        if (this[units[i]] !== undefined) {
          if (units[i] === 'secondTenths') {
            arrayTime.push(this[units[i]]);
          } else {
            arrayTime.push(leftPadding(this[units[i]], leftZeroPadding, '0'));
          }
        }
      }

      stringTime = arrayTime.join(separator);
      return stringTime;
    };
  }

  /*
   * Polyfill por IE9, IE10 and IE11
   */
  var CustomEvent$1 = typeof window !== 'undefined' ? window.CustomEvent : undefined;

  if (typeof window !== 'undefined' && typeof CustomEvent$1 !== 'function') {
    CustomEvent$1 = function CustomEvent(event, params) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined,
      };
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };

    CustomEvent$1.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent$1;
  }

  /*
   * General functions, variables and constants
   */

  var SECOND_TENTHS_PER_SECOND = 10;
  var SECONDS_PER_MINUTE = 60;
  var MINUTES_PER_HOUR = 60;
  var HOURS_PER_DAY = 24;
  var SECOND_TENTHS_POSITION = 0;
  var SECONDS_POSITION = 1;
  var MINUTES_POSITION = 2;
  var HOURS_POSITION = 3;
  var DAYS_POSITION = 4;
  var SECOND_TENTHS = 'secondTenths';
  var SECONDS = 'seconds';
  var MINUTES = 'minutes';
  var HOURS = 'hours';
  var DAYS = 'days';
  var VALID_INPUT_VALUES = [SECOND_TENTHS, SECONDS, MINUTES, HOURS, DAYS];
  var unitsInMilliseconds = {
    secondTenths: 100,
    seconds: 1000,
    minutes: 60000,
    hours: 3600000,
    days: 86400000,
  };
  var groupedUnits = {
    secondTenths: SECOND_TENTHS_PER_SECOND,
    seconds: SECONDS_PER_MINUTE,
    minutes: MINUTES_PER_HOUR,
    hours: HOURS_PER_DAY,
  };
  var events = typeof module !== 'undefined' && module.exports && typeof require === 'function' ? require('events') : undefined;

  function hasDOM() {
    return typeof document !== 'undefined';
  }

  function hasEventEmitter() {
    return events;
  }

  function mod(number, module) {
    return ((number % module) + module) % module;
  }
  /**
   * [Timer Timer/Chronometer/Countdown compatible with AMD and NodeJS.
   * Can update time values with different time intervals: tenth of seconds,
   * seconds, minutes and hours.]
   */

  function Timer() {
    /*
     * PRIVATE variables and Functions
     */
    var counters = new TimeCounter();
    var totalCounters = new TimeCounter();
    var intervalId;
    var eventEmitter = hasDOM() ? document.createElement('span') : hasEventEmitter() ? new events.EventEmitter() : undefined;
    var running = false;
    var paused = false;
    var precision;
    var timerTypeFactor;
    var customCallback;
    var timerConfig = {};
    var currentParams;
    var targetValues;
    var startValues;
    var countdown;
    var startingDate;
    var targetDate;
    var eventData = {
      detail: {
        timer: this,
      },
    };

    function updateCounters(precision, roundedValue) {
      totalCounters[precision] = roundedValue;

      if (precision === DAYS) {
        counters[precision] = roundedValue;
      } else if (roundedValue >= 0) {
        counters[precision] = mod(roundedValue, groupedUnits[precision]);
      } else {
        counters[precision] = groupedUnits[precision] - mod(roundedValue, groupedUnits[precision]);
      }
    }

    function updateDays(value) {
      return updateUnitByPrecision(value, DAYS);
    }

    function updateHours(value) {
      return updateUnitByPrecision(value, HOURS);
    }

    function updateMinutes(value) {
      return updateUnitByPrecision(value, MINUTES);
    }

    function updateSeconds(value) {
      return updateUnitByPrecision(value, SECONDS);
    }

    function updateSecondTenths(value) {
      return updateUnitByPrecision(value, SECOND_TENTHS);
    }

    function updateUnitByPrecision(value, precision) {
      var previousValue = totalCounters[precision];
      updateCounters(precision, calculateIntegerUnitQuotient(value, unitsInMilliseconds[precision]));
      return totalCounters[precision] !== previousValue;
    }

    function stopTimerAndResetCounters() {
      stopTimer();
      resetCounters();
    }

    function stopTimer() {
      clearInterval(intervalId);
      intervalId = undefined;
      running = false;
      paused = false;
    }

    function setParamsAndStartTimer(params) {
      if (!isPaused()) {
        setParams(params);
      } else {
        startingDate = calculateStartingDate();
        targetValues = setTarget(currentParams.target);
      }

      startTimer();
    }

    function startTimer() {
      var interval = unitsInMilliseconds[precision];

      if (isTargetAchieved(roundTimestamp(Date.now()))) {
        return;
      }

      intervalId = setInterval(updateTimerAndDispatchEvents, interval);
      running = true;
      paused = false;
    }

    function calculateStartingDate() {
      return roundTimestamp(Date.now()) - totalCounters.secondTenths * unitsInMilliseconds[SECOND_TENTHS] * timerTypeFactor;
    }

    function updateTimerAndDispatchEvents() {
      var currentTime = roundTimestamp(Date.now());
      var valuesUpdated = updateTimer();
      dispatchEvents(valuesUpdated);
      customCallback(eventData.detail.timer);

      if (isTargetAchieved(currentTime)) {
        stop();
        dispatchEvent('targetAchieved', eventData);
      }
    }

    function updateTimer() {
      var currentTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : roundTimestamp(Date.now());
      var elapsedTime = timerTypeFactor > 0 ? currentTime - startingDate : startingDate - currentTime;
      var valuesUpdated = {};
      valuesUpdated[SECOND_TENTHS] = updateSecondTenths(elapsedTime);
      valuesUpdated[SECONDS] = updateSeconds(elapsedTime);
      valuesUpdated[MINUTES] = updateMinutes(elapsedTime);
      valuesUpdated[HOURS] = updateHours(elapsedTime);
      valuesUpdated[DAYS] = updateDays(elapsedTime);
      return valuesUpdated;
    }

    function roundTimestamp(timestamp) {
      return Math.floor(timestamp / unitsInMilliseconds[precision]) * unitsInMilliseconds[precision];
    }

    function dispatchEvents(valuesUpdated) {
      if (valuesUpdated[SECOND_TENTHS]) {
        dispatchEvent('secondTenthsUpdated', eventData);
      }

      if (valuesUpdated[SECONDS]) {
        dispatchEvent('secondsUpdated', eventData);
      }

      if (valuesUpdated[MINUTES]) {
        dispatchEvent('minutesUpdated', eventData);
      }

      if (valuesUpdated[HOURS]) {
        dispatchEvent('hoursUpdated', eventData);
      }

      if (valuesUpdated[DAYS]) {
        dispatchEvent('daysUpdated', eventData);
      }
    }

    function isTargetAchieved(currentDate) {
      return targetValues instanceof Array && currentDate >= targetDate;
    }

    function resetCounters() {
      for (var counter in counters) {
        if (counters.hasOwnProperty(counter) && typeof counters[counter] === 'number') {
          counters[counter] = 0;
        }
      }

      for (var _counter in totalCounters) {
        if (totalCounters.hasOwnProperty(_counter) && typeof totalCounters[_counter] === 'number') {
          totalCounters[_counter] = 0;
        }
      }
    }

    function setParams(params) {
      params = params || {};
      precision = checkPrecision(params.precision);
      customCallback = typeof params.callback === 'function' ? params.callback : function () {};
      countdown = params.countdown === true;
      timerTypeFactor = countdown === true ? -1 : 1;

      if (_typeof(params.startValues) === 'object') {
        setStartValues(params.startValues);
      } else {
        startValues = null;
      }

      startingDate = calculateStartingDate();
      updateTimer();

      if (_typeof(params.target) === 'object') {
        targetValues = setTarget(params.target);
      } else if (countdown) {
        params.target = {
          seconds: 0,
        };
        targetValues = setTarget(params.target);
      } else {
        targetValues = null;
      }

      timerConfig = {
        precision: precision,
        callback: customCallback,
        countdown: _typeof(params) === 'object' && params.countdown === true,
        target: targetValues,
        startValues: startValues,
      };
      currentParams = params;
    }

    function checkPrecision(precision) {
      precision = typeof precision === 'string' ? precision : SECONDS;

      if (!isValidInputValue(precision)) {
        throw new Error('Error in precision parameter: '.concat(precision, ' is not a valid value'));
      }

      return precision;
    }

    function isValidInputValue(value) {
      return VALID_INPUT_VALUES.indexOf(value) >= 0;
    }

    function configInputValues(inputValues) {
      var secondTenths, seconds, minutes, hours, days, values;

      if (_typeof(inputValues) === 'object') {
        if (inputValues instanceof Array) {
          if (inputValues.length !== 5) {
            throw new Error('Array size not valid');
          }

          values = inputValues;
        } else {
          for (var value in inputValues) {
            if (VALID_INPUT_VALUES.indexOf(value) < 0) {
              throw new Error('Error in startValues or target parameter: '.concat(value, ' is not a valid input value'));
            }
          }

          values = [inputValues.secondTenths || 0, inputValues.seconds || 0, inputValues.minutes || 0, inputValues.hours || 0, inputValues.days || 0];
        }
      }

      secondTenths = values[SECOND_TENTHS_POSITION];
      seconds = values[SECONDS_POSITION] + calculateIntegerUnitQuotient(secondTenths, SECOND_TENTHS_PER_SECOND);
      minutes = values[MINUTES_POSITION] + calculateIntegerUnitQuotient(seconds, SECONDS_PER_MINUTE);
      hours = values[HOURS_POSITION] + calculateIntegerUnitQuotient(minutes, MINUTES_PER_HOUR);
      days = values[DAYS_POSITION] + calculateIntegerUnitQuotient(hours, HOURS_PER_DAY);
      values[SECOND_TENTHS_POSITION] = secondTenths % SECOND_TENTHS_PER_SECOND;
      values[SECONDS_POSITION] = seconds % SECONDS_PER_MINUTE;
      values[MINUTES_POSITION] = minutes % MINUTES_PER_HOUR;
      values[HOURS_POSITION] = hours % HOURS_PER_DAY;
      values[DAYS_POSITION] = days;
      return values;
    }

    function calculateIntegerUnitQuotient(unit, divisor) {
      var quotient = unit / divisor;
      return quotient < 0 ? Math.ceil(quotient) : Math.floor(quotient);
    }

    function setTarget(inputTarget) {
      if (!inputTarget) {
        return;
      }

      targetValues = configInputValues(inputTarget);
      var targetCounter = calculateTotalCounterFromValues(targetValues);
      targetDate = startingDate + targetCounter.secondTenths * unitsInMilliseconds[SECOND_TENTHS] * timerTypeFactor;
      return targetValues;
    }

    function setStartValues(inputStartValues) {
      startValues = configInputValues(inputStartValues);
      counters.secondTenths = startValues[SECOND_TENTHS_POSITION];
      counters.seconds = startValues[SECONDS_POSITION];
      counters.minutes = startValues[MINUTES_POSITION];
      counters.hours = startValues[HOURS_POSITION];
      counters.days = startValues[DAYS_POSITION];
      totalCounters = calculateTotalCounterFromValues(startValues, totalCounters);
    }

    function calculateTotalCounterFromValues(values, outputCounter) {
      var total = outputCounter || {};
      total.days = values[DAYS_POSITION];
      total.hours = total.days * HOURS_PER_DAY + values[HOURS_POSITION];
      total.minutes = total.hours * MINUTES_PER_HOUR + values[MINUTES_POSITION];
      total.seconds = total.minutes * SECONDS_PER_MINUTE + values[SECONDS_POSITION];
      total.secondTenths = total.seconds * SECOND_TENTHS_PER_SECOND + values[[SECOND_TENTHS_POSITION]];
      return total;
    }
    /*
     * PUBLIC functions
     */

    /**
     * [stop stops the timer and resets the counters. Dispatch stopped event]
     */

    function stop() {
      stopTimerAndResetCounters();
      dispatchEvent('stopped', eventData);
    }
    /**
     * [stop stops and starts the timer. Dispatch stopped event]
     */

    function reset() {
      stopTimerAndResetCounters();
      setParamsAndStartTimer(currentParams);
      dispatchEvent('reset', eventData);
    }
    /**
     * [start starts the timer configured by the params object. Dispatch started event]
     * @param  {object} params [Configuration parameters]
     */

    function start() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (isRunning()) {
        return;
      }

      setParamsAndStartTimer(params);
      dispatchEvent('started', eventData);
    }
    /**
     * [pause stops the timer without resetting the counters. The timer it can be restarted with start function.
     * Dispatch paused event]
     * @return {type} [description]
     */

    function pause() {
      stopTimer();
      paused = true;
      dispatchEvent('paused', eventData);
    }
    /**
     * [addEventListener Adds event listener to the timer]
     * @param {string} eventType      [event to listen]
     * @param {function} listener   [the event listener function]
     */

    function addEventListener(eventType, listener) {
      if (hasDOM()) {
        eventEmitter.addEventListener(eventType, listener);
      } else if (hasEventEmitter()) {
        eventEmitter.on(eventType, listener);
      }
    }
    /**
     * [removeEventListener Removes event listener to the timer]
     * @param  {string} eventType    [event to remove listener]
     * @param  {function} listener [listener to remove]
     */

    function removeEventListener(eventType, listener) {
      if (hasDOM()) {
        eventEmitter.removeEventListener(eventType, listener);
      } else if (hasEventEmitter()) {
        eventEmitter.removeListener(eventType, listener);
      }
    }
    /**
     * [dispatchEvent dispatches an event]
     * @param  {string} eventType [event to dispatch]
     * @param data
     */

    function dispatchEvent(eventType, data) {
      if (hasDOM()) {
        eventEmitter.dispatchEvent(new CustomEvent(eventType, data));
      } else if (hasEventEmitter()) {
        eventEmitter.emit(eventType, data);
      }
    }
    /**
     * [isRunning return true if the timer is running]
     * @return {Boolean}
     */

    function isRunning() {
      return running;
    }
    /**
     * [isPaused returns true if the timer is paused]
     * @return {Boolean}
     */

    function isPaused() {
      return paused;
    }
    /**
     * [getTimeValues returns the counter with the current timer values]
     * @return {TimeCounter}
     */

    function getTimeValues() {
      return counters;
    }
    /**
     * [getTotalTimeValues returns the counter with the current timer total values]
     * @return {TimeCounter}
     */

    function getTotalTimeValues() {
      return totalCounters;
    }
    /**
     * [getConfig returns the configuration parameters]
     * @return {type}
     */

    function getConfig() {
      return timerConfig;
    }
    /**
     * Public API
     * Definition of Timer instance public functions
     */

    if (typeof this !== 'undefined') {
      this.start = start;
      this.pause = pause;
      this.stop = stop;
      this.reset = reset;
      this.isRunning = isRunning;
      this.isPaused = isPaused;
      this.getTimeValues = getTimeValues;
      this.getTotalTimeValues = getTotalTimeValues;
      this.getConfig = getConfig;
      this.addEventListener = addEventListener;
      this.on = addEventListener;
      this.removeEventListener = removeEventListener;
      this.off = removeEventListener;
    }
  }

  exports.Timer = Timer;
  exports.default = Timer;

  Object.defineProperty(exports, '__esModule', { value: true });
});
(function (window, document, $, undefined) {
  if (document.domain.indexOf('lenovouat') == -1) {
    //生产环境
    var sessionUrl = 'https://promotion.lenovo.com.cn';
    var productUrl = 'https://f.lenovo.com.cn';
    var jumpUrl = 'https://shop.lenovo.com.cn/miaosha/index.html';
  } else {
    //uat环境
    var sessionUrl = 'https://promotion.lenovouat.com';
    var productUrl = 'https://f.lenovouat.com';
    var jumpUrl = 'https://shop.lenovouat.com/thinkpad/secList.html';
  }
  var changeState = true;
  var tabOneIsGoing = false;
  var haveTimerTabObj;

  var curSessionIndex = 1; // 全局记录当前所在场次
  // 秒杀场次组件
  var SecKillSession = function () {
    this.$sessionBox = $('.middle-countdown-ul');
    this.__sessionList = []; // 秒杀场次
    this._sessionVisible = false; // 所有场次都结束
    this.proInstance = {};
    this.countTime = {};
    this.init();
  };
  SecKillSession.prototype = {
    constructor: SecKillSession,
    init: function () {
      this.getSecKillSession();
      this.bindEvent();
    },
    // 获取秒杀场次信息
    getSecKillSession: function () {
      var self = this;
      $('.count-down').html('');
      self.__sessionList = [];
      $.ajax({
        type: 'POST',
        url: sessionUrl + '/api/seckillScene/getSeckillScene.jhtm',
        data: {
          shopid: 1,
          terminal: 1,
          businessGroup: 1,
        },
        dataType: 'jsonp',
        jsonp: 'callbackparam',
        timeout: 5000,
        complete: function () {},
        error: function (err, status) {
          console.log('Get session info error' + err);
        },
        success: function (data) {
          if (data.t && data.t.length > 0) {
            var sessionArr = data.t;
            $.each(sessionArr, function (index, obj) {
              self.__sessionList.push({
                id: obj.id,
                shopId: obj.shopId,
                seckillStartTime: obj.seckillStartTime,
                seckillEndTime: obj.seckillEndTime,
                displayTime: obj.displayTime,
                currentTime: obj.currentTime,
              });
            });
            self.rendSecKillSession();
          } else {
            $('.flash-wrap').css('display', 'none');
          }
        },
      });
    },
    //判断li是否是抢购中状态
    seckillIsGoing: function (obj) {
      if (obj.currentTime > obj.seckillStartTime && obj.currentTime < obj.seckillEndTime) {
        //抢购中
        tabOneIsGoing = true;
        // console.log(1)
        return 1;
      } else if (obj.currentTime < obj.seckillStartTime) {
        //抢购即将开始
        tabOneIsGoing = false;
        return 0;
      }
    },
    //判断场次是否为明天
    isTomorrow: function (curTime, starTime) {
      var curNow = new Date(curTime);
      var starNow = new Date(starTime);
      if (
        curNow.getFullYear(curTime) == starNow.getFullYear(starTime) &&
        curNow.getMonth(curTime) + 1 == starNow.getMonth(starTime) + 1 &&
        curNow.getDate(curTime) == starNow.getDate(starTime) - 1
      ) {
        return true; //明天
      } else {
        return false;
      }
    },
    //获取时间差值
    getRemainderTime: function (curTime, startTime) {
      var s2 = curTime,
        s1 = startTime,
        runTime = parseInt((s1 - s2) / 1000);
      var year = Math.floor(runTime / 86400 / 365);
      runTime = runTime % (86400 * 365);
      var month = Math.floor(runTime / 86400 / 30);
      runTime = runTime % (86400 * 30);
      var day = Math.floor(runTime / 86400);
      runTime = runTime % 86400;
      var hour = Math.floor(runTime / 3600);
      runTime = runTime % 3600;
      var minute = Math.floor(runTime / 60);
      runTime = runTime % 60;
      var second = runTime;
      return {
        days: day,
        hours: hour,
        minutes: minute,
        seconds: second,
      };
    },
    // 更新秒杀场次
    rendSecKillSession: function () {
      var self = this;
      var _sessionHtml = '';
      var str = '';
      var tabnum = JSON.parse(window.sessionStorage.getItem('curtab'));
      // console.log(self.__sessionList[0])
      $.each(self.__sessionList, function (index, obj) {
        // console.log(tabnum)
        if (tabnum == null || tabnum <= 0) {
          tabnum = 1;
        }
        // console.log(tabnum,index,obj)

        _sessionHtml +=
          '<li class="middle-countdown-li ' +
          (index == tabnum - 1 ? 'active' : '') +
          ' cur_countdown" data-shopid="' +
          obj.shopId +
          '" tab="' +
          (index + 1) +
          '"  id="' +
          obj.id +
          '" data-starttime="' +
          obj.seckillStartTime +
          '"latag="latag_pc_秒杀_场次_' +
          index +
          '_' +
          obj.displayTime +
          '_null"' +
          'data-id=' +
          obj.id +
          '><div class="middle-countdown-item"><span class="middle-round">' +
          obj.displayTime +
          '</span><i class="middle-round-txt">场</i>-<span class="current-round-txt">' +
          (self.seckillIsGoing(obj) ? '正在抢购' : self.isTomorrow(obj.currentTime, obj.seckillStartTime) ? '明日开始' : '即将开始') +
          '</span></div></li>';
        if (index == tabnum - 1) {
          str +=
            ' <div class="count-down count-down' +
            obj.id +
            '" style="display:block"><span class="left-round">' +
            obj.displayTime +
            '</span><span class="left-round-txt">场</span><div class="flash-countdown-txt">' +
            (self.seckillIsGoing(obj) ? '距结束还剩' : self.isTomorrow(obj.currentTime, obj.seckillStartTime) ? '明日开始' : '即将开始') +
            '</div><div class="left-countdown-wrap timer' +
            obj.id +
            '"></div></div>';
        } else {
          str +=
            ' <div class="count-down count-down' +
            obj.id +
            '" style="display:none"><span class="left-round">' +
            obj.displayTime +
            '</span><span class="left-round-txt">场</span><div class="flash-countdown-txt">' +
            (self.seckillIsGoing(obj) ? '距结束还剩' : self.isTomorrow(obj.currentTime, obj.seckillStartTime) ? '明日开始' : '即将开始') +
            '</div><div class="left-countdown-wrap timer' +
            obj.id +
            '"></div></div>';
        }

        obj.timer = new easytimer.Timer();
        if (self.seckillIsGoing(obj)) {
          obj.timer.start({
            countdown: true,
            precision: 'seconds',
            startValues: self.getRemainderTime(obj.currentTime, obj.seckillEndTime),
          });
        } else {
          obj.timer.start({
            countdown: true,
            precision: 'seconds',
            startValues: self.getRemainderTime(obj.currentTime, obj.seckillStartTime),
          });
        }
        self.bindTimerEnv(obj.timer, 'timer' + obj.id, obj);
      });
      haveTimerTabObj = self.__sessionList;
      // console.log(haveTimerTabObj)
      self.$sessionBox.html(_sessionHtml);
      $('.flash-left-countdown').html(str);
      if (tabnum == null) {
        //初始化列表传参
        self.proInstance = new SecKillPro(self.__sessionList[0].shopId, self.__sessionList[0].id, self.__sessionList[0].seckillStartTime);
      } else {
        //有选中项的传参
        self.proInstance = new SecKillPro(self.__sessionList[tabnum - 1].shopId, self.__sessionList[tabnum - 1].id, self.__sessionList[tabnum - 1].seckillStartTime);
      }
      changeState = true;
      // 初始化当前页面选中的场次信息
      $('.middle-countdown-li').each(function (index, item) {
        if ($(this).hasClass('active')) {
          curSessionIndex = index + 1;
        }
      });
    },
    bindTimerEnv: function (timerObj, domClass, val) {
      var self = this;
      // if(self.seckillIsGoing(val)){//抢购中
      timerObj.on('secondsUpdated', function (e) {
        // console.log("更新倒计时")
        var _curValObj = timerObj.getTimeValues();

        if (self.seckillIsGoing(val)) {
          $('.' + domClass).html('<i>' + _curValObj.toString(['hours']) + '</i>:<i>' + _curValObj.toString(['minutes']) + '</i>:<i>' + _curValObj.toString(['seconds']) + '</i>');
        } else {
          $('.' + domClass).html('<i>' + _curValObj.toString(['hours']) + '</i>:<i>' + _curValObj.toString(['minutes']) + '</i>:<i>' + _curValObj.toString(['seconds']) + '</i>');
          $('.' + domClass).css('display', 'none');
        }

        // $('.'+ domClass).html('<i>' + _curValObj.toString(['hours']) + '</i>:<i>' + _curValObj.toString(['minutes']) + '</i>:<i>' + _curValObj.toString(['seconds']) + '</i>')

        // $('.'+domClass).css('display','none')
      });

      timerObj.on('stopped', function (e) {
        // console.log("重置倒计时")
        $.each(haveTimerTabObj, function (k, v) {
          if (k < 5) {
            if (v.timer.isRunning()) {
              v.timer.stop();
            }
          }
        });
        // 重置倒计时
        if (changeState == true) {
          changeState = false;
          var newtabnum = sessionStorage.getItem('curtab');
          if (newtabnum == 1) {
            //当前选中的第一项
            window.sessionStorage.setItem('curtab', 1);
          } else {
            if (tabOneIsGoing) {
              //抢购中
              window.sessionStorage.setItem('curtab', JSON.stringify(Number(newtabnum) - 1));
            } else {
              window.sessionStorage.setItem('curtab', JSON.stringify(Number(newtabnum)));
            }
          }
          setTimeout(function () {
            //场次结束清除当前场次结构
            self.getSecKillSession();
          }, 1000);
        }
      });
      // }else{//即将开始
      //     $('.'+ domClass).html('')
      // }
      // timerObj.on('secondsUpdated', function (e) {
      //     // console.log("更新倒计时")
      //     var _curValObj = timerObj.getTimeValues();
      //     $('.'+ domClass).html('<i>' + _curValObj.toString(['hours']) + '</i>:<i>' + _curValObj.toString(['minutes']) + '</i>:<i>' + _curValObj.toString(['seconds']) + '</i>')
      // });
      // timerObj.on('stopped', function (e) {
      //     // console.log("重置倒计时")
      //     // 重置倒计时
      //     setTimeout(function () {
      //         self.getSecKillSession()
      //     }, 1000);
      // });
    },
    bindEvent: function () {
      var self = this;

      self.$sessionBox.on('click', 'li', function (env) {
        var curSessionTime = $(this).find('.middle-round').text(), // 当前场次时间
          $sessionTit = $('.left-round'); // 左侧秒杀场次

        $sessionTit.text(curSessionTime);

        $(this).siblings('li').removeClass('active').end().addClass('active'); //点击的时候切换li的样式
        var curTab = $(this).attr('tab');
        var id = $(this).attr('id');
        window.sessionStorage.setItem('curtab', curTab);
        $('.count-down').siblings().css('display', 'none');
        $('.count-down' + id).css('display', 'block');

        var shopid = $(this).data('shopid');
        var id = $(this).data('id');
        var startTime = $(this).data('starttime');
        self.proInstance.getSecKillPro(shopid, id, startTime);

        // 获取当前浏览的场次 index
        curSessionIndex = $(this).attr('tab');
      });

      $('.right-center-cont a').on('click', function () {
        window.location.href = jumpUrl + '?pagenum=' + curSessionIndex;
      });
      $('#flash-countdown-link').on('click', function () {
        window.location.href = jumpUrl + '?pagenum=' + curSessionIndex;
      });
    },
    // setNextDaySession: function (index) {
    //     var self = this;
    //     self.$sessionBox.find('.middle-round').eq(index).prepend('<span>明日</span>');
    // }
  };

  // 秒杀产品列表组件
  var SecKillPro = function (shopid, id, startTime) {
    this.__proList = [];
    (this.shopid = shopid), //保存上个函数传过来的shopid和id值 和时间
      (this.id = id),
      (this.listSort = {}),
      (this.startTime = startTime),
      (this.$productBox = $('.middle-product-list-ul'));
    this.init();
  };
  SecKillPro.prototype = {
    constructor: SecKillPro,
    init: function () {
      this.getSecKillPro(this.shopid, this.id, this.startTime);
    },
    // 获取产品列表
    getSecKillPro: function (shopid, id, startTime) {
      var self = this;
      var startTime;
      $.ajax({
        type: 'POST',
        url: sessionUrl + '/api/seckillScene/getGoodsByScene.jhtm',
        data: {
          shopid: shopid,
          id: id,
        },
        dataType: 'jsonp',
        jsonp: 'callbackparam',
        timeout: 5000,
        error: function (err, status) {
          console.log('Get session product error' + err);
        },
        success: function (data) {
          // 限制每个场次的商品为6个
          var Arr = JSON.parse(data.t).slice(0, 6);
          self.listSort = JSON.parse(data.t).slice(0, 6);
          var ids = [];
          $.each(Arr, function (key, val) {
            ids.push(val);
          });
          ids = ids.join(',');
          self.getproInfo(ids, startTime);
        },
      });
    },
    //根据code获取商品详细信息
    getproInfo: function (ids, startTime) {
      var self = this;
      $.ajax({
        type: 'get',
        url: productUrl + '/goods/activity/detail/B00001',
        data: {
          code: ids,
          startTime: startTime,
          terminal: 1,
        },
        dataType: 'jsonp',
        // jsonpCallback: 'jQueryJSONP_seckill_get',
        // jsonp: 'jsonpCallback',
        error: function (err) {
          console.log('Get product error' + err);
        },
        success: function (data) {
          // console.log(333,data.result)
          var productList = data.result;
          if (data) {
            self.__proList = [];
          }
          // 组装数据
          $.each(productList, function (key, val) {
            self.__proList.push({
              gcode: key,
              Activity: val.Activity,
              // 优先获取到手价
              price:
                val.deliveryPrice.deliverPrice && val.deliveryPrice.deliverPrice.price != ''
                  ? val.deliveryPrice.deliverPrice.price
                  : val.P_C && val.P_C.C_1 && val.P_C.C_1.P_0 && val.P_C.C_1.P_0.DV && val.P_C.C_1.P_0.DV.V,
              detail: val.detail,
            });
          });
          self.renderSecKillPro();
        },
      });
    },
    // 渲染秒杀产品列表
    renderSecKillPro: function () {
      var self = this;
      var secKillProHtml = '';
      $.each(self.listSort, function (sortKey, sortVal) {
        // console.log(999,sortKey,sortVal)
        $.each(self.__proList, function (index, obj) {
          if (sortVal == obj.gcode) {
            //只显示4个产品
            // console.log(index,obj)
            if (obj.price == '1.00' || obj.price == '1.0' || obj.price == '1') {
              //一元秒的情况
              secKillProHtml +=
                '<li class="middle-product-list-li"><a href="' +
                jumpUrl +
                '?pagenum=' +
                curSessionIndex +
                '" latag="latag_pc_秒杀_商品_' +
                index +
                '_https://shop.lenovo.com.cn/miaosha/index.html_' +
                obj.detail.name +
                '"><div class="product-detail-img"><img class="pro-thumbnail" src="' +
                'https:' +
                obj.detail.thumbnail.path +
                '" alt=""></div><div class="product-detail-title"><span class="pro-detail-txt" title="' +
                obj.detail.name +
                '">' +
                obj.detail.name +
                '</span></div><div class="product-detail-icons"><div class="pro-icon seckill"><i class="pro-icon-pic"></i><span class="pro-icon-txt">1元秒</span></div></div><div class="product-detail-price"><div class="pro-cur-price"><span class="currency-sign">¥</span><span class="pro-price">' +
                self.handlePrice(obj.price) +
                '</span></div><div class="pro-del-price"><span class="del-sign">¥</span><span class="del-price">' +
                obj.detail.basePrice +
                '</span></div></div></a></li>';
            } else if (obj.price == '') {
              //暂无报价
              secKillProHtml +=
                '<li class="middle-product-list-li"><a href="' +
                jumpUrl +
                '?pagenum=' +
                curSessionIndex +
                '" latag="latag_pc_秒杀_商品_' +
                index +
                '_https://shop.lenovo.com.cn/miaosha/index.html_' +
                obj.detail.name +
                '"><div class="product-detail-img"><img class="pro-thumbnail" src="' +
                'https:' +
                obj.detail.thumbnail.path +
                '" alt=""></div><div class="product-detail-title"><span class="pro-detail-txt" title="' +
                obj.detail.name +
                '">' +
                obj.detail.name +
                '</span></div> <div class="product-detail-icons"><div class="pro-icon discount" style = "display:' +
                (discount == '10' || discount < '1' || discount == 'undefined' || discount == null ? 'none' : 'block') +
                '"> <i class="pro-icon-pic"></i><span class="pro-icon-txt">' +
                discount +
                '折' +
                '</span></div ></div ><div class="product-detail-price"><div class="pro-cur-price"><span class="pro-price">￥暂无报价</span></div><div class="pro-del-price"><span class="del-sign">¥</span><span class="del-price">' +
                obj.detail.basePrice +
                '</span></div></div></a></li>';
            } else {
              //显示折扣的情况
              var discount = Math.ceil(((100 - obj.Activity.discountPercentage) / 10) * 10) / 10;
              // console.log(999,discount)
              secKillProHtml +=
                '<li class="middle-product-list-li"><a href="' +
                jumpUrl +
                '?pagenum=' +
                curSessionIndex +
                '" latag="latag_pc_秒杀_商品_' +
                index +
                '_https://shop.lenovo.com.cn/miaosha/index.html_' +
                obj.detail.name +
                '"><div class="product-detail-img"><img class="pro-thumbnail" src="' +
                'https:' +
                obj.detail.thumbnail.path +
                '" alt=""></div><div class="product-detail-title"><span class="pro-detail-txt" title="' +
                obj.detail.name +
                '">' +
                obj.detail.name +
                '</span></div> <div class="product-detail-icons"><div class="pro-icon discount" style = "display:' +
                (discount == '10' || discount < '1' ? 'none' : 'block') +
                '"> <i class="pro-icon-pic"></i><span class="pro-icon-txt">' +
                discount +
                '折' +
                '</span></div ></div ><div class="product-detail-price"><div class="pro-cur-price"><span class="currency-sign">¥</span><span class="pro-price">' +
                self.handlePrice(obj.price) +
                '</span></div><div class="pro-del-price"><span class="del-sign">¥</span><span class="del-price">' +
                obj.detail.basePrice +
                '</span></div></div></a></li>';
            }
          } else {
            return true;
          }
        });
      });

      self.$productBox.html('');
      self.$productBox.html(secKillProHtml);
    },
    handlePrice: function (val) {
      if (val.toString().indexOf('.') != -1) {
        var num1 = val.toString().split('.')[0];
        var num2 = val.toString().split('.')[1];
        //88.01  => 88.01
        if (num2.length == 2 && num2.split('')[0] == '0' && num2.split('')[1] != '0') {
          return num1 + '.0' + num2.split('')[1];
          //88.10 =>88.1
        } else if (num2.length == 2 && num2.split('')[0] != '0' && num2.split('')[1] == '0') {
          return num1 + '.' + num2.split('')[0];
        } else if (num2.length == 1 && num2 != 0) {
          return num1 + '.' + num2.split('')[0];
        } else {
          return num1;
        }
      } else {
        return val;
      }
    },
  };

  // 实例化产品组件
  new SecKillSession();
})(window, document, jQuery);


;
var Fnav=(function(){var _fnav={};_fnav.floornav=function(){var floorNav=$("#J-floor-nav-box");var floorNavA=floorNav.find("a");floorNavA.bind("click",function(){floorNavA.removeClass("active");$(this).addClass("active");var scrolltodom=$(this).attr("data-scroll");$("html,body").animate({scrollTop:$(scrolltodom).offset().top-50},500);return false})};return _fnav})(jQuery,Fnav);function showOrHide(){var scroll_top=$(document).scrollTop();var win_height=$(window).height();var first_top=$(".nav_floor_item:eq(0)").offset().top;var blankWidth=($(window).width()-1200)/2;if(blankWidth<50){$("#J-floor-nav-box").hide();$("#J-floor-nav-box").find("li>a").removeClass("active")}else{if(scroll_top+200<first_top){$("#J-floor-nav-box").hide();$("#J-floor-nav-box").find("li>a").removeClass("active")}else{if($(".footer").offset().top-scroll_top<=$(window).height()){$("#J-floor-nav-box").hide();$("#J-floor-nav-box").find("li>a").removeClass("active")}else{$("#J-floor-nav-box").show()}}}}$(function(){Fnav.floornav();win_scroll();setTimeout(function(){win_scroll()},1000);$(document).scroll(function(){win_scroll()});$(window).resize(function(){win_scroll()});function heighlight_when_scroll(index){$("#J-floor-nav-box").find("li>a").removeClass("active");$("#J-floor-nav-box").find("li>a:eq("+index+")").addClass("active")}var timer=null;function win_scroll(){if(timer){clearTimeout(timer);timer=null}timer=setTimeout(function(){showOrHide();var scroll_top=$(document).scrollTop();var doc_height=$(document).height();var sc_height=$(window).height();$(".nav_floor_item").each(function(index){var hasSelKill=$(".flash-wrap").length>0&&!$(".flash-wrap").is(":hidden");if(!hasSelKill){$("#miaosha_floor").hide().next(".ns_line").hide();if(!$(this).hasClass("flash-wrap")){var top=$(this).offset().top-56;if($("#J-floor-nav-box").attr("data-noSecKill")=="false"){index++}if(top<=scroll_top){heighlight_when_scroll(index)}if(doc_height==scroll_top-0+sc_height){var last=$("#J-floor-nav-box li>a").length-1;heighlight_when_scroll(last)}}}else{$("#miaosha_floor").show().next(".ns_line").show();var top=$(this).offset().top-56;if(top<=scroll_top){heighlight_when_scroll(index)}if(doc_height==scroll_top-0+sc_height){var last=$("#J-floor-nav-box li>a").length-1;heighlight_when_scroll(last)}}})},30)}});$(function(){try{if($("body").find(".list_nav").length>0&&window.location.href.indexOf("shop.lenovo")!=-1){$(".list_nav").find("a").each(function(){if($(this).attr("href").indexOf("?")!=-1){$(this).attr("href",$(this).attr("href")+"&frompage=home")}else{$(this).attr("href",$(this).attr("href")+"?frompage=home")}})}}catch(error){}});

