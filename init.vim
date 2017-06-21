"dein Scripts-----------------------------
if &compatible
  set nocompatible               " Be iMproved
endif

" Required:
set runtimepath+=/home/scott/.config/nvim/bundle/./repos/github.com/Shougo/dein.vim

" Required:
if dein#load_state('/home/scott/.config/nvim/bundle/.')
  call dein#begin('/home/scott/.config/nvim/bundle/.')

  " Let dein manage dein
  " Required:
  call dein#add('/home/scott/.config/nvim/bundle/repos/github.com/Shougo/dein.vim')

  " Add or remove your plugins here:
  call dein#add('Shougo/neosnippet.vim')
  call dein#add('Shougo/neosnippet-snippets')
  call dein#add('Shougo/neocomplete.vim')
  call dein#add('nanotech/jellybeans.vim')
  call dein#add('vim-airline/vim-airline')
  call dein#add('vim-airline/vim-airline-themes')
  call dein#add('Shougo/vimshell')
  call dein#add('kien/ctrlp.vim')

  " Required:
  call dein#end()
  call dein#save_state()
endif

" Required:
filetype plugin indent on
syntax enable

" If you want to install not installed plugins on startup.
if dein#check_install()
  call dein#install()
endif

"End dein Scripts-------------------------

"nvim specific
"{{{
   set termguicolors
"}}}

"System Options
"{{{
   "Change Directory for Swap File
   set backupdir=./.backup/,.,~/tmp
   set directory=.,./.backup/,~/tmp

   "Save Buffers for next sessioen
   "exec 'set viminfo=%,' . &viminfo

   "Change the leader to space
   let mapleader="\<space>"

   "Backspace Settings
   set backspace=2

   "Clipboard
   set clipboard=unnamed
"}}}

"Misc Key Remaps
"{{{
   "Insert Mode Map
   inoremap jk <esc>

   "Save with leader+w
   nmap <leader>w :w<CR>

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
"}}}

"Font, colorscheme, and gui options
"{{{
   filetype plugin indent on    " required
   syntax enable
   color jellybeans
   set t_ut=
   set t_Co=256
   "set background=dark
   "set guifont=Consolas:h10
   set number
   set relativenumber
"}}}

"Set tab formatting
"{{{
   set tabstop=3
   set softtabstop=3
   set shiftwidth=3
   set expandtab
"}}}


"CtrlP Options
"{{{
   let g:ctrlp_working_path_mode = 0
   let g:ctrlp_map = '<c-p>'
   let g:ctrlp_cmd = 'CtrlP'
   if exists("g:ctrl_user_command")
     unlet g:ctrlp_user_command
   endif
   let g:ctrlp_switch_buffer = 0
   let g:ctrlp_show_hidden = 1
   set wildignore+=*\\tmp\\*,*.swp,*.zip,*.exe,*.bak,*.d,*.svn*,*.o,*.lst,*.scs,*.sts,*.peg
"}}}


"Setup the Ctags workspace
set tags=./tags;

"Seach Parameters
set smartcase
set ignorecase

" edit vimrc/zshrc/bashrc and load vimrc bindings
nnoremap <leader>ev :e $MYVIMRC<CR>
nnoremap <leader>ez :e ~/.zshrc<CR>
nnoremap <leader>eb :e ~/.bashrc<CR>
nnoremap <leader>sv :source $MYVIMRC<CR>

"Delete Trailing Spaces
nnoremap <leader>ds :%s/\s\+$//<CR>

"Tab Control
"{{{
   "Jump To last Tab
   let g:lasttab = 1
   nmap <Leader>tt :exe "tabn ".g:lasttab<CR>
   au TabLeave * let g:lasttab = tabpagenr()

   "Open New Tab
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

"Update the tags file
command! Ctags :!ctags --extra=+q -R

"Airline settings
"{{{
   let g:airline#extensions#whitespace#checks = ['trailing', 'long']
   " configure the minimum number of tabs needed to show the tabline.
   let g:airline#extensions#tabline#enabled = 1
   let g:airline#extensions#tabline#tab_min_count = 2
   let g:airline#extensions#tabline#show_buffers = 0
   set laststatus=2
"}}}

