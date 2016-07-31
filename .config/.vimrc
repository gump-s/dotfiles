set nocompatible
filetype off
"Pathogen
execute pathogen#infect()

"Backspace Settings
set backspace=2

"Change the leader to space
let mapleader="\<space>"
"Font, colorscheme, and gui options
colorscheme jellybeans
"let g:jellybeans_use_lowcolor_black=0
"colorscheme ir_black
syntax enable
set background=dark
set guifont=Consolas:h10
set number
set relativenumber
set guioptions-=r  "remove right-hand scroll bar
set guioptions-=L  "remove left-hand scroll bar
set guioptions-=m  "remove menubar
set guioptions-=T  "remove toolbar

"Normal Mode Map
"nnoremap <Tab> :bnext<CR>
"nnoremap <S-Tab> :bprevious<CR>
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>

"Insert Mode Map
inoremap jk <esc>
"inoremap <esc> <nop>

"Save Buffers for next sessioen
exec 'set viminfo=%,' . &viminfo
nmap <leader>w :w<CR>
"imap <c-w> jk:w<CR>

"Set tab formatting
filetype plugin indent on
set tabstop=4
set softtabstop=4
set shiftwidth=4
set expandtab

"Highlight Column 110 with dark gray
set colorcolumn=130
highlight ColorColumn ctermbg=darkgray

"This unsets the 'last search pattern' register by hitting return
nnoremap <CR> :noh<CR><CR>:<backspace>

"CtrlP Options
let g:ctrlp_working_path_mode = 0
let g:ctrlp_map = '<c-p>'
let g:ctrlp_cmd = 'CtrlP'
if exists("g:ctrl_user_command")
  unlet g:ctrlp_user_command
endif
set wildignore+=*\\tmp\\*,*.swp,*.zip,*.exe,*.bak,*.d,*.svn*,*.o,*.lst,*.scs,*.sts,*.peg

"Change Directory for Swap File
set backupdir=./.backup,.,/tmp
set directory=.,./.backup,/tmp

"Setup the Ctags workspace
set tags=./tags;../SOCShared/tags;

"Seach Parameters
set smartcase
set ignorecase

"Relative Number Toggle
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

" edit vimrc/zshrc and load vimrc bindings
nnoremap <leader>ev :e $MYVIMRC<CR>
nnoremap <leader>ez :e ~/.zshrc<CR>
nnoremap <leader>sv :source $MYVIMRC<CR>

"Update the tags file
command! Ctags :!ctags --extra=+q -R

"Disble the beep
set noeb vb t_vb=

"Virtual Edit Block
set virtualedit=block

"Airline settings
let g:airline#extensions#whitespace#checks = ['trailing', 'long']
set laststatus=2

"Force 256 colors
set t_Co=256

set clipboard=unnamed
