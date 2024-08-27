import { Menu } from "github.com/octarine-public/wrapper/index"

import { BaseMenu } from "./base"

export class RunesMenu extends BaseMenu {
	constructor(tree: Menu.Node) {
		super(tree, "Runes", false)

		const abilities = new Map<string, boolean>([["ember_spirit_sleight_of_fist", false]])

		this.Types = this.Tree.AddDropdown("Rune type", ["All", "Bounty", "Power Up"])
		this.Abilities = this.Tree.AddImageSelector("Abilities", [...abilities.keys()], abilities)
	}

	public readonly Types: Menu.Dropdown
	public readonly Abilities: Menu.ImageSelector
}
