// 图片处理
export const imageUtils = {
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async compressImage(file, maxWidth = 600, maxHeight = 600) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.65));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },
};

// 搜索和筛选
export const searchUtils = {
  search(items, keyword, { categories = [], rooms = [] } = {}) {
    if (!keyword) return items;
    const lower = keyword.toLowerCase();
    return items.filter(item => {
      const cat = categories.find(c => c.id === item.categoryId);
      const room = rooms.find(r => r.id === item.roomId);
      return (
        item.name?.toLowerCase().includes(lower) ||
        item.notes?.toLowerCase().includes(lower) ||
        item.ip?.toLowerCase().includes(lower) ||
        item.location?.toLowerCase().includes(lower) ||
        cat?.name?.toLowerCase().includes(lower) ||
        room?.name?.toLowerCase().includes(lower)
      );
    });
  },

  filter(items, filters = {}) {
    let result = items;
    if (filters.categoryId) result = result.filter(i => i.categoryId === filters.categoryId);
    if (filters.roomId) result = result.filter(i => i.roomId === filters.roomId);
    if (filters.favorite) result = result.filter(i => i.favorite);
    return result;
  },

  groupByMonth(items) {
    const groups = {};
    items.forEach(item => {
      const dateStr = item.date || item.createdAt;
      const key = dateStr ? dateStr.slice(0, 7) : '未知';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  },
};

export function formatPrice(price) {
  const num = parseFloat(price);
  if (!num) return '';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
