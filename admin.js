const translations = {
    en: {
        adminTitle: "Admin - Freej Swaeleh",
        loginTitle: "Admin Login",
        manageTitle: "Manage Menu Items",
        itemsTitle: "Menu Items",
        usernameLabel: "Username:",
        passwordLabel: "Password:",
        loginButton: "Login",
        nameEnLabel: "Name (English):",
        nameArLabel: "Name (Arabic):",
        priceLabel: "Price (SAR):",
        imageUrlLabel: "Image URL:",
        categoryLabel: "Category:",
        subcategoryLabel: "Subcategory:",
        saveButton: "Save Item",
        logoutButton: "Logout",
        editButton: "Edit",
        deleteButton: "Delete",
        errorInvalidPrice: "Please enter a valid price.",
        errorInvalidUrl: "Please enter a valid image URL.",
        errorSaveFailed: "Failed to save item. Please try again."
    },
    ar: {
        adminTitle: "الإدارة - فريج صويلح",
        loginTitle: "تسجيل دخول الإدارة",
        manageTitle: "إدارة عناصر القائمة",
        itemsTitle: "عناصر القائمة",
        usernameLabel: "اسم المستخدم:",
        passwordLabel: "كلمة المرور:",
        loginButton: "تسجيل الدخول",
        nameEnLabel: "الاسم (بالإنجليزية):",
        nameArLabel: "الاسم (بالعربية):",
        priceLabel: "السعر (ريال سعودي):",
        imageUrlLabel: "رابط الصورة:",
        categoryLabel: "الفئة:",
        subcategoryLabel: "الفئة الفرعية:",
        saveButton: "حفظ العنصر",
        logoutButton: "تسجيل الخروج",
        editButton: "تعديل",
        deleteButton: "حذف",
        errorInvalidPrice: "الرجاء إدخال سعر صحيح.",
        errorInvalidUrl: "الرجاء إدخال رابط صورة صحيح.",
        errorSaveFailed: "فشل في حفظ العنصر. حاول مرة أخرى."
    }
};

const categoryMap = {
    'Lunch Menu': 'قائمة الغداء',
    'Breakfast Menu': 'قائمة الإفطار'
};

const subcategoryMap = {
    'Kuwaiti Food': 'طعام كويتي',
    'Appetizers': 'المقبلات',
    'Grilled': 'مشويات',
    'Soups': 'الحساء',
    'Dessert': 'الحلوى',
    'Beverages': 'المشروبات',
    'Cocktails': 'الكوكتيلات',
    'Juices': 'العصائر',
    'Soups & Starters': 'الحساء والمقبلات',
    'Salads': 'السلطات',
    'Egg Dishes': 'أطباق البيض',
    'Meat Dishes': 'أطباق اللحوم',
    'Vegetable Dishes': 'أطباق الخضروات',
    'Cheese Dishes': 'أطباق الجبن'
};

let currentLang = 'en';
let db;

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
    document.getElementById('admin-title').textContent = translations[currentLang].adminTitle;
    const loginSection = document.getElementById('login-section');
    const adminSection = document.getElementById('admin-section');
    if (loginSection.style.display !== 'none') {
        loginSection.querySelector('h2').textContent = translations[currentLang].loginTitle;
        loginSection.querySelector('label[for="username"]').textContent = translations[currentLang].usernameLabel;
        loginSection.querySelector('label[for="password"]').textContent = translations[currentLang].passwordLabel;
        loginSection.querySelector('button[type="submit"]').textContent = translations[currentLang].loginButton;
    }
    if (adminSection.style.display !== 'none') {
        adminSection.querySelector('h2').textContent = translations[currentLang].manageTitle;
        adminSection.querySelector('h3').textContent = translations[currentLang].itemsTitle;
        adminSection.querySelector('label[for="name-en"]').textContent = translations[currentLang].nameEnLabel;
        adminSection.querySelector('label[for="name-ar"]').textContent = translations[currentLang].nameArLabel;
        adminSection.querySelector('label[for="price"]').textContent = translations[currentLang].priceLabel;
        adminSection.querySelector('label[for="image-url"]').textContent = translations[currentLang].imageUrlLabel;
        adminSection.querySelector('label[for="category"]').textContent = translations[currentLang].categoryLabel;
        adminSection.querySelector('label[for="subcategory"]').textContent = translations[currentLang].subcategoryLabel;
        adminSection.querySelector('button[type="submit"]').textContent = translations[currentLang].saveButton;
        document.getElementById('logout-btn').textContent = translations[currentLang].logoutButton;
        loadMenuItems();
    }
}

async function loadMenuItems() {
    if (!db) {
        db = await initDB();
    }
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
                <button class="edit-btn" onclick="editItem(${id})">${translations[currentLang].editButton}</button>
                <button class="delete-btn" onclick="deleteItem(${id})">${translations[currentLang].deleteButton}</button>
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

function editItem(id) {
    if (!db) return;
    const results = db.exec(`SELECT * FROM menu WHERE id = ${id}`);
    if (results[0]) {
        const [itemId, name_en, name_ar, price, image_url, category_en, , , subcategory_en] = results[0].values[0];
        document.getElementById('item-id').value = itemId;
        document.getElementById('name-en').value = name_en;
        document.getElementById('name-ar').value = name_ar;
        document.getElementById('price').value = price;
        document.getElementById('image-url').value = image_url;
        document.getElementById('category').value = category_en || 'Lunch Menu';
        document.getElementById('subcategory').value = subcategory_en || 'Kuwaiti Food';
    }
}

function deleteItem(id) {
    if (!db) return;
    db.run(`DELETE FROM menu WHERE id = ${id}`);
    const data = db.export();
    localStorage.setItem('menu_db', JSON.stringify(Array.from(data)));
    loadMenuItems();
}

function logout() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('admin-section').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'none';
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'admin' && password === 'newpassword2025') {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'inline-block';
        db = await initDB();
        updateContent();
    } else {
        alert(currentLang === 'en' ? 'Invalid credentials' : 'بيانات الاعتماد غير صحيحة');
    }
});

document.getElementById('menu-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!db) {
        db = await initDB();
    }

    const id = document.getElementById('item-id').value;
    const name_en = document.getElementById('name-en').value.trim();
    const name_ar = document.getElementById('name-ar').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const image_url = document.getElementById('image-url').value.trim();
    const category_en = document.getElementById('category').value;
    const category_ar = categoryMap[category_en] || category_en;
    const subcategory_en = document.getElementById('subcategory').value;
    const subcategory_ar = subcategoryMap[subcategory_en] || subcategory_en;

    if (!name_en || !name_ar) {
        alert(currentLang === 'en' ? 'Please enter both English and Arabic names.' : 'الرجاء إدخال الاسم بالإنجليزية والعربية.');
        return;
    }
    if (isNaN(price) || price < 0) {
        alert(translations[currentLang].errorInvalidPrice);
        return;
    }
    try {
        new URL(image_url);
    } catch {
        alert(translations[currentLang].errorInvalidUrl);
        return;
    }

    try {
        if (id) {
            db.run(`UPDATE menu SET name_en = ?, name_ar = ?, price = ?, image_url = ?, category_en = ?, category_ar = ?, subcategory_en = ?, subcategory_ar = ? WHERE id = ?`,
                   [name_en, name_ar, price, image_url, category_en, category_ar, subcategory_en, subcategory_ar, id]);
        } else {
            db.run(`INSERT INTO menu (name_en, name_ar, price, image_url, category_en, category_ar, subcategory_en, subcategory_ar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                   [name_en, name_ar, price, image_url, category_en, category_ar, subcategory_en, subcategory_ar]);
        }

        const data = db.export();
        localStorage.setItem('menu_db', JSON.stringify(Array.from(data)));
        document.getElementById('menu-form').reset();
        document.getElementById('item-id').value = '';
        loadMenuItems();
    } catch (error) {
        console.error('Error saving item:', error);
        alert(translations[currentLang].errorSaveFailed);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    db = await initDB();
    updateContent();
});