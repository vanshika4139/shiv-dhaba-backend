import API_BASE from '../api.js';
import { useState, useEffect } from "react";
import { useTheme, ThemeToggle } from "./ThemeContext";

const CATEGORIES = [
  "All", "Snacks", "Breakfast", "Indian", "Rice",
  "Tandoor", "Raita", "Soup", "Noodles", "Beverages", "Sweets"
];

const CATEGORY_ICONS = {
  All: "🍽️", Snacks: "🥙", Breakfast: "🍳", Indian: "🍛",
  Rice: "🍚", Tandoor: "🔥", Raita: "🥛", Soup: "🍲",
  Noodles: "🍜", Beverages: "☕", Sweets: "🍮"
};

export default function Menu({ onAddToCart }) {
  const { theme } = useTheme();
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/menu`)
      .then(r => r.json())
      .then(data => { setMenuItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = menuItems.filter(item => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = CATEGORIES.slice(1).reduce((acc, cat) => {
    const items = filtered.filter(i => i.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  const handleAdd = (item) => {
    if (onAddToCart) onAddToCart(item);
    setAddedId(item.id || item._id);
    setTimeout(() => setAddedId(null), 1000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: theme.bg,
      fontFamily: "'Segoe UI', sans-serif",
      color: theme.text,
      transition: "background 0.25s, color 0.25s",
    }}>
      {/* ── Header ── */}
      <div style={{
        background: theme.bgHeader,
        borderBottom: `1px solid ${theme.border}`,
        padding: "28px 24px 20px",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: theme.headerShadow,
        transition: "background 0.25s",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: theme.accent, letterSpacing: "-0.5px" }}>
                🍽️ SHIV DHABA
              </h1>
              <p style={{ margin: "0 0 16px", color: theme.textSubtitle, fontSize: 13 }}>
                Indian • Chinese • Tandoori
              </p>
            </div>
            <ThemeToggle style={{ marginTop: 4 }} />
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 14 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.5 }}>🔍</span>
            <input
              type="text" placeholder="Search dishes..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "11px 14px 11px 42px",
                background: theme.bgInput,
                border: `1.5px solid ${theme.borderInput}`,
                borderRadius: 10, color: theme.text, fontSize: 15, outline: "none",
                transition: "background 0.25s, border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = theme.accent}
              onBlur={e => e.target.style.borderColor = theme.borderInput}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: theme.textMuted, cursor: "pointer", fontSize: 18, padding: 0 }}
              >×</button>
            )}
          </div>

          {/* Category Pills */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0, padding: "7px 14px", borderRadius: 20,
                  border: activeCategory === cat ? "none" : `1.5px solid ${theme.borderInput}`,
                  background: activeCategory === cat ? theme.accent : theme.bgInput,
                  color: activeCategory === cat ? "#fff" : theme.textMuted,
                  fontSize: 13, fontWeight: activeCategory === cat ? 700 : 400,
                  cursor: "pointer", whiteSpace: "nowrap",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: theme.textMuted }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🍛</div>
            <p>Loading menu...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: theme.textMuted }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>😕</div>
            <p>No items found</p>
          </div>
        ) : activeCategory !== "All" ? (
          <ItemGrid items={filtered} onAdd={handleAdd} addedId={addedId} theme={theme} />
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[cat]}</span>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: theme.accent }}>{cat}</h2>
                <div style={{ flex: 1, height: 1, background: theme.border, marginLeft: 6 }} />
                <span style={{ color: theme.textMuted, fontSize: 12 }}>{items.length} items</span>
              </div>
              <ItemGrid items={items} onAdd={handleAdd} addedId={addedId} theme={theme} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ItemGrid({ items, onAdd, addedId, theme }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
      {items.map(item => {
        const id = item.id || item._id;
        const isAdded = addedId === id;
        return (
          <div
            key={id}
            style={{
              background: theme.bgHover,
              border: `1px solid ${theme.borderCard}`,
              borderRadius: 12,
              overflow: "hidden",
              transition: "border-color 0.2s, transform 0.1s, background 0.25s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = theme.accent;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = theme.borderCard;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {item.image ? (
              <img
                src={`${API_BASE}${item.image}`} alt={item.name}
                style={{ width: "100%", height: 130, objectFit: "cover" }}
              />
            ) : (
              <div style={{
                width: "100%", height: 100, background: theme.bgInput,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, opacity: 0.3,
              }}>🍽️</div>
            )}
            <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 600, color: theme.text }}>{item.name}</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: theme.accent }}>₹{item.price}</p>
              </div>
              <button
                onClick={() => onAdd(item)}
                style={{
                  width: 34, height: 34, borderRadius: "50%", border: "none",
                  background: isAdded ? "#22c55e" : theme.accent, color: "#fff",
                  fontSize: 20, fontWeight: 700, cursor: "pointer", flexShrink: 0,
                  transform: isAdded ? "scale(1.15)" : "scale(1)", transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {isAdded ? "✓" : "+"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
