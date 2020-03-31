// Grapes-editor object
const editor = grapesjs.init({
  height: '100%',
  showOffsets: 1,
  noticeOnUnload: 0,
  canvas: {
    styles: []
  },
  storageManager: { 
    id: '',
    type: 'remote',
    autosave: false,
    autoload: false, 
    contentTypeJson: true,
    urlStore: '/cadau/user-template-page/save',
    // urlLoad: '/lroxv54oss7dz4wtlxtdxrfcft6zynyw/storage/grapesjs',
    // For custom parameters/headers on requests
    // params: { _some_token: '....' },
    // headers: { Authorization: 'Basic ...' },
  },
  container: '#gjs',
  fromElement: true,
  plugins: ['gjs-preset-webpage'],
  pluginsOpts: {
    'gjs-preset-webpage': {}
  },
  blockManager: {
    appendTo : '#componentsContent'
  },
});

// My block manager
const blockManager = {
  // Reference to editor block manager
  obj: editor.BlockManager,
  config: {
    // Prefix for current tab
    prefix: '',
    // DOM Element for current tab block manager
    queryContent: '#componentsContent',
  },
  // Render panel with blocks to DOM element by query selector
  render: function (blocks) {
    const el = document.querySelector(this.config.queryContent);
    if (!el) return;
    el.innerHTML = '';
    el.appendChild(blocks === undefined ? this.searchBlocks('') : blocks);
  },
  // Searching query in blocks names and category names
  searchBlocks: function (query, labelFlag=true, categoryFlag=true) {
    // Filtering by current tab
    const blocks = this.obj.getAll().filter(block => {
      let category = block.attributes.category;
      if (category === '' && this.config.prefix === '')
        return true;
      if (category === '')
        return false;
      category = category.attributes.id;
      if (this.config.prefix === '') {
        return category.indexOf('tab-') === -1;
      }
      return category.split('-')[0] === this.config.prefix.split('-')[0] && category.split('-')[1] === this.config.prefix.split('-')[1];
    });
    // Filtering by inner string
    return this.obj.render(blocks.filter(block => {
      const labelBlock = block.attributes.label;
      const idBlock = block.id;
      const labelCategory = block.attributes.category !== '' ? block.attributes.category.attributes.label : null;
      const idCategory = block.attributes.category !== '' ? block.attributes.category.id : null;
      const cFlag = (labelCategory ? labelCategory.toLowerCase().indexOf(query) !== -1 : false) || (idCategory ? idCategory.toLowerCase().indexOf(query) !== -1 : false);
      const bFlag = labelBlock.toLowerCase().indexOf(query) !== -1 || idBlock.toLowerCase().indexOf(query) !== -1;
      return (cFlag && categoryFlag) || (bFlag && labelFlag);
    }));
  },
  // Manage search from DOM event
  searchManage: function (event) {
    let str = event.target.value;
    if (str === null || str === undefined) {
      str = '';
    }
    const blocks = this.searchBlocks(str);
    this.render(blocks);
  },
  // Initialization of listeners for searching blocks
  initSearchers: function (query='.body__search') {
    document.querySelectorAll(query).forEach(e => e.addEventListener('input', this.searchManage.bind(this)));
  },
  // Creating new block (if no define to category it will be in 'other' category)
  creatingNewBlock: function (id, opts, tab='') {
    const defaultCategory = {
      id: tab !== '' ? `tab-${tab}-other` : 'Other',
      label: 'Other',
    };
    let options = opts ? opts : { category: defaultCategory };
    if (!options.category)
      options.category = defaultCategory;
    this.obj.add(id, options);
  },
};

// Manager of tabs (now 'Components' and 'Blocks') contains a method to add new Tab
const tabManager = {
  // DOM Container of tabs
  objectDOM: document.querySelector('.js__tab-manager'),
  // Map with tab faces
  tabNames: new Map(),
  // Map with tab bodies
  tabBodies: new Map(),
  // Key of current tab
  currentKey: null,
  // Refer to block manager
  bManager: blockManager,
  // Change current tab
  setCurrentTab: function (key) {
    if (this.currentKey !== key) {
      document.querySelectorAll('.js__active-tab').forEach(e => e.classList.remove('js__active-tab'));
      document.querySelectorAll(`[data-tab-key=${key}]`).forEach(e => e.classList.add('js__active-tab'));
      this.currentKey = key;
      if (key === 'components') {
        this.bManager.config.prefix = ''
      } else {
        this.bManager.config.prefix = `tab-${key}`;
      }
      this.bManager.config.queryContent = `#${key}Content`;
      this.bManager.render();
    }
  },
  // Load tabs from HTML
  importFromDOM: function (namesContainer = '.js__tab-names', bodiesContainer = '.js__tab-bodies') {
    const nmsWrpDOM = document.querySelector(namesContainer);
    const bdsWrpDOM = document.querySelector(bodiesContainer);
    nmsWrpDOM.childNodes.forEach(child => {
      const key = child.getAttribute('data-tab-key');
      if (child.classList.contains('js__active-tab'))
        this.crrTab = key;
      this.tabNames.set(key, child);
    });
    bdsWrpDOM.childNodes.forEach(child => {
      const key = child.getAttribute('data-tab-key');
      this.tabBodies.set(key, child);
    });
  },
  // Load tabs to HTML
  exportToDOM: function (namesContainer = '.js__tab-names', bodiesContainer = '.js__tab--bodies') {
    const nmsWrpDOM = document.querySelector(namesContainer);
    const bdsWrpDOM = document.querySelector(bodiesContainer);
    nmsWrpDOM.innerHTML = '';
    bdsWrpDOM.innerHTML = '';
    this.tabNames.forEach((value, key) => {
      if (this.crrTab === key)
        value.classList.add('js__active-tab');
      value.setAttribute('data-tab-key', key);
      nmsWrpDOM.appendChild(value);
    });
    this.tabBodies.forEach((value, key) => {
      if (this.crrTab === key)
        value.classList.add('js__active-tab');
      value.setAttribute('data-tab-key', key);
      nmsWrpDOM.appendChild(value);
    })
  },
};

// Testing creating new block without category
blockManager.creatingNewBlock('h1-block', {
  label: 'Heading',
  content: '<h1>Put your title here</h1>',
  category: {
    id: 'tab-blocks-other',
    label: 'Other',
  },
  attributes: {
    title: 'Insert h1 block'
  }
});
// Testing creating new block with category
blockManager.creatingNewBlock('h2-block', {
  label: 'Heading',
  content: '<h2>Put your title here</h2>',
  category: 'Other',
  attributes: {
    title: 'Insert h2 block'
  }
});
// Testing creating new block without options
blockManager.creatingNewBlock('h3-block', { label: 'Heading' }, 'blocks');

// Fix fullscreen-mode
editor.Commands.extend('core:fullscreen', {
  run () {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  },
  stop () {
    const d = document;
    if (d.exitFullscreen) d.exitFullscreen();
    else if (d.webkitExitFullscreen) d.webkitExitFullscreen();
    else if (d.mozCancelFullScreen) d.mozCancelFullScreen();
    else if (d.msExitFullscreen) d.msExitFullscreen();
  }
});

//allow components to be drag and dropped
// editor.setDragMode('absolute');

editor.on('storage:start:store', (objectToStore) => {
  console.log("Extend parameters to store");
  console.log(pageManager.pgs + ":" + pageManager.crrPg);
  objectToStore.pageId = pageManager.pgs[pageManager.crrPg].id;
  objectToStore.pageName = pageManager.pgs[pageManager.crrPg].name;
  objectToStore.userProjectId = getUrlVars()["userProject"];
});

// Left-side panel with page list
const leftBar = document.getElementsByClassName('left-bar')[0];
const rightBar = document.getElementsByClassName('right-bar')[0];
const pageManagerDOM = document.getElementsByClassName('page-manager')[0];

//hide left panel on preview
editor.on('run:preview:before', () => {
  leftBar.style.display = 'none';
  rightBar.style.left = '0';
  rightBar.style.setProperty("width", "100%", "important");
});

editor.on('stop:preview:before', () => {
  leftBar.style.display = '';
  rightBar.style.left = '13.04%';
  rightBar.style.setProperty("width", "calc(100% - 13.04%) ", "important");
});

const data = {userProjectId: getUrlVars()["userProject"]};
editor.Commands.add('canvas-publish', e => {
      fetch('http://localhost:9080/cadau/user-project/publish', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      .then(response => response.json())
      .then(data => {
        alert("success: " + data);
      });
});

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
  pageManagerDOM.appendChild(el);
}

// Clearing panel and filling it by pages
function drwNmsPgs (pgs, cur) {
  let lstChl = pageManagerDOM.lastElementChild;
  while (pageManagerDOM.childElementCount > 1) {
    pageManagerDOM.removeChild(lstChl);
    lstChl = leftBar.lastElementChild;
  }
  for (let i = 0; i < pgs.length; i++) {
    crtAddPgVw(pgs[i].name, i, i === cur);
  }
}

function getUrlVars() {
  let vars = {};
  let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
  });
  return vars;
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

  ],
  // Index of current page
  crrPg: 0,
  // Change index of current page to i
  chnCrrPg: function (i) {
    if (i !== this.crrPg) {
      editor.store();
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
    const str = prompt('Page name', this.pgs[this.crrPg].name);
    if (str !== '' && str !== undefined && str !== null) {
      this.pgs.push({
        id: null,
        name: str,
        components: this.dflPg.components,
        styles: this.dflPg.styles,
        externalStyles: null,
        externalScripts: null
      });
      drwNmsPgs(this.pgs, this.crrPg);

      //load the newly created page
      this.chnCrrPg(this.pgs.length-1);
    }
  },
  // Copy of existing page having index i
  cpPg: function (i) {
    const pg = this.pgs[i];
    if (this.crrPg === i) {
      this.pgs[this.crrPg].components = editor.getHtml();
      this.pgs[this.crrPg].styles = editor.getCss();
    }
    this.pgs.push({
      id: null,
      name: pg.name + '_copy',
      components: pg.components,
      styles: pg.styles,
      externalStyles: null,
      externalScripts: null
    });
    drwNmsPgs(this.pgs, this.crrPg);

    //load the newly created page
    this.chnCrrPg(this.pgs.length-1);
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
  // Rendering blocks
  blockManager.render();
  // Initializing of search handler
  blockManager.initSearchers();
  // Load content from HTML to tab manager
  tabManager.importFromDOM();
  // Deleting old blocks button
  editor.Panels.removeButton('views', 'open-blocks');
  //
  editor.Panels.getButton('views', 'open-sm').set('active', true);
  // Open a panel
  editor.Commands.run('open-sm');
  const Http = new XMLHttpRequest();
  const url='/cadau/user-project/1/pages';
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      let response = JSON.parse(Http.responseText);
      for(let i=0; i<response.length; i++) {
        let jsonObj = response[i];
        let pageObj = {};

        pageObj.id = jsonObj.id;
        pageObj.name = jsonObj.name;
        pageObj.components = jsonObj.html;
        pageObj.styles = jsonObj.css;
        pageObj.externalStyles = jsonObj.externalStyles;
        pageObj.externalScripts = jsonObj.externalScripts;

        pageManager.pgs.push(pageObj);
      }

      drwNmsPgs(pageManager.pgs, pageManager.crrPg);

      editor.setComponents(pageManager.pgs[0].components);
      editor.setStyle(pageManager.pgs[0].styles);

      for(let i=0; i<pageManager.pgs[0].externalStyles.length; i++) {
        let link = pageManager.pgs[0].externalStyles[i];
        editor.Canvas.getFrame().addLink(link);
      }

      for(let i=0; i<pageManager.pgs[0].externalScripts.length; i++) {
        let script = pageManager.pgs[0].externalScripts[i];
        editor.Canvas.getFrame().addScript(script);
      }

    }
  }
};
