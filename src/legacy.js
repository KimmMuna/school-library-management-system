    /**
     * =========================================================================
     * SCHOOL LIBRARY MANAGEMENT SYSTEM — HORIZONX STUDIO EDITION
     * Final-Year Computer Science Project Architecture
     *
     * Table of Contents:
     * 1. Storage Keys, Theme Controller & Default Seed Data
     * 2. Storage Helper Functions (localStorage wrapper)
     * 3. Authentication & Session Controller
     * 4. Date Utilities & Due Date Calculator
     * 5. Validation Rules Engine
     * 6. Books Module (CRUD & Borrow-Aware Deletion)
     * 7. Students Module (CRUD & Active Borrow Check)
     * 8. Circulation Module (Borrow with 3-Book Limit, Return, Overdue Detection)
     * 9. Dashboard & KPI Analytics Engine
     * 10. Modal, Toast & View Nav Controller
     * 11. App Initialization & Event Listeners
     * =========================================================================
     */

    // -------------------------------------------------------------------------
    // 1. STORAGE KEYS, THEME CONTROLLER & DEFAULT SEED DATA
    // -------------------------------------------------------------------------
    const STORAGE_KEYS = {
      BOOKS: 'slms_books',
      STUDENTS: 'slms_students',
      TRANSACTIONS: 'slms_transactions',
      AUTH_USER: 'slms_auth_user',
      THEME: 'slms_theme'
    };

    // Hardcoded credentials for librarian demo (per project requirements)
    const DEMO_CREDENTIALS = {
      username: 'librarian',
      password: 'library123'
    };

    /**
     * TWO THEMES ONLY:
     * 1. 'dark': Ambient Dark (Midnight Leather, deep auroral glow & golden stardust motes)
     * 2. 'light': Ambient Light (Warm Cream Parchment, golden sunlight motes & illuminated aurora)
     */
    function initTheme() {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
      setAppTheme(savedTheme, false);
      setupThemeDropdownEvents();
    }

    function setAppTheme(theme, notify = true) {
      const validTheme = theme === 'light' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', validTheme);
      localStorage.setItem(STORAGE_KEYS.THEME, validTheme);

      // The navbar button text stays strictly "Theme"
      const activeLabel = document.getElementById('theme-active-label');
      const activeIcon = document.getElementById('theme-active-icon');
      if (activeLabel) {
        activeLabel.textContent = 'Theme';
      }
      if (activeIcon) {
        activeIcon.innerHTML = '<use href="#skeu-theme"/>';
      }

      // Update active option and checkmark in dropdown menu
      const darkOption = document.getElementById('theme-option-dark');
      const lightOption = document.getElementById('theme-option-light');
      const darkCheck = document.getElementById('check-icon-dark');
      const lightCheck = document.getElementById('check-icon-light');

      if (darkOption) darkOption.classList.toggle('active', validTheme === 'dark');
      if (lightOption) lightOption.classList.toggle('active', validTheme === 'light');
      if (darkCheck) darkCheck.style.display = validTheme === 'dark' ? 'inline-block' : 'none';
      if (lightCheck) lightCheck.style.display = validTheme === 'light' ? 'inline-block' : 'none';

      // Keep ambient animation backdrop running in both themes
      const backdrop = document.getElementById('calm-ambient-backdrop');
      if (backdrop) {
        backdrop.style.opacity = '1';
      }

      closeThemeDropdown();

      if (notify) {
        showToast(`Theme switched to ${validTheme === 'light' ? 'Ambient Light (Sky Ice & Royal Navy)' : 'Ambient Dark (Midnight Royal Blue & Radiant Cyan)'}`, 'info');
      }
    }
    window.setAppTheme = setAppTheme;

    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      setAppTheme(next, true);
    }
    window.toggleTheme = toggleTheme;

    function toggleThemeDropdown(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const menu = document.getElementById('theme-dropdown-menu');
      const btn = document.getElementById('btn-theme-dropdown-toggle');
      if (!menu || !btn) return;

      const isOpen = menu.classList.contains('open') || menu.classList.contains('show');
      if (isOpen) {
        closeThemeDropdown();
      } else {
        if (typeof closeSmartSectionsMenu === 'function') {
          closeSmartSectionsMenu();
        }
        menu.classList.add('open', 'show');
        btn.classList.add('open', 'show');
        btn.setAttribute('aria-expanded', 'true');
      }
    }
    window.toggleThemeDropdown = toggleThemeDropdown;

    function closeThemeDropdown() {
      const menu = document.getElementById('theme-dropdown-menu');
      const btn = document.getElementById('btn-theme-dropdown-toggle');
      if (menu) {
        menu.classList.remove('open', 'show');
      }
      if (btn) {
        btn.classList.remove('open', 'show');
        btn.setAttribute('aria-expanded', 'false');
      }
    }
    window.closeThemeDropdown = closeThemeDropdown;

    function setupThemeDropdownEvents() {
      const toggleBtn = document.getElementById('btn-theme-dropdown-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleThemeDropdown);
      }
      document.addEventListener('click', function (e) {
        const wrapper = document.getElementById('theme-dropdown-wrapper');
        if (wrapper && !wrapper.contains(e.target)) {
          closeThemeDropdown();
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          closeThemeDropdown();
        }
      });
    }

    /**
     * Default seed dataset to allow instant demonstration of:
     * - Book inventory with various copy counts
     * - Registered students
     * - Active borrows
     * - An intentional OVERDUE book to test the red highlight requirement immediately!
     */
    function getInitialSeedData() {
      const today = new Date();
      const format = (d) => d.toISOString().split('T')[0];

      const tenDaysAgo = new Date(today);
      tenDaysAgo.setDate(today.getDate() - 10);

      const twentyFiveDaysAgo = new Date(today);
      twentyFiveDaysAgo.setDate(today.getDate() - 25);

      const elevenDaysAgo = new Date(today);
      elevenDaysAgo.setDate(today.getDate() - 11);

      const inFourDays = new Date(today);
      inFourDays.setDate(today.getDate() + 4);

      return {
        books: [
          { id: 'BK-101', title: 'Clean Code: A Handbook of Agile Software', author: 'Robert C. Martin', totalCopies: 5, borrowedCopies: 2 },
          { id: 'BK-102', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', totalCopies: 3, borrowedCopies: 1 },
          { id: 'BK-103', title: 'Design Patterns: Elements of Reusable Object-Oriented Software', author: 'Erich Gamma et al.', totalCopies: 4, borrowedCopies: 0 },
          { id: 'BK-104', title: 'Database System Concepts', author: 'Abraham Silberschatz', totalCopies: 2, borrowedCopies: 0 },
          { id: 'BK-105', title: 'Computer Networking: A Top-Down Approach', author: 'James F. Kurose', totalCopies: 3, borrowedCopies: 0 }
        ],
        students: [
          { id: 'STU-001', name: 'Alex Johnson', studentClass: 'CS Year 3' },
          { id: 'STU-002', name: 'Beatrice Chen', studentClass: 'CS Year 2' },
          { id: 'STU-003', name: 'David Miller', studentClass: 'Grade 12-A' },
          { id: 'STU-004', name: 'Emma Watson', studentClass: 'Grade 11-B' }
        ],
        transactions: [
          // Overdue transaction for immediate demo of red highlight requirement
          {
            id: 'TXN-1001',
            studentId: 'STU-001',
            studentName: 'Alex Johnson',
            bookId: 'BK-101',
            bookTitle: 'Clean Code: A Handbook of Agile Software',
            borrowDate: format(twentyFiveDaysAgo),
            dueDate: format(elevenDaysAgo), // Past due!
            returnDate: null,
            status: 'ACTIVE'
          },
          // Active normal transaction
          {
            id: 'TXN-1002',
            studentId: 'STU-002',
            studentName: 'Beatrice Chen',
            bookId: 'BK-101',
            bookTitle: 'Clean Code: A Handbook of Agile Software',
            borrowDate: format(tenDaysAgo),
            dueDate: format(inFourDays),
            returnDate: null,
            status: 'ACTIVE'
          },
          // Active normal transaction for BK-102
          {
            id: 'TXN-1003',
            studentId: 'STU-001',
            studentName: 'Alex Johnson',
            bookId: 'BK-102',
            bookTitle: 'Introduction to Algorithms',
            borrowDate: format(tenDaysAgo),
            dueDate: format(inFourDays),
            returnDate: null,
            status: 'ACTIVE'
          }
        ]
      };
    }

    // -------------------------------------------------------------------------
    // 2. STORAGE CONTROLLER (localStorage CRUD)
    // -------------------------------------------------------------------------
    function loadData(key, fallback = []) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (err) {
        console.error('Error reading localStorage key: ' + key, err);
        return fallback;
      }
    }

    function saveData(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.error('Error saving to localStorage key: ' + key, err);
        showToast('Storage error: browser storage may be full.', 'error');
      }
    }

    function initializeStorage() {
      if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
        const seed = getInitialSeedData();
        saveData(STORAGE_KEYS.BOOKS, seed.books);
        saveData(STORAGE_KEYS.STUDENTS, seed.students);
        saveData(STORAGE_KEYS.TRANSACTIONS, seed.transactions);
      }
    }

    function resetToSampleData() {
      if (confirm('Reset all library data back to the original demo sample dataset? Any additions will be replaced.')) {
        const seed = getInitialSeedData();
        saveData(STORAGE_KEYS.BOOKS, seed.books);
        saveData(STORAGE_KEYS.STUDENTS, seed.students);
        saveData(STORAGE_KEYS.TRANSACTIONS, seed.transactions);
        refreshAllViews();
        showToast('Library database reset to default demo dataset!', 'info');
      }
    }

    function exportDataBackup() {
      const backup = {
        exportedAt: new Date().toISOString(),
        books: loadData(STORAGE_KEYS.BOOKS),
        students: loadData(STORAGE_KEYS.STUDENTS),
        transactions: loadData(STORAGE_KEYS.TRANSACTIONS)
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `library_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup JSON downloaded successfully.', 'success');
    }

    function downloadSelfContainedHtml() {
      const htmlContent = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'school_library_management_system.html';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Standalone single HTML file downloaded successfully!', 'success');
    }

    // -------------------------------------------------------------------------
    // 3. AUTHENTICATION CONTROLLER (Librarian Login/Logout)
    // -------------------------------------------------------------------------
    function checkAuth() {
      const user = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      const loginView = document.getElementById('login-view');
      const appContainer = document.getElementById('app-container');

      if (user) {
        loginView.style.display = 'none';
        appContainer.style.display = 'flex';
        document.getElementById('current-user-display').textContent = user;
        refreshAllViews();
      } else {
        loginView.style.display = 'flex';
        appContainer.style.display = 'none';
      }
    }

    document.getElementById('login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const userField = document.getElementById('login-username').value.trim();
      const passField = document.getElementById('login-password').value.trim();

      if (userField === DEMO_CREDENTIALS.username && passField === DEMO_CREDENTIALS.password) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, userField);
        showToast('Login successful! Welcome to Chafun Gate Schools Library System.', 'success');
        checkAuth();
      } else {
        showToast('Invalid credentials. Please use librarian / library123', 'error');
      }
    });

    document.getElementById('btn-autofill-login').addEventListener('click', function () {
      document.getElementById('login-username').value = DEMO_CREDENTIALS.username;
      document.getElementById('login-password').value = DEMO_CREDENTIALS.password;
    });

    /**
     * Dedicated Sign Out Handler
     * Clears authentication session, hides drawer, and smoothly returns to login view.
     * Works without blocking window.confirm dialogs which fail in iframe environments.
     */
    function handleLogout() {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      if (typeof closeMobileDrawer === 'function') {
        closeMobileDrawer();
      }
      showToast('You have been signed out successfully.', 'info');
      checkAuth();
    }
    window.handleLogout = handleLogout;

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', handleLogout);
    }

    // -------------------------------------------------------------------------
    // 4. DATE UTILITIES & DUE DATE CALCULATOR
    // -------------------------------------------------------------------------
    function getTodayString() {
      return new Date().toISOString().split('T')[0];
    }

    function calculateDefaultDueDate(fromDateString) {
      const baseDate = fromDateString ? new Date(fromDateString + 'T00:00:00') : new Date();
      const dueDate = new Date(baseDate);
      dueDate.setDate(dueDate.getDate() + 14);
      return dueDate.toISOString().split('T')[0];
    }

    function isRecordOverdue(record) {
      if (record.status !== 'ACTIVE') return false;
      const todayStr = getTodayString();
      return record.dueDate < todayStr;
    }

    function getDaysOverdue(dueDateString) {
      const due = new Date(dueDateString + 'T00:00:00');
      const today = new Date(getTodayString() + 'T00:00:00');
      const diffTime = today - due;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }

    // -------------------------------------------------------------------------
    // 5. VALIDATION RULES ENGINE
    // -------------------------------------------------------------------------
    function isBookIdUnique(bookId, excludeOriginalId = null) {
      const books = loadData(STORAGE_KEYS.BOOKS);
      const normalized = bookId.trim().toUpperCase();
      return !books.some(b => b.id.toUpperCase() === normalized && b.id !== excludeOriginalId);
    }

    function isStudentIdUnique(studentId, excludeOriginalId = null) {
      const students = loadData(STORAGE_KEYS.STUDENTS);
      const normalized = studentId.trim().toUpperCase();
      return !students.some(s => s.id.toUpperCase() === normalized && s.id !== excludeOriginalId);
    }

    function getStudentActiveBorrowCount(studentId) {
      const txns = loadData(STORAGE_KEYS.TRANSACTIONS);
      return txns.filter(t => t.studentId === studentId && t.status === 'ACTIVE').length;
    }

    // -------------------------------------------------------------------------
    // 6. BOOKS MODULE CONTROLLER
    // -------------------------------------------------------------------------
    let currentBookFilter = 'ALL';

    function setBookFilterChip(filterType, buttonEl) {
      currentBookFilter = filterType;
      document.querySelectorAll('#books-filter-chips .filter-chip').forEach(btn => btn.classList.remove('active'));
      if (buttonEl) buttonEl.classList.add('active');
      const q = document.getElementById('books-search-input')?.value || '';
      renderBooksTable(q);
    }

    function renderBooksTable(filterQuery = '') {
      const books = loadData(STORAGE_KEYS.BOOKS);
      const tbody = document.getElementById('books-table-body');
      tbody.innerHTML = '';

      // Update chip counts
      const countAll = books.length;
      const countAvail = books.filter(b => (b.totalCopies - b.borrowedCopies) > 0).length;
      const countBorrowed = books.filter(b => (b.totalCopies - b.borrowedCopies) <= 0).length;

      const elCountAll = document.getElementById('chip-count-all');
      const elCountAvail = document.getElementById('chip-count-avail');
      const elCountBorrowed = document.getElementById('chip-count-borrowed');
      if (elCountAll) elCountAll.textContent = countAll;
      if (elCountAvail) elCountAvail.textContent = countAvail;
      if (elCountBorrowed) elCountBorrowed.textContent = countBorrowed;

      const query = filterQuery.toLowerCase().trim();
      let filtered = books.filter(b => 
        b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query)
      );

      if (currentBookFilter === 'AVAILABLE') {
        filtered = filtered.filter(b => (b.totalCopies - b.borrowedCopies) > 0);
      } else if (currentBookFilter === 'BORROWED') {
        filtered = filtered.filter(b => (b.totalCopies - b.borrowedCopies) <= 0);
      }

      document.getElementById('books-count-summary').textContent = `Showing ${filtered.length} of ${books.length} books`;

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="empty-state">
              <div class="skeu-icon-badge skeu-badge-oxblood" style="width: 44px; height: 44px; margin: 0 auto 0.65rem auto;">
                <svg class="skeu-icon" width="24" height="24"><use href="#skeu-book"/></svg>
              </div>
              <p>No books found matching your criteria.</p>
            </td>
          </tr>
        `;
        return;
      }

      filtered.forEach(book => {
        const available = Math.max(0, book.totalCopies - book.borrowedCopies);
        const isAvailable = available > 0;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${escapeHtml(book.id)}</code></td>
          <td>
            <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(book.title)}</div>
          </td>
          <td>${escapeHtml(book.author)}</td>
          <td>${book.totalCopies}</td>
          <td><span style="color: var(--success); font-weight: 700;">${available}</span></td>
          <td><span style="color: var(--warning); font-weight: 600;">${book.borrowedCopies}</span></td>
          <td>
            <span class="badge ${isAvailable ? 'badge-success' : 'badge-danger'}">
              ${isAvailable ? `${available} Available` : 'Out of Stock'}
            </span>
          </td>
          <td style="text-align: right;">
            <div class="table-actions" style="justify-content: flex-end;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="viewBookHistory('${escapeHtml(book.id)}')" title="View Lending Ledger">
                <svg class="skeu-icon" width="13" height="13"><use href="#skeu-ledger"/></svg>
                <span>History</span>
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="openEditBookModal('${escapeHtml(book.id)}')" title="Edit Book Details">
                <svg class="skeu-icon" width="13" height="13"><use href="#skeu-edit"/></svg>
                <span>Edit</span>
              </button>
              <button type="button" class="btn btn-danger btn-sm" onclick="attemptDeleteBook('${escapeHtml(book.id)}')" title="Delete Book Record">
                <svg class="skeu-icon" width="13" height="13"><use href="#skeu-trash"/></svg>
                <span>Delete</span>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function handleBookSearch() {
      const q = document.getElementById('books-search-input').value;
      renderBooksTable(q);
    }

    function openAddBookModal() {
      document.getElementById('book-form-mode').value = 'add';
      document.getElementById('book-form-original-id').value = '';
      document.getElementById('modal-book-title').textContent = 'Add New Book to Catalog';
      document.getElementById('book-input-id').value = '';
      document.getElementById('book-input-id').disabled = false;
      document.getElementById('book-input-title').value = '';
      document.getElementById('book-input-author').value = '';
      document.getElementById('book-input-copies').value = 1;
      document.getElementById('book-input-copies').min = 1;
      document.getElementById('book-copies-hint').textContent = 'Must be at least 1 copy.';
      openModal('modal-book');
    }

    function openEditBookModal(bookId) {
      const books = loadData(STORAGE_KEYS.BOOKS);
      const book = books.find(b => b.id === bookId);
      if (!book) return;

      document.getElementById('book-form-mode').value = 'edit';
      document.getElementById('book-form-original-id').value = book.id;
      document.getElementById('modal-book-title').textContent = `Edit Book: ${book.id}`;
      document.getElementById('book-input-id').value = book.id;
      document.getElementById('book-input-id').disabled = true;
      document.getElementById('book-input-title').value = book.title;
      document.getElementById('book-input-author').value = book.author;
      document.getElementById('book-input-copies').value = book.totalCopies;

      document.getElementById('book-input-copies').min = book.borrowedCopies;
      document.getElementById('book-copies-hint').textContent = 
        `Currently borrowed: ${book.borrowedCopies}. Total copies cannot be less than this.`;

      openModal('modal-book');
    }

    function handleBookFormSubmit(e) {
      e.preventDefault();
      const mode = document.getElementById('book-form-mode').value;
      const originalId = document.getElementById('book-form-original-id').value;
      const id = document.getElementById('book-input-id').value.trim();
      const title = document.getElementById('book-input-title').value.trim();
      const author = document.getElementById('book-input-author').value.trim();
      const copies = parseInt(document.getElementById('book-input-copies').value, 10);

      if (!id || !title || !author || isNaN(copies)) {
        showToast('All fields are required.', 'error');
        return;
      }

      if (copies < 1) {
        showToast('Number of copies must be at least 1.', 'error');
        return;
      }

      const books = loadData(STORAGE_KEYS.BOOKS);

      if (mode === 'add') {
        if (!isBookIdUnique(id)) {
          showToast(`Book ID "${id}" is already in use. Please use a unique ID.`, 'error');
          return;
        }

        const newBook = {
          id: id,
          title: title,
          author: author,
          totalCopies: copies,
          borrowedCopies: 0
        };

        books.push(newBook);
        saveData(STORAGE_KEYS.BOOKS, books);
        showToast(`Book "${title}" added successfully!`, 'success');
      } else {
        const index = books.findIndex(b => b.id === originalId);
        if (index === -1) return;

        const currentBorrowed = books[index].borrowedCopies;
        if (copies < currentBorrowed) {
          showToast(`Cannot reduce copies below currently borrowed count (${currentBorrowed}).`, 'error');
          return;
        }

        books[index].title = title;
        books[index].author = author;
        books[index].totalCopies = copies;

        saveData(STORAGE_KEYS.BOOKS, books);
        showToast(`Book "${title}" updated successfully!`, 'success');
      }

      closeModal('modal-book');
      refreshAllViews();
    }

    function attemptDeleteBook(bookId) {
      const books = loadData(STORAGE_KEYS.BOOKS);
      const book = books.find(b => b.id === bookId);
      if (!book) return;

      if (book.borrowedCopies > 0) {
        showToast(
          `Cannot delete "${book.title}": ${book.borrowedCopies} copy/copies are currently borrowed. Return all copies first!`,
          'error'
        );
        return;
      }

      showDeleteConfirmModal(
        'Delete Book',
        `Are you sure you want to delete "${book.title}" (${book.id})? This action cannot be undone.`,
        () => {
          const updatedBooks = books.filter(b => b.id !== bookId);
          saveData(STORAGE_KEYS.BOOKS, updatedBooks);
          showToast(`Book "${book.title}" deleted from catalog.`, 'info');
          refreshAllViews();
        }
      );
    }

    // -------------------------------------------------------------------------
    // 7. STUDENTS MODULE CONTROLLER
    // -------------------------------------------------------------------------
    function renderStudentsTable(filterQuery = '') {
      const students = loadData(STORAGE_KEYS.STUDENTS);
      const tbody = document.getElementById('students-table-body');
      tbody.innerHTML = '';

      const query = filterQuery.toLowerCase().trim();
      const filtered = students.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query) ||
        s.studentClass.toLowerCase().includes(query)
      );

      document.getElementById('students-count-summary').textContent = `Showing ${filtered.length} of ${students.length} students`;

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="empty-state">
              <div class="skeu-icon-badge skeu-badge-indigo" style="width: 44px; height: 44px; margin: 0 auto 0.65rem auto;">
                <svg class="skeu-icon" width="24" height="24"><use href="#skeu-student"/></svg>
              </div>
              <p>No students found matching your search.</p>
            </td>
          </tr>
        `;
        return;
      }

      filtered.forEach(student => {
        const borrowedCount = getStudentActiveBorrowCount(student.id);
        const limitReached = borrowedCount >= 3;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${escapeHtml(student.id)}</code></td>
          <td><span style="font-weight: 600; color: var(--text-main);">${escapeHtml(student.name)}</span></td>
          <td>${escapeHtml(student.studentClass)}</td>
          <td>
            <span class="badge ${borrowedCount > 0 ? (limitReached ? 'badge-danger' : 'badge-warning') : 'badge-neutral'}">
              ${borrowedCount} of 3 books
            </span>
          </td>
          <td>
            <span style="font-size: 0.8125rem; color: ${limitReached ? 'var(--danger)' : 'var(--text-muted)'}; font-weight: 600;">
              ${limitReached ? 'Limit Reached (3/3)' : `${3 - borrowedCount} slots remaining`}
            </span>
          </td>
          <td style="text-align: right;">
            <div class="table-actions" style="justify-content: flex-end;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="viewStudentHistory('${escapeHtml(student.id)}')" title="View Lending Ledger">
                <svg class="skeu-icon" width="13" height="13"><use href="#skeu-ledger"/></svg>
                <span>History</span>
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="openEditStudentModal('${escapeHtml(student.id)}')" title="Edit Student Profile">
                <svg class="skeu-icon" width="13" height="13"><use href="#skeu-edit"/></svg>
                <span>Edit</span>
              </button>
              <button type="button" class="btn btn-danger btn-sm" onclick="attemptDeleteStudent('${escapeHtml(student.id)}')" title="Delete Student Record">
                <svg class="skeu-icon" width="13" height="13"><use href="#skeu-trash"/></svg>
                <span>Delete</span>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function handleStudentSearch() {
      const q = document.getElementById('students-search-input').value;
      renderStudentsTable(q);
    }

    function openAddStudentModal() {
      document.getElementById('student-form-mode').value = 'add';
      document.getElementById('student-form-original-id').value = '';
      document.getElementById('modal-student-title').textContent = 'Register New Student';
      document.getElementById('student-input-id').value = '';
      document.getElementById('student-input-id').disabled = false;
      document.getElementById('student-input-name').value = '';
      document.getElementById('student-input-class').value = '';
      openModal('modal-student');
    }

    function openEditStudentModal(studentId) {
      const students = loadData(STORAGE_KEYS.STUDENTS);
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      document.getElementById('student-form-mode').value = 'edit';
      document.getElementById('student-form-original-id').value = student.id;
      document.getElementById('modal-student-title').textContent = `Edit Student: ${student.id}`;
      document.getElementById('student-input-id').value = student.id;
      document.getElementById('student-input-id').disabled = true;
      document.getElementById('student-input-name').value = student.name;
      document.getElementById('student-input-class').value = student.studentClass;
      openModal('modal-student');
    }

    function handleStudentFormSubmit(e) {
      e.preventDefault();
      const mode = document.getElementById('student-form-mode').value;
      const originalId = document.getElementById('student-form-original-id').value;
      const id = document.getElementById('student-input-id').value.trim();
      const name = document.getElementById('student-input-name').value.trim();
      const studentClass = document.getElementById('student-input-class').value.trim();

      if (!id || !name || !studentClass) {
        showToast('All fields are required.', 'error');
        return;
      }

      const students = loadData(STORAGE_KEYS.STUDENTS);

      if (mode === 'add') {
        if (!isStudentIdUnique(id)) {
          showToast(`Student ID "${id}" is already registered. IDs must be unique.`, 'error');
          return;
        }

        const newStudent = { id, name, studentClass };
        students.push(newStudent);
        saveData(STORAGE_KEYS.STUDENTS, students);
        showToast(`Student "${name}" registered successfully!`, 'success');
      } else {
        const index = students.findIndex(s => s.id === originalId);
        if (index === -1) return;

        students[index].name = name;
        students[index].studentClass = studentClass;

        const txns = loadData(STORAGE_KEYS.TRANSACTIONS);
        txns.forEach(t => {
          if (t.studentId === originalId) {
            t.studentName = name;
          }
        });
        saveData(STORAGE_KEYS.TRANSACTIONS, txns);

        saveData(STORAGE_KEYS.STUDENTS, students);
        showToast(`Student "${name}" updated successfully!`, 'success');
      }

      closeModal('modal-student');
      refreshAllViews();
    }

    function attemptDeleteStudent(studentId) {
      const students = loadData(STORAGE_KEYS.STUDENTS);
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const activeBorrows = getStudentActiveBorrowCount(studentId);
      if (activeBorrows > 0) {
        showToast(
          `Cannot delete student "${student.name}": they currently have ${activeBorrows} borrowed book(s). Return all books first!`,
          'error'
        );
        return;
      }

      showDeleteConfirmModal(
        'Delete Student Record',
        `Are you sure you want to remove "${student.name}" (${student.id}) from the system?`,
        () => {
          const updated = students.filter(s => s.id !== studentId);
          saveData(STORAGE_KEYS.STUDENTS, updated);
          showToast(`Student "${student.name}" removed from library registry.`, 'info');
          refreshAllViews();
        }
      );
    }

    // -------------------------------------------------------------------------
    // 8. BORROW & RETURN MODULE (Circulation Logic)
    // -------------------------------------------------------------------------
    function populateBorrowFormDropdowns() {
      const students = loadData(STORAGE_KEYS.STUDENTS);
      const books = loadData(STORAGE_KEYS.BOOKS);

      const studentSelect = document.getElementById('borrow-student-select');
      studentSelect.innerHTML = '<option value="">-- Choose Student --</option>';

      students.forEach(s => {
        const borrowedCount = getStudentActiveBorrowCount(s.id);
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.name} (${s.id}) - [${borrowedCount}/3 borrowed]`;
        if (borrowedCount >= 3) {
          opt.textContent += ' [MAX REACHED]';
        }
        studentSelect.appendChild(opt);
      });

      const bookSelect = document.getElementById('borrow-book-select');
      bookSelect.innerHTML = '<option value="">-- Choose Book --</option>';

      books.forEach(b => {
        const available = b.totalCopies - b.borrowedCopies;
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = `${b.title} (${b.id}) - [${available} left]`;
        if (available <= 0) {
          opt.disabled = true;
          opt.textContent += ' [OUT OF STOCK]';
        }
        bookSelect.appendChild(opt);
      });

      const todayStr = getTodayString();
      document.getElementById('borrow-date').value = todayStr;
      document.getElementById('borrow-due-date').value = calculateDefaultDueDate(todayStr);

      handleBorrowStudentSelect();
    }

    function handleBorrowDateChange() {
      const borrowDateVal = document.getElementById('borrow-date').value;
      if (borrowDateVal) {
        document.getElementById('borrow-due-date').value = calculateDefaultDueDate(borrowDateVal);
      }
    }

    function handleBorrowStudentSelect() {
      const studentId = document.getElementById('borrow-student-select').value;
      const statusBox = document.getElementById('student-borrow-status');
      const submitBtn = document.getElementById('btn-submit-borrow');

      if (!studentId) {
        statusBox.style.display = 'none';
        submitBtn.disabled = false;
        return;
      }

      const activeCount = getStudentActiveBorrowCount(studentId);
      statusBox.style.display = 'block';

      if (activeCount >= 3) {
        statusBox.style.backgroundColor = 'var(--danger-bg)';
        statusBox.style.borderColor = 'var(--danger-border)';
        statusBox.style.color = 'var(--danger)';
        statusBox.innerHTML = `⚠️ <strong>Limit Reached:</strong> This student already has 3 books borrowed. Cannot borrow more until books are returned.`;
        submitBtn.disabled = true;
      } else {
        statusBox.style.backgroundColor = 'var(--primary-subtle)';
        statusBox.style.borderColor = 'var(--primary-border)';
        statusBox.style.color = 'var(--primary)';
        statusBox.innerHTML = `ℹ️ Currently borrowed: <strong>${activeCount} of 3 allowed</strong> (${3 - activeCount} slots remaining).`;
        submitBtn.disabled = false;
      }
    }

    function handleBorrowSubmit(e) {
      e.preventDefault();
      const studentId = document.getElementById('borrow-student-select').value;
      const bookId = document.getElementById('borrow-book-select').value;
      const borrowDate = document.getElementById('borrow-date').value;
      const dueDate = document.getElementById('borrow-due-date').value;

      if (!studentId || !bookId || !borrowDate || !dueDate) {
        showToast('Please fill in all borrow form fields.', 'error');
        return;
      }

      if (dueDate < borrowDate) {
        showToast('Due date cannot be earlier than the borrow checkout date.', 'error');
        return;
      }

      const currentStudentBorrows = getStudentActiveBorrowCount(studentId);
      if (currentStudentBorrows >= 3) {
        showToast('Borrow blocked: Student has reached the maximum quota of 3 active books.', 'error');
        return;
      }

      const books = loadData(STORAGE_KEYS.BOOKS);
      const bookIndex = books.findIndex(b => b.id === bookId);
      if (bookIndex === -1) {
        showToast('Selected book could not be found.', 'error');
        return;
      }

      const book = books[bookIndex];
      const availableCopies = book.totalCopies - book.borrowedCopies;
      if (availableCopies <= 0) {
        showToast(`Borrow blocked: 0 copies available for "${book.title}".`, 'error');
        return;
      }

      const students = loadData(STORAGE_KEYS.STUDENTS);
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      books[bookIndex].borrowedCopies += 1;
      saveData(STORAGE_KEYS.BOOKS, books);

      const transactions = loadData(STORAGE_KEYS.TRANSACTIONS);
      const newTxn = {
        id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
        studentId: student.id,
        studentName: student.name,
        bookId: book.id,
        bookTitle: book.title,
        borrowDate: borrowDate,
        dueDate: dueDate,
        returnDate: null,
        status: 'ACTIVE'
      };

      transactions.unshift(newTxn);
      saveData(STORAGE_KEYS.TRANSACTIONS, transactions);

      showToast(`Success! "${book.title}" issued to ${student.name}.`, 'success');
      document.getElementById('borrow-form').reset();
      populateBorrowFormDropdowns();
      refreshAllViews();
    }

    function renderActiveBorrowsTable() {
      const transactions = loadData(STORAGE_KEYS.TRANSACTIONS);
      const tbody = document.getElementById('active-borrows-body');
      tbody.innerHTML = '';

      const query = (document.getElementById('active-borrows-search')?.value || '').toLowerCase().trim();

      const activeList = transactions.filter(t => t.status === 'ACTIVE' && (
        t.studentName.toLowerCase().includes(query) ||
        t.bookTitle.toLowerCase().includes(query) ||
        t.studentId.toLowerCase().includes(query) ||
        t.bookId.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
      ));

      document.getElementById('active-borrows-count').textContent = `${activeList.length} active checkouts`;

      if (activeList.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="empty-state">
              <div class="skeu-icon-badge skeu-badge-emerald" style="width: 44px; height: 44px; margin: 0 auto 0.65rem auto;">
                <svg class="skeu-icon" width="24" height="24"><use href="#skeu-borrow"/></svg>
              </div>
              <p>No active borrows found.</p>
            </td>
          </tr>
        `;
        return;
      }

      activeList.forEach(t => {
        const overdue = isRecordOverdue(t);
        const daysOver = overdue ? getDaysOverdue(t.dueDate) : 0;

        const tr = document.createElement('tr');
        if (overdue) {
          tr.className = 'overdue-row-highlight';
        }

        tr.innerHTML = `
          <td><code>${escapeHtml(t.id)}</code></td>
          <td>
            <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(t.bookTitle)}</div>
            <code style="font-size: 0.72rem;">${escapeHtml(t.bookId)}</code>
          </td>
          <td>
            <div style="color: var(--text-main); font-weight: 500;">${escapeHtml(t.studentName)}</div>
            <code style="font-size: 0.72rem;">${escapeHtml(t.studentId)}</code>
          </td>
          <td>${t.borrowDate}</td>
          <td>
            <strong style="color: ${overdue ? 'var(--danger)' : 'inherit'};">${t.dueDate}</strong>
            ${overdue ? `<div style="font-size: 0.75rem; color: var(--danger); font-weight: 700;">${daysOver}d overdue</div>` : ''}
          </td>
          <td>
            <span class="badge ${overdue ? 'badge-danger' : 'badge-warning'}">
              ${overdue ? 'OVERDUE' : 'BORROWED'}
            </span>
          </td>
          <td style="text-align: right;">
            <button type="button" class="btn btn-success btn-sm btn-shimmer" onclick="openReturnModal('${t.id}')" title="Record Book Return">
              <svg class="skeu-icon" width="13" height="13"><use href="#skeu-return"/></svg>
              <span>Return Book</span>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function openReturnModal(transactionId) {
      const transactions = loadData(STORAGE_KEYS.TRANSACTIONS);
      const txn = transactions.find(t => t.id === transactionId);
      if (!txn) return;

      document.getElementById('return-transaction-id').value = txn.id;
      document.getElementById('return-info-book').textContent = `${txn.bookTitle} (${txn.bookId})`;
      document.getElementById('return-info-student').textContent = `${txn.studentName} (${txn.studentId})`;
      document.getElementById('return-info-borrow-date').textContent = txn.borrowDate;
      document.getElementById('return-info-due-date').textContent = txn.dueDate;

      const todayStr = getTodayString();
      const returnDateInput = document.getElementById('return-actual-date');
      returnDateInput.value = todayStr;
      returnDateInput.min = txn.borrowDate;

      openModal('modal-return');
    }

    function handleConfirmReturn(e) {
      e.preventDefault();
      const txnId = document.getElementById('return-transaction-id').value;
      const actualReturnDate = document.getElementById('return-actual-date').value;

      const transactions = loadData(STORAGE_KEYS.TRANSACTIONS);
      const txnIndex = transactions.findIndex(t => t.id === txnId);
      if (txnIndex === -1) return;

      const txn = transactions[txnIndex];

      if (actualReturnDate < txn.borrowDate) {
        showToast('Validation Error: Return date cannot be earlier than the borrow date.', 'error');
        return;
      }

      const books = loadData(STORAGE_KEYS.BOOKS);
      const bookIndex = books.findIndex(b => b.id === txn.bookId);
      if (bookIndex !== -1) {
        books[bookIndex].borrowedCopies = Math.max(0, books[bookIndex].borrowedCopies - 1);
        saveData(STORAGE_KEYS.BOOKS, books);
      }

      transactions[txnIndex].returnDate = actualReturnDate;
      transactions[txnIndex].status = 'RETURNED';
      saveData(STORAGE_KEYS.TRANSACTIONS, transactions);

      closeModal('modal-return');
      showToast(`Book "${txn.bookTitle}" successfully returned by ${txn.studentName}!`, 'success');
      populateBorrowFormDropdowns();
      refreshAllViews();
    }

    // -------------------------------------------------------------------------
    // 9. DASHBOARD & KPI ANALYTICS ENGINE
    // -------------------------------------------------------------------------
    function updateDashboard() {
      const books = loadData(STORAGE_KEYS.BOOKS);
      const students = loadData(STORAGE_KEYS.STUDENTS);
      const transactions = loadData(STORAGE_KEYS.TRANSACTIONS);

      const totalTitles = books.length;
      let totalPhysicalCopies = 0;
      let borrowedCopies = 0;

      books.forEach(b => {
        totalPhysicalCopies += Number(b.totalCopies) || 0;
        borrowedCopies += Number(b.borrowedCopies) || 0;
      });

      const availableCopies = Math.max(0, totalPhysicalCopies - borrowedCopies);
      const registeredStudents = students.length;

      const overdueList = transactions.filter(t => isRecordOverdue(t));
      const overdueCount = overdueList.length;

      document.getElementById('kpi-total-books').textContent = totalTitles;
      document.getElementById('kpi-total-copies-desc').textContent = `${totalPhysicalCopies} total physical copies`;
      document.getElementById('kpi-available-copies').textContent = availableCopies;
      document.getElementById('kpi-borrowed-copies').textContent = borrowedCopies;
      document.getElementById('kpi-total-students').textContent = registeredStudents;
      document.getElementById('kpi-overdue-count').textContent = overdueCount;
      document.getElementById('overdue-badge-count').textContent = `${overdueCount} Overdue`;

      const overdueSection = document.getElementById('overdue-container');
      const overdueTbody = document.getElementById('overdue-table-body');
      overdueTbody.innerHTML = '';

      if (overdueCount === 0) {
        overdueSection.style.borderColor = 'var(--border-subtle)';
        overdueTbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; color: var(--success); padding: 1.5rem; font-weight: 600;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                <svg class="skeu-icon" width="20" height="20"><use href="#skeu-borrow"/></svg>
                <span>All borrowed books are on schedule. No overdue items.</span>
              </div>
            </td>
          </tr>
        `;
      } else {
        overdueSection.style.borderColor = 'var(--danger-border)';

        overdueList.forEach(item => {
          const daysOver = getDaysOverdue(item.dueDate);
          const student = students.find(s => s.id === item.studentId);
          const studentClass = student ? student.studentClass : 'N/A';

          const tr = document.createElement('tr');
          tr.className = 'overdue-row-highlight';
          tr.innerHTML = `
            <td><strong>${escapeHtml(item.bookTitle)}</strong></td>
            <td><code>${escapeHtml(item.bookId)}</code></td>
            <td><strong style="color: var(--text-main);">${escapeHtml(item.studentName)}</strong></td>
            <td><code>${escapeHtml(item.studentId)}</code></td>
            <td>${escapeHtml(studentClass)}</td>
            <td><strong style="color: var(--danger);">${item.dueDate}</strong></td>
            <td>
              <span class="badge badge-danger">
                ${daysOver} day${daysOver === 1 ? '' : 's'} late
              </span>
            </td>
            <td>
              <button type="button" class="btn btn-success btn-sm btn-shimmer" onclick="openReturnModal('${item.id}')" title="Return Overdue Volume">
                <svg class="skeu-icon" width="13" height="13"><use href="#skeu-return"/></svg>
                <span>Return Now</span>
              </button>
            </td>
          `;
          overdueTbody.appendChild(tr);
        });
      }

      const recentTbody = document.getElementById('dashboard-recent-borrows');
      recentTbody.innerHTML = '';
      const activeList = transactions.filter(t => t.status === 'ACTIVE').slice(0, 5);

      if (activeList.length === 0) {
        recentTbody.innerHTML = `
          <tr>
            <td colspan="7" class="empty-state" style="padding: 1.5rem;">
              <p>No active borrows right now.</p>
            </td>
          </tr>
        `;
      } else {
        activeList.forEach(t => {
          const overdue = isRecordOverdue(t);
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><code>${escapeHtml(t.id)}</code></td>
            <td>${escapeHtml(t.bookTitle)}</td>
            <td>${escapeHtml(t.studentName)}</td>
            <td>${t.borrowDate}</td>
            <td style="color: ${overdue ? 'var(--danger)' : 'inherit'}; font-weight: ${overdue ? '700' : 'normal'};">
              ${t.dueDate}
            </td>
            <td>
              <span class="badge ${overdue ? 'badge-danger' : 'badge-warning'}">
                ${overdue ? 'OVERDUE' : 'BORROWED'}
              </span>
            </td>
            <td>
              <button type="button" class="btn btn-secondary btn-sm" onclick="openReturnModal('${t.id}')" title="Process Return">
                <svg class="skeu-icon" width="13" height="13"><use href="#skeu-return"/></svg>
                <span>Return</span>
              </button>
            </td>
          `;
          recentTbody.appendChild(tr);
        });
      }
    }

    // -------------------------------------------------------------------------
    // 10. HISTORY AUDIT LOG & PER-BOOK / PER-STUDENT HISTORY
    // -------------------------------------------------------------------------
    function renderHistoryTable() {
      const transactions = loadData(STORAGE_KEYS.TRANSACTIONS);
      const tbody = document.getElementById('history-table-body');
      tbody.innerHTML = '';

      const query = (document.getElementById('history-search-input')?.value || '').toLowerCase().trim();
      const statusFilter = document.getElementById('history-filter-status')?.value || 'ALL';

      const filtered = transactions.filter(t => {
        const matchesQuery = 
          t.bookTitle.toLowerCase().includes(query) ||
          t.studentName.toLowerCase().includes(query) ||
          t.bookId.toLowerCase().includes(query) ||
          t.studentId.toLowerCase().includes(query) ||
          t.id.toLowerCase().includes(query);

        if (!matchesQuery) return false;

        if (statusFilter === 'ALL') return true;
        if (statusFilter === 'RETURNED') return t.status === 'RETURNED';
        if (statusFilter === 'ACTIVE') return t.status === 'ACTIVE' && !isRecordOverdue(t);
        if (statusFilter === 'OVERDUE') return isRecordOverdue(t);

        return true;
      });

      document.getElementById('history-count-summary').textContent = `Showing ${filtered.length} of ${transactions.length} total records`;

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="empty-state">
              <div class="skeu-icon-badge skeu-badge-oxblood" style="width: 44px; height: 44px; margin: 0 auto 0.65rem auto;">
                <svg class="skeu-icon" width="24" height="24"><use href="#skeu-ledger"/></svg>
              </div>
              <p>No records found matching filters.</p>
            </td>
          </tr>
        `;
        return;
      }

      filtered.forEach(t => {
        const isOverdue = isRecordOverdue(t);
        let statusBadge = '';

        if (t.status === 'RETURNED') {
          statusBadge = '<span class="badge badge-success">RETURNED</span>';
        } else if (isOverdue) {
          statusBadge = '<span class="badge badge-danger">OVERDUE</span>';
        } else {
          statusBadge = '<span class="badge badge-warning">ACTIVE</span>';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${escapeHtml(t.id)}</code></td>
          <td>
            <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(t.bookTitle)}</div>
            <code style="font-size: 0.72rem;">${escapeHtml(t.bookId)}</code>
          </td>
          <td>
            <div style="color: var(--text-main); font-weight: 500;">${escapeHtml(t.studentName)}</div>
            <code style="font-size: 0.72rem;">${escapeHtml(t.studentId)}</code>
          </td>
          <td>${t.borrowDate}</td>
          <td>${t.dueDate}</td>
          <td>${t.returnDate ? `<strong>${t.returnDate}</strong>` : '<span style="color: var(--text-dim);">-</span>'}</td>
          <td>${statusBadge}</td>
          <td>
            ${t.status === 'ACTIVE' ? `
              <button class="btn btn-secondary btn-sm" onclick="openReturnModal('${t.id}')">Return</button>
            ` : '<span style="color: var(--text-dim); font-size: 0.8125rem;">Closed</span>'}
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function viewBookHistory(bookId) {
      const books = loadData(STORAGE_KEYS.BOOKS);
      const book = books.find(b => b.id === bookId);
      if (!book) return;

      const transactions = loadData(STORAGE_KEYS.TRANSACTIONS);
      const bookTxns = transactions.filter(t => t.bookId === bookId);

      document.getElementById('modal-detail-title').textContent = `Circulation History for Book`;
      document.getElementById('modal-detail-summary').innerHTML = `
        <strong>Title:</strong> ${escapeHtml(book.title)} &bull; 
        <strong>Author:</strong> ${escapeHtml(book.author)} &bull; 
        <strong>ID:</strong> <code>${escapeHtml(book.id)}</code> &bull; 
        <strong>Total Records:</strong> ${bookTxns.length}
      `;

      renderDetailTable(bookTxns, 'STUDENT');
      openModal('modal-detail-history');
    }

    function viewStudentHistory(studentId) {
      const students = loadData(STORAGE_KEYS.STUDENTS);
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const transactions = loadData(STORAGE_KEYS.TRANSACTIONS);
      const studentTxns = transactions.filter(t => t.studentId === studentId);

      document.getElementById('modal-detail-title').textContent = `Borrow History for Student`;
      document.getElementById('modal-detail-summary').innerHTML = `
        <strong>Name:</strong> ${escapeHtml(student.name)} &bull; 
        <strong>Class:</strong> ${escapeHtml(student.studentClass)} &bull; 
        <strong>Student ID:</strong> <code>${escapeHtml(student.id)}</code> &bull; 
        <strong>Active Checkouts:</strong> ${getStudentActiveBorrowCount(student.id)}/3
      `;

      renderDetailTable(studentTxns, 'BOOK');
      openModal('modal-detail-history');
    }

    function renderDetailTable(records, displayType) {
      const tbody = document.getElementById('modal-detail-tbody');
      tbody.innerHTML = '';

      if (records.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="empty-state" style="padding: 1.5rem;">
              <p>No transaction history found for this item.</p>
            </td>
          </tr>
        `;
        return;
      }

      records.forEach(t => {
        const isOverdue = isRecordOverdue(t);
        const itemCol = displayType === 'STUDENT'
          ? `<strong>${escapeHtml(t.studentName)}</strong> (<code>${escapeHtml(t.studentId)}</code>)`
          : `<strong>${escapeHtml(t.bookTitle)}</strong> (<code>${escapeHtml(t.bookId)}</code>)`;

        let statusBadge = '';
        if (t.status === 'RETURNED') {
          statusBadge = '<span class="badge badge-success">RETURNED</span>';
        } else if (isOverdue) {
          statusBadge = '<span class="badge badge-danger">OVERDUE</span>';
        } else {
          statusBadge = '<span class="badge badge-warning">ACTIVE</span>';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${escapeHtml(t.id)}</code></td>
          <td>${itemCol}</td>
          <td>${t.borrowDate}</td>
          <td>${t.dueDate}</td>
          <td>${t.returnDate || '-'}</td>
          <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    // -------------------------------------------------------------------------
    // 11. MODAL, TOAST, TAB NAVIGATION & UTILITY HELPERS
    // -------------------------------------------------------------------------
    const SECTION_METADATA = {
      'tab-dashboard': { label: 'Dashboard', icon: '#skeu-dashboard' },
      'tab-books': { label: 'Book Catalog', icon: '#skeu-book' },
      'tab-students': { label: 'Students', icon: '#skeu-student' },
      'tab-borrow': { label: 'Borrow / Return', icon: '#skeu-borrow' },
      'tab-history': { label: 'Circulation Ledger', icon: '#skeu-ledger' }
    };

    function toggleSmartSectionsMenu() {
      const menu = document.getElementById('smart-sections-menu');
      const btn = document.getElementById('btn-smart-section-toggle');
      if (!menu || !btn) return;
      const isOpen = menu.classList.contains('open');
      if (isOpen) {
        closeSmartSectionsMenu();
      } else {
        openSmartSectionsMenu();
      }
    }
    window.toggleSmartSectionsMenu = toggleSmartSectionsMenu;

    function openSmartSectionsMenu() {
      const menu = document.getElementById('smart-sections-menu');
      const btn = document.getElementById('btn-smart-section-toggle');
      if (menu) menu.classList.add('open');
      if (btn) {
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    }
    window.openSmartSectionsMenu = openSmartSectionsMenu;

    function closeSmartSectionsMenu() {
      const menu = document.getElementById('smart-sections-menu');
      const btn = document.getElementById('btn-smart-section-toggle');
      if (menu) menu.classList.remove('open');
      if (btn) {
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    }
    window.closeSmartSectionsMenu = closeSmartSectionsMenu;

    function switchTab(tabId) {
      document.querySelectorAll('[data-tab]').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      document.querySelectorAll('.tab-view').forEach(view => {
        if (view.id === tabId) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });

      // Update smart navbar active section label & icon
      const meta = SECTION_METADATA[tabId];
      if (meta) {
        const labelEl = document.getElementById('smart-active-label');
        const iconEl = document.getElementById('smart-active-icon');
        if (labelEl) labelEl.textContent = meta.label;
        if (iconEl) iconEl.innerHTML = `<svg class="skeu-icon" width="16" height="16"><use href="${meta.icon}"/></svg>`;
      }

      closeSmartSectionsMenu();
      closeMobileDrawer();

      if (tabId === 'tab-borrow') {
        populateBorrowFormDropdowns();
        renderActiveBorrowsTable();
      }
    }

    function toggleMobileDrawer() {
      const drawer = document.getElementById('mobile-nav-drawer');
      const overlay = document.getElementById('mobile-drawer-overlay');
      const btn = document.getElementById('btn-mobile-menu-toggle');
      if (!drawer) return;
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        closeMobileDrawer();
      } else {
        drawer.classList.add('open');
        if (overlay) overlay.classList.add('open');
        if (btn) btn.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeMobileDrawer() {
      const drawer = document.getElementById('mobile-nav-drawer');
      const overlay = document.getElementById('mobile-drawer-overlay');
      const btn = document.getElementById('btn-mobile-menu-toggle');
      if (drawer) drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      if (btn) btn.classList.remove('open');
      document.body.style.overflow = '';
    }

    function showBorrowModal() {
      switchTab('tab-borrow');
      document.getElementById('borrow-student-select').focus();
    }

    function openModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.add('show');
    }

    function closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('show');
    }

    let deleteConfirmCallback = null;
    function showDeleteConfirmModal(title, message, onConfirm) {
      document.getElementById('confirm-delete-title').textContent = title;
      document.getElementById('confirm-delete-message').textContent = message;
      deleteConfirmCallback = onConfirm;
      openModal('modal-confirm-delete');
    }

    document.getElementById('btn-confirm-delete-exec').addEventListener('click', function () {
      if (typeof deleteConfirmCallback === 'function') {
        deleteConfirmCallback();
      }
      closeModal('modal-confirm-delete');
    });

    function showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;

      let icon = '⚡';
      if (type === 'success') icon = '✅';
      if (type === 'error') icon = '❌';

      toast.innerHTML = `<span style="font-size: 1.05rem;">${icon}</span><span>${escapeHtml(message)}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.transition = 'opacity 0.25s, transform 0.25s';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => toast.remove(), 250);
      }, 3500);
    }

    function escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function refreshAllViews() {
      updateDashboard();
      renderBooksTable(document.getElementById('books-search-input')?.value || '');
      renderStudentsTable(document.getElementById('students-search-input')?.value || '');
      renderActiveBorrowsTable();
      renderHistoryTable();
      populateBorrowFormDropdowns();
    }

    // -------------------------------------------------------------------------
    // 11B. 21ST.DEV CALM & SOOTHING AMBIENT BACKGROUND ANIMATION CONTROLLER
    // -------------------------------------------------------------------------
    let ambientAnimationActive = true;
    let ambientAnimFrameId = null;
    let ambientParticles = [];

    function initCalmAmbientBackground() {
      const saved = localStorage.getItem('calm_ambient_enabled');
      ambientAnimationActive = saved !== null ? saved === 'true' : true;
      updateAmbientToggleButton();

      const canvas = document.getElementById('calm-ambient-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      resize();
      window.addEventListener('resize', resize);

      // Create gentle floating light particles (stardust motes)
      const particleCount = Math.min(42, Math.floor(window.innerWidth / 35));
      ambientParticles = [];
      for (let i = 0; i < particleCount; i++) {
        ambientParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.2 + 0.8,
          speedY: Math.random() * 0.35 + 0.15,
          speedX: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.45 + 0.15,
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.01
        });
      }

      function draw() {
        if (!ambientAnimationActive) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ambientAnimFrameId = requestAnimationFrame(draw);
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const colorBase = isLight ? '0, 162, 232' : '56, 189, 248';

        for (let i = 0; i < ambientParticles.length; i++) {
          const p = ambientParticles[i];
          p.phase += p.pulseSpeed;
          p.y -= p.speedY;
          p.x += p.speedX + Math.sin(p.phase) * 0.25;

          // Wrap around edges smoothly
          if (p.y < -10) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < -10) p.x = canvas.width + 10;
          if (p.x > canvas.width + 10) p.x = -10;

          const currentOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.phase));

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colorBase}, ${currentOpacity})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(${colorBase}, 0.35)`;
          ctx.fill();
        }

        ambientAnimFrameId = requestAnimationFrame(draw);
      }

      draw();
    }

    function toggleAmbientAnimation() {
      ambientAnimationActive = !ambientAnimationActive;
      localStorage.setItem('calm_ambient_enabled', String(ambientAnimationActive));
      updateAmbientToggleButton();
      const backdrop = document.getElementById('calm-ambient-backdrop');
      if (backdrop) {
        backdrop.style.opacity = ambientAnimationActive ? '1' : '0.15';
      }
      showToast(ambientAnimationActive ? 'Calm ambient background animation enabled.' : 'Ambient animation dimmed.', 'info');
    }
    window.toggleAmbientAnimation = toggleAmbientAnimation;

    function updateAmbientToggleButton() {
      const btn = document.getElementById('btn-ambient-toggle');
      if (!btn) return;
      if (ambientAnimationActive) {
        btn.classList.remove('paused');
        btn.setAttribute('title', 'Calm Ambient Atmosphere: Active (Click to pause)');
      } else {
        btn.classList.add('paused');
        btn.setAttribute('title', 'Calm Ambient Atmosphere: Paused (Click to resume)');
      }
    }

    // -------------------------------------------------------------------------
    // 11C. 21ST.DEV SPOTLIGHT CARDS CURSOR TRACKING
    // -------------------------------------------------------------------------
    function initSpotlightCards() {
      document.addEventListener('mousemove', function (e) {
        const cards = document.querySelectorAll('.spotlight-card, .kpi-card, .content-card, .form-card, .login-card');
        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        });
      });
    }

    // -------------------------------------------------------------------------
    // 11D. 21ST.DEV COMMAND PALETTE (⌘K) CONTROLLER
    // -------------------------------------------------------------------------
    let cmdCurrentType = 'ALL';
    let cmdSelectedIndex = 0;
    let cmdCurrentResults = [];

    function openCommandPalette() {
      const modal = document.getElementById('modal-command-palette');
      if (!modal) return;
      modal.classList.add('show');
      const input = document.getElementById('cmd-palette-input');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 50);
      }
      renderCmdResults('');
    }
    window.openCommandPalette = openCommandPalette;

    function closeCommandPalette() {
      const modal = document.getElementById('modal-command-palette');
      if (modal) modal.classList.remove('show');
    }
    window.closeCommandPalette = closeCommandPalette;

    function handleCmdBackdropClick(e) {
      if (e.target && e.target.id === 'modal-command-palette') {
        closeCommandPalette();
      }
    }
    window.handleCmdBackdropClick = handleCmdBackdropClick;

    function setCmdFilterTab(type, btn) {
      cmdCurrentType = type;
      document.querySelectorAll('.cmd-tab-chip').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      const input = document.getElementById('cmd-palette-input');
      renderCmdResults(input ? input.value : '');
    }
    window.setCmdFilterTab = setCmdFilterTab;

    function handleCmdInput(query) {
      renderCmdResults(query);
    }
    window.handleCmdInput = handleCmdInput;

    function handleCmdKeydown(e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (cmdCurrentResults.length > 0) {
          cmdSelectedIndex = (cmdSelectedIndex + 1) % cmdCurrentResults.length;
          updateCmdSelectionHighlight();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (cmdCurrentResults.length > 0) {
          cmdSelectedIndex = (cmdSelectedIndex - 1 + cmdCurrentResults.length) % cmdCurrentResults.length;
          updateCmdSelectionHighlight();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (cmdCurrentResults[cmdSelectedIndex]) {
          executeCmdItem(cmdCurrentResults[cmdSelectedIndex]);
        }
      } else if (e.key === 'Escape') {
        closeCommandPalette();
      }
    }
    window.handleCmdKeydown = handleCmdKeydown;

    function updateCmdSelectionHighlight() {
      const items = document.querySelectorAll('.cmd-item');
      items.forEach((item, idx) => {
        if (idx === cmdSelectedIndex) {
          item.classList.add('selected');
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('selected');
        }
      });
    }

    function renderCmdResults(query) {
      const q = (query || '').toLowerCase().trim();
      const resultsContainer = document.getElementById('cmd-palette-results');
      if (!resultsContainer) return;

      const books = loadData(STORAGE_KEYS.BOOKS);
      const students = loadData(STORAGE_KEYS.STUDENTS);
      const transactions = loadData(STORAGE_KEYS.TRANSACTIONS);

      let items = [];

      // Books
      if (cmdCurrentType === 'ALL' || cmdCurrentType === 'BOOKS') {
        books.forEach(b => {
          if (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.id.toLowerCase().includes(q)) {
            const avail = b.totalCopies - b.borrowedCopies;
            items.push({
              type: 'book',
              badge: 'VOLUME',
              icon: '#skeu-book',
              title: b.title,
              subtitle: `${b.author} • ID: ${b.id} • ${avail} available of ${b.totalCopies}`,
              action: () => {
                closeCommandPalette();
                switchTab('tab-books');
                const searchInp = document.getElementById('books-search-input');
                if (searchInp) searchInp.value = b.title;
                renderBooksTable(b.title);
              }
            });
          }
        });
      }

      // Students
      if (cmdCurrentType === 'ALL' || cmdCurrentType === 'STUDENTS') {
        students.forEach(s => {
          if (!q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.studentClass.toLowerCase().includes(q)) {
            const borrowed = getStudentActiveBorrowCount(s.id);
            items.push({
              type: 'student',
              badge: 'STUDENT',
              icon: '#skeu-student',
              title: s.name,
              subtitle: `Class: ${s.studentClass} • ID: ${s.id} • ${borrowed}/3 books borrowed`,
              action: () => {
                closeCommandPalette();
                switchTab('tab-students');
                const searchInp = document.getElementById('students-search-input');
                if (searchInp) searchInp.value = s.name;
                renderStudentsTable(s.name);
              }
            });
          }
        });
      }

      // Active Loans
      if (cmdCurrentType === 'ALL' || cmdCurrentType === 'BORROWS') {
        const activeTxns = transactions.filter(t => t.status === 'ACTIVE');
        activeTxns.forEach(t => {
          if (!q || t.bookTitle.toLowerCase().includes(q) || t.studentName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)) {
            const overdue = isRecordOverdue(t);
            items.push({
              type: 'borrow',
              badge: overdue ? 'OVERDUE LOAN' : 'ACTIVE LOAN',
              icon: '#skeu-borrow',
              title: `${t.bookTitle} → ${t.studentName}`,
              subtitle: `Due: ${t.dueDate} • Record: ${t.id}`,
              action: () => {
                closeCommandPalette();
                openReturnModal(t.id);
              }
            });
          }
        });
      }

      // Quick system commands if typing search or empty
      if (cmdCurrentType === 'ALL') {
        const actions = [
          {
            title: 'Borrow / Issue Book to Student',
            subtitle: 'Open the book loan checkout form',
            icon: '#skeu-borrow',
            badge: 'QUICK ACTION',
            action: () => { closeCommandPalette(); switchTab('tab-borrow'); }
          },
          {
            title: 'Add New Book to Catalog',
            subtitle: 'Register a new title into library inventory',
            icon: '#skeu-plus',
            badge: 'NEW RECORD',
            action: () => { closeCommandPalette(); switchTab('tab-books'); openAddBookModal(); }
          },
          {
            title: 'Register New Student',
            subtitle: 'Add a student to the library directory',
            icon: '#skeu-student',
            badge: 'NEW RECORD',
            action: () => { closeCommandPalette(); switchTab('tab-students'); openAddStudentModal(); }
          },
          {
            title: 'Switch Theme (Ambient Dark / Ambient Light)',
            subtitle: 'Toggle between Ambient Dark and Ambient Light reading environments',
            icon: '#skeu-sparkle',
            badge: 'THEME',
            action: () => { closeCommandPalette(); toggleTheme(); }
          },
          {
            title: 'Toggle Calm Ambient Atmosphere Animation',
            subtitle: 'Control soothing background luminous stardust motes',
            icon: '#skeu-sparkle',
            badge: 'ATMOSPHERE',
            action: () => { closeCommandPalette(); toggleAmbientAnimation(); }
          },
          {
            title: 'Sign Out (Curator / Librarian)',
            subtitle: 'Exit your active session and return to authentication portal',
            icon: '#skeu-logout',
            badge: 'SESSION',
            action: () => { closeCommandPalette(); handleLogout(); }
          }
        ];

        actions.forEach(a => {
          if (!q || a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)) {
            items.push(a);
          }
        });
      }

      cmdCurrentResults = items.slice(0, 30);
      cmdSelectedIndex = 0;

      if (cmdCurrentResults.length === 0) {
        resultsContainer.innerHTML = `
          <div class="cmd-empty">
            <svg class="skeu-icon" width="28" height="28" style="margin: 0 auto 0.5rem auto; display: block; opacity: 0.5;"><use href="#skeu-search"/></svg>
            No matches found for "${escapeHtml(query)}"
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = cmdCurrentResults.map((item, idx) => `
        <div class="cmd-item ${idx === 0 ? 'selected' : ''}" data-index="${idx}" onclick="executeCmdIndex(${idx})">
          <div class="cmd-item-left">
            <svg class="skeu-icon" width="18" height="18" style="flex-shrink: 0;"><use href="${item.icon}"/></svg>
            <div style="min-width: 0;">
              <div class="cmd-item-title">${escapeHtml(item.title)}</div>
              <div class="cmd-item-subtitle">${escapeHtml(item.subtitle)}</div>
            </div>
          </div>
          <span class="cmd-item-badge">${item.badge}</span>
        </div>
      `).join('');
    }

    function executeCmdIndex(index) {
      if (cmdCurrentResults[index]) {
        executeCmdItem(cmdCurrentResults[index]);
      }
    }
    window.executeCmdIndex = executeCmdIndex;

    function executeCmdItem(item) {
      if (typeof item.action === 'function') {
        item.action();
      }
    }

    // -------------------------------------------------------------------------
    // 12. APP INITIALIZATION & EVENT LISTENERS
    // -------------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', function () {
      initTheme();
      initializeStorage();
      initCalmAmbientBackground();
      initSpotlightCards();

      // Keyboard Shortcut listener for 21st.dev Command Palette (⌘K, Ctrl+K, /)
      document.addEventListener('keydown', function (e) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          const modal = document.getElementById('modal-command-palette');
          if (modal && modal.classList.contains('show')) {
            closeCommandPalette();
          } else {
            openCommandPalette();
          }
        } else if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
          e.preventDefault();
          openCommandPalette();
        }
      });

      // Universal tab navigation (desktop menu, mobile chips, and drawer links)
      document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', function () {
          const tabId = this.getAttribute('data-tab');
          if (tabId) switchTab(tabId);
        });
      });

      // Smart Section Dropdown Toggle
      const smartSectionToggleBtn = document.getElementById('btn-smart-section-toggle');
      if (smartSectionToggleBtn) {
        smartSectionToggleBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          toggleSmartSectionsMenu();
        });
      }

      // Close smart section menu on outside click
      document.addEventListener('click', function (e) {
        const wrapper = document.getElementById('smart-section-dropdown-wrapper');
        if (wrapper && !wrapper.contains(e.target)) {
          closeSmartSectionsMenu();
        }
      });

      // Mobile Drawer Controls
      const menuToggleBtn = document.getElementById('btn-mobile-menu-toggle');
      if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', toggleMobileDrawer);
      }

      const drawerCloseBtn = document.getElementById('btn-mobile-drawer-close');
      if (drawerCloseBtn) {
        drawerCloseBtn.addEventListener('click', closeMobileDrawer);
      }

      const drawerOverlay = document.getElementById('mobile-drawer-overlay');
      if (drawerOverlay) {
        drawerOverlay.addEventListener('click', closeMobileDrawer);
      }

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          closeSmartSectionsMenu();
          closeMobileDrawer();
        }
      });

      document.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.addEventListener('click', function (e) {
          if (e.target === this) {
            this.classList.remove('show');
          }
        });
      });

      checkAuth();
    });
  </script>
