[[ -f ~/.Xresources ]] && xrdb -merge -I$HOME ~/.Xresources

#dual monitor
xrandr --output DVI-I-3 --left-of DVI-I-2
xrandr --output DVI-I-3 --primary

#WM
#openbox------------------------------
#exec openbox-session
#
#bspwm--------------------------------
#export XDG_CONFIG_HOME="$HOME/.config"
#sxhkd &
#urxvt -rv &
#exec bspwm
#
#i3----------------------------------
exec i3
xsetroot -solid \#254444
