import { useEffect, useMemo, useState } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { api } from '../utils/api';
import { searchUtils } from '../utils/helpers';
import ItemCard from '../components/ItemCard';

export default function TimeBrowsePage({ onNavigate, onBack }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    api.getItems().then(setItems);
    api.getCategories().then(setCategories);
    api.getRooms().then(setRooms);
  }, []);

  const grouped = useMemo(() => searchUtils.groupByMonth(items), [items]);

  return (
    <div className="page page--stack">
      <div className="stack-header">
        <button type="button" className="back-btn" onClick={onBack}>
          <LeftOutlined />
        </button>
        <h1 className="stack-title">按时间浏览</h1>
        <div style={{ width: 40 }} />
      </div>

      <div className="browse-content">
        {grouped.length === 0 ? (
          <div className="empty-state"><p>还没有物品记录</p></div>
        ) : (
          grouped.map(([month, monthItems]) => (
            <section key={month} className="browse-section">
              <div className="browse-section-title">
                <span>{month === '未知' ? '未记录日期' : month}</span>
                <span className="browse-section-count">({monthItems.length})</span>
              </div>
              <div className="browse-item-list">
                {monthItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    categories={categories}
                    rooms={rooms}
                    onClick={() => onNavigate('item-detail', { itemId: item.id })}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
