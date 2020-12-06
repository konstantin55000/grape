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
<<<<<<< HEAD
  plugins: ['gjs-preset-webpage','html-block'],
=======
  plugins: ['gjs-preset-webpage', 'grapesjs-custom-code'],
>>>>>>> refs/remotes/origin/develop
  pluginsOpts: {
    'gjs-preset-webpage': {}, 
    'grapesjs-custom-code': {
      // options
    }
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


var pfx = editor.getConfig().stylePrefix;
var modal = editor.Modal;
var cmdm = editor.Commands;
var codeViewer = editor.CodeManager.getViewer('CodeMirror').clone();
console.log('code viewer', codeViewer);
var pnm = editor.Panels;
var container = document.createElement('div');
var btnEdit = document.createElement('button');

codeViewer.set({
    codeName: 'htmlmixed',
    readOnly: 0,
    theme: 'hopscotch',
    autoBeautify: true,
    autoCloseTags: true,
    autoCloseBrackets: true,
    lineWrapping: true,
    styleActiveLine: true,
    smartIndent: true,
    indentWithTabs: true
});



btnEdit.innerHTML = 'Edit Modal';
btnEdit.className = pfx + 'btn-prim ' + pfx + 'btn-import';
btnEdit.onclick = function() {
    var code = codeViewer.editor.getValue(); 
    editor.DomComponents.getWrapper().set('content', ''); //вот строка  

    editor.setComponents(code.trim());
    modal.close();
};

cmdm.add('html-edit', {
    run: function(editor, sender) {
      
        sender && sender.set('active', 0);
        var viewer = codeViewer.editor;
        modal.setTitle('Edit code');
        if (!viewer || document.querySelector('#editor-html-value') === null) {
            var txtarea = document.createElement('textarea');
            container.appendChild(txtarea);
            container.appendChild(btnEdit);
            let strModal = `
            <div class="gjs-mdl-dialog gjs-one-bg gjs-two-color">
                <div class="gjs-mdl-header">
                  <div class="gjs-mdl-title">Custom block</div>
                  <div class="gjs-mdl-btn-close" data-close-modal="">⨯</div>
                </div>
                <div class="gjs-mdl-content">
                  <div id="gjs-mdl-c"><div class="panel-custom-block" id="panel-custom-block"><div class="form-base is-relative"><div class="spinner form-base__spinner" style="display: none;"><i class="spinner-large"></i></div> <form class="form-base__form"><div class="tabs tp-size--m"><div class="tabs__tabs"><div class="grid"><div class="tabs__tab-wrapper grid-item grid-item--behavior-fixed"><input id="tab_main" type="radio" class="tabs__input tabs__input-main" value="main"> <label for="tab_main" class="tabs__tab tabs__tab-main is-clickable ">
                    Main
                    <!----></label></div><div class="tabs__tab-wrapper grid-item grid-item--behavior-fixed"><input id="tab_extra" type="radio" class="tabs__input tabs__input-extra" value="main"> <label for="tab_extra" class="tabs__tab tabs__tab-extra is-clickable ">
                    Extra
                    <!----></label></div> <div class="grid-item grid-item--behavior-fixed grid-item--push-left"><!----> <div class="input-group-container is-relative is-inline--bl"><!----> <button type="submit" class="call-btn-dash"><span class="call-btn-layer"><!----> <span class="is-valign--middle">
                  Save
                </span> </span></button> <!----></div></div></div></div> <div class="radio-tabs__contents u-p-top--m panel-custom-block__tab-c"><div><div class="tabs__content tabs__content-main"><div class="u-m-bottom--s grid grid--align-center grid--gutters-x2lg"><div class="grid-item"><div class="input-group-container is-relative"><label for="input-name" class="input-label u-m-bottom--xs">
            Name
            </label>   <input type="text" name="name" id="input-name" required="required" placeholder="eg. Button" class="input-group__input input-group__input--text input-box">  <!----></div></div> <div class="grid-item"><div class="input-group-container is-relative"><label for="input-category" class="input-label u-m-bottom--xs">
            Category
            </label>   <input type="text" name="category" id="input-category" placeholder="eg. Buttons" class="input-group__input input-group__input--text input-box">  <!----></div></div></div> <div class="panel-custom-block__editors grid grid--gutters-x2lg grid--no-wrap"><div class="grid-item grid-item--cols-6"><label class="input-label u-m-bottom--xs">
            HTML
            </label> <div class="panel-custom-block__editor-left"><div><textarea style="display: none;"></textarea>
                <div class="CodeMirror cm-s-hopscotch CodeMirror-wrap"><div style="overflow: hidden; position: relative; width: 3px; height: 0px; top: 4px; left: 40.3px;">
                    
                    <textarea id="editor-html-value" style="position: absolute; bottom: -1em; padding: 0px; width: 1px; height: 1em; outline: currentcolor none medium;" autocorrect="off" 
                    autocapitalize="none" spellcheck="false" tabindex="0" wrap="off"></textarea></div><div class="CodeMirror-vscrollbar" tabindex="-1" cm-not-content="true"><div style="min-width: 1px; height: 0px;"></div></div><div class="CodeMirror-hscrollbar" tabindex="-1" cm-not-content="true"><div style="height: 100%; min-height: 1px; width: 0px;"></div></div><div class="CodeMirror-scrollbar-filler" cm-not-content="true"></div><div class="CodeMirror-gutter-filler" cm-not-content="true"></div><div class="CodeMirror-scroll" tabindex="-1" draggable="true"><div class="CodeMirror-sizer" style="margin-left: 29px; margin-bottom: -17px; border-right-width: 33px; min-height: 53px; padding-right: 0px; padding-bottom: 0px;"><div style="position: relative; top: 0px;"><div class="CodeMirror-lines" role="presentation"><div style="position: relative; outline: currentcolor none medium;" role="presentation"><div class="CodeMirror-measure"><pre class="CodeMirror-line-like">x</pre></div><div class="CodeMirror-measure"></div><div style="position: relative; z-index: 1;"><div class="CodeMirror-selected" style="position: absolute; left: 11.3px; top: 0px; width: 350.7px; height: 15px;"></div><div class="CodeMirror-selected" style="position: absolute; left: 4px; top: 15px; width: 358px; height: 15px;"></div><div class="CodeMirror-selected" style="position: absolute; left: 4px; top: 30px; width: 32.5px; height: 15px;"></div><div class="CodeMirror-selected" style="position: absolute; left: 4px; top: 15px; width: 358px; height: 15px;"></div></div><div class="CodeMirror-cursors" style="visibility: hidden;"></div><div class="CodeMirror-code" role="presentation"><div style="position: relative;"><div class="CodeMirror-gutter-wrapper" style="left: -29px;"><div class="CodeMirror-linenumber CodeMirror-gutter-elt" style="left: 0px; width: 21px;">1</div></div><pre class=" CodeMirror-line " role="presentation"><span role="presentation"><span class="cm-tag cm-bracket">&lt;</span><span class="cm-tag">h1</span> <span class="cm-attribute">id</span>=<span class="cm-string">"iodmj"</span> <span class="cm-attribute">data-gjs-type</span>=<span class="cm-string">"header"</span> <span class="cm-attribute">data-gjs-view</span>=<span class="cm-string">""</span><span class="cm-tag cm-bracket">&gt;</span>Party Card</span></pre></div><div style="position: relative;"><div class="CodeMirror-gutter-wrapper" style="left: -29px;"><div class="CodeMirror-linenumber CodeMirror-gutter-elt" style="left: 0px; width: 21px;">2</div></div><pre class=" CodeMirror-line " role="presentation"><span role="presentation"><span class="cm-tag cm-bracket">&lt;/</span><span class="cm-tag">h1</span><span class="cm-tag cm-bracket">&gt;</span></span></pre></div></div></div></div></div></div><div style="position: absolute; height: 33px; width: 1px; border-bottom: 0px solid transparent; top: 53px;"></div><div class="CodeMirror-gutters" style="height: 86px; left: 0px;"><div class="CodeMirror-gutter CodeMirror-linenumbers" style="width: 29px;"></div></div></div></div></div></div></div> <div class="grid-item grid-item--cols-6"><label class="input-label u-m-bottom--xs">
            CSS
            </label> <div class="panel-custom-block__editor-right"><div><textarea id="editor-css-value" style="display: none;"></textarea>
                
                <div class="CodeMirror cm-s-hopscotch CodeMirror-wrap"><div style="overflow: hidden; position: relative; width: 3px; height: 0px; top: 4px; left: 43.6px;"><textarea style="position: absolute; bottom: -1em; padding: 0px; width: 1px; height: 1em; outline: currentcolor none medium;" autocorrect="off" autocapitalize="none" spellcheck="false" tabindex="0" wrap="off"></textarea></div><div class="CodeMirror-vscrollbar" tabindex="-1" cm-not-content="true"><div style="min-width: 1px; height: 0px;"></div></div><div class="CodeMirror-hscrollbar" tabindex="-1" cm-not-content="true"><div style="height: 100%; min-height: 1px; width: 0px;"></div></div><div class="CodeMirror-scrollbar-filler" cm-not-content="true"></div><div class="CodeMirror-gutter-filler" cm-not-content="true"></div><div class="CodeMirror-scroll" tabindex="-1" draggable="true"><div class="CodeMirror-sizer" style="margin-left: 29px; margin-bottom: -17px; border-right-width: 33px; min-height: 98px; padding-right: 0px; padding-bottom: 0px;"><div style="position: relative; top: 0px;"><div class="CodeMirror-lines" role="presentation"><div style="position: relative; outline: currentcolor none medium;" role="presentation"><div class="CodeMirror-measure"><pre class="CodeMirror-line-like">x</pre></div><div class="CodeMirror-measure"></div><div style="position: relative; z-index: 1;"><div class="CodeMirror-selected" style="position: absolute; left: 14.6px; top: 0px; width: 347.4px; height: 15px;"></div><div class="CodeMirror-selected" style="position: absolute; left: 4px; top: 45px; width: 47.4px; height: 15px;"></div><div class="CodeMirror-selected" style="position: absolute; left: 4px; top: 15px; width: 358px; height: 30px;"></div></div><div class="CodeMirror-cursors" style="visibility: hidden;"></div><div class="CodeMirror-code" role="presentation" style=""><div style="position: relative;"><div class="CodeMirror-gutter-wrapper" style="left: -29px;"><div class="CodeMirror-linenumber CodeMirror-gutter-elt" style="left: 0px; width: 21px;">1</div></div><pre class=" CodeMirror-line " role="presentation"><span role="presentation"><span class="cm-builtin">#iodmj</span>{</span></pre></div><div style="position: relative;"><div class="CodeMirror-gutter-wrapper" style="left: -29px;"><div class="CodeMirror-linenumber CodeMirror-gutter-elt" style="left: 0px; width: 21px;">2</div></div><pre class=" CodeMirror-line " role="presentation"><span role="presentation"> &nbsp;<span class="cm-property">font-family</span>:<span class="cm-variable">Brush</span> <span class="cm-variable">Script</span> <span class="cm-variable">MT</span>, <span class="cm-atom">sans-serif</span>;</span></pre></div><div style="position: relative;"><div class="CodeMirror-gutter-wrapper" style="left: -29px;"><div class="CodeMirror-linenumber CodeMirror-gutter-elt" style="left: 0px; width: 21px;">3</div></div><pre class=" CodeMirror-line " role="presentation"><span role="presentation"> &nbsp;<span class="cm-property">font-size</span>:<span class="cm-number">50px</span>;</span></pre></div><div style="position: relative;"><div class="CodeMirror-gutter-wrapper" style="left: -29px;"><div class="CodeMirror-linenumber CodeMirror-gutter-elt" style="left: 0px; width: 21px;">4</div></div><pre class=" CodeMirror-line " role="presentation"><span role="presentation"> &nbsp;<span class="cm-property">margin</span>:<span class="cm-number">0</span> <span class="cm-number">0</span> <span class="cm-number">20px</span> <span class="cm-number">0</span>;</span></pre></div><div style="position: relative;"><div class="CodeMirror-gutter-wrapper" style="left: -29px;"><div class="CodeMirror-linenumber CodeMirror-gutter-elt" style="left: 0px; width: 21px;">5</div></div><pre class=" CodeMirror-line " role="presentation"><span role="presentation">}</span></pre></div><div style="position: relative;"><div class="CodeMirror-gutter-wrapper" style="left: -29px;"><div class="CodeMirror-linenumber CodeMirror-gutter-elt" style="left: 0px; width: 21px;">6</div></div><pre class=" CodeMirror-line " role="presentation"><span role="presentation"><span cm-text="">​</span></span></pre></div></div></div></div></div></div><div style="position: absolute; height: 33px; width: 1px; border-bottom: 0px solid transparent; top: 98px;"></div><div class="CodeMirror-gutters" style="height: 131px; left: 0px;"><div class="CodeMirror-gutter CodeMirror-linenumbers" style="width: 29px;"></div></div></div></div></div></div></div></div> <br> <div class="panel-custom-block__preview is-relative--hidden"><div class="panel-custom-block__preview-toolbar color-bg--secondary is-anim is-opac--half is-abs--b-l"><div class="grid grid--align-center"><div class="grid-item"><span title="" data-tooltip-pos="right" class="tp__u tp-size--m is-clickable" data-tooltip="Save preview"><i class="icon fa fa-camera"></i></span></div> <div class="grid-item grid-item--behavior-fixed grid-item--push-left"><i class="panel-custom-block__toolbar-hand is-anim icon fa fa-angle-right"></i></div></div></div> <iframe class="panel-custom-block__preview-frame"></iframe></div></div><div class="tabs__content tabs__content-extra" style="display: none;"><div class="u-m-bottom--s grid grid--align-center grid--gutters-x2lg"><div class="grid-item">Description</div> <div class="grid-item">Preview</div></div> <div class="u-m-bottom--s grid grid--align-stretch grid--gutters-x2lg"><div class="grid-item"><div class="input-group-container is-relative"><!----> <textarea name="description" id="input-description" class="input-group__input input-group__input--textarea input-box" style="min-height: 260px;"></textarea> <!----></div></div> <div class="grid-item"><div class="input-group-container is-relative upload-group is-full-height"><!----> <input type="file" name="preview" accept="image/*" class="is-hidden"> <div class="grid grid--align-center grid--gutters-xlg is-full-height"><div class="grid-item grid-item--behavior-fixed is-full-height is-full-width"><div class="upload-group__preview input-box is-clickable is-relative upload-group__preview--fill"><img class="upload-group__preview-img is-abs--m" src="data:,"> <div class="gpd-overlay is-absolute--fill is-anim upload-group__overlay is-no-opac"><div class="is-absolute--fill is-opac--half color-bg--black"></div> <div class="is-full-height is-relative grid grid--justify-center grid--align-center"><div class="grid-item grid-item--behavior-fixed"><i class="panel-custom-block__overlay-icon icon fa fa-cloud-upload"></i></div></div></div></div> <!----></div> <!----></div> <!----></div></div></div> <div class="u-m-bottom--s grid grid--align-center grid--gutters-x2lg"><div class="grid-item"><div class="input-group-container is-relative"><!----> <label class="is-no-select is-clickable"><input type="hidden" value="0"> <input id="input-wbf4iqlbzu" type="checkbox" class="input-group__input input-group__input--checkbox input-box" value=""> <i class="form-checkbox"></i> <span class="u-m-left--xs is-valign--middle">
                Make the block available only in this project
              </span> </label> <!----></div></div></div></div></div></div></div></form></div></div></div>`; 

            container.insertAdjacentHTML('beforeend', strModal);
            

            codeViewer.init(txtarea);
            viewer = codeViewer.editor;
        }
        var InnerHtml = editor.getHtml();
        var Css = editor.getCss();
        modal.setContent('');
        modal.setContent(container);
        codeViewer.setContent(InnerHtml + "<style>" + Css + '</style>');
        modal.open();
        viewer.refresh();
    
     
    }
});

pnm.addButton('options',
    [
        {
            id: 'edit',
            className: 'fa fa-edit',
            command: 'html-edit',
            attributes: {
                title: 'Edit'
            }
        }
    ]
);

editor.on('component:selected', (model) => {

    // whenever a component is selected in the editor
    let self = this;
    const freeModeCommand = () => {
      model.set('dmode', 'absolute');
      document.querySelector('.fa-mouse-pointer.gjs-toolbar-item').classList.toggle('active-icon');
    }
<<<<<<< HEAD

    const addBlock = () => {
      editor.Commands.run('open-html-code-editor');
=======
    const toEdit = () => {
      document.querySelector('.gjs-pn-btn.fa-edit').click();
    }
    const addBlock = () => { 
   
      document.querySelector('.gjs-pn-btn.fa.fa-code').click();
>>>>>>> refs/remotes/origin/develop
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
<<<<<<< HEAD
    }
=======
      selectedComponent.set({
      toolbar: [ ...defaultToolbar,  
        {  attributes: {class: 'fa fa-edit' ,  title: 'Edit'} , command: toEdit }
      ]
    }); 
    } 
  
>>>>>>> refs/remotes/origin/develop
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
