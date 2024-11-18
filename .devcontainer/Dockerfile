# Docker image
ARG VARIANT=20-bullseye
FROM mcr.microsoft.com/devcontainers/typescript-node:${VARIANT}

# Install nerd font
RUN curl -fLo "/usr/local/share/fonts/FiraCode Nerd Font Retina.ttf" \
  https://github.com/ryanoasis/nerd-fonts/raw/HEAD/patched-fonts/FiraCode/Retina/FiraCodeNerdFont-Retina.ttf && fc-cache

# Install Starship theme for zsh
RUN curl -sS https://starship.rs/install.sh | sh -s -- --yes

# Source zshrc from .devcontainer/shell/.zshrc
RUN echo 'source $CODESPACE_VSCODE_FOLDER/.devcontainer/shell/.zshrc' > /home/node/.zshrc

# Set zsh as the main shell
RUN chsh -s /usr/bin/zsh

# Install Node version set in `.nvrmc`
RUN nvm install && nvm use