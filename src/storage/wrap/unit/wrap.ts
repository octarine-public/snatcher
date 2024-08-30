import {
	DOTA_RUNES,
	Entity,
	GetPositionHeight,
	Input,
	Item,
	item_aegis,
	item_aghanims_shard_roshan,
	item_bloodstone,
	item_bottle,
	item_cheese,
	item_gem,
	item_rapier,
	item_refresher_shard,
	item_tpscroll,
	item_ultimate_scepter_roshan,
	PhysicalItem,
	Rune,
	Sleeper,
	Unit
} from "github.com/octarine-public/wrapper/index"

export class UnitWrap {
	public readonly Sleeper = new Sleeper()

	protected readonly pickUpItems = 400
	private readonly pickUpRuneRange = 150
	private readonly pickSleeperKey = "pick"
	private readonly moveSleeperKey = "move"

	constructor(
		public readonly unit: Unit,
		public readonly Handle = unit.Handle
	) {}

	public get IsValid() {
		return this.unit.IsValid && this.unit.IsAlive && !this.Sleeper.Sleeping(this.pickSleeperKey)
	}

	public CanPickRune(rune: Rune) {
		return this.ShouldPick(rune) && this.unit.Distance(rune) <= this.pickUpRuneRange
	}

	public CanPickItem(physicalItem: PhysicalItem) {
		if (!this.ShouldPick(physicalItem)) {
			return false
		}

		const phyitem = physicalItem.Item
		const Inventory = this.unit.Inventory

		const position = GetPositionHeight(this.unit.Position)
		if (phyitem === undefined || physicalItem.Position.Floor().z > position) {
			return false
		}

		const IsFreeSlotsBackpack = Inventory.FreeSlotsBackpack.length !== 0
		const IsFreeSlotsInventory = Inventory.FreeSlotsInventory.length !== 0

		if (phyitem?.IsNeutralDrop) {
			if (IsFreeSlotsBackpack || Inventory.NeutralItem === undefined) {
				if (!this.Sleeper.Sleeping(this.moveSleeperKey)) {
					const time = Math.floor(physicalItem.Position.Distance2D(this.unit.Position) / this.unit.Speed)
					this.Sleeper.Sleep(time, this.moveSleeperKey)
				}
				return true
			}
		}

		if (
			phyitem instanceof item_gem ||
			phyitem instanceof item_rapier ||
			phyitem instanceof item_aegis ||
			phyitem instanceof item_refresher_shard ||
			phyitem instanceof item_aghanims_shard_roshan
		) {
			if (IsFreeSlotsInventory) {
				return true
			}

			if (!IsFreeSlotsBackpack) {
				return false
			}

			const itemMove = Inventory.Items.filter(x => x.IsValid && !(x instanceof item_tpscroll) && !x.IsNeutralDrop)
				.orderBy(x => x.Cost)
				.find(x => this.CanBeMovedToBackpack(x))

			if (itemMove === undefined) {
				return false
			}

			this.unit.MoveItem(itemMove, Inventory.FreeSlotsBackpack[0])
			return true
		}

		if (phyitem instanceof item_cheese || (phyitem instanceof item_ultimate_scepter_roshan && this.unit.HasScepter)) {
			return Inventory.FreeSlotsInventory.length !== 0 || Inventory.FreeSlotsBackpack.length !== 0
		}

		if (phyitem instanceof item_ultimate_scepter_roshan) {
			return true
		}

		return false
	}

	public Pick(item: PhysicalItem | Rune) {
		const isNeutralDrop = item instanceof PhysicalItem && item.Item?.IsNeutralDrop && !this.unit.IsInvisible

		if (item instanceof PhysicalItem) {
			this.unit.PickupItem(item)
			if (isNeutralDrop) {
				this.unit.AttackMove(Input.CursorOnWorld, isNeutralDrop)
			}
		} else {
			this.unit.PickupRune(item)
		}

		this.Sleeper.Sleep(Math.randomRange(0.133, 0.2), this.pickSleeperKey)
	}

	protected ShouldPick(entity: Entity) {
		if (!entity.IsValid || !entity.IsVisible) {
			return false
		}
		const distance2D = this.unit.Distance(entity.Position)
		if (distance2D > this.pickUpItems) {
			return false
		}
		if (this.unit.IsStunned || this.unit.IsHexed || this.unit.IsInAbilityPhase) {
			return false
		}
		if (this.unit.IsCharge || this.unit.IsChanneling || this.unit.IsInvulnerable) {
			return false
		}
		return true
	}

	protected CanBeMovedToBackpack(item: Item) {
		if (item instanceof item_gem || item instanceof item_rapier || item instanceof item_bloodstone) {
			return false
		}
		if (item instanceof item_bottle) {
			return item.StoredRune === DOTA_RUNES.DOTA_RUNE_INVALID
		}
		return item.IsDroppable
	}
}
