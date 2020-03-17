// Grapes-editor object
const editor = grapesjs.init({
  height: '100%',
  showOffsets: 1,
  noticeOnUnload: 0,
  storageManager: { autoload: 0 },
  container: '#gjs',
  fromElement: true,

  plugins: ['gjs-preset-webpage'],
  pluginsOpts: {
    'gjs-preset-webpage': {}
  }
});
// Left-side panel with page list
const leftBar = document.getElementsByClassName('left-bar')[0];

// Create and add page (name and controls) to DOM
function crtAddPgVw (name, i, flag) {
  const el = document.createElement('DIV');
  el.classList.add('left-bar__item', 'bar-item');
  const fw = flag ? 'item-bold' : '';
  let inner = `<span class="left-bar__item-title inline-button ${fw}" onclick="pageManager.chnCrrPg(${i})">${name}</span>`;
  inner += `<i class="left-bar__item-control inline-button fa fa-copy" onclick="pageManager.cpPg(${i})"></i>`;
  inner += `<i class="left-bar__item-control inline-button fa fa-edit" onclick="pageManager.rnmPg(${i})"></i>`;
  inner += `<i class="left-bar__item-control inline-button fa fa-trash" onclick="pageManager.dltPg(${i})"></i>`;
  el.innerHTML = inner;
  leftBar.appendChild(el);
}

// Clearing panel and filling it by pages
function drwNmsPgs (pgs, cur) {
  let lstChl = leftBar.lastElementChild;
  while (leftBar.childElementCount > 1) {
    leftBar.removeChild(lstChl);
    lstChl = leftBar.lastElementChild;
  }
  for (let i = 0; i < pgs.length; i++) {
    crtAddPgVw(pgs[i].name, i, i === cur);
  }
}

// Object contains interactions with pages logic
const pageManager = {
  // Default page
  dflPg: {
    components: null,
    styles: null,
  },
  // List of pages
  pgs: [
    {
      name: 'index',
      components: null,
      styles: null,
    }
  ],
  // Index of current page
  crrPg: 0,
  // Change index of current page to i
  chnCrrPg: function (i) {
    if (i !== this.crrPg) {
      if (this.crrPg !== -1) {
        this.pgs[this.crrPg].components = editor.getHtml();
        this.pgs[this.crrPg].styles = editor.getCss();
      }
      this.crrPg = i;
      editor.setComponents(i !== -1 ? this.pgs[this.crrPg].components : '');
      editor.setStyle(i !== -1 ? this.pgs[this.crrPg].styles : '');
      drwNmsPgs(this.pgs, this.crrPg);
    }
  },
  // Add new default page to list
  addNewPg: function () {
    this.pgs.push({
      name: 'index',
      components: this.dflPg.components,
      styles: this.dflPg.styles,
    });
    drwNmsPgs(this.pgs, this.crrPg);
  },
  // Copy of existing page having index i
  cpPg: function (i) {
    const pg = this.pgs[i];
    if (this.crrPg === i) {
      this.pgs[this.crrPg].components = editor.getHtml();
      this.pgs[this.crrPg].styles = editor.getCss();
    }
    this.pgs.push({
      name: pg.name + '_copy',
      components: pg.components,
      styles: pg.styles,
    });
    drwNmsPgs(this.pgs, this.crrPg);
  },
  // Rename page having index i
  rnmPg: function (i) {
    const str = prompt('Rename the page', this.pgs[i].name);
    if (str !== '' && str !== undefined && str !== null) {
      this.pgs[i].name = str;
      drwNmsPgs(this.pgs, this.crrPg);
    }
  },
  // Delete page having index i
  dltPg: function (i) {
    if (confirm(`Do you want to delete ${this.pgs[i].name} ?`)) {
      this.chnCrrPg(i - 1);
      this.pgs.splice(i, 1);
      drwNmsPgs(this.pgs, this.crrPg);
    }
  },
  // Get array with html and css of all pages
  getData() {
    this.pgs[this.crrPg].components = editor.getHtml();
    this.pgs[this.crrPg].styles = editor.getCss();
    return this.pgs;
  }
};

// Init default page by editor content
window.onload = function (event) {
  pageManager.dflPg.components = editor.getHtml();
  pageManager.dflPg.styles = editor.getCss();
  pageManager.pgs[0].components = editor.getHtml();
  pageManager.pgs[0].styles = editor.getCss();
  drwNmsPgs(pageManager.pgs, pageManager.crrPg);
};
