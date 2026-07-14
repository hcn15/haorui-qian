let timerIds = [];
let selectedType = '';
let productItemList = [];
let originBannerList = [];
let productId = '';

const svgIconList = [
    `<i><svg xmlns="http://www.w3.org/2000/svg" width="73.875" height="73.88" viewBox="0 0 73.875 73.88" loading="lazy"><defs><style>.cls-1{fill:#1ca1ee;fill-rule:evenodd;}</style></defs><path class="cls-1" d="M123.544,1320.67l0.192-.62,2.2,0.06,0.107-1.99-2.179-.12-0.149-.69a6.325,6.325,0,0,0-.534-1.62l-0.278-.55,1.581-1.5-1.346-1.49-1.644,1.45-0.577-.39a5.671,5.671,0,0,0-1.537-.74l-0.6-.2,0.064-2.2-2.008-.1-0.107,2.18-0.662.12a6.348,6.348,0,0,0-1.623.56l-0.576.3-1.5-1.6-1.5,1.32,1.452,1.6-0.363.58a6.056,6.056,0,0,0-.747,1.56l-0.214.59-2.178-.04-0.128,1.99,2.2,0.13,0.128,0.68a6.214,6.214,0,0,0,.556,1.62l0.277,0.56-1.58,1.49,1.324,1.5,1.623-1.43,0.555,0.36a7,7,0,0,0-1.559.77l-0.6.19-0.064,2.18,2.008.11,0.106-2.18,0.662-.13a7.3,7.3,0,0,0,1.623-.55l0.577-.28,1.516,1.56,1.5-1.33-1.452-1.62,0.385-.56A7.313,7.313,0,0,1,123.544,1320.67Zm-2.99,1.34a4.644,4.644,0,0,1-3.182,1.26h-0.149a4.639,4.639,0,0,1-3.054-8.01,4.549,4.549,0,0,1,3.31-1.28H117.5a4.69,4.69,0,0,1,3.246,1.45,4.6,4.6,0,0,1,1.26,3.34A4.666,4.666,0,0,1,120.554,1322.01Zm25.264,2.8-6.278-6.45a16.056,16.056,0,0,0,1.473-3.67,15.714,15.714,0,0,0-29.9-9.55,15.432,15.432,0,0,0-.854,3.4,3.466,3.466,0,0,1,3.267-.39,12.538,12.538,0,1,1,14.458,14.89,3.172,3.172,0,0,1-.683.36,3.56,3.56,0,0,1-.428,2.97,15.731,15.731,0,0,0,7.518-2.48l6.022,6.22a0.778,0.778,0,0,0,1.047,0l4.356-4.23A0.791,0.791,0,0,0,145.818,1324.81Zm-4.805,4.7-6.492-6.73-0.6.39a14.659,14.659,0,0,1-5.723,2.19,4.375,4.375,0,0,0,.064-1.49,0.043,0.043,0,0,0,.042-0.02,13.385,13.385,0,1,0-15.4-16.74,4.287,4.287,0,0,0-1.517.04,12.02,12.02,0,0,1,.534-1.71,14.853,14.853,0,0,1,28.746,4.8,14.951,14.951,0,0,1-.492,4.25,14.4,14.4,0,0,1-1.388,3.46l-0.3.56,6.727,6.75Zm21.121-17.41h-3.288l-0.043-.81a32.533,32.533,0,0,0-30.5-30.5l-0.811-.04v-3.29a1.154,1.154,0,0,0-2.307,0v3.29l-0.811-.04a32.532,32.532,0,0,0-30.5,30.5l-0.043.81H90.549a1.155,1.155,0,0,0,0,2.31h3.289l0.043,0.81a32.532,32.532,0,0,0,30.5,30.5l0.811,0.04v3.29a1.154,1.154,0,0,0,2.307,0v-3.29l0.811-.04a32.533,32.533,0,0,0,30.5-30.5l0.043-.81h3.288A1.155,1.155,0,0,0,162.134,1312.1Z" transform="translate(-89.406 -1276.31)"></path></svg></i>`,
    `<i><svg xmlns="http://www.w3.org/2000/svg" width="72.563" height="72.56" viewBox="0 0 72.563 72.56" loading="lazy"><defs><style>.cls-1{fill:#1ca1ee;fill-rule:evenodd;}</style></defs><path class="cls-1" d="M742.343,1312.78h-3.209l-0.063-.78a31.948,31.948,0,0,0-29.947-29.95l-0.776-.06v-3.21a1.144,1.144,0,0,0-1.154-1.13,1.125,1.125,0,0,0-1.132,1.13v3.21l-0.8.06A31.948,31.948,0,0,0,675.317,1312l-0.042.78h-3.209a1.16,1.16,0,0,0-1.153,1.15,1.143,1.143,0,0,0,1.153,1.13h3.209l0.042,0.8a31.941,31.941,0,0,0,29.948,29.95l0.8,0.04v3.21a1.142,1.142,0,0,0,1.132,1.15,1.161,1.161,0,0,0,1.154-1.15v-3.21l0.776-.04a31.94,31.94,0,0,0,29.947-29.95l0.063-.8h3.209a1.125,1.125,0,0,0,1.132-1.13A1.142,1.142,0,0,0,742.343,1312.78Zm-8.619,2.28h3.124l-0.062.91a29.761,29.761,0,0,1-27.558,27.55l-0.88.07v-3.13a1.161,1.161,0,0,0-1.154-1.15,1.142,1.142,0,0,0-1.132,1.15v3.13l-0.9-.07a29.76,29.761,0,0,1-27.557-27.55l-0.063-.91h3.125a1.143,1.143,0,0,0,1.153-1.13,1.16,1.16,0,0,0-1.153-1.15H677.54l0.063-.88a29.778,29.778,0,0,1,27.557-27.56l0.9-.06v3.12a1.133,1.133,0,0,0,1.132,1.14,1.152,1.152,0,0,0,1.154-1.14v-3.12l0.88,0.06a29.779,29.779,0,0,1,27.558,27.56l0.062,0.88h-3.124a1.142,1.142,0,0,0-1.133,1.15A1.125,1.125,0,0,0,733.724,1315.06Z" transform="translate(-670.906 -1277.66)"></path></svg></i>`,
    `<i><svg xmlns="http://www.w3.org/2000/svg" width="73.53" height="74.31" viewBox="0 0 73.53 74.31" loading="lazy"><defs><style>.cls-1{fill:#1ca1ee;fill-rule:evenodd;}</style></defs><path class="cls-1" d="M1440.28,1321.81a0.759,0.759,0,0,1,.36.9,0.692,0.692,0,0,1-1.04.38l-3.06-1.78a1.341,1.341,0,0,0-1.38.02,1.382,1.382,0,0,0-.61,1.27l0.25,2.6a0.785,0.785,0,0,1-.7.86,0.72,0.72,0,0,1-.72-0.67l-0.6-6.27-4.4-2.58a2.447,2.447,0,0,0-2.48,0,2.5,2.5,0,0,0-1.26,2.19v5.14l5.02,3.61a0.774,0.774,0,0,1,.28.98,0.725,0.725,0,0,1-1.05.26l-2.14-1.55a1.281,1.281,0,0,0-1.38-.1,1.329,1.329,0,0,0-.73,1.2v3.56a0.682,0.682,0,0,1-.23.52,0.6,0.6,0,0,1-.53.19,0.823,0.823,0,0,1-.68-0.81v-3.46a1.338,1.338,0,0,0-.72-1.2,1.236,1.236,0,0,0-.62-0.15,1.434,1.434,0,0,0-.76.23l-2.15,1.57a0.771,0.771,0,0,1-1.06-.26,0.8,0.8,0,0,1,.27-0.98l5.04-3.61v-5.14a2.511,2.511,0,0,0-1.25-2.19,2.465,2.465,0,0,0-2.49,0l-4.42,2.58-0.57,6.27a0.746,0.746,0,0,1-.83.65,0.739,0.739,0,0,1-.6-0.82l0.24-2.62a1.339,1.339,0,0,0-2-1.29l-3.04,1.78a0.692,0.692,0,0,1-1.04-.38,0.783,0.783,0,0,1,.36-0.9l3.02-1.77a1.319,1.319,0,0,0,.66-1.22,1.343,1.343,0,0,0-.77-1.16l-2.36-1.09a0.775,0.775,0,0,1-.46-0.84,0.714,0.714,0,0,1,.4-0.5,0.78,0.78,0,0,1,.6,0l5.69,2.62,4.4-2.55a2.547,2.547,0,0,0,1.25-2.19,2.487,2.487,0,0,0-1.25-2.19l-4.4-2.58-5.67,2.62a0.71,0.71,0,0,1-1-.45,0.763,0.763,0,0,1,.44-0.88l2.34-1.1a1.282,1.282,0,0,0,.79-1.16,1.385,1.385,0,0,0-.66-1.22l-3.06-1.78a0.726,0.726,0,0,1-.34-0.45,0.723,0.723,0,0,1,1.13-.75l2.99,1.71a1.277,1.277,0,0,0,1.38-.02,1.361,1.361,0,0,0,.62-1.27l-0.26-2.66a0.682,0.682,0,0,1,.22-0.58,0.694,0.694,0,0,1,.57-0.21,0.754,0.754,0,0,1,.64.73l0.59,6.23,4.4,2.55a2.419,2.419,0,0,0,2.49,0,2.5,2.5,0,0,0,1.25-2.19v-5.13l-5.08-3.65a0.714,0.714,0,0,1-.3-0.54,0.653,0.653,0,0,1,.22-0.58,0.742,0.742,0,0,1,.97-0.02l2.09,1.5a1.341,1.341,0,0,0,1.38.09,1.361,1.361,0,0,0,.72-1.2v-3.55a0.734,0.734,0,0,1,.76-0.73,0.852,0.852,0,0,1,.68.82v3.48a1.375,1.375,0,0,0,.73,1.2,1.346,1.346,0,0,0,1.38-.11l2.14-1.54a0.7,0.7,0,0,1,.62-0.11,0.674,0.674,0,0,1,.47.41,0.755,0.755,0,0,1-.3.92l-5.04,3.61v5.13a2.487,2.487,0,0,0,1.26,2.19,2.357,2.357,0,0,0,2.48,0l4.42-2.55,0.58-6.3a0.8,0.8,0,0,1,.27-0.49,0.693,0.693,0,0,1,.56-0.15,0.813,0.813,0,0,1,.59.88l-0.23,2.55a1.378,1.378,0,0,0,.59,1.27,1.311,1.311,0,0,0,1.4.02l3.04-1.78a0.678,0.678,0,0,1,.62-0.04,0.693,0.693,0,0,1,.42.45,0.77,0.77,0,0,1-.38.9l-2.99,1.74a1.364,1.364,0,0,0-.66,1.22,1.3,1.3,0,0,0,.76,1.16l2.36,1.1a0.783,0.783,0,0,1,.45.9,0.7,0.7,0,0,1-.98.45l-5.69-2.64-4.4,2.58a2.476,2.476,0,0,0-1.26,2.19,2.535,2.535,0,0,0,1.26,2.19l4.4,2.55,5.67-2.62a0.735,0.735,0,0,1,1.02.5,0.835,0.835,0,0,1-.47.86l-2.34,1.07a1.36,1.36,0,0,0-.1,2.41Zm19.25-10.4h-3.27l-0.04-.81a32.53,32.53,0,0,0-30.34-30.67l-0.81-.04v-3.31a1.15,1.15,0,1,0-2.3,0v3.31l-0.8.04a32.523,32.523,0,0,0-30.34,30.67l-0.05.81h-3.27a1.16,1.16,0,0,0,0,2.32h3.27l0.05,0.82a32.513,32.513,0,0,0,30.34,30.66l0.8,0.05v3.3a1.15,1.15,0,1,0,2.3,0v-3.3l0.81-.05a32.521,32.521,0,0,0,30.34-30.66l0.04-.82h3.27A1.16,1.16,0,0,0,1459.53,1311.41Z" transform="translate(-1387.16 -1275.41)"></path></svg></i>`,
    `<i><svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24"><path fill="#1ca1ee" d="M12 22c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2zm5-3H7v-2h10v2zm-4-6c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2s2 .9 2 2v4c0 1.1-.9 2-2 2zm6-9c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4z" /></svg></i>`,
    `<i><svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24"><path fill="#1ca1ee" d="M3 8l9-6 9 6v10l-9 6-9-6V8zm1 1.32v9.36l8 5.33 8-5.33V9.32L12 4l-8 4.32zM12 11q1.25 0 2.125.862T15 14t-.875 2.138T12 17t-2.125-.863T9 14t.875-2.138T12 11zm0-2q-1.65 0-2.825 1.175T8 14t1.175 2.825T12 18t2.825-1.175T16 14t-1.175-2.825T12 9zm0 3.5a.5.5 0 0 1 .5.5.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5.5.5 0 0 1 .5-.5z" /></svg></i>`
];

const config = {
    titleIdList: [
        'jsjc-title', 'lqjc-title', 'hntjc-title', 'gfbl-title', 'fsm-title',
        'cp6-title', 'cp7-title', 'cp8-title', 'cp9-title', 'cp10-title'
    ],
    typeList: [
        'jsjc', 'lqjc', 'aqwx', 'gfbl', 'fsm',
        'cp6', 'cp7', 'cp8', 'cp9', 'cp10'
    ],
    anchorList: [
        'cpjs1', 'cpjs2', 'cpjs3', 'cpjs4', 'cpjs5',
        'cpjs6', 'cpjs7', 'cpjs8', 'cpjs9', 'cpjs10'
    ]
};

document.addEventListener('DOMContentLoaded', function () {
    new CommonNav({ loadNav: false });
    new LazyLoad();
    
    productId = Utils.getUrlParam('id') || '1';
    
    loadProductInfo(productId);
    loadProductItem(productId);
});

async function loadProductInfo(productId) {
    try {
        const resData = await ApiService.getProductById(productId);
        
        if (resData.code === 0 && resData.data) {
            const product = resData.data;
            const productNameEl = document.getElementById('productName');
            const pageTitleEl = document.getElementById('pageTitle');
            const titleEl = document.querySelector('title');
            const bannerImg = document.getElementById('bannerImg');
            
            if (productNameEl) productNameEl.textContent = product.name || '产品服务';
            if (pageTitleEl) pageTitleEl.textContent = product.name || '产品服务';
            if (titleEl) titleEl.textContent = product.name ? `${product.name} - 浩瑞绿色科技` : '浩瑞绿色科技';
            if (bannerImg && (product.imageUrl || product.imgUrl || product.firstUrl)) {
                bannerImg.src = getImageUrl(product.imageUrl || product.imgUrl || product.firstUrl);
            }
            
            const langLinks = document.querySelectorAll('.nav_lan_sel a');
            if (langLinks[0]) langLinks[0].href = `./chanpin1-en.html?id=${productId}`;
            if (langLinks[1]) langLinks[1].href = `./chanpin1.html?id=${productId}`;
        }
    } catch (err) {
        console.error("加载产品服务信息失败：", err);
    }
}

async function loadProductItem(productId) {
    try {
        const resData = await ApiService.getProductItems(productId);
        console.log('productItem API response:', resData);
        
        if (resData.code === 0 && Array.isArray(resData.data)) {
            productItemList = resData.data.slice(0, 10);

            if (productItemList.length > 0) {
                renderProductItem();
                selectedType = 'type0';
                switchImages(selectedType);
                toggleUnderline(selectedType);
            } else {
                renderEmptyState();
            }
        } else {
            console.warn('productItem API data is not valid:', resData);
            renderEmptyState();
        }
    } catch (err) {
        console.error("接口请求失败：", err);
        renderEmptyState();
    }
}

function renderProductItem() {
    const boxWrap = document.getElementById('productItemBox');
    if (!boxWrap) return;
    let html = '';
    const maxRender = productItemList.length;
    for (let idx = 0; idx < maxRender; idx++) {
        const itemData = productItemList[idx] || {};
        const itemName = itemData.name || '';
        const itemSubTitle = itemData.title || '';
        const clickType = `type${idx}`;
        const svgHtml = svgIconList[idx % 5];
        const tId = `title${idx}`;
        const lineHtml = idx >= 2
            ? `<div style="width:1px; background:#ccc; position:absolute; right:0; top:20px; bottom:0;"></div>`
            : '';
        const initUnderline = idx === 0 ? '#1ca1ee' : 'transparent';

        html += `
            <div class="item" onclick="switchImages('${clickType}')" style="flex:1; text-align:center; cursor:pointer; display:flex; flex-direction:column; align-items:center; position: relative; padding-right:0;">
                <div class="g_h3 wow fadeInUp" style="margin-bottom:8px; visibility: visible; animation-name: fadeInUp; animation-delay: ${0.2 + idx * 0.1}s;">
                    ${svgHtml}
                </div>
                <div class="txt font18 wow fadeInUp" style="visibility: visible; animation-name: fadeInUp; animation-delay: ${0.3 + idx * 0.1}s; text-align:center;">
                    <h3 class="font34" id="${tId}" style="display: inline-block; position: relative; font-size:18px; margin:0 0 4px 0;margin-left:-20px;">
                        ${itemName}
                        <span style="position: absolute; left: 0; bottom: -5px; width: 100%; height: 2px; background-color: ${initUnderline}; display: block;"></span>
                    </h3>
                    <p style="font-size:14px; margin:0;margin-left:-10px;">${itemSubTitle}</p>
                </div>
                ${lineHtml}
            </div>
        `;
    }
    boxWrap.innerHTML = html;
}

function renderEmptyState() {
    const boxWrap = document.getElementById('productItemBox');
    if (!boxWrap) return;
    
    boxWrap.innerHTML = `
        <div style="width:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:80px 0; min-height:300px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#1ca1ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                <path d="M16 21h5v-5"></path>
            </svg>
            <p style="margin-top:20px; font-size:16px; color:#666;">暂无商品，敬请期待</p>
        </div>
    `;
}

function showImagesWithDelay() {
    timerIds.forEach(t => clearTimeout(t));
    timerIds = [];
    const imgs = document.querySelectorAll('#productImages img');
    imgs.forEach((img, i) => {
        img.style.opacity = '0';
        let t = setTimeout(() => img.style.opacity = '1', i * 200);
        timerIds.push(t);
    });
}

function toggleUnderline(type) {
    document.querySelectorAll('.font34 span').forEach(el => {
        el.style.backgroundColor = 'transparent';
    });
    const idx = parseInt(type.replace('type', '')) || 0;
    const el = document.querySelector(`#title${idx} span`);
    if (el) el.style.backgroundColor = '#1ca1ee';
}

function switchImages(type) {
    selectedType = type;
    toggleUnderline(type);
    const idx = parseInt(type.replace('type', '')) || 0;
    const currData = productItemList[idx] || {};

    const bannerImg = document.getElementById('bannerImg');
    if (bannerImg && currData.firstUrl) {
        bannerImg.src = getImageUrl(currData.firstUrl);
    }

    document.querySelectorAll('.h_banner.on').forEach(el => el.remove());
    document.querySelectorAll('.product-intro-anchor').forEach(el => el.remove());
    const tabBar = document.getElementById('tabBar');
    const prodImg = getImageUrl(currData.productUrl || '');
    if (prodImg) {
        const detailHtml = `
            <div class="h_banner on" style="margin:0; padding:0; width:100%; float:none; clear:both;" id="anchor${idx}">
                <div class="h_banner_swi" style="margin:0; padding:0;">
                    <div class="h_b_box" style="margin:0; padding:0; position:relative; width:100%; height:auto;">
                        <img src="${prodImg}" alt="${currData.name || '产品介绍'}" 
                            style="display:block; width:80%; height:auto; border:none; outline:none; margin: 50px auto 0; ">
                    </div>
                </div>
            </div>
        `;
        tabBar.insertAdjacentHTML('afterend', detailHtml);
    } else {
        tabBar.insertAdjacentHTML('afterend', `<div id="anchor${idx}" class="product-intro-anchor" style="margin-top:50px;"></div>`);
    }

    const imgBox = document.getElementById('productImages');
    if (!imgBox) return;
    const imgUrl = getImageUrl(currData.imageUrl || '');
    if (!imgUrl) {
        imgBox.innerHTML = '';
        return;
    }
    imgBox.innerHTML = `
        <div style="width:1000px; height:300px; display:block;">
            <img src="${imgUrl}" style="width:1000px;height:300px;object-fit:fill;border-radius:4px;" alt="${currData.name || ''}">
        </div>`;
    showImagesWithDelay();
}

function goToProductIntro() {
    const idx = parseInt(selectedType.replace('type', '')) || 0;
    const target = `anchor${idx}`;
    
    document.querySelectorAll('.tab-underline').forEach(el => el.style.display = 'none');
    document.querySelector('#tabCpjs .tab-underline').style.display = 'block';
    
    const targetEl = document.getElementById(target);
    if (!targetEl) {
        switchImages(selectedType);
    }
    
    location.href = `#${target}`;
}

function scrollToAnchor(anchorId) {
    if (anchorId === 'gywm') {
        document.querySelectorAll('.tab-underline').forEach(el => el.style.display = 'none');
        document.querySelector('#tabGywm .tab-underline').style.display = 'block';
    } else if (anchorId.startsWith('anchor')) {
        document.querySelectorAll('.tab-underline').forEach(el => el.style.display = 'none');
        document.querySelector('#tabCpjs .tab-underline').style.display = 'block';
    }
    
    const target = document.getElementById(anchorId);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const backTopBtn = document.querySelector('.pop_a.cur2');
    if (backTopBtn) {
        backTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});