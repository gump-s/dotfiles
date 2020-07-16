if &compatible
    set nocompatible               " Be iMproved
endif

" Plugins
"{{{

    " TODO figure this out
    "if empty(glob('"${XDG_DATA_HOME:-$HOME/.local/share}"/nvim/site/autoload/plug.vim'))
    "    silent !curl -fLo "${XDG_DATA_HOME:-$HOME/.local/share}"/nvim/site/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
    "    autocmd VimEnter * PlugInstall --sync | source $MYVIMRC
    "endif

    call plug#begin(stdpath('data') . '/plugged')
    Plug 'nanotech/jellybeans.vim'
    Plug 'junegunn/fzf.vim'
    Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
    Plug 'mkitt/tabline.vim'
    Plug 'scrooloose/nerdtree'
    Plug 'majutsushi/tagbar'
    Plug 'vim-airline/vim-airline'
    Plug 'vim-airline/vim-airline-themes'
    Plug 'tpope/vim-fugitive'
    Plug 'tpope/vim-sensible'
    Plug 'neoclide/coc.nvim', {'branch': 'release'}
    Plug 'nfvs/vim-perforce'
    Plug 'vim-scripts/DoxygenToolkit.vim'
    Plug 'vim-scripts/Doxygen.vim'

    call plug#end()
"}}}

"nvim specific
"{{{
    set termguicolors
"}}}

"System Options
"{{{
    filetype plugin indent on    " required
    syntax enable

    "Change Directory for Swap File
    "set backupdir=./.backup/,.,~/tmp
    "set directory=.,./.backup/,~/tmp
    set nobackup
    set nowritebackup

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
"}}}

"Font, colorscheme, and gui options
"{{{
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
    set tabstop=4
    set softtabstop=4
    set shiftwidth=4
    set expandtab
"}}}
"
"FZF
"{{{
    nnoremap <c-p> :FZF<CR>
    nnoremap <leader>p :Buffers<CR>
"}}}

"Setup the Ctags workspace
set tags=./tags;

"Seach Parameters
"{{{
    set smartcase
    set ignorecase
    set inccommand=split
"}}}

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
    let g:airline#extensions#tabline#tab_nr_type = 1
    set laststatus=2
"}}}
"
"tagbar
"{{{
   nmap <leader>tb :TagbarToggle<CR>
"}}}

"nerdree
"{{{
   nmap <C-n> :NERDTreeToggle<CR>
   let g:NERDTreeWinSize=50
"}}}

" COC -- whole bunch of stuff copied
"{{{
    " TextEdit might fail if hidden is not set.
    set hidden

    " Some servers have issues with backup files, see #649.
    set nobackup
    set nowritebackup

    " Give more space for displaying messages.
    set cmdheight=2

    " Having longer updatetime (default is 4000 ms = 4 s) leads to noticeable
    " delays and poor user experience.
    set updatetime=300

    " Don't pass messages to |ins-completion-menu|.
    set shortmess+=c

    " Always show the signcolumn, otherwise it would shift the text each time
    " diagnostics appear/become resolved.
    if has("patch-8.1.1564")
      " Recently vim can merge signcolumn and number column into one
      set signcolumn=number
    else
      set signcolumn=yes
    endif

    " Use tab for trigger completion with characters ahead and navigate.
    " NOTE: Use command ':verbose imap <tab>' to make sure tab is not mapped by
    " other plugin before putting this into your config.
    inoremap <silent><expr> <TAB>
          \ pumvisible() ? "\<C-n>" :
          \ <SID>check_back_space() ? "\<TAB>" :
          \ coc#refresh()
    inoremap <expr><S-TAB> pumvisible() ? "\<C-p>" : "\<C-h>"

    function! s:check_back_space() abort
      let col = col('.') - 1
      return !col || getline('.')[col - 1]  =~# '\s'
    endfunction

    " Use <c-space> to trigger completion.
    inoremap <silent><expr> <c-space> coc#refresh()

    " Use <cr> to confirm completion, `<C-g>u` means break undo chain at current
    " position. Coc only does snippet and additional edit on confirm.
    " <cr> could be remapped by other vim plugin, try `:verbose imap <CR>`.
    if exists('*complete_info')
      inoremap <expr> <cr> complete_info()["selected"] != "-1" ? "\<C-y>" : "\<C-g>u\<CR>"
    else
      inoremap <expr> <cr> pumvisible() ? "\<C-y>" : "\<C-g>u\<CR>"
    endif

    " Use `[g` and `]g` to navigate diagnostics
    " Use `:CocDiagnostics` to get all diagnostics of current buffer in location list.
    nmap <silent> [g <Plug>(coc-diagnostic-prev)
    nmap <silent> ]g <Plug>(coc-diagnostic-next)

    " GoTo code navigation.
    nmap <silent> gd <Plug>(coc-definition)
    nmap <silent> gy <Plug>(coc-type-definition)
    nmap <silent> gi <Plug>(coc-implementation)
    nmap <silent> gr <Plug>(coc-references)

    " Use K to show documentation in preview window.
    nnoremap <silent> K :call <SID>show_documentation()<CR>

    function! s:show_documentation()
      if (index(['vim','help'], &filetype) >= 0)
        execute 'h '.expand('<cword>')
      else
        call CocAction('doHover')
      endif
    endfunction

    " Highlight the symbol and its references when holding the cursor.
    autocmd CursorHold * silent call CocActionAsync('highlight')

    " Symbol renaming.
    nmap <leader>rn <Plug>(coc-rename)

    " Formatting selected code.
    xmap <leader>f  <Plug>(coc-format-selected)
    nmap <leader>f  <Plug>(coc-format-selected)

    augroup mygroup
      autocmd!
      " Setup formatexpr specified filetype(s).
      autocmd FileType typescript,json setl formatexpr=CocAction('formatSelected')
      " Update signature help on jump placeholder.
      autocmd User CocJumpPlaceholder call CocActionAsync('showSignatureHelp')
    augroup end

    " Applying codeAction to the selected region.
    " Example: `<leader>aap` for current paragraph
    xmap <leader>a  <Plug>(coc-codeaction-selected)
    nmap <leader>a  <Plug>(coc-codeaction-selected)

    " Remap keys for applying codeAction to the current buffer.
    nmap <leader>ac  <Plug>(coc-codeaction)
    " Apply AutoFix to problem on the current line.
    nmap <leader>qf  <Plug>(coc-fix-current)

    " Map function and class text objects
    " NOTE: Requires 'textDocument.documentSymbol' support from the language server.
    xmap if <Plug>(coc-funcobj-i)
    omap if <Plug>(coc-funcobj-i)
    xmap af <Plug>(coc-funcobj-a)
    omap af <Plug>(coc-funcobj-a)
    xmap ic <Plug>(coc-classobj-i)
    omap ic <Plug>(coc-classobj-i)
    xmap ac <Plug>(coc-classobj-a)
    omap ac <Plug>(coc-classobj-a)

    " Use CTRL-S for selections ranges.
    " Requires 'textDocument/selectionRange' support of LS, ex: coc-tsserver
    nmap <silent> <C-s> <Plug>(coc-range-select)
    xmap <silent> <C-s> <Plug>(coc-range-select)

    " Add `:Format` command to format current buffer.
    command! -nargs=0 Format :call CocAction('format')

    " Add `:Fold` command to fold current buffer.
    command! -nargs=? Fold :call     CocAction('fold', <f-args>)

    " Add `:OR` command for organize imports of the current buffer.
    command! -nargs=0 OR   :call     CocAction('runCommand', 'editor.action.organizeImport')

    " Add (Neo)Vim's native statusline support.
    " NOTE: Please see `:h coc-status` for integrations with external plugins that
    " provide custom statusline: lightline.vim, vim-airline.
    set statusline^=%{coc#status()}%{get(b:,'coc_current_function','')}

    " Mappings for CoCList
    " Show all diagnostics.
    "nnoremap <silent><nowait> <space>a  :<C-u>CocList diagnostics<cr>
    "" Manage extensions.
    "nnoremap <silent><nowait> <space>e  :<C-u>CocList extensions<cr>
    "" Show commands.
    "nnoremap <silent><nowait> <space>c  :<C-u>CocList commands<cr>
    "" Find symbol of current document.
    "nnoremap <silent><nowait> <space>o  :<C-u>CocList outline<cr>
    "" Search workspace symbols.
    "nnoremap <silent><nowait> <space>s  :<C-u>CocList -I symbols<cr>
    "" Do default action for next item.
    "nnoremap <silent><nowait> <space>j  :<C-u>CocNext<CR>
    "" Do default action for previous item.
    "nnoremap <silent><nowait> <space>k  :<C-u>CocPrev<CR>
    "" Resume latest coc list.
    "nnoremap <silent><nowait> <space>p  :<C-u>CocListResume<CR>
    hi! CocErrorSign guifg=#d166a
"}}}"

