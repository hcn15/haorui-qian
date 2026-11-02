/**
 * 组件加载工具函数
 * 通过AJAX异步加载HTML组件并插入到指定DOM元素中
 * 
 * @param {string} elementId - 目标DOM元素的ID
 * @param {string} url - 组件HTML文件的路径
 * @param {Function} callback - 加载完成后的回调函数（可选）
 */
function loadComponent(elementId, url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			document.getElementById(elementId).innerHTML = xhr.responseText;
			if (callback) callback();
		}
	};
	xhr.send();
}

/**
 * 根据目标语言获取对应的页面URL
 * 用于中英文页面切换时生成跳转链接，保留查询参数
 * 
 * @param {string} targetLang - 目标语言('en'表示英文，其他表示中文)
 * @returns {string} 对应的语言版本页面URL（包含查询参数）
 */
function getLangUrl(targetLang) {
	var currentPath = window.location.pathname;
	var currentQuery = window.location.search;
	var currentHash = window.location.hash;

	// 以目录形式访问时（如 "/"、"http://域名/"、"http://域名/子目录/"），
	// pathname 末尾没有文件名，此时实际渲染的就是 index.html / index-en.html。
	// 若不处理，会返回原地址导致切换看起来“失灵”。
	var slashIndex = currentPath.lastIndexOf('/');
	var baseUrl = currentPath.substring(0, slashIndex + 1);
	var currentFilename = currentPath.substring(slashIndex + 1);
	if (!currentFilename) {
		currentFilename = 'index.html';
	}

	// 如果目标语言是英文
	if (targetLang === 'en') {
		if (currentFilename === 'index.html') {
			return baseUrl + 'index-en.html' + currentQuery + currentHash;
		} else if (currentFilename === 'search.html') {
			return baseUrl + 'search-en.html' + currentQuery + currentHash;
		} else if (currentFilename.indexOf('-en.html') !== -1) {
			return currentPath + currentQuery + currentHash;
		} else if (currentFilename.endsWith('.html')) {
			return baseUrl + currentFilename.replace('.html', '-en.html') + currentQuery + currentHash;
		}
	} else {
		if (currentFilename === 'index-en.html') {
			return baseUrl + 'index.html' + currentQuery + currentHash;
		} else if (currentFilename === 'search-en.html') {
			return baseUrl + 'search.html' + currentQuery + currentHash;
		} else if (currentFilename.indexOf('-en.html') !== -1) {
			return baseUrl + currentFilename.replace('-en.html', '.html') + currentQuery + currentHash;
		} else {
			return currentPath + currentQuery + currentHash;
		}
	}
	return currentPath + currentQuery + currentHash;
}

/**
 * 初始化导航栏交互功能
 * 包括搜索框、移动端菜单、语言切换等交互逻辑
 */
function initNav() {
	// 获取搜索按钮和搜索框元素
	var searchBtn = document.getElementById('searchBtn');
	var searchBox = document.getElementById('searchBox');

	// 搜索框交互逻辑
	if (searchBtn && searchBox) {
		searchBtn.addEventListener('click', function(e) {
			e.stopPropagation();
			searchBox.classList.toggle('active');
			if (searchBox.classList.contains('active')) {
				searchBox.querySelector('input').focus();
			}
		});

		document.addEventListener('click', function() {
			searchBox.classList.remove('active');
		});

		searchBox.addEventListener('click', function(e) {
			e.stopPropagation();
		});
	}

	// 获取移动端导航相关元素
	var mobileMenuBtn = document.getElementById('mobileMenuBtn');
	var mobileNavOverlay = document.getElementById('mobileNavOverlay');
	var mobileNavDrawer = document.getElementById('mobileNavDrawer');
	var mobileNavCloseBtn = document.getElementById('mobileNavCloseBtn');
	var mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

	/**
	 * 切换移动端菜单显示/隐藏状态
	 */
	function toggleMobileMenu() {
		if (mobileMenuBtn) mobileMenuBtn.classList.toggle('active');
		if (mobileNavOverlay) mobileNavOverlay.classList.toggle('active');
		if (mobileNavDrawer) mobileNavDrawer.classList.toggle('active');
	}

	/**
	 * 关闭移动端菜单并重置状态
	 */
	function closeMobileMenu() {
		if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
		if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
		if (mobileNavDrawer) mobileNavDrawer.classList.remove('active');
		document.querySelectorAll('.mobile-nav-item').forEach(item => {
			item.classList.remove('open');
		});
	}

	// 移动端菜单按钮点击事件
	if (mobileMenuBtn) {
		mobileMenuBtn.addEventListener('click', function(e) {
			e.stopPropagation();
			toggleMobileMenu();
		});
	}

	// 遮罩层点击关闭菜单
	if (mobileNavOverlay) {
		mobileNavOverlay.addEventListener('click', function() {
			closeMobileMenu();
		});
	}

	// 关闭按钮点击事件
	if (mobileNavCloseBtn) {
		mobileNavCloseBtn.addEventListener('click', function() {
			closeMobileMenu();
		});
	}

	// 移动端导航链接点击事件
	mobileNavLinks.forEach(function(link) {
		link.addEventListener('click', function(e) {
			var hasSub = this.nextElementSibling && this.nextElementSibling.classList.contains('mobile-nav-sub');
			if (hasSub) {
				e.preventDefault();
				this.parentElement.classList.toggle('open');
			} else {
				closeMobileMenu();
			}
		});
	});

	// 移动端子导航链接点击事件
	document.querySelectorAll('.mobile-nav-sub-link').forEach(function(link) {
		link.addEventListener('click', function() {
			closeMobileMenu();
		});
	});

	// 英文语言切换链接点击事件
	document.querySelectorAll('.lang-switch-en').forEach(function(link) {
		link.addEventListener('click', function(e) {
			e.preventDefault();
			var enUrl = getLangUrl('en');
			if (enUrl) {
				window.location.href = enUrl;
			}
		});
	});

	// 中文语言切换链接点击事件
	document.querySelectorAll('.lang-switch-zh').forEach(function(link) {
		link.addEventListener('click', function(e) {
			e.preventDefault();
			var zhUrl = getLangUrl('zh');
			if (zhUrl) {
				window.location.href = zhUrl;
			}
		});
	});

	// 移动端语言切换链接点击事件
	document.querySelectorAll('.mobile-nav-lang a').forEach(function(link) {
		link.addEventListener('click', function() {
			closeMobileMenu();
		});
	});

	/* ================================================================
	 * 语言切换下拉：点击展开 / 收起 + 点击外部关闭
	 * 适用于 .nav_lan（组件页）与 .lang-dropdown（内联页）
	 * ================================================================ */
	var openDropdown = null;

	function closeAllDropdowns() {
		document.querySelectorAll('.nav_lan.open, .lang-dropdown.open').forEach(function(el) {
			el.classList.remove('open');
			if (el.classList.contains('nav_lan')) {
				var box = el.querySelector('.nav_lan_box svg');
				if (box) box.style.transform = '';
			}
		});
		openDropdown = null;
	}

	// .nav_lan 点击切换（组件页）
	document.querySelectorAll('.nav_lan').forEach(function(trigger) {
		trigger.addEventListener('click', function(e) {
			e.stopPropagation();
			var isOpen = trigger.classList.contains('open');
			closeAllDropdowns();
			if (!isOpen) {
				trigger.classList.add('open');
				openDropdown = trigger;
			}
		});
		trigger.addEventListener('mouseenter', function() {
			// hover 打开时关闭其他 click-opened 状态
			if (openDropdown && openDropdown !== trigger) {
				openDropdown.classList.remove('open');
				openDropdown = null;
			}
		});
		// 点击下拉项本身不关闭（让 initNav 的 a 点击处理），但防止事件冒泡
		var sel = trigger.querySelector('.nav_lan_sel');
		if (sel) {
			sel.addEventListener('click', function(e) { e.stopPropagation(); });
		}
	});

	// .lang-dropdown 点击切换（内联页）
	document.querySelectorAll('.lang-dropdown').forEach(function(wrap) {
		var btn = wrap.querySelector('.lang-dropdown-trigger');
		if (!btn) return;
		btn.addEventListener('click', function(e) {
			e.stopPropagation();
			var isOpen = wrap.classList.contains('open');
			closeAllDropdowns();
			if (!isOpen) {
				wrap.classList.add('open');
				openDropdown = wrap;
			}
		});
		// 下拉面板内点击不冒泡
		var panel = wrap.querySelector('.lang-dropdown-panel');
		if (panel) {
			panel.addEventListener('click', function(e) { e.stopPropagation(); });
		}
	});

	// 页面任意位置点击 → 关闭
	document.addEventListener('click', function() { closeAllDropdowns(); });
	// ESC 关闭
	document.addEventListener('keydown', function(e) {
		if (e.key === 'Escape') closeAllDropdowns();
	});

	/* ===== 为组件页 .nav_lan_sel 动态补 sel-mark（选中对勾） ===== */
	document.querySelectorAll('.nav_lan_sel a').forEach(function(a) {
		if (!a.querySelector('.sel-mark')) {
			var mark = document.createElement('span');
			mark.className = 'sel-mark';
			mark.textContent = '✓';
			a.appendChild(mark);
		}
	});

	/* ===== 根据当前高亮项更新 .lang-dropdown-trigger 文字 ===== */
	function syncDropdownTrigger() {
		document.querySelectorAll('.lang-dropdown').forEach(function(wrap) {
			var cur = wrap.querySelector('.lang-dropdown-current');
			var active = wrap.querySelector('.lang-dropdown-panel a.active');
			if (cur && active) {
				var label = active.textContent.trim();
				// 取第一个词（"简体中文" → "中"，"English" → "EN"）
				var short = label.indexOf('简体') === 0 ? '中' :
				            label.indexOf('中文') === 0 ? '中' :
				            label.indexOf('English') === 0 ? 'EN' :
				            label.indexOf('简') === 0 ? '中' :
				            label.length > 4 ? label.substring(0, 4) : label;
				cur.textContent = short;
			}
		});
	}
	syncDropdownTrigger();
	// initNav 绑定完后再同步一次（某些页面可能在组件加载前就 initNav 了）
	setTimeout(syncDropdownTrigger, 200);

	// 窗口大小变化时，大于768px自动关闭移动端菜单
	window.addEventListener('resize', function() {
		if (window.innerWidth >= 768) {
			closeMobileMenu();
		}
	});

	// 初始化产品子导航
	initProductSubNav();
}

/**
 * 初始化产品子导航菜单
 * 调用接口获取产品数据，根据当前页面语言动态生成产品导航链接
 */
function initProductSubNav() {
	var navProductSub = document.getElementById('navProductSub');
	var mobileNavProductSub = document.getElementById('mobileNavProductSub');
	var currentPage = window.location.pathname;

	// 判断当前页面是否为英文页面
	var isEnglish = currentPage.includes('-en.html') || currentPage.includes('index-en.html');

	// 调用接口获取产品导航数据
	if (typeof SERVER_BASE_URL !== 'undefined') {
		fetch(`${SERVER_BASE_URL}/website/product`)
			.then(res => res.json())
			.then(resData => {
				if (resData.code === 0 && Array.isArray(resData.data)) {
					renderProductNav(resData.data, isEnglish);
				}
			})
			.catch(err => {
				// 接口失败静默，已走硬编码兜底
				renderProductNavFallback(isEnglish);
			});
	} else {
		// SERVER_BASE_URL未定义时使用硬编码数据作为兜底
		renderProductNavFallback(isEnglish);
	}

	/**
	 * 根据接口数据渲染产品导航
	 * @param {Array} productData - 接口返回的产品数据数组
	 * @param {boolean} isEnglish - 是否为英文页面
	 */
	function renderProductNav(productData, isEnglish) {
		var desktopHtml = '';
		var mobileHtml = '';

		productData.forEach(function(item) {
			var jumpUrl = '';
			if (item.id === 1) {
				jumpUrl = isEnglish ? './chanpin1-cp1-en.html' : './chanpin1-cp1.html';
			} else if (item.id === 4) {
				jumpUrl = isEnglish ? './chanpin1-ai-en.html' : './chanpin1-ai.html';
			} else {
				jumpUrl = isEnglish ? `./chanpin1-en.html?id=${item.id}` : `./chanpin1.html?id=${item.id}`;
			}
			var displayName = isEnglish ? (item.nameEn || item.name) : item.name;

			desktopHtml += '<div class="new-nav-sub-item"><a href="' + jumpUrl + '" class="new-nav-sub-link">' + displayName + '</a></div>';
			mobileHtml += '<div class="mobile-nav-sub-item"><a href="' + jumpUrl + '" class="mobile-nav-sub-link">' + displayName + '</a></div>';
		});

		if (navProductSub) {
			navProductSub.innerHTML = desktopHtml;
		}

		if (mobileNavProductSub) {
			mobileNavProductSub.innerHTML = mobileHtml;
		}
	}

	/**
	 * 接口调用失败时使用硬编码数据渲染产品导航（兜底方案）
	 * @param {boolean} isEnglish - 是否为英文页面
	 */
	function renderProductNavFallback(isEnglish) {
		// 中文产品导航数据（兜底）
		var productItemsZh = [
			{ name: '前沿材料', url: './chanpin1-cp1.html' },
			{ name: '数字服务与平台', url: './chanpin1.html?id=2' },
			{ name: '通信与网络', url: './chanpin1.html?id=3' },
			{ name: 'AI机器人', url: './chanpin1-ai.html' },
			{ name: '低空经济', url: './chanpin1.html?id=5' },
			{ name: '大宗商品贸易', url: './chanpin1.html?id=6' },
			{ name: '文创IP', url: './chanpin1.html?id=7' }
		];

		// 英文产品导航数据（兜底）
		var productItemsEn = [
			{ name: 'Advanced Materials', url: './chanpin1-cp1-en.html' },
			{ name: 'Digital Services & Platform', url: './chanpin1-en.html?id=2' },
			{ name: 'Communications & Network', url: './chanpin1-en.html?id=3' },
			{ name: 'AI Robotics', url: './chanpin1-ai-en.html' },
			{ name: 'Low Altitude Economy', url: './chanpin1-en.html?id=5' },
			{ name: 'Commodity Trading', url: './chanpin1-en.html?id=6' },
			{ name: 'Cultural & Creative IP', url: './chanpin1-en.html?id=7' }
		];

		var productItems = isEnglish ? productItemsEn : productItemsZh;
		var desktopHtml = '';
		var mobileHtml = '';

		productItems.forEach(function(item) {
			desktopHtml += '<div class="new-nav-sub-item"><a href="' + item.url + '" class="new-nav-sub-link">' + item.name + '</a></div>';
			mobileHtml += '<div class="mobile-nav-sub-item"><a href="' + item.url + '" class="mobile-nav-sub-link">' + item.name + '</a></div>';
		});

		if (navProductSub) {
			navProductSub.innerHTML = desktopHtml;
		}

		if (mobileNavProductSub) {
			mobileNavProductSub.innerHTML = mobileHtml;
		}
	}
}