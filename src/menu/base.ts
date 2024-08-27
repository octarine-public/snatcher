import { Menu } from "github.com/octarine-public/wrapper/index"

export abstract class BaseMenu {
	constructor(node: Menu.Node, nodeName: string, defaultState = true, iconPath?: string, tooltip?: string) {
		this.Tree = node.AddNode(nodeName, iconPath, tooltip)
		this.State = this.Tree.AddToggle("State", defaultState)
	}

	public readonly Tree: Menu.Node
	public readonly State: Menu.Toggle

	public MenuChanged(callback: () => void) {
		this.State.OnValue(() => callback())
	}

	public ResetSettings(callback: () => void) {
		this.State.value = this.State.defaultValue
		callback()
	}
}
