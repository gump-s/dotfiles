[[ -f ~/.Xresources ]] && xrdb -merge -I$HOME ~/.Xresources
[[ -f ~/.Xmodmap ]] && xmodmap ~/.Xmodmap

#dual monitor
xrandr --output DVI-I-2 --left-of DVI-I-3
xrandr --output DVI-I-2 --primary
xrandr --output DVI-I-3 --rotate left
unclutter & #hide mouse pointer when it is not needed
#xedgewarp -b #run let the mouse warp for mismatched displays

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
