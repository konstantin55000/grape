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

const getBlocks =   function (url, blockTabId){
  jQuery.ajax({
    url: url ,
    crossDomain: true
})
  .done(function( data ) {

    data.forEach( (row, index)=> {
      
      let blockType  = row.blockType //1
      let content = row.HTML;
      content = content.replace(/\n/g, "<br />"); 
      blockManager.creatingNewBlock('custom-block-'+index, {
              label: row.Name,
              content: content,
              category: {
                id: blockTabId,
                label: row.Category,
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
    tabManager.setCurrentTab('blocks');

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
    }
    const addBlock = () => {
      editor.Commands.run('open-html-code-editor', {fromTab : 0});
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

  document.querySelector('#add-custom-block').addEventListener('click', () => { 
      editor.Commands.run('open-html-code-editor', {fromTab : 1} );
  });

  //Get block data to panel tabs: 
  let url = 'https://engine.cashngo.com.au/api/Communication/GetWorkflow?workflow=GetBlocks&BlockType=1'; 
  getBlocks(url, 'tab-custom-other');     
  url = 'https://engine.cashngo.com.au/api/Communication/GetWorkflow?workflow=GetBlocks&BlockType=2';
  getBlocks(url, 'tab-blocks');

  tabManager.setCurrentTab('components'); //1s panel by defaults

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
          //get blocks of blocktype two 
          tabManager.setCurrentTab('bootstrap'); 
        }
    });

  },
  100);

};

 //this is for editing component
 const getInstanceValues = () => {            
  editorTextArea.value = localStorage.getItem('editorTextArea_' + cid);
  cssTextArea.value = localStorage.getItem('cssTextArea_' + cid);          
  editorTextBlockName.value  = localStorage.getItem( 'blockName_' + cid );
  editorTextCategoryName.value = localStorage.getItem( 'catValue_' + cid );     

  let contentToSet = editorTextArea.value + ' ' + cssTextArea.value;
  codeViewer.setContent(contentToSet);  
   
}

editor.Commands.add("open-html-code-editor", {
    run: function(editor, sender, data) {
        var selectedComponent =   (data.fromTab == 0);
        var codeViewer = editor.CodeManager.getViewer("CodeMirror").clone();
        codeViewer.set({
            codeName: "htmlmixed",
            theme: "hopscotch",
            readOnly: false
        });

        var modalContent = document.createElement("div"); 
        let editorTextArea = document.createElement("textarea");  
        editorTextArea.id  = 'html-code'; 
        let Css, cssString = '';
        
     if (selectedComponent){ //if not from tab, get for select component.
          var selComponent = editor.getSelected(); 
          let attr = editor.getSelectedToStyle().attributes; 
          Css = attr.style; 
          editorTextArea.innerHTML = editor.getSelected().toHTML(); 
     }
     else { 
         let customBlock =  `<div class="my-block-class">
              My new block example
          </div>`; 
           cssString =  `.my-block-class { 
            color: #555;  
            font-size: 3rem;  
            padding: 50px; 
            text-align: center; 
          }
          `; 
          editorTextArea.innerHTML = customBlock;
     }

        var wrapColumnOne = document.createElement('div');
        var wrapColumnTwo = document.createElement('div') 
        wrapColumnOne.classList.add('wrap-column');
        wrapColumnTwo.classList.add('wrap-column');
        wrapColumnTwo.classList.add('wrap-column-two');
         
        var cssTextArea = document.createElement("textarea");
        var editorLabel = document.createElement("label");
        editorLabel.for = 'cat-name';
        editorLabel.innerHTML = 'Name';
        editorLabel.id = 'label-cat-value';
        wrapColumnOne.appendChild(editorLabel);
     

        var editorTextBlockName = document.createElement("input");
        editorTextBlockName.type = 'text';
        editorTextBlockName.class = 'input-box';
        editorTextBlockName.id = 'block-name';
        editorTextBlockName.placeholder = 'e.q. Button';
        editorTextBlockName.classList.add('input-box');

        wrapColumnOne.appendChild(editorTextBlockName); 

        var editorLabel = document.createElement("label");
        editorLabel.innerHTML = 'Category';
        editorLabel.for = 'cat-value';
        editorLabel.id = 'label-cat-value';

        wrapColumnTwo.appendChild(editorLabel);

        let editorTextCategoryName = document.createElement("input");
        editorTextCategoryName.type = 'text';
        editorTextCategoryName.placeholder = 'e.q. Buttons Category';
        editorTextCategoryName.id = 'cat-value'; 
        editorTextCategoryName.classList.add('input-box');
        editorTextCategoryName.classList.add('second');

        wrapColumnTwo.appendChild(editorTextCategoryName);
        var cssTextArea = document.createElement("textarea"); 
        cssTextArea.id  = 'css-style'; 
        if (selectedComponent){
      
       
        cssString = '{ '; 
        for (const [key, value] of Object.entries(Css)) {
          cssString +=   key +': ' + value + ";";
        }
        cssString += ' }'; 
        }
        cssTextArea.innerHTML = cssString;

        var saveButton = document.createElement("button");
        saveButton.innerHTML = "Save";
        saveButton.id = "save";
        saveButton.classList.add("save");
        saveButton.classList.add("call-btn-dash");
      

        let wrapButton = document.createElement('div');  

        wrapColumnOne.appendChild(editorTextArea); 
        wrapColumnTwo.appendChild(cssTextArea);  
        wrapButton.appendChild(saveButton); 
        modalContent.appendChild(wrapButton);

        let wrapColumns = document.createElement("div");   
        wrapColumns.className = 'wrap-columns';      
        wrapColumns.classList.add('wrap-columns');

        wrapColumns.appendChild(wrapColumnOne); 
        wrapColumns.appendChild(wrapColumnTwo); 
        modalContent.appendChild(wrapColumns);  

        codeViewer.init(editorTextArea);
        codeViewer.init(cssTextArea); 
          
        const updateInstance = () => {

          if ( data.fromTab == 0){
            var selComponent = editor.getSelected() ;
            var cid = selComponent.cid; 
          } else {
            var cid = 10000;
          }
          

          //this func. is for block editing
          // localStorage.setItem('editorTextArea_' + cid, editorTextArea.value);
          // localStorage.setItem('cssTextArea_' + cid, cssTextArea.value);          
          // localStorage.setItem('blockName_' + cid,  document.getElementById('block-name').value );
          // localStorage.setItem('catValue_' + cid, document.getElementById('cat-value').value);

          editorTextArea = document.getElementById('html-code');
          editorTextArea.class = 'input-box text-area-box';
          cssTextArea = document.getElementById('css-style');
          cssTextArea.class = 'input-box text-area-box';

          let contentToSet = editorTextArea.value; 
          let blockName =  document.getElementById('block-name').value;
           
          blockManager.creatingNewBlock('custom-block-'+(cid + 1), {
            style: Css,
            label:  blockName,
            content: contentToSet,
            category: {         
              id: 'tab-custom-other',     
              label: document.getElementById('cat-value').value,
            },
            attributes: {
             title:  blockName
            }
          }); 
          
          editor.Modal.close();
          alert('Component values are saved.');

        }

        saveButton.onclick=updateInstance; 
         
        editor.Modal
            .setTitle("New Block")
            .setContent(modalContent)
            .open();

        //getInstanceValues(); this if for editing component 
        codeViewer.editor.refresh();
        
    }
});
