.PHONY: install
install:
	pnpm install

.PHONY: dev
dev:
	pnpm tauri dev

.PHONY: dev-web
dev-web:
	pnpm dev

.PHONY: build
build:
	pnpm tauri build

.PHONY: clean
clean:
	rm -rf node_modules dist target src-tauri/target
