/* release-changelog.js */
/**
 * Release Changelog Web Component
 * 
 * A self-contained web component for displaying monthly release change logs
 * with pagination support.
 * 
 * Features:
 * - Fetch changelog data from external JSON file via 'src' attribute
 * - Accept inline JSON data via 'data' attribute
 * - Programmatic data loading via setData() method
 * - Pagination support with configurable items per page
 * - Auto-fill missing item properties from meta defaults
 * - Responsive design with built-in styling
 * 
 * JSON Structure:
 * {
 *   "meta": {
 *     "title": "Release Changelog",
 *     "description": "Monthly product releases",
 *     "lastUpdated": "2024-01-15",
 *     "issue": "https://github.com/org/repo/issues"
 *   },
 *   "items": [
 *     {
 *       "version": "1.0.0",
 *       "date": "2024-01-15",
 *       "title": "Initial Release",
 *       "description": "First stable release",
 *       "changes": ["Feature 1", "Feature 2"],
 *       "lastUpdated": "2024-01-15",  // Optional, uses meta.lastUpdated if omitted
 *       "issue": "https://..."  // Optional, uses meta.issue if omitted
 *     }
 *   ]
 * }
 * 
 * Usage:
 * <release-changelog src="changelog.json"></release-changelog>
 * <release-changelog data='{"meta":{...},"items":[...]}'></release-changelog>
 * 
 * @element release-changelog
 * @attr {string} src - URL to JSON file containing changelog data
 * @attr {string} data - Inline JSON string with changelog data
 * @attr {number} items-per-page - Number of items to display per page (default: 5)
 */

class ReleaseChangelog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._data = null;
    this._currentPage = 1;
    this._itemsPerPage = 5;
  }

  static get observedAttributes() {
    return ['src', 'data', 'items-per-page'];
  }

  connectedCallback() {
    this.render();
    this.loadData();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'items-per-page') {
      this._itemsPerPage = parseInt(newValue, 10) || 5;
      this._currentPage = 1;
      this.render();
    } else if (name === 'src' || name === 'data') {
      this.loadData();
    }
  }

  /**
   * Load data from src attribute or data attribute
   */
  async loadData() {
    const src = this.getAttribute('src');
    const dataAttr = this.getAttribute('data');

    try {
      if (src) {
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        this._data = await response.json();
      } else if (dataAttr) {
        this._data = JSON.parse(dataAttr);
      }

      if (this._data) {
        this.normalizeData();
        this.render();
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  /**
   * Programmatically set changelog data
   * @param {Object} data - Changelog data object
   */
  setData(data) {
    this._data = data;
    this.normalizeData();
    this._currentPage = 1;
    this.render();
  }

  /**
   * Normalize data by filling in missing properties from meta defaults
   */
  normalizeData() {
    if (!this._data || !this._data.items) return;

    const meta = this._data.meta || {};
    this._data.items = this._data.items.map(item => ({
      ...item,
      lastUpdated: item.lastUpdated || meta.lastUpdated || '',
      issue: item.issue || meta.issue || ''
    }));
  }

  /**
   * Get paginated items for current page
   */
  getPaginatedItems() {
    if (!this._data || !this._data.items) return [];
    
    const start = (this._currentPage - 1) * this._itemsPerPage;
    const end = start + this._itemsPerPage;
    return this._data.items.slice(start, end);
  }

  /**
   * Get total number of pages
   */
  getTotalPages() {
    if (!this._data || !this._data.items) return 0;
    return Math.ceil(this._data.items.length / this._itemsPerPage);
  }

  /**
   * Navigate to specific page
   */
  goToPage(page) {
    const totalPages = this.getTotalPages();
    if (page < 1 || page > totalPages) return;
    
    this._currentPage = page;
    this.render();
  }

  /**
   * Show error message
   */
  showError(message) {
    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="error">
        <h3>Error Loading Changelog</h3>
        <p>${message}</p>
      </div>
    `;
  }

  /**
   * Render the component
   */
  render() {
    if (!this._data) {
      this.shadowRoot.innerHTML = `
        ${this.getStyles()}
        <div class="loading">Loading changelog...</div>
      `;
      return;
    }

    const meta = this._data.meta || {};
    const items = this.getPaginatedItems();
    const totalPages = this.getTotalPages();

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="changelog-container">
        <header class="changelog-header">
          <h2>${meta.title || 'Release Changelog'}</h2>
          ${meta.description ? `<p class="description">${meta.description}</p>` : ''}
        </header>

        <div class="changelog-items">
          ${items.map(item => this.renderItem(item)).join('')}
        </div>

        ${totalPages > 1 ? this.renderPagination(totalPages) : ''}
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * Render a single changelog item
   */
  renderItem(item) {
    return `
      <article class="changelog-item">
        <div class="item-header">
          <h3 class="version">${item.version || 'Unknown Version'}</h3>
          <time class="date">${item.date || ''}</time>
        </div>
        
        <h4 class="title">${item.title || ''}</h4>
        
        ${item.description ? `<p class="description">${item.description}</p>` : ''}
        
        ${item.changes && item.changes.length > 0 ? `
          <div class="changes">
            <strong>Changes:</strong>
            <ul>
              ${item.changes.map(change => `<li>${change}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        <div class="item-footer">
          ${item.lastUpdated ? `<span class="last-updated">Updated: ${item.lastUpdated}</span>` : ''}
          ${item.issue ? `<a href="${item.issue}" class="issue-link" target="_blank" rel="noopener">View Issue</a>` : ''}
        </div>
      </article>
    `;
  }

  /**
   * Render pagination controls
   */
  renderPagination(totalPages) {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return `
      <div class="pagination">
        <button 
          class="page-btn prev" 
          data-action="prev"
          ${this._currentPage === 1 ? 'disabled' : ''}
        >
          Previous
        </button>
        
        <div class="page-numbers">
          ${pages.map(page => `
            <button 
              class="page-btn ${page === this._currentPage ? 'active' : ''}" 
              data-page="${page}"
            >
              ${page}
            </button>
          `).join('')}
        </div>
        
        <button 
          class="page-btn next" 
          data-action="next"
          ${this._currentPage === totalPages ? 'disabled' : ''}
        >
          Next
        </button>
      </div>
    `;
  }

  /**
   * Attach event listeners for pagination
   */
  attachEventListeners() {
    const pagination = this.shadowRoot.querySelector('.pagination');
    if (!pagination) return;

    pagination.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (!button) return;

      const action = button.dataset.action;
      const page = button.dataset.page;

      if (action === 'prev') {
        this.goToPage(this._currentPage - 1);
      } else if (action === 'next') {
        this.goToPage(this._currentPage + 1);
      } else if (page) {
        this.goToPage(parseInt(page, 10));
      }
    });
  }

  /**
   * Get component styles
   */
  getStyles() {
    return `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          color: #333;
        }

        .changelog-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .changelog-header {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }

        .changelog-header h2 {
          margin: 0 0 10px 0;
          font-size: 2em;
          color: #2c3e50;
        }

        .changelog-header .description {
          margin: 0;
          color: #666;
          font-size: 1.1em;
        }

        .changelog-items {
          margin-bottom: 30px;
        }

        .changelog-item {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          transition: box-shadow 0.2s;
        }

        .changelog-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .version {
          margin: 0;
          font-size: 1.5em;
          color: #2c3e50;
          font-weight: 600;
        }

        .date {
          color: #666;
          font-size: 0.9em;
        }

        .title {
          margin: 10px 0;
          font-size: 1.2em;
          color: #34495e;
        }

        .description {
          color: #555;
          line-height: 1.6;
        }

        .changes {
          margin: 15px 0;
          padding: 15px;
          background: white;
          border-radius: 4px;
        }

        .changes strong {
          color: #2c3e50;
        }

        .changes ul {
          margin: 10px 0 0 0;
          padding-left: 20px;
        }

        .changes li {
          margin: 5px 0;
          color: #555;
        }

        .item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
          font-size: 0.9em;
        }

        .last-updated {
          color: #666;
        }

        .issue-link {
          color: #3498db;
          text-decoration: none;
          font-weight: 500;
        }

        .issue-link:hover {
          text-decoration: underline;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          padding: 20px 0;
        }

        .page-numbers {
          display: flex;
          gap: 5px;
        }

        .page-btn {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          color: #333;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          background: #f0f0f0;
          border-color: #999;
        }

        .page-btn.active {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading, .error {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .error {
          color: #e74c3c;
        }

        .error h3 {
          margin: 0 0 10px 0;
          color: #c0392b;
        }

        @media (max-width: 640px) {
          .changelog-container {
            padding: 10px;
          }

          .item-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .item-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .pagination {
            flex-wrap: wrap;
          }
        }
      </style>
    `;
  }
}

// Define the custom element
customElements.define('release-changelog', ReleaseChangelog);

// Export as default for ES module
export default ReleaseChangelog;
