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
  plugins: ['gjs-preset-webpage','html-block'],
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
      if (typeof category.attributes === 'undefined')
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

const getBlocks =   function (url, tab){

  jQuery.ajax({
    url: url ,
    crossDomain: true

})
  .done(function( data ) {

    data.forEach( (row, index)=> {


      let blockType  = row.blockType //1
      let content = row.HTML;
      content = content.replace(/\n/g, "<br />");

      let categoryName = 'tab-custom-other';
       if (tab == 2){
        categoryName = 'tab-blocks'
      }
      blockManager.creatingNewBlock('custom-block-'+index, {
              label: `<div>
              <img src="`+row.Preview+`"/>
              <div class="my-label-block">`+row.Category+`</div>
            </div>`,
            content: content,
            category: {
              id: categoryName,
              label: row.Category
            },
            attributes: {
            title:  row.Name
          }
      });

    });

  })
}

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
  label: 'Yes, label',
  content: '<h1>Put your title here</h1>',
  category: {
    id: 'tab-bootstrap-other',
    label: 'BLOCKS other.',
  },
  attributes: {
    title: 'Insert h1 block'
  }
});
// Testing creating new block with category
blockManager.creatingNewBlock('h2-block', {
  label: 'Heading',
  content: '<h2>Test</h2>',
  category: 'bootstrap',

  attributes: {
    title: 'Insert h2 block'
  }
});

// Testing creating new block without options
blockManager.creatingNewBlock('h3-bootstrap', { label: 'Heading' }, 'bootstrap');

// editor.Panels.addButton('devices-c', [ { id: 'toggle-panel-right3', className: 'fa fa-arrows-alt icon-blank',
//  command: {
//   run: function(editor) {
//     editor.setDragMode('absolute');

//   },
//   stop: function(editor) {
//     editor.setDragMode('block');
//   }
// }
// } ] );

editor.Panels.addButton('devices-c', [ { id: 'toggle-panel-right2', className: 'fa fa-plus  icon-blank',
 command: function(editor1, sender) {
    tabManager.setCurrentTab('components');

    jQuery('.panel-blocks').toggleClass('panel-blocks--open');
   }, attributes: { title: 'Blocks' } }
, ]);


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


const rightBar = document.getElementsByClassName('right-bar')[0];


//hide left panel on preview
editor.on('run:preview:before', () => {

  rightBar.style.left = '0';
  rightBar.style.setProperty("width", "100%", "important");
});

editor.on('stop:preview:before', () => {

  rightBar.style.left = '13.04%';
  rightBar.style.setProperty("width", "calc(100% - 13.04%) ", "important");
});


editor.on('component:selected', (model) => {

    // whenever a component is selected in the editor
    let self = this;
    const freeModeCommand = () => {
      model.set('dmode', 'absolute');
      document.querySelector('.fa-mouse-pointer.gjs-toolbar-item').classList.toggle('active-icon');
    }

    const addBlock = () => {
      editor.Commands.run('open-html-code-editor');
    }

    const selectedComponent = editor.getSelected();
    const defaultToolbar = selectedComponent.get('toolbar');
    const addBlockClass = 'fa fa-plus-square-o';
    const iconFreeMode = 'fa fa-mouse-pointer';

    if (defaultToolbar.length < 6){
      selectedComponent.set({
        toolbar: [ ...defaultToolbar, {  attributes: {class: iconFreeMode  }, command:  freeModeCommand  },
            {  attributes: {class: addBlockClass }, command:  addBlock },
        ]
      });
    }
  });



function getUrlVars() {
  let vars = {};
  let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
  });
  return vars;
}



// Init default page by editor content
window.onload = function (event) {
//  pageManager.dflPg.components = editor.getHtml();
//  pageManager.dflPg.styles = editor.getCss();
  // Rendering blocks
  blockManager.render();
  // Initializing of search handler
  blockManager.initSearchers();

  // Deleting old blocks button
  editor.Panels.removeButton('views', 'open-blocks');
  //
  editor.Panels.getButton('views', 'open-sm').set('active', true);
  // Open a panel
  editor.Commands.run('open-sm');

  let url = 'https://engine.cashngo.com.au/api/Communication/GetWorkflow?workflow=GetBlocks&BlockType=1';
  console.log('current url', url);

  getBlocks(url);
  getBlocks('https://engine.cashngo.com.au/api/Communication/GetWorkflow?workflow=GetBlocks&BlockType=2', 2);

  setTimeout( () => {

    document.querySelector('#select-tab')
      .addEventListener("change", () => {
        let val = document.getElementById("select-tab").value;
        if (val == 1){
          tabManager.setCurrentTab('components');
        }
        if (val == 2){
          tabManager.setCurrentTab('blocks');
        }
        if (val == 3){
          tabManager.setCurrentTab('custom');
        }
        if (val == 4 ){
          tabManager.setCurrentTab('bootstrap');
        }
    });

  },
  110);

};



        editor.Commands.add("open-html-code-editor", {
            run: function(editor, sender, data) {

                var codeViewer = editor.CodeManager.getViewer("CodeMirror").clone();
                codeViewer.set({
                    codeName: "htmlmixed",
                    theme: "hopscotch",
                    readOnly: false
                });

                var modalContent = document.createElement("div");

                var editorTextArea = document.createElement("textarea");
                var editorTextArea2 = document.createElement("textarea");

                $( editorTextArea ).attr('id', 'HtmlCode');
                $( editorTextArea2 ).attr('id', 'CssStyle');

                var saveButton = document.createElement("button");
                saveButton.innerHTML = "Save";
                saveButton.className = "gjs-btn-prim";
                saveButton.style = "margin-top: 8px;";
                saveButton.onclick = function() {
                    var content = codeViewer.editor.getValue();
                    editor.getSelected().set("content", content);
                    editor.Modal.close();
                };

                modalContent.appendChild(editorTextArea);
                modalContent.appendChild(editorTextArea2);
                modalContent.appendChild(saveButton);

                codeViewer.init(editorTextArea);
                codeViewer.init(editorTextArea2);



                var htmlContent = document.createElement("div");
                htmlContent.innerHTML = editor.getSelected().getAttributes('style');
                htmlContent = htmlContent.firstChild.innerHTML;

                codeViewer.setContent(htmlContent);

                editor.Modal
                    .setTitle("Edit HTML")
                    .setContent(modalContent)
                    .open();

                codeViewer.editor.refresh();
            }
        });
