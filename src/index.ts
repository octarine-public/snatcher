import { EventsSDK, Sleeper } from "github.com/octarine-public/wrapper/index"

import { GUIManager } from "./gui/manager"
import { MenuManager } from "./menu/manager"

new (class Snatcher {
	constructor() {
		this.menuManager = new MenuManager(new Sleeper())
		this.guiManager = new GUIManager(this.menuManager)

		EventsSDK.on("Draw", () => this.Draw())
	}

	private readonly menuManager: MenuManager
	private readonly guiManager: GUIManager

	public Draw() {
		this.guiManager.Draw()
	}
})()
