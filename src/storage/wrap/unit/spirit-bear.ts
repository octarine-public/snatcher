import { PhysicalItem, SpiritBear } from "github.com/octarine-public/wrapper/index"

import { UnitWrap } from "./wrap"

export class SpiritBearUnitWrap extends UnitWrap {
	constructor(public readonly Unit: SpiritBear) {
		super(Unit)
	}

	public CanPickItem(physicalItem: PhysicalItem) {
		if (
			!this.ShouldPick(physicalItem) ||
			physicalItem.Item === undefined ||
			!this.Unit.ShouldRespawn ||
			this.Unit.IsIllusion
		) {
			return false
		}

		switch (physicalItem.Item.Name) {
			case "item_gem":
			case "item_rapier": {
				return this.Unit.Inventory.FreeSlotsInventory.length !== 0
			}
			case "item_refresher_shard":
			case "item_aghanims_shard_roshan":
			case "item_ultimate_scepter_roshan":
			case "item_ultimate_scepter_2":
			case "item_cheese": {
				return this.Unit.Inventory.FreeSlotsInventory.length !== 0 || this.Unit.Inventory.FreeSlotsBackpack.length !== 0
			}
			default: {
				return false
			}
		}
	}
}
