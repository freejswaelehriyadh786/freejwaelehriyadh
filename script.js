const translations = {
    en: {
        restaurantName: "Freej Swaeleh Restaurant",
        welcomeTitle: "Welcome to Freej Swaeleh",
        welcomeText: "Experience the heart of Kuwaiti hospitality at Freej Swaeleh Restaurant, now proudly open in Riyadh, Saudi Arabia. Bringing the authentic flavors of Kuwait to the vibrant capital, we invite you to savor cherished family recipes that capture the essence of Kuwaiti cuisine. From the fragrant spices of machboos to the comforting warmth of fattoush and the sweet delight of balaleet, every dish celebrates Kuwait’s rich culinary heritage. Join us for a warm, welcoming dining experience that feels like a gathering with loved ones, right here in the heart of Riyadh.",
        menuTitle: "Our Menu"
    },
    ar: {
        restaurantName: "مطعم فريج صويلح",
        welcomeTitle: "مرحبًا بكم في فريج صويلح",
        welcomeText: "استمتع بدفء الضيافة الكويتية في مطعم فريج صويلح، الآن مفتوح بفخر في الرياض، المملكة العربية السعودية. نحن نجلب النكهات الأصيلة للكويت إلى العاصمة النابضة بالحياة، وندعوك لتذوق الوصفات العائلية الغالية التي تجسد جوهر المطبخ الكويتي. من توابل المجبوس العطرية إلى الدفء المريح للفتوش والمتعة الحلوة للبلاليط، كل طبق يحتفي بالتراث الطهوي الغني للكويت. انضم إلينا لتجربة طعام دافئة ومرحبة تشعرك وكأنك في تجمع مع الأحبة، هنا في قلب الرياض.",
        menuTitle: "قائمتنا"
    }
};

let currentLang = 'en';

async function initDB() {
    const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` });
    const savedData = localStorage.getItem('menu_db');
    let db;
    if (savedData) {
        const array = JSON.parse(savedData);
        db = new SQL.Database(new Uint8Array(array));
        const columns = db.exec("PRAGMA table_info(menu)");
        const columnNames = columns[0].values.map(col => col[1]);
        if (!columnNames.includes('category_en')) {
            db.run(`
                ALTER TABLE menu ADD COLUMN category_en TEXT;
                ALTER TABLE menu ADD COLUMN category_ar TEXT;
                ALTER TABLE menu ADD COLUMN subcategory_en TEXT;
                ALTER TABLE menu ADD COLUMN subcategory_ar TEXT;
            `);
            db.run(`UPDATE menu SET category_en = 'Lunch Menu', category_ar = 'قائمة الغداء', 
                    subcategory_en = 'Kuwaiti Food', subcategory_ar = 'طعام كويتي' WHERE category_en IS NULL`);
            const data = db.export();
            localStorage.setItem('menu_db', JSON.stringify(Array.from(data)));
        }
    } else {
        db = new SQL.Database();
        db.run(`
            CREATE TABLE menu (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name_en TEXT,
                name_ar TEXT,
                price REAL,
                image_url TEXT,
                category_en TEXT,
                category_ar TEXT,
                subcategory_en TEXT,
                subcategory_ar TEXT
            );
            INSERT INTO menu (name_en, name_ar, price, image_url, category_en, category_ar, subcategory_en, subcategory_ar) VALUES
            ('Kabsa', 'كبسة', 50.00, 'https://placehold.co/150x150?text=Kabsa', 'Lunch Menu', 'قائمة الغداء', 'Kuwaiti Food', 'طعام كويتي'),
            ('Machboos', 'مجبوس', 45.00, 'https://placehold.co/150x150?text=Machboos', 'Lunch Menu', 'قائمة الغداء', 'Kuwaiti Food', 'طعام كويتي'),
            ('Fattoush', 'فتوش', 20.00, 'https://placehold.co/150x150?text=Fattoush', 'Lunch Menu', 'قائمة الغداء', 'Salads', 'السلطات'),
            ('Balaleet', 'بلاليط', 15.00, 'https://placehold.co/150x150?text=Balaleet', 'Breakfast Menu', 'قائمة الإفطار', 'Dessert', 'الحلوى'),
            ('Kunafa', 'كنافة', 25.00, 'https://placehold.co/150x150?text=Kunafa', 'Breakfast Menu', 'قائمة الإفطار', 'Dessert', 'الحلوى');
        `);
        const data = db.export();
        localStorage.setItem('menu_db', JSON.stringify(Array.from(data)));
    }
    return db;
}

function updateContent() {
    document.documentElement.lang = currentLang;
    document.getElementById('restaurant-name').textContent = translations[currentLang].restaurantName;
    document.getElementById('menu-title').textContent = translations[currentLang].menuTitle;
    const welcomeSection = document.getElementById('welcome-message');
    welcomeSection.innerHTML = `
        <h2>${translations[currentLang].welcomeTitle}</h2>
        <p>${translations[currentLang].welcomeText}</p>
    `;
    loadMenuItems();
}

async function loadMenuItems() {
    const db = await initDB();
    const results = db.exec("SELECT * FROM menu ORDER BY category_en, subcategory_en, name_en");
    const menuItems = document.getElementById('menu-items');
    menuItems.innerHTML = '';

    if (results[0]) {
        let currentCategory = '';
        let currentSubcategory = '';
        let categoryContainer = null;
        let subcategoryContainer = null;

        results[0].values.forEach(item => {
            const [id, name_en, name_ar, price, image_url, category_en, category_ar, subcategory_en, subcategory_ar] = item;
            const name = currentLang === 'en' ? name_en : name_ar;
            const category = currentLang === 'en' ? category_en : category_ar;
            const subcategory = currentLang === 'en' ? subcategory_en : subcategory_ar;

            if (category !== currentCategory) {
                currentCategory = category;
                currentSubcategory = '';
                const categoryTitle = document.createElement('h2');
                categoryTitle.className = 'category-title';
                categoryTitle.textContent = category;
                menuItems.appendChild(categoryTitle);
                categoryContainer = document.createElement('div');
                categoryContainer.className = 'menu-grid';
                menuItems.appendChild(categoryContainer);
            }

            if (subcategory !== currentSubcategory) {
                currentSubcategory = subcategory;
                const subcategoryTitle = document.createElement('h3');
                subcategoryTitle.className = 'subcategory-title';
                subcategoryTitle.textContent = subcategory;
                categoryContainer.appendChild(subcategoryTitle);
                subcategoryContainer = document.createElement('div');
                subcategoryContainer.className = 'menu-grid';
                categoryContainer.appendChild(subcategoryContainer);
            }

            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <img src="${image_url}" alt="${name}">
                <h3>${name}</h3>
                <p class="price">SAR ${price.toFixed(2)}</p>
            `;
            subcategoryContainer.appendChild(menuItem);
        });
    }
}

function switchLanguage() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    document.getElementById('lang-toggle').textContent = currentLang === 'en' ? 'AR' : 'EN';
    updateContent();
}

document.addEventListener('DOMContentLoaded', () => {
    updateContent();
});