if [[ "$XDG_SESSION_TYPE" == "wayland" ]]; then
    export MOZ_ENABLE_WAYLAND=1
fi

export PATH=~/.npm-global/bin:$PATH

# for vpn
export CISCO_SPLIT_DNS="qsc.com qscaudio.com"

# history
export HISTFILE="$XDG_STATE_HOME"/zsh/history
