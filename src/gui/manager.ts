import { MenuManager } from "../menu/manager"
import { StatusGUI } from "./status"

export class GUIManager {
	constructor(private readonly menuManager: MenuManager) {
		this.Status = new StatusGUI(menuManager.Status)
	}

	public readonly Status: StatusGUI

	public Draw(): void {
		if (!this.menuManager.State.value) {
			return
		}

		this.Status.Draw({ menu: this.menuManager })
	}
}
