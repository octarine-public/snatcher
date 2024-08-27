import { Sleeper } from "github.com/octarine-public/wrapper/index"

import { MenuManager } from "./menu/manager"

new (class Snatcher {
	constructor() {
		this.menuManager = new MenuManager(new Sleeper())
	}

	private readonly menuManager: MenuManager
})()