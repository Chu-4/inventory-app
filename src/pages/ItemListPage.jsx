import { useMemo, useState } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { storage } from '../utils/storage';
import ItemCard from '../components/ItemCard';

export default function ItemListPage({ listType, categoryId, roomId, onNavigate, onBack }) {
  const [items] = useState(storage.getItems());
  const category = categoryId ? storage.getCategory(categoryId) : null;
  const room = roomId ? storage.getRoom(roomId) : null;

  const filteredItems = useMemo(() => {
    if (listType === 'room' && roomId) return items.filter(i => i.roomId === roomId);
    if (listType === 'category' && categoryId) return items.filter(i => i.categoryId === categoryId);
    return items;
  }, [items, listType, categoryId, roomId]);

  const title = listType === 'all'
    ? '全部物品'
    : listType === 'room'
      ? room?.name || '房间'
      : category?.name || '分类';

  return (
    <div className="page page--stack">
      <div className="stack-header">
        <button type="button" className="back-btn" onClick={onBack}>
          <LeftOutlined />
        </button>
        <h1 className="stack-title">{title}</h1>
        <div style={{ width: 40 }} />
      </div>

      <div className="browse-content">
        {filteredItems.length === 0 ? (
          <div className="empty-state"><p>这个列表还是空的</p></div>
        ) : (
          <div className="browse-item-list">
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => onNavigate('item-detail', { itemId: item.id })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
