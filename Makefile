.PHONY: install
install:
	pnpm install

.PHONY: dev
dev:
	pnpm tauri dev

.PHONY: build
build:
	pnpm tauri build

.PHONY: clean
clean:
	rm -rf node_modules target src-tauri/target
