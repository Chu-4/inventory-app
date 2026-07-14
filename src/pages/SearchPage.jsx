import { useEffect, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { api } from '../utils/api';
import { searchUtils } from '../utils/helpers';
import ItemCard from '../components/ItemCard';

export default function SearchPage({ onNavigate, onBack, initialKeyword = '' }) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recent_searches') || '[]') } catch { return [] }
  });

  // 进入搜索页只拉分类和房间（用于展示标签、按名称匹配）
  useEffect(() => {
    Promise.all([api.getCategories(), api.getRooms()])
      .then(([cats, rms]) => {
        setCategories(cats);
        setRooms(rms);
      });
  }, []);

  // 有搜索词时才拉物品，并做防抖
  useEffect(() => {
    const kw = keyword.trim();
    if (!kw) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const all = await api.getItems();
        setItems(searchUtils.search(all, kw, { categories, rooms }));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, categories, rooms]);

  const saveRecentSearch = (kw) => {
    const list = [kw, ...recentSearches.filter(s => s !== kw)].slice(0, 8);
    setRecentSearches(list);
    localStorage.setItem('recent_searches', JSON.stringify(list));
  };

  const handleSearch = (kw) => {
    setKeyword(kw);
  };

  const handleSearchTag = (tag) => {
    setKeyword(tag);
    saveRecentSearch(tag);
  };

  const handleResultClick = (item) => {
    if (keyword.trim()) saveRecentSearch(keyword.trim());
    onNavigate('item-detail', { itemId: item.id });
  };

  return (
    <div className="page page--search">
      <div className="search-header">
        <div className="search-input-wrap">
          <SearchOutlined style={{ fontSize: 18, color: '#6c757d' }} />
          <input
            type="search"
            className="search-input"
            placeholder="搜索物品名称、分类、房间..."
            value={keyword}
            onChange={e => handleSearch(e.target.value)}
            autoFocus
          />
        </div>
        <button type="button" className="search-cancel" onClick={onBack}>
          取消
        </button>
      </div>

      {!keyword.trim() && recentSearches.length > 0 && (
        <div className="search-section">
          <div className="search-section-title">最近搜索</div>
          <div className="search-tags">
            {recentSearches.map(tag => (
              <button key={tag} type="button" className="search-tag" onClick={() => handleSearchTag(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {keyword.trim() && (
        <div className="search-section">
          <div className="search-section-title">搜索结果</div>
          {loading ? (
            <div className="empty-state empty-state--compact"><p>搜索中...</p></div>
          ) : items.length === 0 ? (
            <div className="empty-state empty-state--compact"><p>没有找到匹配的物品</p></div>
          ) : (
            <div className="search-results">
              {items.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  variant="search"
                  categories={categories}
                  rooms={rooms}
                  onClick={() => handleResultClick(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
