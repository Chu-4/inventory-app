// 默认分类
const DEFAULT_CATEGORIES = [
  { id: '1', name: '电子产品', color: '#45B7D1' },
  { id: '2', name: '家具', color: '#96CEB4' },
  { id: '3', name: '厨具', color: '#FF6B6B' },
  { id: '4', name: '家电', color: '#4ECDC4' },
  {
    id: '5',
    name: '书籍',
    color: '#4ECDC4',
    subcategories: [{ id: '5-1', name: '同人本' }],
  },
  { id: '6', name: '衣物鞋包', color: '#FFA07A' },
  { id: '7', name: '唱片', color: '#96CEB4' },
  { id: '8', name: '影碟', color: '#FFEAA7' },
];

// 默认房间
const DEFAULT_ROOMS = [
  { id: 'r1', name: '客厅', icon: 'living' },
  { id: 'r2', name: '卧室', icon: 'bedroom' },
  { id: 'r3', name: '厨房', icon: 'kitchen' },
  { id: 'r4', name: '书房', icon: 'study' },
  { id: 'r5', name: '卫生间', icon: 'bathroom' },
  { id: 'r6', name: '阳台', icon: 'balcony' },
];

const STORAGE_KEYS = {
  categories: 'categories',
  rooms: 'rooms',
  items: 'items',
  recentSearches: 'recent_searches',
  initialized: 'inventory_initialized_v2',
};

const memoryStore = {};
let lastError = null;

function detectStorage() {
  try {
    const testKey = '__inventory_storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const canUseLocalStorage = detectStorage();

function readRaw(key) {
  if (canUseLocalStorage) return localStorage.getItem(key);
  return memoryStore[key] ?? null;
}

function writeRaw(key, value) {
  try {
    if (canUseLocalStorage) {
      localStorage.setItem(key, value);
    } else {
      memoryStore[key] = value;
      lastError = new Error('当前环境不支持 localStorage，数据仅保存在内存中，刷新后会丢失');
    }
    lastError = null;
    return true;
  } catch (e) {
    lastError = e;
    console.error('Storage write failed:', e);
    return false;
  }
}

function removeRaw(key) {
  if (canUseLocalStorage) localStorage.removeItem(key);
  else delete memoryStore[key];
}

export const storage = {
  isPersistent() {
    return canUseLocalStorage;
  },

  getLastError() {
    return lastError;
  },

  init() {
    if (!readRaw(STORAGE_KEYS.initialized)) {
      const hasLegacy = readRaw('inventory_initialized');
      const legacyCategories = readRaw(STORAGE_KEYS.categories);
      const legacyItems = readRaw(STORAGE_KEYS.items);

      if (hasLegacy && (legacyCategories || legacyItems)) {
        if (!legacyCategories) writeRaw(STORAGE_KEYS.categories, JSON.stringify(DEFAULT_CATEGORIES));
        if (!readRaw(STORAGE_KEYS.rooms)) writeRaw(STORAGE_KEYS.rooms, JSON.stringify(DEFAULT_ROOMS));
        if (!legacyItems) writeRaw(STORAGE_KEYS.items, JSON.stringify([]));
        writeRaw(STORAGE_KEYS.recentSearches, JSON.stringify([]));
        writeRaw(STORAGE_KEYS.initialized, '1');
        return;
      }

      writeRaw(STORAGE_KEYS.categories, JSON.stringify(DEFAULT_CATEGORIES));
      writeRaw(STORAGE_KEYS.rooms, JSON.stringify(DEFAULT_ROOMS));
      writeRaw(STORAGE_KEYS.items, JSON.stringify([]));
      writeRaw(STORAGE_KEYS.recentSearches, JSON.stringify([]));
      writeRaw(STORAGE_KEYS.initialized, '1');
      return;
    }

    if (!readRaw(STORAGE_KEYS.categories)) writeRaw(STORAGE_KEYS.categories, JSON.stringify(DEFAULT_CATEGORIES));
    if (!readRaw(STORAGE_KEYS.rooms)) writeRaw(STORAGE_KEYS.rooms, JSON.stringify(DEFAULT_ROOMS));
    if (!readRaw(STORAGE_KEYS.items)) writeRaw(STORAGE_KEYS.items, JSON.stringify([]));
    if (!readRaw(STORAGE_KEYS.recentSearches)) writeRaw(STORAGE_KEYS.recentSearches, JSON.stringify([]));
  },

  // 分类
  getCategories() {
    const data = readRaw(STORAGE_KEYS.categories);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  },

  saveCategories(categories) {
    return writeRaw(STORAGE_KEYS.categories, JSON.stringify(categories));
  },

  addCategory(name, color) {
    const categories = this.getCategories();
    const newCategory = { id: Date.now().toString(), name, color };
    categories.push(newCategory);
    if (!this.saveCategories(categories)) throw new Error('分类保存失败');
    return newCategory;
  },

  deleteCategory(id) {
    if (!this.saveCategories(this.getCategories().filter(c => c.id !== id))) {
      throw new Error('分类保存失败');
    }
  },

  getCategory(id) {
    return this.getCategories().find(c => c.id === id);
  },

  // 房间
  getRooms() {
    const data = readRaw(STORAGE_KEYS.rooms);
    return data ? JSON.parse(data) : DEFAULT_ROOMS;
  },

  saveRooms(rooms) {
    return writeRaw(STORAGE_KEYS.rooms, JSON.stringify(rooms));
  },

  addRoom(name, icon = 'living') {
    const rooms = this.getRooms();
    const newRoom = { id: Date.now().toString(), name, icon };
    rooms.push(newRoom);
    if (!this.saveRooms(rooms)) throw new Error('房间保存失败');
    return newRoom;
  },

  deleteRoom(id) {
    if (!this.saveRooms(this.getRooms().filter(r => r.id !== id))) {
      throw new Error('房间保存失败');
    }
  },

  getRoom(id) {
    return this.getRooms().find(r => r.id === id);
  },

  // 物品
  getItems() {
    const data = readRaw(STORAGE_KEYS.items);
    return data ? JSON.parse(data) : [];
  },

  saveItems(items) {
    return writeRaw(STORAGE_KEYS.items, JSON.stringify(items));
  },

  addItem(item) {
    const items = this.getItems();
    const newItem = {
      id: Date.now().toString(),
      favorite: false,
      quantity: 1,
      ...item,
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    if (!this.saveItems(items)) throw new Error('物品保存失败，图片可能过大');
    return newItem;
  },

  updateItem(id, item) {
    const items = this.getItems();
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...item };
      if (!this.saveItems(items)) throw new Error('物品保存失败，图片可能过大');
    }
  },

  deleteItem(id) {
    if (!this.saveItems(this.getItems().filter(i => i.id !== id))) {
      throw new Error('删除失败');
    }
  },

  getItem(id) {
    return this.getItems().find(i => i.id === id);
  },

  toggleFavorite(id) {
    const item = this.getItem(id);
    if (item) this.updateItem(id, { favorite: !item.favorite });
    return !item?.favorite;
  },

  getFavoriteItems() {
    return this.getItems().filter(i => i.favorite);
  },

  // 最近搜索
  getRecentSearches() {
    const data = readRaw(STORAGE_KEYS.recentSearches);
    return data ? JSON.parse(data) : [];
  },

  addRecentSearch(keyword) {
    const kw = keyword.trim();
    if (!kw) return;
    const list = this.getRecentSearches().filter(s => s !== kw);
    list.unshift(kw);
    writeRaw(STORAGE_KEYS.recentSearches, JSON.stringify(list.slice(0, 8)));
  },

  clearRecentSearches() {
    writeRaw(STORAGE_KEYS.recentSearches, JSON.stringify([]));
  },

  // 导出导入
  exportData() {
    return {
      categories: this.getCategories(),
      rooms: this.getRooms(),
      items: this.getItems(),
      exportTime: new Date().toISOString(),
    };
  },

  importData(data) {
    try {
      if (data.categories && !this.saveCategories(data.categories)) return false;
      if (data.rooms && !this.saveRooms(data.rooms)) return false;
      if (data.items && !this.saveItems(data.items)) return false;
      writeRaw(STORAGE_KEYS.initialized, '1');
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },

  clearAll() {
    const keys = Object.values(STORAGE_KEYS);
    keys.forEach(k => removeRaw(k));
    if (canUseLocalStorage) {
      localStorage.removeItem('inventory_initialized');
    }
    this.init();
  },

  getStats() {
    const items = this.getItems();
    const categories = this.getCategories();
    const rooms = this.getRooms();

    const stats = {
      totalItems: items.length,
      totalValue: 0,
      byCategory: {},
      byRoom: {},
    };

    categories.forEach(cat => {
      const catItems = items.filter(i => i.categoryId === cat.id);
      stats.byCategory[cat.id] = {
        name: cat.name,
        count: catItems.length,
        value: catItems.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0),
      };
    });

    rooms.forEach(room => {
      const roomItems = items.filter(i => i.roomId === room.id);
      stats.byRoom[room.id] = {
        name: room.name,
        count: roomItems.length,
        value: roomItems.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0),
      };
    });

    stats.totalValue = items.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0);
    return stats;
  },
};

storage.init();
