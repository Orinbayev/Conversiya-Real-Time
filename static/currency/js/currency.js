document.addEventListener('DOMContentLoaded', function () {
    // Core elements
    const sellAmountInput = document.getElementById('sell-amount');
    const sellCurrencySelect = document.getElementById('sell-currency');
    const getAmountInput = document.getElementById('get-amount');
    const swapBtn = document.getElementById('swap-btn');
    const searchToggle = document.getElementById('search-toggle');
    const searchContainer = document.getElementById('search-container');
    const globalSearch = document.getElementById('global-search');
    const currencyRows = document.querySelectorAll('.currency-row');
    const themeToggle = document.getElementById('theme-toggle');
    const langBtns = document.querySelectorAll('.lang-btn');
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthDisplay = document.getElementById('current-month-display');
    const currentMonthBtn = document.getElementById('current-month-btn');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const tableLoader = document.getElementById('table-loader');

    // Dropdown elements
    const dropdownToggle = document.getElementById('dropdown-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const currencySearch = document.getElementById('currency-search');
    const currencyList = document.getElementById('currency-list');
    const selectedCurrencyText = document.getElementById('selected-currency-text');
    const currencyOptions = document.querySelectorAll('.currency-option');

    let calendarDate = new Date();
    let selectedDate = new Date();
    let currentLang = (localStorage.getItem('appLang') || 'UZ').toUpperCase().trim();
    let currentTheme = localStorage.getItem('appTheme') || 'light';

    const translations = {
        'UZ': {
            'kurs_valyut': 'Kurs valyut',
            'table_curr': 'Valyuta',
            'table_buy': 'Sotib olish',
            'table_sell': 'Sotish',
            'table_note': '* Kurslar almashuv vaqtida o\'zgarishi mumkin. Aniq kurs bank kassasida so\'ralgan vaqtda belgilanadi.',
            'conv_title': 'Konverter',
            'conv_sell': 'Sotmoqchiman',
            'conv_get': 'Olmoqchiman',
            'archive': 'Kurslar arxivi',
            'search_placeholder': 'Valyutani izlang...',
            'weekdays': ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
        },
        'RU': {
            'kurs_valyut': 'Курс валют',
            'table_curr': 'Валюта',
            'table_buy': 'Покупка',
            'table_sell': 'Продажа',
            'table_note': '* Курсы могут отличаться в момент обмена. Точный курс обмена будет определен на момент совершения операции в кассе банка.',
            'conv_title': 'Конвертер',
            'conv_sell': 'Хочу продать',
            'conv_get': 'Получу',
            'archive': 'Архив курсов',
            'search_placeholder': 'Искать валюту...',
            'weekdays': ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        },
        'EN': {
            'kurs_valyut': 'Exchange Rates',
            'table_curr': 'Currency',
            'table_buy': 'Buy',
            'table_sell': 'Sell',
            'table_note': '* Rates may differ at the time of exchange. The exact exchange rate will be determined at the time of the transaction at the bank.',
            'conv_title': 'Converter',
            'conv_sell': 'I want to sell',
            'conv_get': 'I will get',
            'archive': 'Archive of rates',
            'search_placeholder': 'Search currency...',
            'weekdays': ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
        }
    };

    const monthNames = {
        'UZ': ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'],
        'RU': ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        'EN': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    };

    function updateUI() {
        try {
            const langKey = currentLang.toUpperCase().trim();
            const t = translations[langKey] || translations['UZ'];

            const transMap = {
                'h2': 'kurs_valyut',
                '#conv-label-sell': 'conv_sell',
                '#conv-label-get': 'conv_get',
                '#conv-title-text': 'conv_title',
                '#archive-title': 'archive',
                '#table-note-text': 'table_note',
                '#table-th-curr': 'table_curr',
                '#table-th-buy': 'table_buy',
                '#table-th-sell': 'table_sell'
            };

            for (let selector in transMap) {
                const el = document.querySelector(selector);
                if (el) {
                    if (selector === 'h2') {
                        const span = el.querySelector('span');
                        const dateText = span ? span.outerHTML : '';
                        el.innerHTML = t[transMap[selector]] + ' ' + dateText;
                    } else {
                        el.textContent = t[transMap[selector]];
                    }
                }
            }

            if (globalSearch) globalSearch.placeholder = t['search_placeholder'];
            if (currencySearch) currencySearch.placeholder = t['search_placeholder'];

            langBtns.forEach(btn => {
                const bLang = btn.getAttribute('data-lang').toUpperCase();
                if (bLang === langKey) {
                    btn.className = 'lang-btn px-2 py-1 rounded-md text-[10px] font-black transition-all bg-white shadow-sm text-blue-600 dark:bg-slate-900';
                } else {
                    btn.className = 'lang-btn px-2 py-1 rounded-md text-[10px] font-black transition-all text-gray-400 hover:text-gray-600';
                }
            });

            localStorage.setItem('appLang', langKey);
            renderCalendar();
        } catch (e) {
            console.error("updateUI error:", e);
        }
    }

    function renderCalendar() {
        try {
            const langKey = currentLang.toUpperCase().trim();
            const t = translations[langKey] || translations['UZ'];
            const m = monthNames[langKey] || monthNames['UZ'];

            const weekdaysContainer = document.getElementById('calendar-weekdays');
            if (!calendarDays || !currentMonthDisplay) return;

            if (weekdaysContainer && t.weekdays) {
                weekdaysContainer.innerHTML = '';
                t.weekdays.forEach((wd, idx) => {
                    const div = document.createElement('div');
                    div.textContent = wd;
                    div.className = idx >= 5 ? 'text-red-400' : 'text-gray-400';
                    weekdaysContainer.appendChild(div);
                });
            }

            const year = calendarDate.getFullYear();
            const month = calendarDate.getMonth();
            currentMonthDisplay.textContent = `${m[month]} ${year}`;

            calendarDays.innerHTML = '';
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            let startingDay = firstDay === 0 ? 6 : firstDay - 1;

            for (let i = 0; i < startingDay; i++) {
                calendarDays.appendChild(document.createElement('div'));
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dayEl = document.createElement('div');
                dayEl.textContent = day;
                dayEl.className = 'py-3 hover:bg-blue-50 cursor-pointer rounded-xl transition-all duration-200 border border-transparent hover:border-blue-100 active:scale-95 text-center flex items-center justify-center';

                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                const isSelected = selectedDate.toDateString() === new Date(year, month, day).toDateString();

                if (isSelected) {
                    dayEl.classList.add('bg-blue-600', 'text-white', 'shadow-lg', 'font-black');
                } else if (isToday) {
                    dayEl.classList.add('bg-blue-50', 'text-blue-600', 'border-blue-100', 'font-bold');
                } else {
                    dayEl.classList.add('text-gray-700', 'dark:text-gray-300');
                }

                dayEl.onclick = () => {
                    selectedDate = new Date(year, month, day);
                    renderCalendar();
                    fetchHistoricalRates(selectedDate);
                };

                calendarDays.appendChild(dayEl);
            }
        } catch (e) {
            console.error("renderCalendar error:", e);
        }
    }

    function fetchHistoricalRates(date) {
        const formattedDate = date.toISOString().split('T')[0];
        if (tableLoader) tableLoader.classList.remove('hidden');

        fetch(`/api/historical-rates/?date=${formattedDate}`)
            .then(res => res.json())
            .then(json => {
                if (json.data) updateTableData(json.data);
            })
            .catch(e => console.error("Fetch error:", e))
            .finally(() => {
                if (tableLoader) tableLoader.classList.add('hidden');
            });
    }

    function updateTableData(data) {
        const ratesMap = {};
        data.forEach(item => {
            const code = item.code || item.Ccy;
            ratesMap[code] = {
                buy: item.nbu_buy_price || item.Rate,
                sell: item.nbu_cell_price || item.Rate
            };
        });

        const rows = document.querySelectorAll('.currency-row');
        rows.forEach(row => {
            const code = row.getAttribute('data-code');
            const rate = ratesMap[code];
            if (rate) {
                const buyEl = row.querySelector('td:nth-child(2) span');
                const sellEl = row.querySelector('td:nth-child(3) span');
                if (buyEl) buyEl.textContent = parseFloat(rate.buy).toLocaleString('uz-UZ', { minimumFractionDigits: 2 });
                if (sellEl) sellEl.textContent = parseFloat(rate.sell).toLocaleString('uz-UZ', { minimumFractionDigits: 2 });
            }
        });
    }

    function toggleTheme() {
        try {
            const sun = document.querySelector('.theme-icon-sun');
            const moon = document.querySelector('.theme-icon-moon');
            if (currentTheme === 'dark') {
                document.body.classList.add('dark');
                if (sun) sun.classList.remove('hidden');
                if (moon) moon.classList.add('hidden');
            } else {
                document.body.classList.remove('dark');
                if (sun) sun.classList.add('hidden');
                if (moon) moon.classList.remove('hidden');
            }
            localStorage.setItem('appTheme', currentTheme);
        } catch (e) { }
    }

    function calculateConversion() {
        try {
            if (!sellAmountInput || !sellCurrencySelect || !getAmountInput) return;
            const amount = parseFloat(sellAmountInput.value) || 0;
            const selectedOption = sellCurrencySelect.options[sellCurrencySelect.selectedIndex];
            if (!selectedOption) return;
            const rate = parseFloat(selectedOption.getAttribute('data-sell')) ||
                parseFloat(selectedOption.getAttribute('data-buy')) || 0;
            const result = amount * rate;
            getAmountInput.value = result.toLocaleString('uz-UZ', { maximumFractionDigits: 2 });
        } catch (e) { }
    }

    // Dropdown Logic
    if (dropdownToggle && dropdownMenu && currencySearch) {
        dropdownToggle.onclick = (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
            if (!dropdownMenu.classList.contains('hidden')) {
                currencySearch.value = '';
                filterCurrencies('');
                currencySearch.focus();
            }
        };

        currencySearch.oninput = (e) => {
            filterCurrencies(e.target.value.toLowerCase().trim());
        };

        currencySearch.onclick = (e) => e.stopPropagation();

        function filterCurrencies(term) {
            currencyOptions.forEach(opt => {
                const code = opt.getAttribute('data-code').toLowerCase();
                const name = opt.textContent.toLowerCase();
                if (code.includes(term) || name.includes(term)) {
                    opt.style.display = 'flex';
                } else {
                    opt.style.display = 'none';
                }
            });
        }

        currencyOptions.forEach(opt => {
            opt.onclick = () => {
                const code = opt.getAttribute('data-code');
                if (selectedCurrencyText) selectedCurrencyText.textContent = code;
                if (sellCurrencySelect) {
                    sellCurrencySelect.value = code;
                    calculateConversion();
                }
                dropdownMenu.classList.add('hidden');
            };
        });

        document.addEventListener('click', () => {
            dropdownMenu.classList.add('hidden');
        });
    }

    // Event Listeners
    langBtns.forEach(btn => {
        btn.onclick = () => {
            currentLang = (btn.getAttribute('data-lang') || 'UZ').toUpperCase();
            updateUI();
        };
    });

    if (themeToggle) {
        themeToggle.onclick = () => {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            toggleTheme();
        };
    }

    if (searchToggle && searchContainer && globalSearch) {
        searchToggle.onclick = () => {
            searchContainer.classList.toggle('hidden');
            if (!searchContainer.classList.contains('hidden')) globalSearch.focus();
        };

        globalSearch.oninput = (e) => {
            const term = e.target.value.toLowerCase().trim();
            currencyRows.forEach(row => {
                const isMatch = row.getAttribute('data-code').toLowerCase().includes(term) ||
                    row.getAttribute('data-name').toLowerCase().includes(term);
                if (term === "") {
                    row.style.display = row.classList.contains('hidden-initially') ? 'none' : '';
                } else {
                    row.style.display = isMatch ? '' : 'none';
                }
            });
        };
    }

    if (prevMonthBtn) prevMonthBtn.onclick = () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); };
    if (nextMonthBtn) nextMonthBtn.onclick = () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); };

    if (currentMonthBtn) {
        currentMonthBtn.onclick = () => {
            const m = monthNames[currentLang.toUpperCase()] || monthNames['UZ'];
            const monthChoice = prompt(`Oyni tanlang (1-12):\n${m.map((n, i) => `${i + 1}: ${n}`).join(', ')}`, calendarDate.getMonth() + 1);
            if (monthChoice) {
                const yearChoice = prompt("Yilni kiriting:", calendarDate.getFullYear());
                if (yearChoice) {
                    calendarDate = new Date(parseInt(yearChoice), parseInt(monthChoice) - 1, 1);
                    renderCalendar();
                }
            }
        };
    }

    if (swapBtn) swapBtn.onclick = () => { swapBtn.classList.toggle('rotate-180'); calculateConversion(); };
    if (sellAmountInput) sellAmountInput.oninput = calculateConversion;
    if (sellCurrencySelect) sellCurrencySelect.onchange = calculateConversion;

    // Init
    updateUI();
    toggleTheme();
    calculateConversion();
    if (window.lucide) {
        try { window.lucide.createIcons(); } catch (e) { }
    }
});
