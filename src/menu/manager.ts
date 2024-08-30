import { Menu, PhysicalItem, Sleeper } from "github.com/octarine-public/wrapper/index"

import { RunesMenu } from "./runes"
import { StatusMenu } from "./status"

export class MenuManager {
	constructor(private readonly sleeper: Sleeper) {
		const abilitiesDefaults = new Map<string, boolean>([
			["item_blink", true],
			["antimage_blink", true],
			["queenofpain_blink", true],
			["rattletrap_hookshot", true],
			["pangolier_swashbuckle", true],
			["sandking_burrowstrike", true],
			["ember_spirit_sleight_of_fist", true]
		])
		const itemsDefaults = new Map<string, boolean>([
			["item_gem", true],
			["item_aegis", true],
			["item_rapier", true],
			["item_cheese", true],
			["item_refresher_shard", true],
			["item_aghanims_shard_roshan", true],
			["item_ultimate_scepter_roshan", true]
		])

		this.Tree = Menu.AddEntryDeep(["Utility", "Snatcher-1"])
		this.Tree.IconPath = "panorama/images/items/aegis_png.vtex_c"
		this.Tree.SortNodes = false

		this.State = this.Tree.AddToggle("State", false)
		this.UseNeutralItems = this.Tree.AddToggle("Neutral items", false, "Pickup neutral items")

		this.Abilities = this.Tree.AddImageSelector(
			"Abilities",
			abilitiesDefaults.keys().toArray(),
			abilitiesDefaults,
			"Abilities to steal aegis"
		)
		this.Items = this.Tree.AddImageSelector(
			"Items",
			itemsDefaults.keys().toArray(),
			itemsDefaults,
			"Items to catch from drop"
		)

		this.Runes = new RunesMenu(this.Tree)
		this.Status = new StatusMenu(this.Tree)

		this.KeyBind = this.Tree.AddKeybind("Key", "N", "Turn script off/on")
		this.KeyMode = this.Tree.AddDropdown("Key mode", ["Toggle", "Hold"])

		this.KeyBind.OnRelease((): void => {
			if (this.KeyMode.SelectedID === 0) {
				this.State.value = !this.State.value
				Menu.Base.ForwardConfigASAP = true
			}
		})
		this.KeyMode.OnValue((call: Menu.Dropdown): void => {
			switch (call.SelectedID) {
				case 0: {
					this.State.IsHidden = false
					break
				}
				case 1: {
					if (this.State.value) {
						this.State.value = false
					}
					this.State.IsHidden = true
				}
			}
		})
	}

	public readonly Tree: Menu.Node

	public readonly State: Menu.Toggle
	public readonly UseNeutralItems: Menu.Toggle

	public readonly Abilities: Menu.ImageSelector // abilities to steal aegis
	public readonly Items: Menu.ImageSelector // items to catch from drop

	public readonly Runes: RunesMenu
	public readonly Status: StatusMenu

	public readonly KeyBind: Menu.KeyBind
	public readonly KeyMode: Menu.Dropdown

	public IsItemEnabled(item: PhysicalItem): boolean {
		if (item.Item === undefined) {
			return false
		}

		return (
			item.Item !== undefined &&
			((item.Item.IsNeutral && this.UseNeutralItems.value) || this.Items.IsEnabled(item.Item.Name))
		)
	}
}
