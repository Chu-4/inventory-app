import { useEffect, useState } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { api } from '../utils/api';
import ItemCard from '../components/ItemCard';

export default function ItemListPage({ listType, categoryId, roomId, onNavigate, onBack }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [title, setTitle] = useState('全部物品');

  useEffect(() => {
    api.getCategories().then(setCategories);
    api.getRooms().then(rs => {
      setRooms(rs);
      if (listType === 'room' && roomId) {
        setTitle(rs.find(r => r.id === roomId)?.name || '房间');
      }
    });
    if (listType === 'category' && categoryId) {
      api.getItems({ categoryId }).then(setItems);
      api.getCategories().then(cats => setTitle(cats.find(c => c.id === categoryId)?.name || '分类'));
    } else if (listType === 'room' && roomId) {
      api.getItems({ roomId }).then(setItems);
    } else {
      api.getItems().then(setItems);
    }
  }, [listType, categoryId, roomId]);

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
            {items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                categories={categories}
                rooms={rooms}
                onClick={() => onNavigate('item-detail', { itemId: item.id })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
