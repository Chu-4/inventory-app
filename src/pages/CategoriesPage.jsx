import { useMemo, useState } from 'react';
import { SearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { storage } from '../utils/storage';
import BottomNav from '../components/BottomNav';
import ItemCard from '../components/ItemCard';

export default function CategoriesPage({ onNavigate }) {
  const [items] = useState(storage.getItems());
  const categories = storage.getCategories();

  const grouped = useMemo(() => {
    return categories
      .map(cat => ({
        ...cat,
        items: items.filter(i => i.categoryId === cat.id),
      }))
      .filter(g => g.items.length > 0);
  }, [items, categories]);

  return (
    <div className="page page--categories">
      <div className="page-top-header">
        <h1 className="page-top-title">分类浏览</h1>
        <div className="page-top-actions">
          <button type="button" className="header-icon-btn" onClick={() => onNavigate('search')}>
            <SearchOutlined style={{ fontSize: 20 }} />
          </button>
          <button type="button" className="header-icon-btn" onClick={() => onNavigate('all-items')}>
            <UnorderedListOutlined style={{ fontSize: 20 }} />
          </button>
        </div>
      </div>

      <div className="browse-content">
        {grouped.length === 0 ? (
          <div className="empty-state">
            <p>还没有物品</p>
            <button type="button" className="btn-primary" onClick={() => onNavigate('item-add')}>
              添加第一件物品
            </button>
          </div>
        ) : (
          grouped.map(group => (
            <section key={group.id} className="browse-section">
              <div className="browse-section-title">
                <span>{group.name}</span>
                <span className="browse-section-count">({group.items.length})</span>
              </div>
              <div className="browse-item-list">
                {group.items.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => onNavigate('item-detail', { itemId: item.id })}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <BottomNav activeId="categories" onNavigate={onNavigate} />
    </div>
  );
}
