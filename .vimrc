set nocompatible
filetype off

"Vundule Setup
"{{{
   if !isdirectory(expand("~/.vim/bundle/Vundle.vim/.git"))
       !git clone https://github.com/gmarik/Vundle.vim.git ~/.vim/bundle/Vundle.vim
   endif

   " set the runtime path to include Vundle and initialize
   set rtp+=~/.vim/bundle/Vundle.vim
   set rtp+=~/.fzf
   call vundle#begin()
   Plugin 'VundleVim/Vundle.vim'

   " Keep Plugin commands between vundle#begin/end.
   " plugin on GitHub repo
   Plugin 'tpope/vim-fugitive'
   Plugin 'tpope/vim-obsession'
   Plugin 'dhruvasagar/vim-prosession'
   Plugin 'nanotech/jellybeans.vim'
   Plugin 'vim-airline/vim-airline'
   Plugin 'vim-airline/vim-airline-themes'
   Plugin 'vimwiki'
   Plugin 'scrooloose/nerdtree'
   Plugin 'plasticboy/vim-markdown'
   Plugin 'majutsushi/tagbar'
   Plugin 'vim-scripts/DoxygenToolkit.vim'
   Plugin 'godlygeek/tabular'
   Plugin 'junegunn/fzf'
   Plugin 'junegunn/fzf.vim'
   Plugin 'cscope_macros.vim'
   Plugin 'nfvs/vim-perforce'
   Plugin 'dhruvasagar/vim-table-mode'
   Plugin 'kana/vim-fakeclip'
   Plugin 'lyuts/vim-rtags'
   Plugin 'vim/killersheep'
   Plugin 'ycm-core/YouCompleteMe'
   " All of your Plugins must be added before the following line
   call vundle#end()            " required
   "To ignore plugin indent changes, instead use:
   "filetype plugin on
   "
   " Brief help
   " :PluginList       - lists configured plugins
   " :PluginInstall    - installs plugins; append `!` to update or just :PluginUpdate
   " :PluginSearch foo - searches for foo; append `!` to refresh local cache
   " :PluginClean      - confirms removal of unused plugins; append `!` to auto-approve removal
   "
   " see :h vundle for more details or wiki for FAQ
   " Put your non-Plugin stuff after this line
"}}}

"System Options
"{{{
   "Change Directory for Swap File
   set backupdir=./.backup/,.,~/tmp
   set directory=.,./.backup/,~/tmp

   "Save Buffers for next sessioen
   "exec 'set viminfo=%,' . &viminfo

   "Change the leader to space
   let mapleader="\<Space>"

  "Backspace Settings
   set backspace=2

   "Clipboard
   "set clipboard=unnamedplus
   set clipboard=unnamed

   set encoding=utf-8
   set fileencoding=utf-8
   set completeopt-=preview

   "Vimdiff
   set diffopt+=iwhite

   "Cursor line
   set nocursorline

   "Lazy redraw
   set lazyredraw

   "timeout option
   set ttimeoutlen=0

   "show normal mode command keystrokes
   set showcmd
"}}}

"Misc Key Remaps
"{{{
   "Insert Mode Map
   inoremap jk <esc>

   "Save with leader+tab
   nmap <leader><tab> :w<CR>

   "Normal Mode Map
   nnoremap <C-J> <C-W><C-J>
   nnoremap <C-K> <C-W><C-K>
   nnoremap <C-L> <C-W><C-L>
   nnoremap <C-H> <C-W><C-H>

   "This unsets the 'last search pattern' register by hitting return
   nnoremap <CR> :noh<CR><CR>:<backspace>

   "Disble the beep
   set noeb vb t_vb=

   "Virtual Edit Block
   set virtualedit=block

   "Doxygen highlighting
   let g:load_doxygen_syntax=1

   "remap file switching
   nnoremap <leader><leader> <C-^>
"}}}

"Font, colorscheme, and gui options
"{{{
   filetype plugin indent on    " required
   syntax enable
   color jellybeans
   "color hybrid
   "color vividchalk
   set number
   set relativenumber
   "set t_Co=256
   "set t_ut=
"}}}

"Set tab formatting
"{{{
   set tabstop=4
   set softtabstop=4
   set shiftwidth=4
   set expandtab
"}}}

"FZF options
"{{{
    "nnoremap <c-p> :FZF!<CR>
    nnoremap <c-p> :Files<CR>
    nnoremap <leader>p :Buffers<CR>
    "let g:fzf_buffers_jump=1
"}}}

"NERDtree Options
"{{{
    "map <C-n> :NERDTreeTabsToggle<CR>
    map <C-n> :NERDTreeToggle<CR>
    map <leader>r :NERDTreeFind<CR>
    autocmd bufenter * if (winnr("$") == 1 && exists("b:NERDTree") && b:NERDTree.isTabTree()) | q | endif
    let g:NERDTreeWinSize = 60
"}}}

"Ctags and Cscope setup
"{{{
    "Setup the Ctags workspace
    set tags=./tags;
    "check ctags db before cscope
    "set csto=1
    "Update the tags file
    command! Ctags :!ctags --extra=+q -R

    "Async tag update
    function! Tagup()
        cs kill 0
        silent !sh ~/scripts/tag_update
        redraw!
        cs add cscope.out
    endfunc
    nnoremap <leader>tu :call Tagup()<CR>
"}}}

"Seach Parameters
"{{{
    set smartcase
    set ignorecase
"}}}

" edit vimrc/zshrc/bashrc and load vimrc bindings
"{{{
    nnoremap <leader>ev :e $MYVIMRC<CR>
    nnoremap <leader>ez :e ~/.zshrc<CR>
    nnoremap <leader>eb :e ~/.bashrc<CR>
    nnoremap <leader>sv :source $MYVIMRC<CR>
"}}}

"Delete Trailing Spaces
nnoremap <leader>ds :%s/\s\+$//<CR>

"Fix C comments
command! FixComments %s/\/\/\(\a\)/\/\/ \1/g

"Tab Control
"{{{
   "Jump To last Tab
   let g:lasttab = 1
   nmap <Leader>tt :exe "tabn ".g:lasttab<CR>
   au TabLeave * let g:lasttab = tabpagenr()

   "Open New Tab
   "nmap <leader>te :tabnew<CR>:NERDTreeToggle<CR>:TagbarToggle<CR>
   nmap <leader>te :tabnew<CR>
"}}}

"Relative Number Toggle
"{{{
   function! NumberToggle()
       if(&relativenumber == 1)
           set number
           set norelativenumber
       else
           set number
           set relativenumber
       endif
   endfunc

   nnoremap <leader>n :call NumberToggle()<cr>
"}}}

"Airline settings
"{{{
   let g:airline#extensions#whitespace#checks = ['trailing', 'long']
   let g:airline#powerline#fonts = 1
   " configure the minimum number of tabs needed to show the tabline.
   let g:airline#extensions#tabline#enabled = 1
   let g:airline#extensions#tabline#tab_min_count = 2
   let g:airline#extensions#tabline#show_buffers = 0
   let g:airline#extensions#tabline#tab_nr_type = 1
   set laststatus=2
"}}}

"Tagbar settings"
"{{{
    nnoremap <leader>tb :TagbarToggle<CR>
"}}}

"Completion Settings
"{{{
"   noremap <expr> <Tab> pumvisible() ? "\<C-n>" : "\<Tab>"
"   inoremap <expr> <S-Tab> pumvisible() ? "\<C-p>" : "\<S-Tab>"
"   inoremap <expr> <cr> pumvisible() ? "\<C-y>" : "\<cr>"
"   let g:asyncomplete_auto_popup = 0
"   let g:asyncomplete_remove_duplicates = 1
"
"   function! s:check_back_space() abort
"       let col = col('.') - 1
"           return !col || getline('.')[col - 1]  =~ '\s'
"   endfunction
"
"   inoremap <silent><expr> <TAB>
"     \ pumvisible() ? "\<C-n>" :
"     \ <SID>check_back_space() ? "\<TAB>" :
"     \ asyncomplete#force_refresh()
"   inoremap <expr><S-TAB> pumvisible() ? "\<C-p>" : "\<C-h>"
"
"   au User asyncomplete_setup call asyncomplete#register_source(asyncomplete#sources#tags#get_source_options({
"        \ 'name': 'tags',
"        \ 'whitelist': ['c'],
"        \ 'completor': function('asyncomplete#sources#tags#completor'),
"        \ 'config': {
"        \   'max_file_size': -1,
"        \   },
"        \ }))
"   au User asyncomplete_setup call asyncomplete#register_source(asyncomplete#sources#omni#get_source_options({
"        \ 'name': 'omni',
"        \ 'whitelist': ['*'],
"        \ 'completor': function('asyncomplete#sources#omni#completor')
"        \  }))
"   au User asyncomplete_setup call asyncomplete#register_source(asyncomplete#sources#buffer#get_source_options({
"        \ 'name': 'buffer',
"        \ 'whitelist': ['*'],
"        \ 'blacklist': ['go'],
"        \ 'completor': function('asyncomplete#sources#buffer#completor'),
"        \ }))
"}}}


"Filetype settings
"{{{
    au BufRead,BufNewFile *.CPP set filetype=cpp
"}}}
"
"Doxygen Toolkit settings
"{{{
"}}}
"
"Tabular
"{{{
"}}}

"Table Mode
"{{{
    let g:table_mode_map_prefix = '<leader>a'
    let g:table_mode_toggle_map = 'm'
    let g:table_mode_corner_corner='+'
    let table_mode_header_fillchar='='
"}}}

" fakeclip -> copy into tmux buffer "&
"{{{
    nmap <leader>y "&
"}}}

" ycm settigns"
"{{{
    let g:ycm_confirm_extra_conf = 0
    let g:ycm_show_diagnostics_ui = 0
"}}}
