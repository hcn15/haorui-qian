/**
 * 全局变量声明
 * productListData - 产品服务数据列表
 * scrollDataList - 核心技术滚动数据列表
 * techSwiper - 核心技术轮播实例
 * sceneSwiper - 应用场景轮播实例
 */
let productListData = [];
let currentProductIndex = 0;
let scrollDataList = [];
let techSwiper = null;
let sceneSwiper = null;

/**
 * 页面加载完成后初始化，并行调用所有数据接口
 */
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🚀 页面加载完成，开始并行调用接口...');

    new CommonNav({ loadNav: false });
    new LazyLoad();

    const promises = [
        loadNewsData(),
        loadProductData(),
        loadCoreTechData(),
        loadSceneData()
    ];

    await Promise.all(promises);

    console.log('🎉 所有接口调用完成！');
});

/**
 * 初始化全局状态 G，用于控制产品跳转逻辑（关闭浏览器自动重置）
 */
if (sessionStorage.getItem('G') === null) {
    sessionStorage.setItem('G', '0');
}

/**
 * 获取全局状态 G 的值
 * @returns {number} G 的整数值
 */
function getG() { return parseInt(sessionStorage.getItem('G')); }

/**
 * 设置全局状态 G 为 1
 */
function setG1() { sessionStorage.setItem('G', '1'); }

/**
 * 根据产品ID跳转对应页面
 * 根据全局状态 G 判断跳转路径：G=1 跳转到产品详情，否则先设置 G=1 再跳转
 * @param {number} id - 产品ID
 */
function goProduct(id) {
    if (getG() === 1) { 
        window.location.href = './chanpin1.html?id=' + id; 
    } else { 
        setG1(); 
        window.location.href = './index-aboutus.html?id=' + id; 
    }
}

/**
 * 加载资讯动态数据，渲染新闻列表和图片轮播
 * 数据来源：GET /website/news?latest=true
 */
async function loadNewsData() {
    console.log('🔹 开始调用：资讯动态接口');
    const json = await (window.__PRELOAD_PROMISES__.news || fetch(`${SERVER_BASE_URL}/website/news?latest=true`).then(r => r.json()));
    console.log("✅ 成功拿到新闻：", json);
    let newsList = json.data || [];

    newsList = newsList.sort((a, b) => b.id - a.id);

    const listEl = document.getElementById("news-list");
    const newsFragment = document.createDocumentFragment();
    newsList.forEach((news, index) => {
        const li = document.createElement("li");
        li.style.cssText = "display:flex; padding:18px 0; border-bottom:1px solid #eee; cursor:pointer;";
        const newsDate = Utils.formatDate(news.date);
        li.innerHTML = `
            <div style="width:70px; text-align:center; color:#c8102e; font-weight:bold;">
                <div style="font-size:16px;">${newsDate}</div>
            </div>
            <div style="flex:1;">
                <h3 style="margin:0 0 5px; font-size:16px; font-weight:normal;">${news.title}</h3>
                <p style="margin:0; font-size:14px; color:#666;">${news.summary || (news.content ? news.content.substring(0, 50) + '...' : '暂无摘要')}</p>
            </div>
        `;
        li.onclick = () => location.href = `./news-detail.html?id=${news.id}`;
        newsFragment.appendChild(li);
    });
    listEl.appendChild(newsFragment);

    const sliderEl = document.getElementById("slider-container");
    const items = [];
    const sliderFragment = document.createDocumentFragment();

    newsList.forEach((news, idx) => {
        const div = document.createElement("div");
        div.style.cssText = `
            position:absolute; 
            top:0; 
            left:0; 
            width:100%; 
            height:100%; 
            transition: opacity 0.8s ease;
            cursor: pointer;
        `;
        const imgUrl = getImageUrl(news.imageUrl || '');
        div.innerHTML = `
            <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;">
            <div style="position:absolute; bottom:0; left:0; right:0; padding:30px 25px; background:linear-gradient(transparent, rgba(0,0,0,0.6));">
                <span style="background:#c8102e; color:#fff; padding:6px 14px; border-radius:4px; font-size:14px; margin-bottom:12px; display:inline-block;">集团要闻</span>
                <h3 style="font-size:22px; color:#fff; margin:0; line-height:1.4;">${news.title}</h3>
            </div>
        `;
        div.onclick = () => location.href = `./news-detail.html?id=${news.id}`;
        sliderFragment.appendChild(div);
        items.push(div);
    });
    sliderEl.appendChild(sliderFragment);

    let current = 0;
    items.forEach((it, i) => it.style.opacity = i === 0 ? 1 : 0);

    /**
     * 跳转到指定索引的轮播图
     * @param {number} index - 目标轮播图索引
     */
    function goToSlide(index) {
        if (items.length === 0) return;
        items[current].style.opacity = 0;
        current = (index + items.length) % items.length;
        items[current].style.opacity = 1;
    }

    /** 跳转到下一张轮播图 */
    function nextSlide() {
        goToSlide(current + 1);
    }

    /** 跳转到上一张轮播图 */
    function prevSlide() {
        goToSlide(current - 1);
    }

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    setInterval(() => {
        nextSlide();
    }, 3000);
    console.log('✅ 资讯动态接口调用完成');
}

/** 产品服务区域的DOM容器引用 */
const imgPcWrap = document.getElementById('imgPcWrap');
const imgMdWrap = document.getElementById('imgMdWrap');
const txtWrap = document.getElementById('txtWrap');
const iconBoxWrap = document.getElementById('iconBoxWrap');

/**
 * 加载产品服务数据，渲染PC/移动端图片、文字描述和图标切换区域
 * 数据来源：GET /website/product
 */
async function loadProductData() {
    console.log('🔹 开始调用：产品服务接口');
    try {
        const resData = await (window.__PRELOAD_PROMISES__.product || fetch(`${SERVER_BASE_URL}/website/product`).then(r => r.json()));

        if (resData.code !== 0 || !Array.isArray(resData.data)) {
            console.log('❌ 产品服务接口异常');
            return;
        }
        productListData = resData.data;

        let pcImgHtml = '';
        let mdImgHtml = '';
        let txtItemHtml = '';
        let iconItemHtml = '';

        productListData.forEach((item, index) => {
            const { name, title, imageUrl, itemOne, itemTwo, itemThree, itemFour, itemFive, itemSix } = item;
            const displayStyle = index === 0 ? 'display: block;' : 'display: none;';
            const imgUrl = getImageUrl(imageUrl);

            pcImgHtml += `<img class="cp-img" data-index="${index}" loading="lazy" src="${imgUrl}" alt="${name}.jpg" style="${displayStyle}">`;
            mdImgHtml += `<img class="cp-img" data-index="${index}" loading="lazy" src="${imgUrl}" alt="${name}.jpg" style="${displayStyle}">`;

            let labelHtml = '';
            const labelArr = [itemOne, itemTwo, itemThree, itemFour, itemFive, itemSix];
            labelArr.forEach(label => {
                if (label && label !== 'null') {
                    labelHtml += `<span>${label}</span>`;
                }
            });

            txtItemHtml += `
                <div class="hth_txt_item cp-txt-item" data-index="${index}" style="${displayStyle}">
                    <div class="g_tit">
                        <div class="g_tit_t">
                            <span class="">${name}</span>
                            <h3 class="font-m font44">${title}</h3>
                        </div>
                        <div class="g_tit_lab font20">
                            ${labelHtml}
                        </div>
                    </div>
                    <div class="g_num">
                        <div class="item">
                            <div class="item_t">
                                <p class="font-r"> </p>
                                <span class=""> </span>
                            </div>
                            <div class="item_b">
                                <p> </p>
                            </div>
                        </div>
                        <div class="item">
                            <div class="item_t">
                                <p class="font-r"> </p>
                                <span class=""> </span>
                            </div>
                            <div class="item_b">
                                <p> </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const jumpFunc = `goProduct(${item.id})`;
            const onClass = index === 0 ? 'item on' : 'item';

            iconItemHtml += `
                <div class="${onClass} cp-icon-item" data-index="${index}">
                    <div class="g_svg">
                        <i>
                            ${getSvgByIndex(index)}
                        </i>
                        <p class="font20 font-m">${name}</p>
                    </div>
                    <div class="txt">
                        <p class="font30">${name}</p>
                        <a href="javascript:${jumpFunc}" title="${name}" class="public-btn font20">
                            <p class=" font-m">探索更多</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="10.844" height="10" viewBox="0 0 10.844 10" data-inject-url="" loading="lazy">
                                <defs>
                                    <style>
                                        .cls-1 {
                                            fill: #fff;
                                            fill-rule: evenodd;
                                        }
                                    </style>
                                </defs>
                                <path id="形状_1_拷贝_4--inject-18" data-name="形状 1 拷贝 4" class="cls-1"
                                    d="M207.821,577.433a1.139,1.139,0,0,1,.241-0.459,0.786,0.786,0,0,1,.513-0.24c0.059,0,.119,0,0.179,0h7.48a0.4,0.4,0,0,0-.062-0.046,1.872,1.872,0,0,1-.609-0.462q-1.008-1.089-2.019-2.177a0.9,0.9,0,0,1-.243-0.919,0.731,0.731,0,0,1,1.166-.387,1.4,1.4,0,0,1,.143.135q1.892,2.029,3.782,4.061a0.876,0.876,0,0,1,.164,1.063,1.054,1.054,0,0,1-.158.212q-1.9,2.042-3.8,4.079a0.74,0.74,0,0,1-1.169-.022,0.9,0.9,0,0,1,.006-1.061c0.041-.053.085-0.1,0.13-0.15q0.861-.925,1.723-1.849a2.634,2.634,0,0,1,.923-0.781c0-.009,0-0.019-0.008-0.029h-0.119q-3.7,0-7.4,0a0.766,0.766,0,0,1-.688-0.32,2.361,2.361,0,0,1-.174-0.4v-0.249Z"
                                    transform="translate(-207.812 -572.562)"></path>
                            </svg>
                        </a>
                    </div>
                </div>
            `;
        });

        imgPcWrap.innerHTML = pcImgHtml;
        imgMdWrap.innerHTML = mdImgHtml;
        txtWrap.innerHTML = txtItemHtml;
        iconBoxWrap.innerHTML = iconItemHtml;

        renderProductNav();

        bindSwitchEvent();
        console.log('✅ 产品服务接口调用完成');
    } catch (err) {
        console.log('❌ 产品服务接口请求失败：', err);
    }
}

/**
 * 动态渲染顶部导航和移动端导航中的产品服务下拉菜单
 */
function renderProductNav() {
    const navProductSub = document.getElementById('navProductSub');
    const mobileNavProductSub = document.getElementById('mobileNavProductSub');
    
    if (!navProductSub && !mobileNavProductSub) return;

    let navHtml = '';
    let mobileNavHtml = '';

    productListData.forEach((item, index) => {
        const { name, id } = item;
        const jumpUrl = `./chanpin1.html?id=${id}`;

        navHtml += `
            <div class="new-nav-sub-item">
                <a href="${jumpUrl}" class="new-nav-sub-link">${name}</a>
            </div>
        `;

        mobileNavHtml += `
            <div class="mobile-nav-sub-item">
                <a href="${jumpUrl}" class="mobile-nav-sub-link">${name}</a>
            </div>
        `;
    });

    if (navProductSub) {
        navProductSub.innerHTML = navHtml;
    }
    if (mobileNavProductSub) {
        mobileNavProductSub.innerHTML = mobileNavHtml;
    }
}

/**
 * 为产品服务图标项绑定鼠标移入和点击事件，触发产品切换
 */
function bindSwitchEvent() {
    const iconItems = document.querySelectorAll('.cp-icon-item');
    iconItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            const index = parseInt(this.getAttribute('data-index'));
            switchToItem(index);
        });
        item.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            if (index === currentProductIndex) {
                goProduct(productListData[index].id);
            } else {
                switchToItem(index);
            }
        });
    });
}

/**
 * 切换到指定索引的产品展示（同步切换图标状态、图片和文字）
 * @param {number} index - 目标产品索引
 */
function switchToItem(index) {
    currentProductIndex = index;
    document.querySelectorAll('.cp-icon-item').forEach((el, idx) => {
        if (idx === index) {
            el.classList.add('on');
        } else {
            el.classList.remove('on');
        }
    });

    document.querySelectorAll('.cp-img').forEach((el, idx) => {
        if (idx === index) {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    });

    document.querySelectorAll('.cp-txt-item').forEach((el, idx) => {
        if (idx === index) {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    });
}

/**
 * 根据索引返回对应的产品图标SVG
 * @param {number} idx - 图标索引
 * @returns {string} SVG字符串
 */
function getSvgByIndex(idx) {
    const svgList = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="72.469" height="72.53" viewBox="0 0 72.469 72.53" data-inject-url="" loading="lazy"><defs><style>.cls-133{fill:#fff;stroke:#1ca1ee;stroke-width:2px;fill-rule:evenodd;}</style></defs><path id="形状_29--inject-13" data-name="形状 29" class="cls-133" d="M180.547,4771.1h-2.71v-46.11a2.707,2.707,0,0,0-1.316-2.32l-27.106-16.27a2.69,2.69,0,0,0-2.79,0l-16.263,9.76a2.711,2.711,0,0,0-1.316,2.33v10.25l-9.344,4.68a2.713,2.713,0,0,0-1.5,2.42v35.26h-2.711a2.71,2.71,0,1,0,0,5.42h65.054A2.71,2.71,0,1,0,180.547,4771.1Zm-29.816,0H145.31v-10.85h5.421v10.85Zm21.684,0h-5.421v-29.83a2.716,2.716,0,0,0-2.71-2.72H131.757a2.717,2.717,0,0,0-2.711,2.72v21.69a2.711,2.711,0,1,0,5.421,0v-18.98h27.106v27.12h-5.421v-13.56a2.709,2.709,0,0,0-2.711-2.71H142.6a2.709,2.709,0,0,0-2.711,2.71v13.56H123.625v-33.58l9.291-4.65c0.034-.02.067-0.03,0.1-0.05l12.293-6.15v3.75a2.711,2.711,0,0,0,5.421,0v-8.14a2.7,2.7,0,0,0-3.923-2.42l-12.341,6.17v-6.01l13.553-8.13,24.395,14.64v44.57Z" transform="translate(-111.781 -4705)"></path></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="44.12" height="50" viewBox="0 0 44.12 50" data-inject-url="" loading="lazy"><defs><style>.cls-1{fill:#fff;fill-rule:evenodd;}</style></defs><path id="形状_716--inject-37" data-name="形状 716" class="cls-1" d="M1416.01,4727.52h11.98v-7.75h-11.98v7.75Zm2.59-5.17h6.8v2.58h-6.8v-2.58Zm3.4-16.88-22.05,11.98v7.57h2.58v-6.03l2.33-1.27v30.81h34.28v-30.81l2.32,1.27v6.03h2.59v-7.57Zm-1.83,33.91-4.89,4.89v-9.78Zm1.83,1.83,4.74,4.74h-9.48Zm1.83-1.83,4.89-4.89v9.78Zm-1.83-1.83-4.87-4.86h9.74Zm14.56,8.4h-5.26V4730.1h-18.6v15.85h-5.26v-29.63l14.56-7.91,14.56,7.91v29.63Z" transform="translate(-1399.94 -4702)"></path></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="59.47" height="50" viewBox="0 0 59.47 50" data-inject-url="https://" loading="lazy"><defs><style>.cls-155{fill:#fff;stroke:#2362bd;stroke-width:1px;fill-rule:evenodd;}</style></defs><path id="形状_717--inject-38" data-name="形状 717" class="cls-155" d="M1629.34,4744.85h-5.36a7.359,7.359,0,0,1-14.22,0h-10.95a7.359,7.359,0,0,1-14.22,0h-4.8a1.845,1.845,0,0,1,0-3.69h4.77a7.358,7.358,0,0,1,14.28,0h10.89a7.358,7.358,0,0,1,14.28,0h3.48v-9.5l-2.68-3.45h-14.32a1.842,1.842,0,0,1-1.84-1.84v-12.9h-28.86a1.84,1.84,0,1,1,0-3.68h30.7a1.835,1.835,0,0,1,1.84,1.84v1.84h7.86a1.817,1.817,0,0,1,1.64,1.02l5.53,10.99h0l3.43,4.42a1.864,1.864,0,0,1,.39,1.13v11.98A1.848,1.848,0,0,1,1629.34,4744.85Zm-37.64-5.59a3.685,3.685,0,1,0,3.69,3.68A3.683,3.683,0,0,0,1591.7,4739.26Zm25.17,0a3.685,3.685,0,1,0,3.69,3.68A3.683,3.683,0,0,0,1616.87,4739.26Zm2.18-22.1h-6.72v7.36h10.43Zm-23.91,2.02a1.835,1.835,0,0,1-1.84,1.84h-15.72a1.84,1.84,0,1,1,0-3.68h15.72A1.835,1.835,0,0,1,1595.14,4719.18Zm-3.01,7.25a1.842,1.842,0,0,1-1.84,1.84h-15.72a1.84,1.84,0,1,1,0-3.68h15.72A1.835,1.835,0,0,1,1592.13,4726.43Zm-14.55,5.4h8.47a1.84,1.84,0,1,1,0,3.68h-8.47A1.84,1.84,0,1,1,1577.58,4731.83Z" transform="translate(-1572.22 -4705.045)"></path></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="36.625" height="50.34" viewBox="0 0 36.625 50.34" data-inject-url="" loading="lazy"><defs><style>.cls-1{fill:#fff;fill-rule:evenodd;}</style></defs><path id="形状_712--inject-39" data-name="形状 712" class="cls-1" d="M722.366,4729.2a3.125,3.125,0,0,0-1.375-1.94l-13.255-8.88-0.521-15.56a3.14,3.14,0,0,0-6.279-.04l-0.677,15.83-12.886,8.53a3.151,3.151,0,1,0,3.265,5.39l12.907-7.23a3.712,3.712,0,0,0,1.244-.04v0.03l12.839,7.3a3.123,3.123,0,0,0,1.656.47,3.552,3.552,0,0,0,.728-0.08,3.118,3.118,0,0,0,2.369-3.72Zm-19.077-27.12a1.034,1.034,0,0,1,.761-0.31,1.086,1.086,0,0,1,1.072,1.1v0.01l0.521,15.15a3.832,3.832,0,0,0-3.275.03l0.6-15.23A1.042,1.042,0,0,1,703.289,4702.08Zm-13.724,28.66a1.072,1.072,0,1,1-1.1-1.84h0.013l11.735-7.76v0.36a3.812,3.812,0,0,0,1.1,2.68Zm12.709-9.24a1.765,1.765,0,1,1,0,.03v-0.03Zm17.931,8.98a1.037,1.037,0,0,1-.666.47,1.052,1.052,0,0,1-.844-0.15l-11.834-6.71a3.758,3.758,0,0,0,.974-3.12l12.021,8.01a1.084,1.084,0,0,1,.349,1.48v0.02Zm-6.445,17.44h-5.207l-0.64-17.75a1.042,1.042,0,1,0-2.083.07l0.62,17.64h-4.509l0.62-17.64a1.042,1.042,0,1,0-2.083-.07h0l-0.625,17.75h-5.206a1.04,1.04,0,1,0,0,2.08H713.76A1.04,1.04,0,1,0,713.76,4747.92Z" transform="translate(-685.844 -4699.66)"></path></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="41.87" height="50" viewBox="0 0 41.87 50" data-inject-url="" loading="lazy"><defs><style>.cls-1{fill:#fff;fill-rule:evenodd;}</style></defs><path id="形状_715--inject-41" data-name="形状 715" class="cls-1" d="M1262.38,4745.77h-4.45l-8.53-28.5h10.95v2.5a1.25,1.25,0,0,0,2.5,0v-3.76a1.244,1.244,0,0,0-.56-1.04l-13.93-9.12a1.242,1.242,0,0,0-.69-0.21h-9.98a1.187,1.187,0,0,0-.68.21l-13.92,9.12a1.269,1.269,0,0,0-.56,1.04v3.76a1.25,1.25,0,0,0,2.5,0v-2.5h10.95l-8.53,28.5H1223a1.25,1.25,0,0,0,0,2.5h39.38a1.25,1.25,0,0,0,0-2.5h0Zm-25.14-23.99,3.3,2.36-5.1,3.64Zm12.7,6-5.1-3.64,3.3-2.36Zm1.32,4.44,3.49,11.67-9.91-7.09Zm-1.85-1.75-6.72,4.8-6.71-4.8,6.71-4.79Zm-15.29,1.75,6.42,4.58-9.91,7.09Zm8.57,6.12,10.41,7.43h-20.82Zm-3.78-23.57v-6.63h7.56v6.63h-7.56Zm10.06,0v-5.53l8.45,5.53h-8.45Zm-12.56-5.54v5.54h-8.45Zm10.38,8.04,0.6,1.98-4.7,3.36-4.69-3.36,0.59-1.98h8.2Z" transform="translate(-1221.75 -4701.95)"></path></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="49.406" height="50" viewBox="0 0 49.406 50" data-inject-url="" loading="lazy"><defs><style>.cls-1{fill:#fff;fill-rule:evenodd;}</style></defs><path id="形状_713--inject-40" data-name="形状 713" class="cls-1" d="M908.546,4730.57l-9.511-23.03a1.074,1.074,0,0,0-.992-0.66H869.811a1.075,1.075,0,0,0-.992.66l-9.5,23.03a1.08,1.08,0,0,0,.576,1.41,0.94,0.94,0,0,0,.437.08h3.522v16.82a1.074,1.074,0,0,0,1.073,1.08h38.064a1.074,1.074,0,0,0,1.073-1.08v-16.82h3.522a1.069,1.069,0,0,0,1.048-1.1A1.09,1.09,0,0,0,908.546,4730.57Zm-22.013,17.23h-5.211v-8.76h5.211v8.76Zm15.354,0h-13.21v-9.84a1.074,1.074,0,0,0-1.072-1.08h-7.356a1.074,1.074,0,0,0-1.072,1.08v9.84H865.972v-15.74h35.921Zm-39.952-17.9,8.578-20.86H897.32l8.626,20.86H861.935Zm33.626-18.77H872.3a1.07,1.07,0,0,0-1,.69l-5.608,14.55a1.087,1.087,0,0,0,.615,1.4,1.026,1.026,0,0,0,.388.07h34.451a1.078,1.078,0,0,0,1.075-1.08,1.143,1.143,0,0,0-.072-0.39l-5.581-14.58A1.073,1.073,0,0,0,895.561,4711.13Zm-17.783,7.02h4.959v2.6h-5.4Zm-2.622,2.6h-5l1-2.6H875.6Zm7.576-4.76h-4.584l0.472-2.7h4.117Zm2.144-2.74h4.118l0.471,2.74h-4.589v-2.74Zm-2.144,9.66v2.75h-6.241l0.456-2.73Zm2.144,0h5.774l0.472,2.75h-6.246v-2.75Zm0-2.16v-2.6h4.938l0.445,2.6h-5.383Zm7.136-2.6H896.7l1,2.6h-5.243Zm3.86-2.16h-4.235l-0.467-2.7h3.651Zm-22.839-2.7h3.41l-0.472,2.7h-3.989Zm-3.7,9.64H874.8l-0.471,2.75h-6.053Zm23.965,2.75-0.472-2.75h5.7l1.072,2.75h-6.3Z" transform="translate(-859.219 -4703.425)"></path></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="72.469" height="72.53" viewBox="0 0 72.469 72.53" data-inject-url="" loading="lazy"><defs><style>.cls-133{fill:#fff;stroke:#1ca1ee;stroke-width:2px;fill-rule:evenodd;}</style></defs><path id="形状_29--inject-13" data-name="形状 29" class="cls-133" d="M180.547,4771.1h-2.71v-46.11a2.707,2.707,0,0,0-1.316-2.32l-27.106-16.27a2.69,2.69,0,0,0-2.79,0l-16.263,9.76a2.711,2.711,0,0,0-1.316,2.33v10.25l-9.344,4.68a2.713,2.713,0,0,0-1.5,2.42v35.26h-2.711a2.71,2.71,0,1,0,0,5.42h65.054A2.71,2.71,0,1,0,180.547,4771.1Zm-29.816,0H145.31v-10.85h5.421v10.85Zm21.684,0h-5.421v-29.83a2.716,2.716,0,0,0-2.71-2.72H131.757a2.717,2.717,0,0,0-2.711,2.72v21.69a2.711,2.711,0,1,0,5.421,0v-18.98h27.106v27.12h-5.421v-13.56a2.709,2.709,0,0,0-2.711-2.71H142.6a2.709,2.709,0,0,0-2.711,2.71v13.56H123.625v-33.58l9.291-4.65c0.034-.02.067-0.03,0.1-0.05l12.293-6.15v3.75a2.711,2.711,0,0,0,5.421,0v-8.14a2.7,2.7,0,0,0-3.923-2.42l-12.341,6.17v-6.01l13.553-8.13,24.395,14.64v44.57Z" transform="translate(-111.781 -4705)"></path></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="#fff"><path d="M25 5l-8 20h16l-8-20zm0 25l-6 15h12l-6-15zm-15 0l5-15h-5v15zm30 0v15h-5l5-15z"/></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="#fff"><path d="M25 2C12.3 2 2 12.3 2 25s10.3 23 23 23 23-10.3 23-23S37.7 2 25 2zm0 40c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-28c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 16c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="#fff"><path d="M25 5L10 20h10l-5 15h10l5-15h10L25 5zm0 8l8 12h-16l8-12z"/></svg>`
    ];
    return svgList[idx] || '';
}

/**
 * 加载核心技术数据，渲染技术展示区和技术滚动轮播
 * 数据来源：GET /website/techMain（主技术数据）和 GET /website/techScrolling（滚动技术列表）
 */
async function loadCoreTechData() {
    console.log('🔹 开始调用：核心技术接口');
    try {
        const techResData = await (window.__PRELOAD_PROMISES__.techMain || fetch(`${SERVER_BASE_URL}/website/techMain`).then(r => r.json()));
        if (techResData.code === 0 && Array.isArray(techResData.data) && techResData.data.length > 0) {
            const data = techResData.data[0];
            document.getElementById('titleLeftText').innerText = data.titleLeft || '';
            document.getElementById('imgLeftXs').src = getImageUrl(data.imageUrlLeft || '');
            document.getElementById('imgLeftYc').src = getImageUrl(data.imageUrlLeft || '');

            document.getElementById('titleRightText').innerText = data.title || '';
            document.getElementById('imgRightXs').src = getImageUrl(data.imageUrl || '');
            document.getElementById('imgRightYc').src = getImageUrl(data.imageUrl || '');

            const wrap = document.getElementById('techItemWrap');
            let itemHtml = '';
            const paramList = [
                { label: data.itemOne, value: data.itemOneValue },
                { label: data.itemTwo, value: data.itemTwoValue },
                { label: data.itemThree, value: data.itemThreeValue },
                { label: data.itemFour, value: data.itemFourValue },
                { label: data.itemFive, value: data.itemFiveValue },
                { label: data.itemSix, value: data.itemSixValue }
            ];
            paramList.forEach(item => {
                if (item.label && item.value) {
                    itemHtml += `
                        <div class="txt_p font24">
                            <p>${item.label}<span>${item.value}</span></p>
                        </div>
                    `;
                }
            });
            wrap.innerHTML = itemHtml;
        }

        const scrollResData = await (window.__PRELOAD_PROMISES__.techScrolling || fetch(`${SERVER_BASE_URL}/website/techScrolling`).then(r => r.json()));
        if (scrollResData.code === 0 && Array.isArray(scrollResData.data)) {
            scrollDataList = scrollResData.data;
            const wrapper = document.getElementById('swiperWrapper');
            let slideHtml = '';

            scrollDataList.forEach((item, index) => {
                const delay = (0.2 + index * 0.1).toFixed(1);
                slideHtml += `
                    <div class="swiper-slide" style="width: 444px; margin-right:20px;">
                        <div class="item wow fadeInUp" style="visibility:visible; animation-delay:${delay}s;">
                            <div class="public-img" style="width:100%; height:auto; overflow:hidden;">
                                <a href="${item.hrefTo || '#'}" target="_blank">
                                    <img loading="lazy" src="${getImageUrl(item.imageUrl)}" alt="${item.title || ''}"
                                        style="width:100%; height:260px; object-fit:cover; display:block;">
                                </a>
                            </div>
                            <div class="txt" style="text-align:center; margin-top:10px;">
                                <h3 class="font-b font26" style="color:#fff;">${item.title || ''}</h3>
                            </div>
                        </div>
                    </div>
                `;
            });

            wrapper.innerHTML = slideHtml;
            requestAnimationFrame(() => {
                setTimeout(initTechSwiper, 200);
            });
        }
        console.log('✅ 核心技术接口调用完成');
    } catch (err) {
        console.error('❌ 核心技术接口请求失败：', err);
    }
}

/**
 * 初始化核心技术轮播（Swiper）
 * 配置：3张/屏、自动播放、支持循环
 */
function initTechSwiper() {
    if (techSwiper) {
        techSwiper.destroy(true, true);
        techSwiper = null;
    }

    const canLoop = scrollDataList.length >= 2;

    techSwiper = new Swiper('.swiper-tech', {
        allowTouchMove: true,
        touchAngle: 30,
        grabCursor: true,
        watchSlidesProgress: false,
        watchSlidesVisibility: false,

        autoplay: {
            delay: 4000,
            disableOnInteraction: true,
            pauseOnMouseEnter: true
        },

        speed: 800,
        loop: canLoop,
        slidesPerView: 3,
        spaceBetween: 20,
        centeredSlides: false,
        freeMode: false,

        pagination: {
            el: '.swip2_pag',
            clickable: true
        }
    });
}

/** 窗口大小改变时更新轮播（防抖处理） */
const debouncedResize = Utils.debounce(() => {
    if (techSwiper) {
        techSwiper.update();
    }
}, 200);

window.addEventListener('resize', debouncedResize);

/** 页面隐藏时停止轮播，显示时恢复轮播 */
document.addEventListener('visibilitychange', () => {
    if (techSwiper) {
        if (document.hidden) {
            techSwiper.autoplay.stop();
        } else {
            techSwiper.autoplay.start();
        }
    }
});

/** 页面卸载时销毁轮播实例，释放资源 */
window.addEventListener('beforeunload', () => {
    if (techSwiper) {
        techSwiper.destroy(true, true);
        techSwiper = null;
    }
    if (sceneSwiper) {
        sceneSwiper.destroy(true, true);
        sceneSwiper = null;
    }
});

/**
 * 初始化应用场景轮播（Swiper）
 * 配置：自动播放、循环、自适应宽度
 */
function initSceneSwiper() {
    setTimeout(() => {
        if (sceneSwiper) sceneSwiper.destroy(true, true);
        sceneSwiper = new Swiper('.swiper-scene', {
            autoplay: {
                delay: 5000,
                disableOnInteraction: true,
                pauseOnMouseEnter: true,
            },
            speed: 1200,
            loop: true,
            loopAdditionalSlides: 2,
            slidesPerView: 'auto',
            spaceBetween: 0,
            centeredSlides: false,
            freeMode: false,
            watchOverflow: false,
            watchSlidesProgress: false,
            watchSlidesVisibility: false,
            pagination: {
                el: '.swip2_pag',
                clickable: true,
            }
        })
    }, 200)
}

/**
 * 加载应用场景数据，渲染场景轮播
 * 数据来源：GET /website/scene
 */
async function loadSceneData() {
    console.log('🔹 开始调用：应用场景接口');
    try {
        const wrapDom = document.getElementById('sceneWrap');

        const resData = await (window.__PRELOAD_PROMISES__.scene || fetch(`${SERVER_BASE_URL}/website/scene`).then(r => r.json()));

        if (resData.code !== 0 || !Array.isArray(resData.data)) {
            console.warn('❌ 应用场景接口异常');
            return;
        }
        let htmlStr = '';
        resData.data.forEach((item, idx) => {
            let textArr = [];
            if (item.textOne) textArr.push(item.textOne);
            if (item.textTwo) textArr.push(item.textTwo);
            if (item.textThree) textArr.push(item.textThree);
            if (item.textFour) textArr.push(item.textFour);
            if (item.textFive) textArr.push(item.textFive);
            const contentText = textArr.join('<br>');

            let moreBtn = '';
            if (item.hrefTo !== null && item.hrefTo !== '') {
                moreBtn = `
                    <a href="${item.hrefTo}" title="${item.type || ''}" target="_blank"
                        class="public-btn public-btn2 font20">
                        <p class=" font-m">探索更多</p>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10.844" height="10"
                            viewBox="0 0 10.844 10" data-inject-url=" " loading="lazy">
                            <defs>
                                <style>
                                    .cls-1 {fill: #fff;fill-rule: evenodd;}
                                </style>
                            </defs>
                            <path id="形状_1_拷贝_4--inject-32" data-name="形状 1 拷贝 4" class="cls-1"
                                d="M207.821,577.433a1.139,1.139,0,0,1,.241-0.459,0.786,0.786,0,0,1,.513-0.24c0.059,0,.119,0,0.179,0h7.48a0.4,0.4,0,0,0-.062-0.046,1.872,1.872,0,0,1-.609-0.462q-1.008-1.089-2.019-2.177a0.9,0.9,0,0,1-.243-0.919,0.731,0.731,0,0,1,1.166-.387,1.4,1.4,0,0,1,.143.135q1.892,2.029,3.782,4.061a0.876,0.876,0,0,1,.164,1.063,1.054,1.054,0,0,1-.158.212q-1.9,2.042-3.8,4.079a0.74,0.74,0,0,1-1.169-.022,0.9,0.9,0,0,1,.006-1.061c0.041-.053.085-0.1,0.13-0.15q0.861-.925,1.723-1.849a2.634,2.634,0,0,1,.923-0.781c0-.009,0-0.019-0.008-0.029h-0.119q-3.7,0-7.4,0a0.766,0.766,0,0,1-.688-0.32,2.361,2.361,0,0,1-.174-0.4v-0.249Z"
                                transform="translate(-207.812 -572.562)"></path>
                        </svg>
                    </a>
                `;
            }

            htmlStr += `
                <div class="swiper-slide" data-swiper-slide-index="${idx}" style="width: 1249px; margin-right: 1px;">
                    <div class="hfo_box" style="display: flex; align-items: flex-start; height: 500px;">
                        <div class="public-img" style="width: 50%; height: 100%; overflow: hidden;">
                            <img loading="lazy" src="${getImageUrl(item.imageUrl)}" alt="${item.type || ''}"
                                style="width:100%;height:100%;object-fit: cover;object-position: center;">
                        </div>
                        <div class="gr"
                            style="width:50%;height:100%;display: flex; flex-direction: column; align-items: flex-start !important; justify-content: flex-start; padding-left: 40px; padding-top: 80px; box-sizing: border-box;">
                            <div class="logo_t">
                                <h3 class="font24 font-m">${item.title || ''}</h3>
                                <h3 class="font24 font-m">${item.type || ''}</h3>
                            </div>
                            <div class="txt">
                                <div class="txt_t">
                                    <div class="g_p font18">
                                        <p>${contentText}</p>
                                    </div>
                                </div>
                                ${moreBtn}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        wrapDom.innerHTML = htmlStr;
        initSceneSwiper();
        console.log('✅ 应用场景接口调用完成');
    } catch (err) {
        console.error('❌ 应用场景接口请求失败：', err);
    }
}