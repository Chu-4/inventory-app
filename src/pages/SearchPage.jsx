import { useState, useMemo } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { storage } from '../utils/storage';
import { searchUtils } from '../utils/helpers';
import ItemCard from '../components/ItemCard';

export default function SearchPage({ onNavigate, onBack, initialKeyword = '' }) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [items] = useState(storage.getItems());
  const categories = storage.getCategories();
  const rooms = storage.getRooms();
  const [recentSearches, setRecentSearches] = useState(storage.getRecentSearches());

  const results = useMemo(() => {
    if (!keyword.trim()) return [];
    return searchUtils.search(items, keyword, { categories, rooms });
  }, [items, keyword, categories, rooms]);

  const handleSearch = (kw) => {
    setKeyword(kw);
    if (kw.trim()) {
      storage.addRecentSearch(kw.trim());
      setRecentSearches(storage.getRecentSearches());
    }
  };

  const handleResultClick = (item) => {
    if (keyword.trim()) storage.addRecentSearch(keyword.trim());
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
              <button key={tag} type="button" className="search-tag" onClick={() => handleSearch(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {keyword.trim() && (
        <div className="search-section">
          <div className="search-section-title">搜索结果</div>
          {results.length === 0 ? (
            <div className="empty-state empty-state--compact"><p>没有找到匹配的物品</p></div>
          ) : (
            <div className="search-results">
              {results.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  variant="search"
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
