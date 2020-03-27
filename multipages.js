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
