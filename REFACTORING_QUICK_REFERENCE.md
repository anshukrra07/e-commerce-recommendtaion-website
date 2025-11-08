# 📋 Refactoring Quick Reference Card

## 🚨 When to Refactor (Red Flags)

| Indicator | Threshold | Action |
|-----------|-----------|--------|
| **File Size** | > 300 lines | Split into smaller components |
| **Function Length** | > 50 lines | Extract to separate function |
| **useState Hooks** | > 5 in one component | Create custom hook |
| **useEffect Hooks** | > 3 in one component | Extract to custom hooks |
| **Props Drilling** | > 2 levels deep | Use Context API or state management |
| **Duplicate Code** | > 3 occurrences | Extract to shared utility |
| **Nested Callbacks** | > 2 levels | Refactor to async/await |

---

## 🎯 File Size Targets

### Frontend Files
```
✅ GOOD:     < 150 lines (Ideal)
⚠️  MEDIUM:  150-300 lines (Acceptable)
❌ BAD:      > 300 lines (Needs refactoring)
🔥 CRITICAL: > 500 lines (Refactor ASAP)
```

### Backend Files
```
✅ GOOD:     < 200 lines
⚠️  MEDIUM:  200-350 lines
❌ BAD:      > 350 lines
```

---

## 📦 Extraction Patterns

### Pattern 1: Extract Custom Hook
**When:** Complex data fetching or state logic

```javascript
// BEFORE: Component with 50 lines of logic
const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 30 lines of fetch logic
  }, []);
  
  return <UI data={data} />;
};

// AFTER: Clean component + custom hook
const MyComponent = () => {
  const { data, loading } = useMyData();
  if (loading) return <Spinner />;
  return <UI data={data} />;
};

// hooks/useMyData.js
export const useMyData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  // ... fetch logic
  return { data, loading };
};
```

### Pattern 2: Extract Component
**When:** Large JSX blocks (> 50 lines)

```javascript
// BEFORE: 300-line component
const BigComponent = () => {
  return (
    <div>
      {/* 100 lines of gallery JSX */}
      {/* 100 lines of info JSX */}
      {/* 100 lines of reviews JSX */}
    </div>
  );
};

// AFTER: Composed components
const BigComponent = () => {
  return (
    <div>
      <Gallery />
      <Info />
      <Reviews />
    </div>
  );
};
```

### Pattern 3: Extract Utility Function
**When:** Reusable logic or calculations

```javascript
// BEFORE: Inline calculation everywhere
const price = Math.round(product.price / (1 - product.discount / 100));

// AFTER: Utility function
// utils/priceUtils.js
export const calculateOriginalPrice = (price, discount) => {
  return Math.round(price / (1 - discount / 100));
};

// Usage
const price = calculateOriginalPrice(product.price, product.discount);
```

---

## 🛠️ Refactoring Steps (5-Minute Checklist)

### Quick Refactor (Component)
```
1. ✅ Create new component file
2. ✅ Copy JSX to new file
3. ✅ Add necessary imports
4. ✅ Define props interface
5. ✅ Replace JSX in original with <NewComponent />
6. ✅ Test in browser
7. ✅ Commit changes
```

### Quick Refactor (Hook)
```
1. ✅ Create hooks/useXxx.js file
2. ✅ Move useState/useEffect logic
3. ✅ Return needed values
4. ✅ Import and use in component
5. ✅ Remove old code
6. ✅ Test functionality
7. ✅ Commit changes
```

---

## 📁 Folder Structure Templates

### Option 1: Feature-Based
```
src/
├── features/
│   ├── products/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── utils/
│   └── reviews/
│       ├── components/
│       ├── hooks/
│       └── pages/
```

### Option 2: Domain-Based (Current)
```
src/
├── admin/
│   ├── components/
│   ├── pages/
│   └── styles/
├── seller/
│   ├── components/
│   ├── pages/
│   └── styles/
└── customer/
    ├── components/
    ├── pages/
    └── styles/
```

### Option 3: Hybrid (Recommended)
```
src/
├── admin/
│   ├── components/
│   ├── hooks/          ← Add this
│   ├── pages/
│   └── styles/
├── seller/
│   ├── components/
│   ├── hooks/          ← Add this
│   ├── pages/
│   └── styles/
├── customer/
│   ├── components/
│   ├── hooks/          ← Add this
│   ├── pages/
│   └── styles/
└── shared/
    ├── components/
    ├── hooks/          ← Add this
    ├── utils/          ← Add this
    └── styles/
```

---

## 🔍 Code Smells to Watch For

### Component Smells
```javascript
// ❌ Too many responsibilities
const BadComponent = () => {
  // API calls
  // Form validation
  // Navigation logic
  // Analytics tracking
  // Error handling
  // UI rendering
};

// ✅ Single responsibility
const GoodComponent = () => {
  const { data } = useData();
  const { submit } = useForm();
  return <UI data={data} onSubmit={submit} />;
};
```

### State Management Smells
```javascript
// ❌ Too much local state
const [field1, setField1] = useState('');
const [field2, setField2] = useState('');
const [field3, setField3] = useState('');
// ... 10 more useState

// ✅ Grouped state
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
  field3: ''
});
```

### Props Drilling Smell
```javascript
// ❌ Props drilling
<Parent>
  <Child1 data={data}>
    <Child2 data={data}>
      <Child3 data={data} />
    </Child2>
  </Child1>
</Parent>

// ✅ Context or state management
const DataContext = createContext();

<DataContext.Provider value={data}>
  <Parent>
    <Child1>
      <Child2>
        <Child3 />
      </Child2>
    </Child1>
  </Parent>
</DataContext.Provider>
```

---

## 🎯 Priority Matrix

| File | Lines | Priority | Time | Benefit |
|------|-------|----------|------|---------|
| ProductDetailsPage | 671 | 🔥 P0 | 4h | Very High |
| SellerStorefront | 596 | 🔥 P0 | 3h | Very High |
| AdminDashboard | 563 | 🔴 P1 | 3h | High |
| SellerDashboard | 477 | 🔴 P1 | 2h | High |
| DashboardTab | 382 | 🟡 P2 | 2h | Medium |
| ProductsPage | 354 | 🟡 P2 | 2h | Medium |
| LoginModal | 309 | 🟢 P3 | 1h | Low |

**Legend:**
- 🔥 P0 = Critical (Do first)
- 🔴 P1 = High (Do soon)
- 🟡 P2 = Medium (Schedule)
- 🟢 P3 = Low (Nice to have)

---

## ⚡ Quick Commands

### Find Large Files
```bash
# Find files > 300 lines
find src -name "*.js" -exec wc -l {} + | sort -rn | head -20

# Find files > 500 lines (critical)
find src -name "*.js" -exec wc -l {} + | awk '$1 > 500' | sort -rn
```

### Create Refactoring Branch
```bash
git checkout -b refactor/component-name
```

### Test After Refactoring
```bash
# Build check
npm run build

# Run tests
npm test

# Check bundle size
npm run build --json | jq '.chunks[].size'
```

---

## 📊 Refactoring ROI

### Time Investment
- Extract Hook: **15-30 min**
- Extract Component: **30-60 min**
- Extract Utilities: **10-20 min**
- Full Page Refactor: **2-4 hours**

### Benefits
- ✅ **50%** easier to maintain
- ✅ **70%** easier to test
- ✅ **90%** easier for new developers
- ✅ **40%** fewer bugs over time

---

## 🚀 Start Here (30-Minute Quick Win)

### Step 1: Create Directories (2 min)
```bash
mkdir -p src/hooks
mkdir -p src/shared/utils
```

### Step 2: Extract One Hook (15 min)
Pick any large file and extract data fetching logic to a custom hook.

### Step 3: Test (3 min)
```bash
npm run build
# Test in browser
```

### Step 4: Commit (2 min)
```bash
git add .
git commit -m "refactor: extract useProductData hook"
```

### Step 5: Repeat! (Forever)
Make refactoring a daily habit. **5-10 minutes per day** adds up!

---

## 💡 Pro Tips

1. **Refactor incrementally** - Don't try to refactor everything at once
2. **Test after each change** - Catch issues early
3. **Use meaningful names** - `useUserProfile` not `useData`
4. **Keep commits small** - One refactor per commit
5. **Write comments** - Explain why, not what
6. **Pair with teammate** - Two sets of eyes catch more issues
7. **Measure bundle size** - Ensure refactoring doesn't increase size
8. **Document patterns** - Help future you and teammates

---

## 📚 Additional Resources

- **Full Guide:** `REFACTORING_GUIDE.md`
- **Project Structure:** `frontend1/src/` (already feature-organized!)
- **Example Hook:** `src/customer/components/ProductDetails/useProductData.js`

---

**🎯 Goal:** No file exceeds 300 lines. Keep it simple, keep it clean!
