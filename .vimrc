set nocompatible
filetype off

"Vundule Setup
"{{{
   if !isdirectory(expand("~/.vim/bundle/Vundle.vim/.git"))
       !git clone https://github.com/gmarik/Vundle.vim.git ~/.vim/bundle/Vundle.vim
   endif

   " set the runtime path to include Vundle and initialize
   set rtp+=~/.vim/bundle/Vundle.vim
   call vundle#begin()
   Plugin 'VundleVim/Vundle.vim'

   " Keep Plugin commands between vundle#begin/end.
   " plugin on GitHub repo
   Plugin 'tpope/vim-fugitive'
   Plugin 'nanotech/jellybeans.vim'
   Plugin 'vim-airline/vim-airline'
   Plugin 'vim-airline/vim-airline-themes'
   Plugin 'Valloric/YouCompleteMe'
   Plugin 'ctrlp.vim'
   Plugin 'vimwiki'
   "Plugin 'cscope/plugin/cscope_maps'

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

