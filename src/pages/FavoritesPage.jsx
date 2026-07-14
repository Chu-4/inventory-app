import { useEffect, useState } from 'react';
import { LeftOutlined, HeartFilled } from '@ant-design/icons';
import { api } from '../utils/api';
import ItemCard from '../components/ItemCard';

export default function FavoritesPage({ onNavigate, onBack, onRefresh }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);

  const loadItems = () => api.getFavoriteItems().then(setItems);

  useEffect(() => {
    loadItems();
    api.getCategories().then(setCategories);
    api.getRooms().then(setRooms);
  }, []);

  const handleToggleFavorite = async (id) => {
    await api.toggleFavorite(id);
    loadItems();
    onRefresh?.();
  };

  return (
    <div className="page page--stack">
      <div className="stack-header">
        <button type="button" className="back-btn back-btn--plain" onClick={onBack}>
          <LeftOutlined />
        </button>
        <h1 className="stack-title stack-title--center">收藏物品</h1>
        <div style={{ width: 40 }} />
      </div>

      <div className="favorites-list">
        {items.length === 0 ? (
          <div className="empty-state">
            <HeartFilled style={{ fontSize: 40, color: '#e67e22', marginBottom: 12 }} />
            <p>还没有收藏的物品</p>
            <p style={{ fontSize: 13, color: '#636366', marginTop: 4 }}>在物品详情页点击爱心即可收藏</p>
          </div>
        ) : (
          items.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              variant="favorite"
              showFavorite
              categories={categories}
              rooms={rooms}
              onToggleFavorite={handleToggleFavorite}
              onClick={() => onNavigate('item-detail', { itemId: item.id })}
            />
          ))
        )}
      </div>
    </div>
  );
}
