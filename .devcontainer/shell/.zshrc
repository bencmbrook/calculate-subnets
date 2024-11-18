# Get ZSH startup time by calling `zprof`
zmodload zsh/zprof

# This repo's folder
ZSHRC_FOLDER="$CODESPACE_VSCODE_FOLDER/.devcontainer/shell"

# Antigen (zsh package manager: https://github.com/zsh-users/antigen)
source "$ZSHRC_FOLDER/antigen.zsh"

# oh-my-zsh
antigen use oh-my-zsh

###################
# ANTIGEN PLUGINS #
###################
antigen bundle yarn
antigen bundle lukechilds/zsh-nvm
antigen bundle zsh-users/zsh-syntax-highlighting
antigen bundle zsh-users/zsh-autosuggestions

# Apply antigen
antigen apply

# Useful for developing this file
alias sz='source ~/.zshrc'

# Starship theme
export STARSHIP_CONFIG="$ZSHRC_FOLDER/starship.toml"
eval "$(starship init zsh)"
