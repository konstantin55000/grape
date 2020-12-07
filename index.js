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

const getBlocks =   function (url){

  jQuery.ajax({
    url: url ,
    crossDomain: true

})
  .done(function( data ) {

    data.forEach( (row, index)=> {
      console.log( row.Category );
      let blockType  = row.blockType //1
      let content = row.HTML;
      content = content.replace(/\n/g, "<br />");


      //tabManager.setCurrentTab('сomponents');

      blockManager.creatingNewBlock('custom-block-'+index, {
              label: row.Name,
              content: content,
              category: {
                id: 'tab-custom-other',
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


  //blocks 1
  getBlocks(url);
  //blocks 2
  url = 'https://engine.cashngo.com.au/api/Communication/GetWorkflow?workflow=GetBlocks&BlockType=2';
  getBlocks(url);

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
          //getBlocks('https://engine.cashngo.com.au/api/Communication/GetWorkflow?workflow=GetBlocks&BlockType=1');
          //console.log(jQuery('#customContent').html() ) ; empty
        }
        if (val == 4 ){
          //get blocks of blocktype two
          //getBlocks('https://engine.cashngo.com.au/api/Communication/GetWorkflow?workflow=GetBlocks&BlockType=2');
          tabManager.setCurrentTab('bootstrap');
          //console.log(jQuery('#bootstrapContent').html() ) ;
        }
    });

  },
  100);

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
        var cssTextArea = document.createElement("textarea");

        var editorLabel = document.createElement("label");
        editorLabel.for = 'cat-name';
        editorLabel.innerHTML = 'Name';
        editorLabel.id = 'label-cat-value';

        modalContent.appendChild(editorLabel);

        var editorTextBlockName = document.createElement("input");
        editorTextBlockName.type = 'text';
        editorTextBlockName.id = 'block-name';
        editorTextBlockName.placeholder = 'e.q. Button';
        modalContent.appendChild(editorTextBlockName); 

        var editorLabel = document.createElement("label");
        editorLabel.innerHTML = 'Category';
        editorLabel.for = 'cat-value';
        editorLabel.id = 'label-cat-value';

        modalContent.appendChild(editorLabel);

        let editorTextCategoryName = document.createElement("input");
        editorTextCategoryName.type = 'text';
        editorTextCategoryName.placeholder = 'e.q. Buttons Category';
        editorTextCategoryName.id = 'cat-value';

        modalContent.appendChild(editorTextCategoryName);

        var cssTextArea = document.createElement("textarea");
        cssTextArea.placeholder = 'CSS';
        editorTextArea.id  = 'html-code'; 
        cssTextArea.id  = 'css-style';
        var Css = editor.getCss();
       
        cssTextArea.innerHTML = Css;

        var saveButton = document.createElement("button");
        saveButton.innerHTML = "Save";
        saveButton.id = "save";
        saveButton.className = "gjs-btn-prim";
        saveButton.style = "margin-top: 8px;";

        saveButton.onclick = function() {
            var content = codeViewer.editor.getValue();
            editor.getSelected().set("content", content);
            editor.Modal.close();
        };

        
        var htmlContent = document.createElement("div");        
        htmlContent.innerHTML = editor.getSelected().toHTML(); 
        htmlContent = htmlContent.firstChild.innerHTML; 
        
        editorTextArea.innerHTML = htmlContent; 
        modalContent.appendChild(editorTextArea); 
        modalContent.appendChild(cssTextArea);
        modalContent.appendChild(saveButton);

        codeViewer.init(editorTextArea);
        codeViewer.init(cssTextArea); 
        //codeViewer.setContent(htmlContent + " <style>" + Css + '</style>');
 

       

        var selComponent =   editor.getSelected() ;
        var cid = selComponent.cid;
      
        const getInstanceValues = () => {
            
          editorTextArea.value = localStorage.getItem('editorTextArea_' + cid);
          cssTextArea.value = localStorage.getItem('cssTextArea_' + cid);          
          editorTextBlockName.value  = localStorage.getItem( 'blockName_' + cid );
          editorTextCategoryName.value = localStorage.getItem( 'catValue_' + cid );     

          // let contentToSet = editorTextArea.value + ' ' + cssTextArea.value;
          // codeViewer.setContent(contentToSet);  

          //editor.getSelected().set("content", contentToSet);  
        }
        

        const updateInstance = () => {
          let selComponent =   editor.getSelected() ;
          let cid = selComponent.cid; 

          localStorage.setItem('editorTextArea_' + cid, editorTextArea.value);
          localStorage.setItem('cssTextArea_' + cid, cssTextArea.value);          
          localStorage.setItem('blockName_' + cid,  document.getElementById('block-name').value );
          localStorage.setItem('catValue_' + cid, document.getElementById('cat-value').value);  
          editorTextArea = document.getElementById('html-code');
          cssTextArea = document.getElementById('css-style');
          
          let contentToSet = editorTextArea.value + ' ' + cssTextArea.value;
          codeViewer.setContent(contentToSet);  
          alert('Component values are saved.');
        }

        saveButton.onclick=updateInstance;

        // editor.on('component:add', updateTextarea);
        // editor.on('component:update', updateTextarea);
        // editor.on('component:remove', updateTextarea);
 

        editor.Modal
            .setTitle("New Block")
            .setContent(modalContent)
            .open();

        getInstanceValues();
        codeViewer.editor.refresh();
        getInstanceValues();
    }
});
