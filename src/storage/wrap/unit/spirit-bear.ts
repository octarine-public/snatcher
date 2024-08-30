import { PhysicalItem, SpiritBear } from "github.com/octarine-public/wrapper/index"

import { UnitWrap } from "./unit"

export class SpiritBearUnitWrap extends UnitWrap {
	constructor(
		public readonly unit: SpiritBear,
		public readonly Handle = unit.Handle
	) {
		super(unit, Handle)
	}

	public CanPickItem(physicalItem: PhysicalItem) {
		if (
			!this.ShouldPick(physicalItem) ||
			physicalItem.Item === undefined ||
			!this.unit.ShouldRespawn ||
			this.unit.IsIllusion
		) {
			return false
		}

		switch (physicalItem.Item.Name) {
			case "item_gem":
			case "item_rapier": {
				return this.unit.Inventory.FreeSlotsInventory.length !== 0
			}
			case "item_refresher_shard":
			case "item_aghanims_shard_roshan":
			case "item_ultimate_scepter_roshan":
			case "item_ultimate_scepter_2":
			case "item_cheese": {
				return this.unit.Inventory.FreeSlotsInventory.length !== 0 || this.unit.Inventory.FreeSlotsBackpack.length !== 0
			}
			default: {
				return false
			}
		}
	}
}
