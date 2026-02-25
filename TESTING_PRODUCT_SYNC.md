# Testing Product Synchronization - Step by Step Guide

## Prerequisites
✅ Backend server running on `http://localhost:5000`
✅ Frontend running on `http://localhost:5173` (or your Vite port)
✅ MongoDB connected and running
✅ Admin user logged in

---

## Test 1: Real-Time Sync (Multiple Tabs)

**What it tests:** Event-based synchronization between tabs

### Steps:

1. **Open Admin Panel:**
   - Navigate to `http://localhost:5173/admin/products` (or your admin route)
   - Login if needed

2. **Open Men's Page in New Tab:**
   - Right-click "View Men's Page" button → Open in New Tab
   - OR manually navigate to `/men` in a new tab

3. **Open Browser Console in Men's Page Tab:**
   - Press F12 or Right-click → Inspect
   - Go to Console tab

4. **Add a Men's Product in Admin Tab:**
   ```
   Title: Test Blue Jeans
   Price: 59.99
   Image URL: https://via.placeholder.com/300
   Size: ☑ M, ☑ L
   Color: ☑ Blue
   Brand: Levi's
   Material: Denim
   Length: ☑ Regular
   Style: Casual
   Category: Men
   ```
   - Click "Add Product"

5. **Expected Results:**
   
   **In Admin Tab:**
   - ✅ Success message: "Product added successfully! Navigate to the Men's page to see it."
   - ✅ Product appears in admin product list
   - Console shows:
     ```
     🎯 ADMIN: Starting to add product...
     ✅ ADMIN: Product added successfully
     💾 ADMIN: Setting localStorage flag
     📢 ADMIN: Broadcasting productAdded event
     ```

   **In Men's Page Tab:**
   - ✅ New product automatically appears in grid (no refresh needed!)
   - Console shows:
     ```
     🔄 MEN: Product added, refreshing products...
     📥 MEN: Fetching products...
     ✅ New product in list
     ```

6. **Verification:**
   - Switch to Men's page tab
   - Scroll through products
   - Find "Test Blue Jeans" - should be there!

---

## Test 2: Navigation-Based Sync (localStorage)

**What it tests:** Sync when user navigates after product is added

### Steps:

1. **Stay in Admin Panel:**
   - Make sure you're on `/admin/products`

2. **Add a Women's Product:**
   ```
   Title: Red Summer Dress
   Price: 79.99
   Image URL: https://via.placeholder.com/300
   Size: ☑ S, ☑ M
   Color: ☑ Red
   Brand: Calvin Klein
   Material: Cotton
   Length: ☑ Short
   Style: Casual
   Category: Women
   ```
   - Click "Add Product"

3. **Check localStorage Flag:**
   - In browser console (F12), type:
     ```javascript
     localStorage.getItem('productUpdated')
     ```
   - Should show something like:
     ```json
     {"timestamp":1697299200000,"category":"Women","action":"added","productId":"..."}
     ```

4. **Navigate to Women's Page:**
   - Click "View Women's Page" button
   - OR use navigation menu to go to Women's section

5. **Expected Results:**
   - ✅ Women's page loads
   - ✅ "Red Summer Dress" is visible in the product grid
   - Console shows:
     ```
     🚀 WOMEN: Component mounted/updated
     🔍 WOMEN: Checking for recent updates in localStorage...
     📋 WOMEN: Found localStorage update
     🔄 WOMEN: Found recent product added, refreshing...
     🧹 WOMEN: Cleared localStorage flag
     ```

6. **Verify localStorage Cleared:**
   - In console, type again:
     ```javascript
     localStorage.getItem('productUpdated')
     ```
   - Should return `null` (flag was cleared after processing)

---

## Test 3: Window Focus Sync

**What it tests:** Sync when returning to a tab

### Steps:

1. **Open Women's Page:**
   - Navigate to `/women`
   - Keep this tab open

2. **Switch to Admin Tab:**
   - Don't close Women's page, just switch tabs

3. **Add Another Women's Product:**
   ```
   Title: Blue Floral Dress
   Price: 69.99
   Image URL: https://via.placeholder.com/300
   Category: Women
   (fill other fields as needed)
   ```
   - Click "Add Product"

4. **Minimize Browser or Switch to Another Application:**
   - Go to another program for 5-10 seconds
   - OR just switch to a different browser window

5. **Return to Women's Page Tab:**
   - Click on the browser
   - Click on the Women's page tab

6. **Expected Results:**
   - ✅ Page automatically refreshes
   - ✅ "Blue Floral Dress" appears in grid
   - Console shows:
     ```
     👁️ WOMEN: Window focused, checking for updates...
     🔍 WOMEN: Checking for recent updates in localStorage...
     🔄 WOMEN: Found recent product added, refreshing...
     ```

---

## Test 4: Category Filtering

**What it tests:** Men's page doesn't refresh for Women's products

### Steps:

1. **Open Men's Page:**
   - Navigate to `/men`
   - Open console (F12)

2. **In Another Tab, Add a Women's Product:**
   - Go to Admin panel
   - Add a product with `Category: Women`

3. **Check Men's Page Console:**
   - Look for console logs
   - Should NOT see any refresh messages
   - Product should NOT appear in Men's page

4. **Expected Results:**
   - ✅ Men's page remains unchanged
   - ✅ No fetch requests triggered
   - ✅ Console might show event received but ignored:
     ```
     // No logs or minimal logs showing category mismatch
     ```

5. **Verify by Adding Men's Product:**
   - Add a product with `Category: Men`
   - Men's page SHOULD refresh and show new product
   - Console shows:
     ```
     🔄 MEN: Product added, refreshing products...
     ```

---

## Test 5: Update Product Sync

**What it tests:** Updates propagate to category pages

### Steps:

1. **Open Women's Page:**
   - Navigate to `/women`
   - Note an existing product name

2. **In Admin, Edit That Product:**
   - Go to Admin panel
   - Click "Edit" on a Women's product
   - Change the title: "Updated Product Name"
   - Click "Update Product"

3. **Expected Results:**
   
   **In Admin:**
   - ✅ Success message: "Product updated successfully!"
   - ✅ Product updates in admin list
   
   **In Women's Page:**
   - ✅ Product name automatically updates
   - ✅ No page refresh needed
   - Console shows:
     ```
     🔄 WOMEN: Product updated, refreshing products...
     ```

---

## Test 6: Delete Product Sync

**What it tests:** Deletions propagate to category pages

### Steps:

1. **Open Men's Page:**
   - Navigate to `/men`
   - Count total products

2. **In Admin, Delete a Men's Product:**
   - Go to Admin panel
   - Click "Delete" on a Men's product
   - Confirm deletion

3. **Expected Results:**
   
   **In Admin:**
   - ✅ Success message: "Product deleted successfully!"
   - ✅ Product removed from admin list
   
   **In Men's Page:**
   - ✅ Product disappears from grid automatically
   - ✅ Product count decreases
   - Console shows:
     ```
     🔄 MEN: Product deleted, refreshing products...
     ```

---

## Test 7: localStorage Expiration

**What it tests:** Old flags don't trigger unnecessary refreshes

### Steps:

1. **Set an Old Flag Manually:**
   - Open browser console
   - Type:
     ```javascript
     localStorage.setItem('productUpdated', JSON.stringify({
       timestamp: Date.now() - 180000, // 3 minutes ago (expired)
       category: 'Men',
       action: 'added'
     }));
     ```

2. **Navigate to Men's Page:**
   - Go to `/men`

3. **Expected Results:**
   - ✅ Page loads normally
   - ✅ Console shows:
     ```
     🔍 MEN: Checking for recent updates in localStorage...
     ❌ MEN: Update not applicable - timeDiff: 180000+
     🧹 MEN: Removed expired localStorage flag
     ```
   - ✅ No unnecessary fetch triggered
   - ✅ Flag is cleaned up

---

## Test 8: Network Error Handling

**What it tests:** Graceful handling of backend errors

### Steps:

1. **Stop Backend Server:**
   - Go to backend terminal
   - Press Ctrl+C to stop the server

2. **Try Adding Product in Admin:**
   - Fill product form
   - Click "Add Product"

3. **Expected Results:**
   - ✅ Error message shown: "Server error. Please try again."
   - ✅ Console shows fetch error
   - ✅ Form data preserved (not cleared)

4. **Try Loading Men's/Women's Page:**
   - Navigate to `/men` or `/women`

5. **Expected Results:**
   - ✅ Shows loading state initially
   - ✅ Shows error message after timeout
   - ✅ "Try Again" button appears
   - ✅ Retry mechanism attempts 3 times

6. **Restart Backend:**
   - Start backend server again
   - Click "Try Again" button

7. **Expected Results:**
   - ✅ Products load successfully
   - ✅ Error message clears

---

## Console Log Reference

### What to Look For:

#### Admin Logs:
```
🎯 ADMIN: Starting to add product...
✅ ADMIN: Product added successfully
💾 ADMIN: Setting localStorage flag
📢 ADMIN: Broadcasting productAdded event
🔄 ADMIN: Refreshing product list
```

#### Men's Page Logs:
```
🚀 MEN: Component mounted/updated
🔍 MEN: Checking for recent updates in localStorage...
📋 MEN: Found localStorage update
🔄 MEN: Product added, refreshing products...
👁️ MEN: Window focused, checking for updates...
🧹 MEN: Cleared localStorage flag
```

#### Women's Page Logs:
```
🚀 WOMEN: Component mounted/updated
🔍 WOMEN: Checking for recent updates in localStorage...
📋 WOMEN: Found localStorage update
🔄 WOMEN: Product added, refreshing products...
👁️ WOMEN: Window focused, checking for updates...
🧹 WOMEN: Cleared localStorage flag
```

---

## Quick Troubleshooting Checklist

### If products don't sync:

1. ✓ Check backend is running (`http://localhost:5000`)
2. ✓ Check console for errors (F12)
3. ✓ Verify localStorage flag:
   ```javascript
   localStorage.getItem('productUpdated')
   ```
4. ✓ Check Network tab - look for 404 or 500 errors
5. ✓ Verify product category is exactly "Men" or "Women" (case-sensitive)
6. ✓ Check MongoDB connection
7. ✓ Try hard refresh (Ctrl+Shift+R)
8. ✓ Clear browser cache and localStorage:
   ```javascript
   localStorage.clear()
   ```

### If multiple products show unexpectedly:

1. ✓ Check MongoDB for duplicate entries
2. ✓ Verify product IDs are unique
3. ✓ Check if fetchProducts() is being called multiple times

---

## Success Criteria

All tests pass when:
- ✅ Products appear in correct category pages
- ✅ Real-time sync works across tabs
- ✅ Navigation sync works reliably
- ✅ No duplicate products
- ✅ Console logs show expected flow
- ✅ localStorage flags set and cleared correctly
- ✅ Updates and deletes propagate properly
- ✅ Old flags are cleaned up automatically

---

**Testing Complete! 🎉**

If all tests pass, your product synchronization system is working perfectly!
